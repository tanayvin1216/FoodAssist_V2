'use client';

import { useMemo, useState } from 'react';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import type { VolunteerApplication } from '@/types/database';
import { adminReviewApplicationAction } from './actions';

interface OrgOption {
  id: string;
  name: string;
}

interface AdminApplicationsClientProps {
  applications: VolunteerApplication[];
  organizations: OrgOption[];
}

export function AdminApplicationsClient({
  applications,
  organizations,
}: AdminApplicationsClientProps) {
  const [orgFilter, setOrgFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (orgFilter === 'all') return applications;
    if (orgFilter === 'general') {
      return applications.filter(
        (a) => !a.organization_id && !a.volunteer_need_id,
      );
    }
    return applications.filter((a) => {
      if (a.organization_id === orgFilter) return true;
      // volunteer_need.organization_id is not included in the type
      // but present at runtime; accessed via any-safe lookup below.
      const need = a.volunteer_need as unknown as
        | { organization_id?: string }
        | undefined;
      return need?.organization_id === orgFilter;
    });
  }, [applications, orgFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-muted-text">
          Organization
        </label>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="h-9 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
        >
          <option value="all">All organizations</option>
          <option value="general">General applications (unassigned)</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-text">
          Showing {filtered.length} of {applications.length}
        </span>
      </div>

      <ApplicationsTable
        applications={filtered}
        showOrganization
        onReview={adminReviewApplicationAction}
      />
    </div>
  );
}
