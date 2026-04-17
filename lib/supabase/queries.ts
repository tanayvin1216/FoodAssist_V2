import { SupabaseClient } from '@supabase/supabase-js';
import {
  Organization,
  AssistanceType,
  CouncilDonation,
  VolunteerNeed,
  Profile,
  DirectoryFilters,
  OrganizationFormData,
  CouncilDonationFormData,
  VolunteerNeedFormData,
} from '@/types/database';
import { SiteSettings } from '@/types/settings';
import { defaultSettings } from '@/config/default-settings';

// ============== Organizations ==============

export async function getOrganizations(
  supabase: SupabaseClient,
  filters?: DirectoryFilters,
  activeOnly: boolean = true
): Promise<Organization[]> {
  let query = supabase
    .from('organizations')
    .select('*')
    .order('name');

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,town.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
    );
  }

  if (filters?.town) {
    query = query.eq('town', filters.town);
  }

  if (filters?.assistanceTypes && filters.assistanceTypes.length > 0) {
    query = query.overlaps('assistance_types', filters.assistanceTypes);
  }

  if (filters?.donationTypes && filters.donationTypes.length > 0) {
    query = query.overlaps('donations_accepted', filters.donationTypes);
  }

  if (filters?.servedPopulations && filters.servedPopulations.length > 0) {
    query = query.overlaps('who_served', filters.servedPopulations);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Filter by days open (client-side since operating_hours is JSONB)
  let organizations = data as Organization[];

  if (filters?.daysOpen && filters.daysOpen.length > 0) {
    organizations = organizations.filter((org) => {
      const openDays = org.operating_hours
        ?.filter((h) => !h.is_closed)
        .map((h) => h.day);
      return filters.daysOpen!.some((day) => openDays?.includes(day));
    });
  }

  return organizations;
}

export async function getOrganizationById(
  supabase: SupabaseClient,
  id: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Organization;
}

export async function createOrganization(
  supabase: SupabaseClient,
  data: OrganizationFormData
): Promise<Organization> {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return org as Organization;
}

