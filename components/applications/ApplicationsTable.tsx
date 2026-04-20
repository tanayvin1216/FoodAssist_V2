'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Mail, Phone, X, MessageSquare, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import type {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from '@/types/database';
import { applicationsToCSV, triggerCSVDownload } from '@/lib/utils/csv';

type StatusFilter = 'all' | VolunteerApplicationStatus;

interface ApplicationsTableProps {
  applications: VolunteerApplication[];
  showOrganization?: boolean;
  exportFilename?: string;
  onReview: (input: {
    id: string;
    status: VolunteerApplicationStatus;
    review_notes?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const STATUS_LABEL: Record<VolunteerApplicationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  contacted: 'Contacted',
};

const STATUS_STYLES: Record<VolunteerApplicationStatus, string> = {
  pending: 'bg-amber-50 text-amber-900 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-900 border-rose-200',
  contacted: 'bg-sky-50 text-sky-900 border-sky-200',
};

export function ApplicationsTable({
  applications,
  showOrganization = false,
  exportFilename = 'volunteer-applications.csv',
  onReview,
}: ApplicationsTableProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!q) return true;
      const haystack = [
        a.applicant_name,
        a.applicant_email,
        a.applicant_phone || '',
        a.willing_to_do,
        a.organization?.name || '',
        a.volunteer_need?.title || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, filter, query]);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: applications.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      contacted: 0,
    };
    for (const a of applications) base[a.status] += 1;
    return base;
  }, [applications]);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('Nothing to export with current filters');
      return;
    }
    const csv = applicationsToCSV(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    triggerCSVDownload(csv, exportFilename.replace(/\.csv$/, '') + `-${stamp}.csv`);
  };

  const review = (
    id: string,
    status: VolunteerApplicationStatus,
    notes?: string,
  ) => {
    startTransition(async () => {
      const result = await onReview({ id, status, review_notes: notes });
      if (result.ok) {
        toast.success(`Marked ${STATUS_LABEL[status].toLowerCase()}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'pending', 'approved', 'contacted', 'rejected'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`h-9 px-3 text-xs uppercase tracking-wider rounded-full transition-colors ${
                filter === s
                  ? 'bg-navy text-white'
                  : 'bg-white text-body-text border border-divider hover:bg-navy/5'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
              <span className="ml-2 opacity-70">{counts[s]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, opportunity…"
            className="h-9 w-full sm:w-64 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={handleExport}
            className="h-9 px-3 rounded-full border border-divider bg-white text-body-text hover:bg-navy/5 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-divider py-12 text-center text-sm text-muted-text">
          No applications match your filters.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => {
            const isOpen = expandedId === a.id;
            const note = noteDraft[a.id] ?? a.review_notes ?? '';
            return (
              <li
                key={a.id}
                className="bg-white rounded-2xl border border-divider overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-navy">{a.applicant_name}</p>
                        <span
                          className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border ${STATUS_STYLES[a.status]}`}
                        >
                          {STATUS_LABEL[a.status]}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-body-text">
                        <a
                          href={`mailto:${a.applicant_email}`}
                          className="inline-flex items-center gap-1 hover:text-navy"
                        >
                          <Mail className="w-3 h-3" />
                          {a.applicant_email}
                        </a>
                        {a.applicant_phone && (
                          <a
                            href={`tel:${a.applicant_phone}`}
                            className="inline-flex items-center gap-1 hover:text-navy"
                          >
                            <Phone className="w-3 h-3" />
                            {a.applicant_phone}
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1 text-muted-text">
                          <Clock className="w-3 h-3" />
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {(a.volunteer_need?.title || (showOrganization && a.organization?.name)) && (
                        <p className="mt-2 text-xs text-muted-text">
                          {a.volunteer_need?.title ?? 'General application'}
                          {showOrganization && a.organization?.name && (
                            <> · {a.organization.name}</>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => review(a.id, 'approved', a.review_notes ?? undefined)}
                        disabled={pending || a.status === 'approved'}
                        className="h-8 px-3 rounded-full text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => review(a.id, 'rejected', a.review_notes ?? undefined)}
                        disabled={pending || a.status === 'rejected'}
                        className="h-8 px-3 rounded-full text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                      <button
                        onClick={() => setExpandedId(isOpen ? null : a.id)}
                        className="h-8 px-3 rounded-full text-xs font-medium border border-divider text-body-text hover:bg-navy/5 inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {isOpen ? 'Close' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-divider space-y-3 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-text mb-1">
                          Willing to help with
                        </p>
                        <p className="text-body-text whitespace-pre-wrap">
                          {a.willing_to_do}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {a.hours_per_week && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-text mb-1">
                              Hours/week
                            </p>
                            <p className="text-body-text">{a.hours_per_week}</p>
                          </div>
                        )}
                        {a.availability && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-text mb-1">
                              Availability
                            </p>
                            <p className="text-body-text">{a.availability}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`note-${a.id}`}
                          className="text-[10px] uppercase tracking-wider text-muted-text mb-1 block"
                        >
                          Internal notes
                        </label>
                        <textarea
                          id={`note-${a.id}`}
                          rows={3}
                          value={note}
                          onChange={(e) =>
                            setNoteDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-divider bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy resize-none"
                          placeholder="Notes for the team…"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => review(a.id, a.status, note)}
                            disabled={pending}
                            className="h-8 px-3 rounded-full text-xs font-medium bg-navy text-white hover:bg-navy-light disabled:opacity-50"
                          >
                            Save notes
                          </button>
                          <button
                            onClick={() => review(a.id, 'contacted', note)}
                            disabled={pending}
                            className="h-8 px-3 rounded-full text-xs font-medium border border-divider text-body-text hover:bg-navy/5"
                          >
                            Mark contacted
                          </button>
                          <button
                            onClick={() => review(a.id, 'pending', note)}
                            disabled={pending}
                            className="h-8 px-3 rounded-full text-xs font-medium border border-divider text-body-text hover:bg-navy/5"
                          >
                            Reset to pending
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
