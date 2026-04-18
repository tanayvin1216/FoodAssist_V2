'use client';

/**
 * ImportOrganizationsDialog
 *
 * Drag-and-drop (or click) file import for bulk organization upsert.
 * Workflow:
 *   1. Drop / pick file  → shows detected column headers
 *   2. "Validate"        → dry-run against API, shows per-row errors
 *   3. "Import"          → writes to DB, toasts result, refreshes
 */

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---- types ------------------------------------------------------------------

interface RowError {
  row: number;
  error: string;
}

interface ImportReport {
  ok: true;
  total: number;
  created: number;
  updated: number;
  errors: RowError[];
}

interface FailReport {
  ok: false;
  error: string;
}

type ApiReport = ImportReport | FailReport;

type UploadState = 'idle' | 'validating' | 'importing' | 'validated';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/octet-stream',
];

const ALLOWED_EXTS = ['.xlsx', '.xls', '.csv'];

function getExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function readHeadersFromFile(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    // Simple CSV header extraction for preview — full parse is on the server.
    // For xlsx we cannot easily read headers client-side without a library,
    // so we show the filename and a note instead.
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string ?? '';
        const firstLine = text.split('\n')[0] ?? '';
        const headers = firstLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        resolve(headers.filter(Boolean));
      };
      reader.readAsText(file);
    } else {
      // xlsx/xls: we cannot read client-side without xlsx library (disallowed).
      // Return empty to indicate "headers will be detected server-side".
      resolve([]);
    }
  });
}

// ---- component --------------------------------------------------------------

interface ImportOrganizationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportOrganizationsDialog({
  open,
  onOpenChange,
}: ImportOrganizationsDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dryRunReport, setDryRunReport] = useState<ImportReport | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  const resetState = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setUploadState('idle');
    setDryRunReport(null);
    setImportReport(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const handleFile = useCallback(async (incoming: File) => {
    const ext = getExt(incoming.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error(`File type not allowed. Use .xlsx, .xls, or .csv`);
      return;
    }
    if (!ALLOWED_TYPES.includes(incoming.type) && incoming.type !== '') {
      // Some OS send empty type for xlsx — allow it
      toast.error(`MIME type not recognized`);
      return;
    }
    if (incoming.size > 2 * 1024 * 1024) {
      toast.error('File exceeds 2 MB limit');
      return;
    }
    setFile(incoming);
    setDryRunReport(null);
    setImportReport(null);
    setUploadState('idle');
    const detected = await readHeadersFromFile(incoming);
    setHeaders(detected);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const callApi = useCallback(
    async (dryRun: boolean): Promise<ApiReport | null> => {
      if (!file) return null;
      const fd = new FormData();
      fd.append('file', file);
      const url = `/api/import/organizations${dryRun ? '?dryRun=1' : ''}`;
      const res = await fetch(url, { method: 'POST', body: fd });
      const json: ApiReport = await res.json();
      return json;
    },
    [file],
  );

  const handleValidate = useCallback(async () => {
    setUploadState('validating');
    try {
      const report = await callApi(true);
      if (!report) return;
      if (!report.ok) {
        toast.error(report.error);
        setUploadState('idle');
        return;
      }
      setDryRunReport(report);
      setUploadState('validated');
    } catch {
      toast.error('Validation request failed');
      setUploadState('idle');
    }
  }, [callApi]);

  const handleImport = useCallback(async () => {
    setUploadState('importing');
    try {
      const report = await callApi(false);
      if (!report) return;
      if (!report.ok) {
        toast.error(report.error);
        setUploadState('validated');
        return;
      }
      setImportReport(report);
      if (report.errors.length === 0) {
        toast.success(
          `Import complete — ${report.created} created, ${report.updated} updated`,
        );
        router.refresh();
        handleClose();
      } else {
        toast.warning(
          `Import finished with ${report.errors.length} row error(s)`,
        );
        setUploadState('validated');
        router.refresh();
      }
    } catch {
      toast.error('Import request failed');
      setUploadState('validated');
    }
  }, [callApi, handleClose, router]);

  const isWorking = uploadState === 'validating' || uploadState === 'importing';
  const activeReport = importReport ?? dryRunReport;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-shoreline">
        <DialogHeader>
          <DialogTitle className="text-lighthouse">Import Organizations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop spreadsheet file here or click to browse"
            className={[
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragOver
                ? 'border-ocean bg-seafoam'
                : 'border-shoreline bg-sand hover:border-ocean hover:bg-seafoam',
            ].join(' ')}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-ocean" />
                <span className="text-lighthouse font-medium">{file.name}</span>
                <button
                  type="button"
                  aria-label="Remove file"
                  className="text-driftwood hover:text-lighthouse"
                  onClick={(e) => { e.stopPropagation(); resetState(); }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-driftwood">
                <Upload className="w-8 h-8" />
                <p className="text-sm">
                  Drag and drop an .xlsx, .xls, or .csv file, or click to browse
                </p>
                <p className="text-xs">Max 2 MB</p>
              </div>
            )}
          </div>

          {/* Column header preview (CSV only) */}
          {file && headers.length > 0 && (
            <div className="rounded-lg border border-shoreline bg-shell p-4 space-y-2">
              <p className="text-sm font-medium text-lighthouse">
                Detected columns ({headers.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {headers.map((h) => (
                  <Badge
                    key={h}
                    variant="secondary"
                    className="bg-seafoam text-lighthouse border-none text-xs"
                  >
                    {h}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-driftwood">
                Column names are normalized (trimmed, lowercased, spaces → underscores)
                before mapping to database fields.
              </p>
            </div>
          )}

          {file && headers.length === 0 && file.name.match(/\.(xlsx|xls)$/i) && (
            <p className="text-xs text-driftwood">
              Column preview is not available for .xlsx files. Run Validate to inspect
              your data server-side.
            </p>
          )}

          {/* Dry-run / import report */}
          {activeReport && (
            <div className="rounded-lg border border-shoreline bg-shell p-4 space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-body">
                  <span className="font-medium text-lighthouse">{activeReport.total}</span> rows
                </span>
                <span className="text-sm text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  {activeReport.created} to create
                </span>
                <span className="text-sm text-ocean">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  {activeReport.updated} to update
                </span>
                {activeReport.errors.length > 0 && (
                  <span className="text-sm text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    {activeReport.errors.length} error(s)
                  </span>
                )}
              </div>

              {activeReport.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {activeReport.errors.map(({ row, error }) => (
                    <div
                      key={row}
                      className="text-xs bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700"
                    >
                      <span className="font-semibold">Row {row}:</span> {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Template hint */}
          <p className="text-xs text-driftwood">
            Expected columns: name, address, town, zip, phone, cost, assistance_types,
            who_served, donations_accepted, is_active, spanish_available, contact_name,
            email, website, facebook, hours_notes, comments, num_meals_available.
            Array fields: separate values with <code className="font-mono">;</code> or{' '}
            <code className="font-mono">,</code>.
          </p>
        </div>

        <DialogFooter className="gap-2 mt-2 flex-wrap">
          <Button
            variant="outline"
            className="border-shoreline"
            onClick={handleClose}
            disabled={isWorking}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-ocean text-ocean hover:bg-seafoam"
            onClick={handleValidate}
            disabled={!file || isWorking}
          >
            {uploadState === 'validating' ? 'Validating…' : 'Validate (dry-run)'}
          </Button>
          <Button
            className="bg-ocean hover:bg-ocean-deep text-white"
            onClick={handleImport}
            disabled={!file || isWorking}
          >
            {uploadState === 'importing' ? 'Importing…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
