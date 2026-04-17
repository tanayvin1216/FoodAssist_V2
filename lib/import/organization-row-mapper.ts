/**
 * Maps a raw spreadsheet row (keyed by normalized column header) to
 * OrganizationFormValues.  Returns { error } on unrecoverable parse failure.
 *
 * Normalization: trim + lowercase + replace spaces/hyphens with underscores.
 * Callers pass `headerMap` as { normalizedHeader -> dbField } built by the
 * route from the sheet's first row.
 */

import type { OrganizationFormValues } from '@/lib/validations/schemas';
import { ASSISTANCE_TYPES, DONATION_TYPES, SERVED_POPULATIONS } from '@/lib/utils/constants';

export type MapperResult = OrganizationFormValues | { error: string };

// ---- helpers ----------------------------------------------------------------

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s\-]+/g, '_');
}

/**
 * Build a lookup from normalized header -> raw cell value using the header map.
 * `headerMap` is { normalizedSheetHeader -> dbFieldName }.
 * `row` is { rawSheetHeader -> cellValue }.
 */
export function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    map[normalizeKey(h)] = h;
  }
  return map;
}

function getString(
  row: Record<string, unknown>,
  key: string,
): string {
  const v = row[key];
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function parseBoolean(
  raw: string,
  defaultValue: boolean,
): boolean {
  const lower = raw.toLowerCase();
  if (['yes', 'true', '1'].includes(lower)) return true;
  if (['no', 'false', '0'].includes(lower)) return false;
  return defaultValue;
}

/**
 * Split a delimited cell (`;` or `,`) into trimmed, non-empty strings.
 * Returns an error string if any item fails the whitelist check.
 */
function parseArray<T extends string>(
  raw: string,
  allowedValues: readonly T[],
  fieldName: string,
): T[] | { error: string } {
  if (!raw) return [];
  const items = raw
    .split(/[;,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const invalid = items.filter((i) => !(allowedValues as unknown as string[]).includes(i));
  if (invalid.length > 0) {
    return {
      error: `${fieldName}: unknown value(s) — ${invalid.join(', ')}. Allowed: ${allowedValues.join(', ')}`,
    };
  }
  return items as T[];
}

// ---- main export ------------------------------------------------------------

/**
 * Maps a single spreadsheet row to OrganizationFormValues.
 *
 * @param row       Key-value map using the RAW header names from the sheet.
 * @param headerMap { normalizedKey -> rawHeader } produced by buildHeaderMap().
 */
export function mapSpreadsheetRowToFormValues(
  row: Record<string, unknown>,
  headerMap: Record<string, string>,
): MapperResult {
  // Helper: get by normalized db field name
  const get = (dbField: string): string => {
    // headerMap maps normalizedSheetHeader -> rawHeader
    // We look up by normalized name which may equal the db field directly,
    // or via common aliases documented in the import template.
    const rawHeader = headerMap[dbField] ?? headerMap[normalizeKey(dbField)];
    if (!rawHeader) return '';
    return getString(row, rawHeader);
  };

  // Array fields
  const assistanceTypesResult = parseArray(
    get('assistance_types'),
    ASSISTANCE_TYPES,
    'assistance_types',
  );
  if ('error' in assistanceTypesResult) return assistanceTypesResult;

  const donationsAcceptedResult = parseArray(
    get('donations_accepted'),
    DONATION_TYPES,
    'donations_accepted',
  );
  if ('error' in donationsAcceptedResult) return donationsAcceptedResult;

  const whoServedResult = parseArray(
    get('who_served'),
    SERVED_POPULATIONS,
    'who_served',
  );
  if ('error' in whoServedResult) return whoServedResult;

  // cost enum
  const rawCost = get('cost') || 'free';
  const costAllowed = ['free', 'sliding_scale', 'other'] as const;
  if (!costAllowed.includes(rawCost as (typeof costAllowed)[number])) {
    return { error: `cost: unknown value "${rawCost}". Allowed: free, sliding_scale, other` };
  }
  const cost = rawCost as 'free' | 'sliding_scale' | 'other';

  // num_meals_available
  const rawMeals = get('num_meals_available');
  let numMeals: number | undefined;
  if (rawMeals) {
    const parsed = parseInt(rawMeals, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return { error: `num_meals_available: "${rawMeals}" is not a positive integer` };
    }
    numMeals = parsed;
  }

  // boolean fields with documented defaults
  const rawIsActive = get('is_active');
  const isActive = rawIsActive === '' ? true : parseBoolean(rawIsActive, true);

  const rawSpanish = get('spanish_available');
  const spanishAvailable = rawSpanish === '' ? false : parseBoolean(rawSpanish, false);

  // operating_hours — leave as empty array if blank (JSONB nullable in DB)
  // Admins can add hours later via the Edit dialog.
  const operatingHours: OrganizationFormValues['operating_hours'] = [];

  // storage_capacity — optional, skip if blank
  let storageCapacity: OrganizationFormValues['storage_capacity'];
  const rawRefrig = get('storage_refrigerator');
  const rawFreezer = get('storage_freezer');
  const rawDry = get('storage_dry');
  if (rawRefrig || rawFreezer || rawDry) {
    storageCapacity = {
      refrigerator: parseBoolean(rawRefrig, false),
      freezer: parseBoolean(rawFreezer, false),
      dry_storage: parseBoolean(rawDry, false),
      notes: get('storage_notes') || undefined,
    };
  }

  return {
    name: get('name'),
    address: get('address'),
    town: get('town'),
    zip: get('zip'),
    contact_name: get('contact_name') || undefined,
    phone: get('phone'),
    email: get('email') || undefined,
    website: get('website') || undefined,
    facebook: get('facebook') || undefined,
    assistance_types: assistanceTypesResult,
    who_served: whoServedResult,
    cost,
    num_meals_available: numMeals,
    operating_hours: operatingHours,
    hours_notes: get('hours_notes') || undefined,
    donations_accepted: donationsAcceptedResult,
    storage_capacity: storageCapacity,
    comments: get('comments') || undefined,
    is_active: isActive,
    spanish_available: spanishAvailable,
  };
}
