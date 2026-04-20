import { z } from 'zod';
import {
  ASSISTANCE_TYPES,
  DONATION_TYPES,
  SERVED_POPULATIONS,
  DAYS_OF_WEEK,
  NC_ZIP_CODE_PATTERN,
} from '@/lib/utils/constants';

// Phone: optional at the schema level, kept as the user entered it.
// Real-world data (import + admin quick-add) often has extensions,
// slashes, or is missing entirely. The public directory treats it as
// a tel: link either way.
const phoneSchema = z.string().max(60).optional().or(z.literal(''));

// ZIP: optional; when present, accept any 5-digit sequence (coastal
// NC covers multiple 28xxx codes but rows come in without them too).
const zipSchema = z.string().max(20).optional().or(z.literal(''));

// URL: empty, a real URL, or a bare domain. Any non-empty string
// passes; the UI/import layer normalizes (adds https://) before save.
const urlSchema = z.string().max(500).optional().or(z.literal(''));

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

// Organization schema.
// Design note — importer tolerance: only `name`, `town`, and at least
// one `assistance_type` are truly required. Address/phone/zip/email/URL
// are optional because the seed data (Google Form responses from the
// real-world Carteret County Master Database) routinely ships with
// them missing or malformed. Invalid values are coerced or dropped at
// the import boundary rather than rejecting the whole row.
export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  address: z.string().max(500).optional().or(z.literal('')),
  town: z.string().min(1, 'Town is required'),
  zip: zipSchema,
  contact_name: z.string().max(100).optional(),
  phone: phoneSchema,
  email: z.string().max(200).optional().or(z.literal('')),
  website: urlSchema,
  facebook: urlSchema,
  assistance_types: z
    .array(z.enum(ASSISTANCE_TYPES as [string, ...string[]]))
    .min(1, 'Select at least one assistance type'),
  who_served: z.array(z.enum(SERVED_POPULATIONS as [string, ...string[]])),
  cost: z.enum(['free', 'sliding_scale', 'other']),
  num_meals_available: z.preprocess(
    (v) => (v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v),
    z.number().int().nonnegative().optional(),
  ),
  operating_hours: z.array(operatingHoursSchema),
  hours_notes: z.string().max(500).optional(),
  donations_accepted: z.array(z.enum(DONATION_TYPES as [string, ...string[]])),
  storage_capacity: storageCapacitySchema.optional(),
  comments: z.string().max(2000).optional(),
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

// Volunteer application schema — public form submission.
// Either volunteer_need_id or organization_id should be set when
// submitted through a need-specific CTA; both can be empty for a
// general application routed to the advisor.
export const volunteerApplicationSchema = z.object({
  volunteer_need_id: z.string().uuid().optional().or(z.literal('')).nullable(),
  organization_id: z.string().uuid().optional().or(z.literal('')).nullable(),
  applicant_name: z.string().min(1, 'Name is required').max(100),
  applicant_email: z.string().email('Valid email is required').max(200),
  applicant_phone: z.string().max(60).optional().or(z.literal('')),
  willing_to_do: z
    .string()
    .min(5, 'Tell us a bit about what you would like to help with')
    .max(2000),
  hours_per_week: z.string().max(100).optional().or(z.literal('')),
  availability: z.string().max(500).optional().or(z.literal('')),
});

export const volunteerApplicationReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'contacted']),
  review_notes: z.string().max(2000).optional().or(z.literal('')),
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
export type DirectoryFilterValues = z.infer<typeof directoryFilterSchema>;
