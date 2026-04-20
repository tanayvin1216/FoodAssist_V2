import type { VolunteerApplication } from '@/types/database';

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // RFC 4180 — wrap in quotes if the cell contains comma, quote, or newline.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  'Submitted',
  'Status',
  'Applicant Name',
  'Email',
  'Phone',
  'Opportunity',
  'Organization',
  'Willing to do',
  'Hours per week',
  'Availability',
  'Review notes',
];

export function applicationsToCSV(applications: VolunteerApplication[]): string {
  const rows = applications.map((a) => [
    new Date(a.created_at).toISOString(),
    a.status,
    a.applicant_name,
    a.applicant_email,
    a.applicant_phone ?? '',
    a.volunteer_need?.title ?? 'General application',
    a.organization?.name ?? '',
    a.willing_to_do,
    a.hours_per_week ?? '',
    a.availability ?? '',
    a.review_notes ?? '',
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\r\n');
}

export function triggerCSVDownload(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
