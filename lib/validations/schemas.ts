import { z } from 'zod';
import {
  ASSISTANCE_TYPES,
  DONATION_TYPES,
  SERVED_POPULATIONS,
  DAYS_OF_WEEK,
  NC_ZIP_CODE_PATTERN,
} from '@/lib/utils/constants';

// Phone validation with formatting
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 10, 'Phone number must be 10 digits');

// NC zip code validation
const zipSchema = z
  .string()
  .min(1, 'ZIP code is required')
  .refine((val) => NC_ZIP_CODE_PATTERN.test(val), 'Please enter a valid NC ZIP code (28XXX)');

// Operating hours schema
export const operatingHoursSchema = z.object({
  day: z.enum(DAYS_OF_WEEK as [string, ...string[]]),
  open_time: z.string().optional(),
  close_time: z.string().optional(),
  is_closed: z.boolean(),
}).refine(
  (data) => {
    if (data.is_closed) return true;
    if (!data.open_time || !data.close_time) return false;
    return data.open_time < data.close_time;
  },
  { message: 'Opening time must be before closing time' }
);

// Storage capacity schema
export const storageCapacitySchema = z.object({
  refrigerator: z.boolean(),
  freezer: z.boolean(),
  dry_storage: z.boolean(),
  notes: z.string().optional(),
});

// Organization schema
export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  town: z.string().min(1, 'Town is required'),
  zip: zipSchema,
  contact_name: z.string().max(100).optional(),
  phone: phoneSchema,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  assistance_types: z
    .array(z.enum(ASSISTANCE_TYPES as [string, ...string[]]))
    .min(1, 'Select at least one assistance type'),
  who_served: z.array(z.enum(SERVED_POPULATIONS as [string, ...string[]])),
  cost: z.enum(['free', 'sliding_scale', 'other']),
  num_meals_available: z.number().int().positive().optional(),
  operating_hours: z.array(operatingHoursSchema),
  hours_notes: z.string().max(500).optional(),
  donations_accepted: z.array(z.enum(DONATION_TYPES as [string, ...string[]])),
  storage_capacity: storageCapacitySchema.optional(),
  comments: z.string().max(1000).optional(),
  is_active: z.boolean(),
  spanish_available: z.boolean(),
});

// Council donation schema — form-facing fields only.
// `recorded_by` is intentionally excluded: the server action injects it from
// the authenticated session (session.profile.name ?? session.email) before INSERT.
// This prevents client-side spoofing of the recorder identity.
// See: docs/backend-integration/phase2-admin-crud.md, Page 4 "recorded_by decision".
export const councilDonationSchema = z.object({
  organization_id: z.string().uuid('Invalid organization'),
  donation_date: z.string().min(1, 'Donation date is required'),
  amount: z.number().positive('Amount must be positive').optional(),
  donation_type: z.enum(['money', 'food', 'supplies', 'other']),
  description: z.string().min(1, 'Description is required').max(1000),
});

// Volunteer need schema
export const volunteerNeedSchema = z.object({
  organization_id: z.string().uuid('Invalid organization'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  needed_date: z.string().optional(),
  needed_skills: z.array(z.string()).optional(),
  time_commitment: z.string().max(200).optional(),
  is_active: z.boolean(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

// User profile schema
export const profileSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['admin', 'organization', 'public']),
  organization_id: z.string().uuid().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Signup schema
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Directory filter schema
export const directoryFilterSchema = z.object({
  search: z.string().optional(),
  town: z.string().optional(),
  assistanceTypes: z.array(z.enum(ASSISTANCE_TYPES as [string, ...string[]])).optional(),
  daysOpen: z.array(z.enum(DAYS_OF_WEEK as [string, ...string[]])).optional(),
  donationTypes: z.array(z.enum(DONATION_TYPES as [string, ...string[]])).optional(),
  servedPopulations: z.array(z.enum(SERVED_POPULATIONS as [string, ...string[]])).optional(),
});

// ============== Settings patch schema ==============
// Mirrors the 6 JSONB columns of the site_settings table.
// Each group is a shallow partial — only supplied keys are merged.
// Unknown top-level keys are rejected (strict).

const navigationItemPatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  enabled: z.boolean(),
  order: z.number().int(),
  showInHeader: z.boolean(),
  showInFooter: z.boolean(),
});

export const settingsPatchSchema = z
  .object({
    branding: z
      .object({
        siteName: z.string().optional(),
        siteTagline: z.string().optional(),
        logoAbbreviation: z.string().optional(),
        primaryColor: z.string().optional(),
        footerTagline: z.string().optional(),
      })
      .optional(),
    contact: z
      .object({
        organizationName: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        emergencyPhone: z.string().optional(),
        emergencyPhoneDisplay: z.string().optional(),
        externalHelpUrl: z.string().url().optional(),
        externalHelpLabel: z.string().optional(),
      })
      .optional(),
    hero: z
      .object({
        locationBadge: z.string().optional(),
        headline: z.string().optional(),
        subtitle: z.string().optional(),
        showStats: z.boolean().optional(),
        statsLabels: z
          .object({
            locations: z.string().optional(),
            towns: z.string().optional(),
            services: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    emergency: z
      .object({
        enabled: z.boolean().optional(),
        icon: z.enum(['heart', 'phone', 'alert']).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        showPrimaryPhone: z.boolean().optional(),
        showExternalHelp: z.boolean().optional(),
      })
      .optional(),
    navigation: z
      .object({
        headerItems: z.array(navigationItemPatchSchema).optional(),
        footerQuickLinks: z.array(navigationItemPatchSchema).optional(),
        showSignIn: z.boolean().optional(),
        signInLabel: z.string().optional(),
      })
      .optional(),
    metadata: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .strict(); // rejects unknown top-level keys

export type SettingsPatch = z.infer<typeof settingsPatchSchema>;

// Export types inferred from schemas
export type OrganizationFormValues = z.infer<typeof organizationSchema>;
export type CouncilDonationFormValues = z.infer<typeof councilDonationSchema>;
export type VolunteerNeedFormValues = z.infer<typeof volunteerNeedSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type DirectoryFilterValues = z.infer<typeof directoryFilterSchema>;
