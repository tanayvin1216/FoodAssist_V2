// Database types for Food Assistance Directory

export type AssistanceType =
  | 'collection'
  | 'hot_meals_eat_in'
  | 'hot_meals_pickup'
  | 'hot_meals_delivery'
  | 'staffed_pantry'
  | 'self_serve_pantry';

export type DonationType =
  | 'non_perishables'
  | 'frozen_meals_or_meats'
  | 'fresh_produce'
  | 'prepared_meals'
  | 'hygiene_or_housecleaning'
  | 'kitchen_household_items'
  | 'clothing_or_shoes';

export type ServedPopulation = 'children' | 'older_adults' | 'all';

export type CostType = 'free' | 'sliding_scale' | 'other';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type UserRole = 'admin' | 'organization' | 'public';

export type CouncilDonationType = 'money' | 'food' | 'supplies' | 'other';

export interface OperatingHours {
  day: DayOfWeek;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
}

export interface StorageCapacity {
  refrigerator: boolean;
  freezer: boolean;
  dry_storage: boolean;
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  town: string;
  zip: string;
  contact_name?: string;
  phone: string;
  email?: string;
  website?: string;
  facebook?: string;
  assistance_types: AssistanceType[];
  who_served: ServedPopulation[];
  cost: CostType;
  num_meals_available?: number;
  operating_hours: OperatingHours[];
  hours_notes?: string;
  donations_accepted: DonationType[];
  storage_capacity?: StorageCapacity;
  comments?: string;
  last_updated: string;
  updated_by?: string;
  is_active: boolean;
  spanish_available: boolean;
  created_at: string;
}

export interface CouncilDonation {
  id: string;
  organization_id: string;
  donation_date: string;
  amount?: number;
  donation_type: CouncilDonationType;
  description: string;
  recorded_by: string;
  created_at: string;
  organization?: Organization;
}

export interface VolunteerNeed {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  needed_date?: string;
  needed_skills?: string[];
  time_commitment?: string;
  is_active: boolean;
  posted_date: string;
  contact_email?: string;
  organization?: Organization;
}

export type VolunteerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'contacted';

export interface VolunteerApplication {
  id: string;
  volunteer_need_id?: string | null;
  organization_id?: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string | null;
  willing_to_do: string;
  hours_per_week?: string | null;
  availability?: string | null;
  status: VolunteerApplicationStatus;
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  organization?: Organization;
  volunteer_need?: VolunteerNeed;
}

export type VolunteerApplicationFormData = Pick<
  VolunteerApplication,
  | 'volunteer_need_id'
  | 'organization_id'
  | 'applicant_name'
  | 'applicant_email'
  | 'applicant_phone'
  | 'willing_to_do'
  | 'hours_per_week'
  | 'availability'
>;

export interface Profile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  organization_id?: string;
  created_at: string;
  organization?: Organization;
}

// Helper type for form data (makes certain fields optional for creation)
export type OrganizationFormData = Omit<
  Organization,
  'id' | 'created_at' | 'last_updated' | 'updated_by'
>;

export type CouncilDonationFormData = Omit<
  CouncilDonation,
  'id' | 'created_at' | 'organization'
>;

export type VolunteerNeedFormData = Omit<
  VolunteerNeed,
  'id' | 'posted_date' | 'organization'
>;

// Filter types for directory search
export interface DirectoryFilters {
  search?: string;
  town?: string;
  assistanceTypes?: AssistanceType[];
  daysOpen?: DayOfWeek[];
  donationTypes?: DonationType[];
  servedPopulations?: ServedPopulation[];
}
