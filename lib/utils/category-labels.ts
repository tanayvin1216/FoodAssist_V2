import type { CategoriesSettings, CategoryItem } from '@/types/settings';

/**
 * Build a slug -> label lookup from the admin-managed catalog. Useful in
 * server components and other contexts where the SettingsContext hooks
 * are not available. Inactive entries are still included so historical
 * data (orgs already tagged with a now-disabled type) still renders with
 * a human-readable label.
 */
export function buildCategoryLabelMap(
  categories: CategoriesSettings
): Record<string, string> {
  const all: CategoryItem[] = [
    ...categories.assistanceTypes,
    ...categories.donationTypes,
  ];
  return Object.fromEntries(all.map((item) => [item.slug, item.label]));
}

export function humanizeSlug(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveCategoryLabel(
  slug: string,
  labelMap: Record<string, string>
): string {
  return labelMap[slug] ?? humanizeSlug(slug);
}