export async function updateOrganization(
  supabase: SupabaseClient,
  id: string,
  data: Partial<OrganizationFormData>
): Promise<Organization> {
  const { data: org, error } = await supabase
    .from('organizations')
    .update({ ...data, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return org as Organization;
}

export async function deleteOrganization(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw error;
}

// ============== Council Donations ==============

export async function getCouncilDonations(
  supabase: SupabaseClient,
  organizationId?: string
): Promise<CouncilDonation[]> {
  let query = supabase
    .from('council_donations')
    .select('*, organization:organizations(id, name)')
    .order('donation_date', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as CouncilDonation[];
}

export async function createCouncilDonation(
  supabase: SupabaseClient,
  data: CouncilDonationFormData
): Promise<CouncilDonation> {
  const { data: donation, error } = await supabase
    .from('council_donations')
    .insert(data)
    .select('*, organization:organizations(id, name)')
    .single();

  if (error) throw error;
  return donation as CouncilDonation;
}

export async function deleteCouncilDonation(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('council_donations').delete().eq('id', id);
  if (error) throw error;
}

// ============== Volunteer Needs ==============

export async function getVolunteerNeeds(
  supabase: SupabaseClient,
  organizationId?: string,
  activeOnly: boolean = true
): Promise<VolunteerNeed[]> {
  let query = supabase
    .from('volunteer_needs')
    .select('*, organization:organizations(id, name)')
    .order('posted_date', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as VolunteerNeed[];
}

export async function createVolunteerNeed(
  supabase: SupabaseClient,
  data: VolunteerNeedFormData
): Promise<VolunteerNeed> {
  const { data: need, error } = await supabase
    .from('volunteer_needs')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return need as VolunteerNeed;
}

export async function updateVolunteerNeed(
  supabase: SupabaseClient,
  id: string,
  data: Partial<VolunteerNeedFormData>
): Promise<VolunteerNeed> {
  const { data: need, error } = await supabase
    .from('volunteer_needs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return need as VolunteerNeed;
}

export async function deleteVolunteerNeed(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from('volunteer_needs').delete().eq('id', id);
  if (error) throw error;
}

// ============== Profiles ==============

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, organization:organizations(id, name)')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Profile;
}

export async function getAllProfiles(
  supabase: SupabaseClient
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, organization:organizations(id, name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: Partial<Profile>
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return profile as Profile;
}

// ============== Stats ==============

export async function getAdminStats(supabase: SupabaseClient) {
  const [orgs, donations, volunteers, profiles] = await Promise.all([
    supabase.from('organizations').select('id, is_active', { count: 'exact' }),
    supabase.from('council_donations').select('amount'),
    supabase.from('volunteer_needs').select('id, is_active', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ]);

  const activeOrgs = orgs.data?.filter((o) => o.is_active).length || 0;
  const totalDonations =
    donations.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const activeVolunteerNeeds =
    volunteers.data?.filter((v) => v.is_active).length || 0;

  return {
    totalOrganizations: orgs.count || 0,
    activeOrganizations: activeOrgs,
    totalDonationsAmount: totalDonations,
    totalDonationsCount: donations.data?.length || 0,
    activeVolunteerNeeds,
    totalUsers: profiles.count || 0,
  };
}

// ============== Dashboard Snapshot ==============

export interface DashboardSnapshot {
  assistanceTypeCounts: Record<AssistanceType, number>;
  recentOrganizations: Pick<Organization, 'id' | 'name' | 'town' | 'last_updated'>[];
  townCount: number;
}

const ZERO_ASSISTANCE_COUNTS: Record<AssistanceType, number> = {
  collection: 0,
  hot_meals_pickup: 0,
  hot_meals_delivery: 0,
  staffed_pantry: 0,
  self_serve_pantry: 0,
};

export async function getDashboardSnapshot(
  supabase: SupabaseClient
): Promise<DashboardSnapshot> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, town, last_updated, assistance_types')
    .eq('is_active', true);

  if (error) throw error;

  const orgs = (data ?? []) as Pick<
    Organization,
    'id' | 'name' | 'town' | 'last_updated' | 'assistance_types'
  >[];

  const assistanceTypeCounts: Record<AssistanceType, number> = {
    ...ZERO_ASSISTANCE_COUNTS,
  };

  for (const org of orgs) {
    for (const type of org.assistance_types ?? []) {
      if (type in assistanceTypeCounts) {
        assistanceTypeCounts[type as AssistanceType] += 1;
      }
    }
  }

  const townCount = new Set(orgs.map((o) => o.town).filter(Boolean)).size;

  const recentOrganizations = [...orgs]
    .sort(
      (a, b) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    )
    .slice(0, 5)
    .map(({ id, name, town, last_updated }) => ({ id, name, town, last_updated }));

  return { assistanceTypeCounts, recentOrganizations, townCount };
}

// ============== Towns ==============

export async function getUniqueTowns(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('town')
    .eq('is_active', true);

  if (error) throw error;

  const towns = [...new Set(data?.map((d) => d.town))].sort();
  return towns;
}

// ============== Site Settings ==============

interface SiteSettingsRow {
  id: string;
  branding: SiteSettings['branding'];
  contact: SiteSettings['contact'];
  hero: SiteSettings['hero'];
  emergency: SiteSettings['emergency'];
  navigation: SiteSettings['navigation'];
  metadata: SiteSettings['metadata'];
  updated_at: string;
  updated_by: string | null;
}

function rowToSettings(row: SiteSettingsRow): SiteSettings {
  return {
    branding: row.branding,
    contact: row.contact,
    hero: row.hero,
    emergency: row.emergency,
    navigation: row.navigation,
    metadata: row.metadata,
    lastUpdated: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
  };
}

/**
 * Fetch the single site_settings row.
 * Falls back to in-code defaults if the table returns no row.
 */
export async function getSiteSettings(
  supabase: SupabaseClient
): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return { ...defaultSettings };

  return rowToSettings(data as SiteSettingsRow);
}

/**
 * Shallow-merge a partial settings patch into the existing row and persist.
 * Each JSONB column is merged independently (existing keys are preserved
 * unless explicitly overwritten by the patch).
 */
export async function updateSiteSettings(
  supabase: SupabaseClient,
  patch: Partial<SiteSettings>,
  updatedBy: string
): Promise<SiteSettings> {
  const current = await getSiteSettings(supabase);

  const merged = {
    branding: patch.branding
      ? { ...current.branding, ...patch.branding }
      : current.branding,
    contact: patch.contact
      ? { ...current.contact, ...patch.contact }
      : current.contact,
    hero: patch.hero ? { ...current.hero, ...patch.hero } : current.hero,
    emergency: patch.emergency
      ? { ...current.emergency, ...patch.emergency }
      : current.emergency,
    navigation: patch.navigation
      ? { ...current.navigation, ...patch.navigation }
      : current.navigation,
    metadata: patch.metadata
      ? { ...current.metadata, ...patch.metadata }
      : current.metadata,
    updated_by: updatedBy,
  };

  // Single-row table: update every row (there is exactly one by schema constraint)
  const { data, error } = await supabase
    .from('site_settings')
    .update(merged)
    .not('id', 'is', null)
    .select('*')
    .single();

  if (error || !data) throw error ?? new Error('Settings update returned no row');

  return rowToSettings(data as SiteSettingsRow);
}
