import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  getOrganizations,
  getCouncilDonations,
  getVolunteerNeeds,
} from '@/lib/supabase/queries';
import ReportsClient, {
  type OrgsByTown,
  type OrgsByType,
  type DonationsByMonth,
  type DonationsByType,
  type VolunteersByOrg,
  type ReportsData,
} from './ReportsClient';
import type { AssistanceType } from '@/types/database';

export const metadata = { title: 'Reports — FoodAssist Admin' };

const ASSISTANCE_LABELS: Record<AssistanceType, string> = {
  collection: 'Collection / Drive',
  hot_meals_eat_in: 'Hot Meals (Eat In)',
  hot_meals_pickup: 'Hot Meals (Pickup)',
  hot_meals_delivery: 'Hot Meals (Delivery)',
  staffed_pantry: 'Staffed Pantry',
  self_serve_pantry: 'Self-Serve Pantry',
};

export default async function AdminReportsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const [allOrganizations, allDonations, allVolunteerNeeds] = await Promise.all([
    getOrganizations(supabase, undefined, false),
    getCouncilDonations(supabase),
    getVolunteerNeeds(supabase, undefined, false),
  ]);

  // ---- Orgs by town ----
  const townMap = new Map<string, { active: number; total: number }>();
  for (const org of allOrganizations) {
    const key = org.town ?? 'Unknown';
    const entry = townMap.get(key) ?? { active: 0, total: 0 };
    entry.total += 1;
    if (org.is_active) entry.active += 1;
    townMap.set(key, entry);
  }
  const orgsByTown: OrgsByTown[] = [...townMap.entries()]
    .map(([town, counts]) => ({ town, activeCount: counts.active, totalCount: counts.total }))
    .sort((a, b) => b.totalCount - a.totalCount);

  // ---- Orgs by assistance type ----
  const typeMap = new Map<AssistanceType, number>();
  for (const org of allOrganizations.filter((o) => o.is_active)) {
    for (const t of org.assistance_types ?? []) {
      typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
    }
  }
  const orgsByType: OrgsByType[] = (Object.keys(ASSISTANCE_LABELS) as AssistanceType[]).map(
    (type) => ({
      type,
      label: ASSISTANCE_LABELS[type],
      count: typeMap.get(type) ?? 0,
    })
  );

  // ---- Donations by month ----
  const monthMap = new Map<string, { count: number; totalAmount: number }>();
  for (const d of allDonations) {
    const key = d.donation_date.slice(0, 7); // "YYYY-MM"
    const entry = monthMap.get(key) ?? { count: 0, totalAmount: 0 };
    entry.count += 1;
    entry.totalAmount += d.amount ?? 0;
    monthMap.set(key, entry);
  }
  const donationsByMonth: DonationsByMonth[] = [...monthMap.entries()]
    .map(([month, val]) => ({
      month,
      label: new Date(`${month}-01`).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      count: val.count,
      totalAmount: val.totalAmount,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // ---- Donations by type ----
  const donTypeMap = new Map<string, { count: number; totalAmount: number }>();
  for (const d of allDonations) {
    const key = d.donation_type;
    const entry = donTypeMap.get(key) ?? { count: 0, totalAmount: 0 };
    entry.count += 1;
    entry.totalAmount += d.amount ?? 0;
    donTypeMap.set(key, entry);
  }
  const donationsByType: DonationsByType[] = [...donTypeMap.entries()]
    .map(([type, val]) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      count: val.count,
      totalAmount: val.totalAmount,
    }))
    .sort((a, b) => b.count - a.count);

  // ---- Volunteer needs by org ----
  const volOrgMap = new Map<string, { active: number; total: number }>();
  for (const v of allVolunteerNeeds) {
    const key = v.organization?.name ?? v.organization_id;
    const entry = volOrgMap.get(key) ?? { active: 0, total: 0 };
    entry.total += 1;
    if (v.is_active) entry.active += 1;
    volOrgMap.set(key, entry);
  }
  const volunteersByOrg: VolunteersByOrg[] = [...volOrgMap.entries()]
    .map(([orgName, counts]) => ({
      orgName,
      activeCount: counts.active,
      totalCount: counts.total,
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 10);

  // ---- Summary numbers ----
  const currentYear = new Date().getFullYear().toString();
  const summaryActiveOrgs = allOrganizations.filter((o) => o.is_active).length;
  const summaryTownsCovered = new Set(
    allOrganizations.filter((o) => o.is_active).map((o) => o.town)
  ).size;
  const summaryDonationsYtd = allDonations
    .filter((d) => d.donation_date.startsWith(currentYear))
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const summaryVolunteerPosts = allVolunteerNeeds.filter((v) => v.is_active).length;

  const reportData: ReportsData = {
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
  };

  return <ReportsClient data={reportData} />;
}
