/**
 * Scores a single organization's data completeness so admins and org
 * users see at a glance what's missing after a bulk import (or any
 * time a listing goes stale).
 *
 * Tiers:
 *  - CRITICAL: things a community member needs to actually use the
 *    listing — address, phone, operating_hours.
 *  - RECOMMENDED: things a community member strongly benefits from —
 *    contact_name, email, zip, donations_accepted, hours_notes.
 *  - OPTIONAL: nice-to-have — website, facebook, storage_capacity,
 *    num_meals_available, comments.
 *
 * A missing critical field knocks more off the score than a missing
 * optional one. Score is clamped to 0–100.
 */

import type { Organization } from '@/types/database';

export type CompletenessTier = 'critical' | 'recommended' | 'optional';

export interface MissingField {
  key: string;
  label: string;
  tier: CompletenessTier;
}

export interface CompletenessResult {
  score: number;
  totalWeight: number;
  missingWeight: number;
  missing: MissingField[];
  criticalMissing: MissingField[];
  recommendedMissing: MissingField[];
  optionalMissing: MissingField[];
  isComplete: boolean;
}

interface FieldDef {
  key: keyof Organization | string;
  label: string;
  tier: CompletenessTier;
  weight: number;
  test: (org: Organization) => boolean; // returns true if PRESENT
}

const hasText = (v: string | null | undefined): boolean =>
  typeof v === 'string' && v.trim().length > 0;

const FIELDS: FieldDef[] = [
  // CRITICAL — weight 20 each, three of them => 60 pts of 100
  {
    key: 'address',
    label: 'Street address',
    tier: 'critical',
    weight: 20,
    test: (o) => hasText(o.address),
  },
  {
    key: 'phone',
    label: 'Phone number',
    tier: 'critical',
    weight: 20,
    test: (o) => hasText(o.phone),
  },
  {
    key: 'operating_hours',
    label: 'Operating hours',
    tier: 'critical',
    weight: 20,
    test: (o) =>
      Array.isArray(o.operating_hours) &&
      o.operating_hours.some((h) => !h.is_closed && hasText(h.open_time) && hasText(h.close_time)),
  },

  // RECOMMENDED — weight 6 each, five of them => 30 pts
  {
    key: 'contact_name',
    label: 'Contact person',
    tier: 'recommended',
    weight: 6,
    test: (o) => hasText(o.contact_name),
  },
  {
    key: 'email',
    label: 'Contact email',
    tier: 'recommended',
    weight: 6,
    test: (o) => hasText(o.email),
  },
  {
    key: 'zip',
    label: 'ZIP code',
    tier: 'recommended',
    weight: 6,
    test: (o) => hasText(o.zip),
  },
  {
    key: 'donations_accepted',
    label: 'Accepted donation types',
    tier: 'recommended',
    weight: 6,
    test: (o) => Array.isArray(o.donations_accepted) && o.donations_accepted.length > 0,
  },
  {
    key: 'hours_notes',
    label: 'Hours notes',
    tier: 'recommended',
    weight: 6,
    test: (o) => hasText(o.hours_notes),
  },

  // OPTIONAL — weight 2 each, five of them => 10 pts
  {
    key: 'website',
    label: 'Website',
    tier: 'optional',
    weight: 2,
    test: (o) => hasText(o.website),
  },
  {
    key: 'facebook',
    label: 'Facebook page',
    tier: 'optional',
    weight: 2,
    test: (o) => hasText(o.facebook),
  },
  {
    key: 'storage_capacity',
    label: 'Storage capacity',
    tier: 'optional',
    weight: 2,
    test: (o) => o.storage_capacity !== null && o.storage_capacity !== undefined,
  },
  {
    key: 'num_meals_available',
    label: 'Meals available per service',
    tier: 'optional',
    weight: 2,
    test: (o) =>
      typeof o.num_meals_available === 'number' && o.num_meals_available > 0,
  },
  {
    key: 'comments',
    label: 'Additional notes',
    tier: 'optional',
    weight: 2,
    test: (o) => hasText(o.comments),
  },
];

const TOTAL_WEIGHT = FIELDS.reduce((sum, f) => sum + f.weight, 0); // 100

export function computeOrgCompleteness(org: Organization): CompletenessResult {
  const missing: MissingField[] = [];
  let missingWeight = 0;

  for (const field of FIELDS) {
    if (!field.test(org)) {
      missing.push({ key: field.key as string, label: field.label, tier: field.tier });
      missingWeight += field.weight;
    }
  }

  const score = Math.max(0, 100 - missingWeight);

  return {
    score,
    totalWeight: TOTAL_WEIGHT,
    missingWeight,
    missing,
    criticalMissing: missing.filter((m) => m.tier === 'critical'),
    recommendedMissing: missing.filter((m) => m.tier === 'recommended'),
    optionalMissing: missing.filter((m) => m.tier === 'optional'),
    isComplete: missing.length === 0,
  };
}

export function countIncompleteOrgs(orgs: Organization[]): {
  critical: number;
  anyMissing: number;
  totalComplete: number;
} {
  let critical = 0;
  let anyMissing = 0;
  let totalComplete = 0;
  for (const org of orgs) {
    const c = computeOrgCompleteness(org);
    if (c.criticalMissing.length > 0) critical++;
    if (!c.isComplete) anyMissing++;
    else totalComplete++;
  }
  return { critical, anyMissing, totalComplete };
}
