'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Building2,
  DollarSign,
  HandHeart,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Organization, CouncilDonation, VolunteerNeed, AssistanceType } from '@/types/database';

// ---- Data shapes passed from the RSC ----

export interface OrgsByTown {
  town: string;
  activeCount: number;
  totalCount: number;
}

export interface OrgsByType {
  type: AssistanceType;
  label: string;
  count: number;
}

export interface DonationsByMonth {
  month: string; // "YYYY-MM"
  label: string;
  count: number;
  totalAmount: number;
}

export interface DonationsByType {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
}

export interface VolunteersByOrg {
  orgName: string;
  activeCount: number;
  totalCount: number;
}

export interface ReportsData {
  allOrganizations: Organization[];
  allDonations: CouncilDonation[];
  allVolunteerNeeds: VolunteerNeed[];
  orgsByTown: OrgsByTown[];
  orgsByType: OrgsByType[];
  donationsByMonth: DonationsByMonth[];
  donationsByType: DonationsByType[];
  volunteersByOrg: VolunteersByOrg[];
  summaryActiveOrgs: number;
  summaryTownsCovered: number;
  summaryDonationsYtd: number;
  summaryVolunteerPosts: number;
}

// ---- CSV helpers ----

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ---- Sub-components ----

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-lg border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#C4B8AD',
      }}
    >
      <div className="flex items-center gap-2" style={{ color: '#8C7E72' }}>
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold" style={{ color: '#1B2D3A' }}>
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E8F4F3' }}>
      <div
        className="h-2 rounded-full"
        style={{ width: `${pct}%`, backgroundColor: '#0D7C8F' }}
      />
    </div>
  );
}

// ---- Main client component ----

