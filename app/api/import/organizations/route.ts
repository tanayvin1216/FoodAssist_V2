/**
 * POST /api/import/organizations
 *
 * Accepts multipart/form-data with a `file` field (.xlsx / .xls / .csv).
 * Parses via exceljs (Node.js runtime — not Edge).
 * De-dupe key: (name + town) — documented here and in the import template.
 * Supports ?dryRun=1 — validates but does not write.
 *
 * Response shape:
 *   { ok: true; total: number; created: number; updated: number;
 *     errors: { row: number; error: string }[] }
 *   | { ok: false; error: string }
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
} from '@/lib/supabase/queries';
import { organizationSchema } from '@/lib/validations/schemas';
import {
  mapSpreadsheetRowToFormValues,
  buildHeaderMap,
} from '@/lib/import/organization-row-mapper';
import type { OrganizationFormData } from '@/types/database';

// ---- constants ---------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/octet-stream',
]);

const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls', '.csv']);

// ---- helpers ----------------------------------------------------------------

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.slice(dotIndex).toLowerCase();
}

type ImportReport = {
  ok: true;
  total: number;
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
};

// ---- handler ----------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth check BEFORE the try block — intentional per acceptance criteria.
  await requireAdmin();

  try {
    const isDryRun = req.nextUrl.searchParams.get('dryRun') === '1';

    // Parse multipart
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Request must be multipart/form-data' },
        { status: 400 },
      );
    }

    const fileField = formData.get('file');
    if (!fileField || typeof fileField === 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing file field in form data' },
        { status: 400 },
      );
    }

    const file = fileField as File;

    // Size guard
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `File exceeds 2 MB limit (${file.size} bytes received)` },
        { status: 400 },
      );
    }

    // MIME + extension guard
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `File extension "${ext}" is not allowed. Use .xlsx, .xls, or .csv` },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: `MIME type "${file.type}" is not allowed`,
        },
        { status: 400 },
      );
    }

    // Buffer the upload — use globalThis.Buffer to keep the non-generic Buffer type
    // that exceljs's .d.ts expects. The newer @types/node uses Buffer<ArrayBuffer>
    // which is structurally identical at runtime but trips the type checker.
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeBuffer: Buffer = (globalThis as any).Buffer.from(arrayBuffer) as Buffer;

    // Parse spreadsheet
    const workbook = new ExcelJS.Workbook();
    try {
      if (ext === '.csv') {
        // exceljs csv parse accepts a readable stream
        const { Readable } = await import('stream');
        await workbook.csv.read(Readable.from(nodeBuffer));
      } else {
        // @ts-expect-error — exceljs .d.ts types load() as Buffer (old monomorphic Node
        // type). @types/node 22+ narrows it to Buffer<ArrayBuffer>. Structurally identical
        // at runtime; the mismatch is a typing artefact only.
        await workbook.xlsx.load(nodeBuffer);
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Could not parse spreadsheet. Ensure it is a valid .xlsx, .xls, or .csv file.' },
        { status: 400 },
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { ok: false, error: 'Spreadsheet has no worksheets' },
        { status: 400 },
      );
    }

    // Extract header row (row 1) and build headerMap
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      headers.push(String(cell.value ?? '').trim());
    });

    if (headers.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Header row is empty' },
        { status: 400 },
      );
    }

    // headerMap: normalizedKey -> rawHeader
    const headerMap = buildHeaderMap(headers);

    // Build column index map: rawHeader -> column number (1-based)
    const colIndexMap: Record<string, number> = {};
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      colIndexMap[String(cell.value ?? '').trim()] = colNumber;
    });

    // Process data rows
    const report: ImportReport = {
      ok: true,
      total: 0,
      created: 0,
      updated: 0,
      errors: [],
    };

    const supabase = await createClient();

    // Fetch all existing orgs once for de-dupe (name + town key)
    // De-dupe key: name (case-insensitive trim) + town (case-insensitive trim)
    const existingOrgs = await getOrganizations(supabase, undefined, false);
    const existingMap = new Map(
      existingOrgs.map((o) => [
        `${o.name.trim().toLowerCase()}|${o.town.trim().toLowerCase()}`,
        o.id,
      ]),
    );

    const totalRows = worksheet.rowCount;

    for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
      const dataRow = worksheet.getRow(rowNumber);

      // Skip completely blank rows
      let hasContent = false;
      dataRow.eachCell({ includeEmpty: false }, () => { hasContent = true; });
      if (!hasContent) continue;

      report.total += 1;

      // Build row object: rawHeader -> cell value
      const rowObj: Record<string, unknown> = {};
      for (const rawHeader of headers) {
        const colIndex = colIndexMap[rawHeader];
        if (colIndex === undefined) continue;
        const cell = dataRow.getCell(colIndex);
        // Coerce rich text / formula results to plain string/number
        let value: unknown = cell.value;
        if (value !== null && typeof value === 'object' && 'result' in (value as object)) {
          value = (value as { result: unknown }).result;
        }
        if (value !== null && typeof value === 'object' && 'richText' in (value as object)) {
          value = (value as { richText: { text: string }[] }).richText
            .map((r) => r.text)
            .join('');
        }
        rowObj[rawHeader] = value;
      }

      // Map row to form values
      const mapped = mapSpreadsheetRowToFormValues(rowObj, headerMap);
      if ('error' in mapped) {
        report.errors.push({ row: rowNumber, error: mapped.error });
        continue;
      }

      // Validate via zod
      const parsed = organizationSchema.safeParse(mapped);
      if (!parsed.success) {
        const msg = parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        report.errors.push({ row: rowNumber, error: msg });
        continue;
      }

      const validated = parsed.data as unknown as OrganizationFormData;

      if (isDryRun) {
        // Predict action without writing
        const dedupeKey = `${validated.name.trim().toLowerCase()}|${validated.town.trim().toLowerCase()}`;
        if (existingMap.has(dedupeKey)) {
          report.updated += 1;
        } else {
          report.created += 1;
        }
        continue;
      }

      // Upsert: de-dupe on name + town (case-insensitive, trimmed)
      const dedupeKey = `${validated.name.trim().toLowerCase()}|${validated.town.trim().toLowerCase()}`;
      const existingId = existingMap.get(dedupeKey);

      try {
        if (existingId) {
          await updateOrganization(supabase, existingId, validated);
          report.updated += 1;
        } else {
          const created = await createOrganization(supabase, validated);
          // Add to map so duplicate rows later in the same file update rather than insert
          existingMap.set(dedupeKey, created.id);
          report.created += 1;
        }
      } catch (dbErr) {
        const msg = dbErr instanceof Error ? dbErr.message : 'Database error';
        report.errors.push({ row: rowNumber, error: msg });
      }
    }

    // Revalidate after a successful non-dry-run import with at least one write
    if (!isDryRun && (report.created > 0 || report.updated > 0)) {
      revalidatePath('/admin/organizations');
      revalidatePath('/');
    }

    // Log counts only — not cell content (may contain PII)
    console.info(
      JSON.stringify({
        event: 'import_organizations',
        dryRun: isDryRun,
        total: report.total,
        created: report.created,
        updated: report.updated,
        errorCount: report.errors.length,
      }),
    );

    return NextResponse.json(report, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(JSON.stringify({ event: 'import_organizations_error', error: msg }));
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
