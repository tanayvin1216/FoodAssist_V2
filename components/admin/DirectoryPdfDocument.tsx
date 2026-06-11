'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Organization } from '@/types/database';
import { formatPhone } from '@/lib/utils/formatters';
import { resolveCategoryLabel } from '@/lib/utils/category-labels';

interface DirectoryPdfProps {
  title: string;
  subtitle?: string;
  generatedAt: string;
  version: number;
  organizations: Organization[];
  categoryLabels: Record<string, string>;
}

const PALETTE = {
  ink: '#1B2D3A',
  body: '#4A5568',
  muted: '#8C7E72',
  ocean: '#0D7C8F',
  shoreline: '#C4B8AD',
  sand: '#F5F0EB',
  seafoam: '#E8F4F3',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: PALETTE.body,
    lineHeight: 1.35,
  },
  titleBlock: {
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: PALETTE.ocean,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Times-Roman',
    color: PALETTE.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: PALETTE.muted,
    marginBottom: 2,
  },
  generatedAt: {
    fontSize: 9,
    color: PALETTE.muted,
  },
  townBlock: {
    marginTop: 12,
  },
  townHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ocean,
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.shoreline,
  },
  orgBlock: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: PALETTE.sand,
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.ocean,
  },
  orgName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    marginBottom: 3,
  },
  addressLine: {
    fontSize: 9,
    color: PALETTE.body,
    marginBottom: 4,
  },
  fieldLine: {
    fontSize: 9,
    color: PALETTE.body,
    marginBottom: 2,
  },
  labelText: {
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.muted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 2,
  },
  tag: {
    fontSize: 8,
    color: PALETTE.ocean,
    borderWidth: 1,
    borderColor: PALETTE.ocean,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 3,
  },
  spanishTag: {
    fontSize: 8,
    color: PALETTE.ink,
    backgroundColor: PALETTE.seafoam,
    borderWidth: 1,
    borderColor: PALETTE.seafoam,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 3,
  },
  hoursLine: {
    fontSize: 9,
    color: PALETTE.muted,
    marginTop: 3,
    fontFamily: 'Helvetica-Oblique',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: PALETTE.muted,
  },
});

const DAY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

function summarizeHours(hours: Organization['operating_hours']): string {
  if (!Array.isArray(hours) || hours.length === 0) return 'Hours not listed';
  const open = DAY_ORDER.filter((d) =>
    hours.some(
      (h) => h.day === d.key && !h.is_closed && h.open_time && h.close_time
    )
  ).map((d) => d.label);
  if (open.length === 0) return 'Hours not listed';
  if (open.length === 7) return 'Open every day';
  return `Open ${open.join(', ')}`;
}

function buildAddressLine(org: Organization): string {
  const parts = [org.address, org.town, org.zip ? `NC ${org.zip}` : 'NC'].filter(
    Boolean
  );
  return parts.join(', ');
}

function groupByTown(orgs: Organization[]): Array<[string, Organization[]]> {
  const map = new Map<string, Organization[]>();
  for (const org of orgs) {
    const town = org.town || 'Unspecified';
    if (!map.has(town)) map.set(town, []);
    map.get(town)!.push(org);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([town, list]) => [
      town,
      [...list].sort((a, b) => a.name.localeCompare(b.name)),
    ]);
}

export function DirectoryPdfDocument({
  title,
  subtitle,
  generatedAt,
  version,
  organizations,
  categoryLabels,
}: DirectoryPdfProps) {
  const grouped = groupByTown(organizations);

  return (
    <Document title={title} author="Carteret County Food & Health Council">
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.generatedAt}>
            Rev. {version} · Generated {generatedAt} · {organizations.length} active organizations
          </Text>
        </View>

        {grouped.map(([town, orgs]) => (
          <View key={town} style={styles.townBlock}>
            <Text style={styles.townHeader}>{town.toUpperCase()}</Text>
            {orgs.map((org) => (
              <View key={org.id} style={styles.orgBlock} wrap={false}>
                <Text style={styles.orgName}>{org.name}</Text>

                <Text style={styles.addressLine}>{buildAddressLine(org)}</Text>

                {org.phone && (
                  <Text style={styles.fieldLine}>
                    <Text style={styles.labelText}>Phone:</Text>{' '}
                    {formatPhone(org.phone)}
                  </Text>
                )}

                {org.email && (
                  <Text style={styles.fieldLine}>
                    <Text style={styles.labelText}>Email:</Text> {org.email}
                  </Text>
                )}

                {org.contact_name && (
                  <Text style={styles.fieldLine}>
                    <Text style={styles.labelText}>Contact:</Text>{' '}
                    {org.contact_name}
                  </Text>
                )}

                {org.assistance_types.length > 0 && (
                  <View style={styles.tagsRow}>
                    {org.assistance_types.map((type) => (
                      <Text key={type} style={styles.tag}>
                        {resolveCategoryLabel(type, categoryLabels)}
                      </Text>
                    ))}
                    {org.spanish_available && (
                      <Text style={styles.spanishTag}>Spanish</Text>
                    )}
                  </View>
                )}

                <Text style={styles.hoursLine}>
                  {summarizeHours(org.operating_hours)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
