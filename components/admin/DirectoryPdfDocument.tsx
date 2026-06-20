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
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 20,
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: PALETTE.body,
    lineHeight: 1.2,
  },
  titleBlock: {
    marginBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: PALETTE.ocean,
    paddingBottom: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Times-Roman',
    color: PALETTE.ink,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    color: PALETTE.muted,
    marginBottom: 1,
  },
  generatedAt: {
    fontSize: 7,
    color: PALETTE.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  townHeader: {
    width: '100%',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ocean,
    letterSpacing: 0.8,
    marginTop: 5,
    marginBottom: 3,
    paddingBottom: 1.5,
    borderBottomWidth: 0.75,
    borderBottomColor: PALETTE.shoreline,
  },
  card: {
    width: '33.33%',
    paddingRight: 6,
    marginBottom: 5,
  },
  cardInner: {
    borderLeftWidth: 2,
    borderLeftColor: PALETTE.ocean,
    backgroundColor: PALETTE.sand,
    paddingLeft: 4,
    paddingRight: 3,
    paddingVertical: 3,
  },
  orgName: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    marginBottom: 1.5,
  },
  fieldLine: {
    fontSize: 6.8,
    color: PALETTE.body,
    marginBottom: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tag: {
    fontSize: 6,
    color: PALETTE.ocean,
    borderWidth: 0.75,
    borderColor: PALETTE.ocean,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2,
    marginRight: 2.5,
    marginBottom: 1.5,
  },
  spanishTag: {
    fontSize: 6,
    color: PALETTE.ink,
    backgroundColor: PALETTE.seafoam,
    borderWidth: 0.75,
    borderColor: PALETTE.seafoam,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2,
    marginRight: 2.5,
    marginBottom: 1.5,
  },
  hoursLine: {
    fontSize: 6.8,
    color: PALETTE.muted,
    marginTop: 1.5,
    fontFamily: 'Helvetica-Oblique',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 7,
    bottom: 12,
    left: 20,
    right: 20,
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

function OrgCard({
  org,
  categoryLabels,
}: {
  org: Organization;
  categoryLabels: Record<string, string>;
}) {
  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.cardInner}>
        <Text style={styles.orgName}>{org.name}</Text>

        <Text style={styles.fieldLine}>{buildAddressLine(org)}</Text>

        {org.phone && (
          <Text style={styles.fieldLine}>{formatPhone(org.phone)}</Text>
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

        <Text style={styles.hoursLine}>{summarizeHours(org.operating_hours)}</Text>
      </View>
    </View>
  );
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

  const gridItems = grouped.flatMap(([town, orgs]) => [
    <Text key={`town-${town}`} style={styles.townHeader}>
      {town.toUpperCase()}
    </Text>,
    ...orgs.map((org) => (
      <OrgCard key={org.id} org={org} categoryLabels={categoryLabels} />
    )),
  ]);

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

        <View style={styles.grid}>{gridItems}</View>

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
