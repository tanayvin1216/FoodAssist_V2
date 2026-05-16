// Site settings type definitions

export interface BrandingSettings {
  siteName: string;
  siteTagline: string;
  logoAbbreviation: string;
  primaryColor: string;
  footerTagline: string;
}

export interface ContactSettings {
  organizationName: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  emergencyPhoneDisplay: string;
  externalHelpUrl: string;
  externalHelpLabel: string;
}

export interface HeroSettings {
  locationBadge: string;
  headline: string;
  subtitle: string;
  showStats: boolean;
  statsLabels: {
    locations: string;
    towns: string;
    services: string;
  };
}

export interface EmergencySettings {
  enabled: boolean;
  icon: 'heart' | 'phone' | 'alert';
  title: string;
  description: string;
  showPrimaryPhone: boolean;
  showExternalHelp: boolean;
}

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  enabled: boolean;
  order: number;
  showInHeader: boolean;
  showInFooter: boolean;
}

export interface NavigationSettings {
  headerItems: NavigationItem[];
  footerQuickLinks: NavigationItem[];
  showSignIn: boolean;
  signInLabel: string;
}

export interface MetadataSettings {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * A single admin-managed category (e.g. an assistance type or donation type).
 * `slug` is the immutable identifier persisted on organization rows; `label`
 * is the user-facing display string and can be edited by admins. `isActive`
 * hides the category from forms/filters without losing historical data.
 */
export interface CategoryItem {
  slug: string;
  label: string;
  isActive: boolean;
  order: number;
}

export interface CategoriesSettings {
  assistanceTypes: CategoryItem[];
  donationTypes: CategoryItem[];
}

export interface SiteSettings {
  branding: BrandingSettings;
  contact: ContactSettings;
  hero: HeroSettings;
  emergency: EmergencySettings;
  navigation: NavigationSettings;
  metadata: MetadataSettings;
  categories: CategoriesSettings;
  lastUpdated: string;
  updatedBy?: string;
}
