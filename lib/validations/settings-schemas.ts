import { z } from 'zod';

// Branding settings schema
export const brandingSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(50),
  siteTagline: z.string().max(100),
  logoAbbreviation: z.string().min(1, 'Logo abbreviation is required').max(3),
  primaryColor: z.string(),
  footerTagline: z.string().max(500),
});

// Contact settings schema
export const contactSettingsSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required').max(100),
  address: z.string().max(200),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().length(2, 'Use 2-letter state code'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number required'),
  emergencyPhone: z.string().min(10, 'Emergency phone required'),
  emergencyPhoneDisplay: z.string(),
  externalHelpUrl: z.string().url('Invalid URL'),
  externalHelpLabel: z.string().max(50),
});

// Hero settings schema
export const heroSettingsSchema = z.object({
  locationBadge: z.string().max(50),
  headline: z.string().min(1, 'Headline is required').max(100),
  subtitle: z.string().max(200),
  showStats: z.boolean(),
  statsLabels: z.object({
    locations: z.string().max(30),
    towns: z.string().max(30),
    services: z.string().max(30),
  }),
});

// Emergency settings schema
export const emergencySettingsSchema = z.object({
  enabled: z.boolean(),
  icon: z.enum(['heart', 'phone', 'alert']),
  title: z.string().max(100),
  description: z.string().max(300),
  showPrimaryPhone: z.boolean(),
  showExternalHelp: z.boolean(),
});

// Navigation item schema
export const navigationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(30),
  href: z.string().min(1, 'Link is required'),
  enabled: z.boolean(),
  order: z.number().int().positive(),
  showInHeader: z.boolean(),
  showInFooter: z.boolean(),
});

// Navigation settings schema
export const navigationSettingsSchema = z.object({
  headerItems: z.array(navigationItemSchema),
  footerQuickLinks: z.array(navigationItemSchema),
  showSignIn: z.boolean(),
  signInLabel: z.string().max(20),
});

// Metadata settings schema
export const metadataSettingsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(70),
  description: z.string().max(160),
  keywords: z.array(z.string()),
});

// Full site settings schema
export const siteSettingsSchema = z.object({
  branding: brandingSettingsSchema,
  contact: contactSettingsSchema,
  hero: heroSettingsSchema,
  emergency: emergencySettingsSchema,
  navigation: navigationSettingsSchema,
  metadata: metadataSettingsSchema,
  lastUpdated: z.string(),
  updatedBy: z.string().optional(),
});

// Export types inferred from schemas
export type BrandingSettingsValues = z.infer<typeof brandingSettingsSchema>;
export type ContactSettingsValues = z.infer<typeof contactSettingsSchema>;
export type HeroSettingsValues = z.infer<typeof heroSettingsSchema>;
export type EmergencySettingsValues = z.infer<typeof emergencySettingsSchema>;
export type NavigationItemValues = z.infer<typeof navigationItemSchema>;
export type NavigationSettingsValues = z.infer<typeof navigationSettingsSchema>;
export type MetadataSettingsValues = z.infer<typeof metadataSettingsSchema>;
export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