export default function ReportsClient({ data }: { data: ReportsData }) {
  const [includeInactive, setIncludeInactive] = useState(false);

  const {
    allOrganizations,
    allDonations,
    allVolunteerNeeds,
    orgsByTown,
    orgsByType,
    donationsByMonth,
    donationsByType,
    volunteersByOrg,
    summaryActiveOrgs,
    summaryTownsCovered,
    summaryDonationsYtd,
    summaryVolunteerPosts,
  } = data;

  const maxTownCount = Math.max(...orgsByTown.map((t) => t.totalCount), 1);
  const maxTypeCount = Math.max(...orgsByType.map((t) => t.count), 1);
  const recentDonations = [...allDonations].slice(0, 10);

  // ---- CSV export handlers ----

  function handleExportOrgs() {
    const orgs = includeInactive
      ? allOrganizations
      : allOrganizations.filter((o) => o.is_active);
    const headers = ['Name', 'Town', 'ZIP', 'Phone', 'Assistance Types', 'Status'];
    const rows = orgs.map((o) => [
      o.name,
      o.town,
      o.zip,
      o.phone,
      o.assistance_types.join('; '),
      o.is_active ? 'Active' : 'Inactive',
    ]);
    downloadCsv([headers, ...rows], `organizations-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Organizations CSV downloaded');
  }

  function handleExportDonations() {
    const donations = includeInactive ? allDonations : allDonations;
    const headers = ['Date', 'Organization', 'Type', 'Amount', 'Description'];
    const rows = donations.map((d) => [
      d.donation_date,
      d.organization?.name ?? d.organization_id,
      d.donation_type,
      d.amount != null ? d.amount.toString() : '',
      d.description,
    ]);
    downloadCsv([headers, ...rows], `donations-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Donations CSV downloaded');
  }

  function handleExportVolunteers() {
    const needs = includeInactive
      ? allVolunteerNeeds
      : allVolunteerNeeds.filter((v) => v.is_active);
    const headers = ['Organization', 'Title', 'Description', 'Date Needed', 'Time Commitment', 'Status'];
    const rows = needs.map((v) => [
      v.organization?.name ?? v.organization_id,
      v.title,
      v.description,
      v.needed_date ?? '',
      v.time_commitment ?? '',
      v.is_active ? 'Active' : 'Inactive',
    ]);
    downloadCsv([headers, ...rows], `volunteer-needs-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Volunteer needs CSV downloaded');
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
          Reports
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
          Carteret County food assistance — live data from the database
        </p>
      </div>

      {/* Export scope toggle */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg border"
        style={{ borderColor: '#C4B8AD', backgroundColor: '#F5F0EB' }}
      >
        <Checkbox
          id="include-inactive"
          checked={includeInactive}
          onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
        />
        <Label htmlFor="include-inactive" className="font-normal text-sm" style={{ color: '#4A5568' }}>
          Include inactive organizations and volunteer needs in CSV exports
        </Label>
      </div>

      {/* Summary cards */}
      <section>
        <h2 className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C7E72' }}>
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard icon={Building2} label="Active orgs" value={summaryActiveOrgs} />
          <SummaryCard icon={MapPin} label="Towns covered" value={summaryTownsCovered} />
          <SummaryCard
            icon={DollarSign}
            label="Donations YTD"
            value={formatCurrency(summaryDonationsYtd)}
          />
          <SummaryCard icon={HandHeart} label="Volunteer posts" value={summaryVolunteerPosts} />
        </div>
      </section>

      {/* Orgs by town */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider" style={{ color: '#8C7E72' }}>
            Organizations by Town
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrgs}
            className="gap-1.5 text-xs"
            style={{ borderColor: '#0D7C8F', color: '#0D7C8F' }}
          >
            <Download className="w-3 h-3" />
            Download CSV
          </Button>
        </div>
        <div
          className="rounded-lg border divide-y"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#FFFFFF' }}
        >
          {orgsByTown.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: '#8C7E72' }}>
              No data yet
            </p>
          ) : (
            orgsByTown.map((row) => (
              <div key={row.town} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: '#1B2D3A' }}>
                    {row.town}
                  </span>
                  <span className="text-xs" style={{ color: '#8C7E72' }}>
                    {row.activeCount} active / {row.totalCount} total
                  </span>
                </div>
                <ProgressBar value={row.totalCount} max={maxTownCount} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Orgs by assistance type */}
      <section>
        <h2 className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C7E72' }}>
          Organizations by Assistance Type
        </h2>
        <div
          className="rounded-lg border divide-y"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#FFFFFF' }}
        >
          {orgsByType.map((row) => (
            <div key={row.type} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: '#1B2D3A' }}>
                  {row.label}
                </span>
                <span className="text-xs" style={{ color: '#8C7E72' }}>
                  {row.count} org{row.count !== 1 ? 's' : ''}
                </span>
              </div>
              <ProgressBar value={row.count} max={maxTypeCount} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent donations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider" style={{ color: '#8C7E72' }}>
            Recent Donations (latest 10)
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDonations}
            className="gap-1.5 text-xs"
            style={{ borderColor: '#0D7C8F', color: '#0D7C8F' }}
          >
            <Download className="w-3 h-3" />
            Download CSV
          </Button>
        </div>
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#FFFFFF' }}
        >
          {recentDonations.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: '#8C7E72' }}>
              No donations recorded yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F5F0EB', color: '#8C7E72' }}>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider">Organization</th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right px-4 py-2 font-medium text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#C4B8AD' }}>
                {recentDonations.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2.5" style={{ color: '#4A5568' }}>
                      {new Date(d.donation_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#1B2D3A' }}>
                      {d.organization?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 capitalize" style={{ color: '#4A5568' }}>
                      {d.donation_type}
                    </td>
                    <td className="px-4 py-2.5 text-right" style={{ color: '#4A5568' }}>
                      {d.amount != null ? formatCurrency(d.amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Top orgs by volunteer posts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider" style={{ color: '#8C7E72' }}>
            Top Organizations by Volunteer Posts
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportVolunteers}
            className="gap-1.5 text-xs"
            style={{ borderColor: '#0D7C8F', color: '#0D7C8F' }}
          >
            <Download className="w-3 h-3" />
            Download CSV
          </Button>
        </div>
        <div
          className="rounded-lg border divide-y"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#FFFFFF' }}
        >
          {volunteersByOrg.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: '#8C7E72' }}>
              No volunteer needs posted yet
            </p>
          ) : (
            volunteersByOrg.map((row) => (
              <div key={row.orgName} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium" style={{ color: '#1B2D3A' }}>
                  {row.orgName}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#E8F4F3', color: '#0D7C8F' }}
                >
                  {row.activeCount} active / {row.totalCount} total
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* PDF export — coming soon */}
      <section>
        <h2 className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C7E72' }}>
          PDF Report
        </h2>
        <div
          className="rounded-lg border px-5 py-5 flex items-start gap-4"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#FFFFFF' }}
        >
          <FileText className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#8C7E72' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: '#1B2D3A' }}>
              Formatted PDF Directory
            </p>
            <p className="text-sm mt-1" style={{ color: '#8C7E72' }}>
              Print-ready PDF with all organizations grouped by town or service type. Requires a
              server-side rendering library — not yet configured.
            </p>
          </div>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="shrink-0 text-xs"
            style={{ borderColor: '#C4B8AD', color: '#8C7E72' }}
          >
            Coming soon
          </Button>
        </div>
      </section>
    </div>
  );
}
