import Link from 'next/link';
import {
  Building2,
  Gift,
  Users,
  MapPin,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import {
  getAdminStats,
  getDashboardSnapshot,
  getOrganizations,
} from '@/lib/supabase/queries';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ASSISTANCE_TYPE_LABELS } from '@/lib/utils/constants';
import type { AssistanceType } from '@/types/database';
import { computeOrgCompleteness } from '@/lib/utils/org-completeness';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [stats, snapshot, allOrgs] = await Promise.all([
    getAdminStats(supabase),
    getDashboardSnapshot(supabase),
    getOrganizations(supabase, undefined, false),
  ]);

  const totalOrgs = stats.totalOrganizations;

  const completenessReport = allOrgs
    .map((org) => ({ org, result: computeOrgCompleteness(org) }))
    .filter((entry) => !entry.result.isComplete)
    .sort((a, b) => a.result.score - b.result.score);
  const criticalGaps = completenessReport.filter(
    (e) => e.result.criticalMissing.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: '#1B2D3A' }}
        >
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
          Overview of food assistance resources in Carteret County
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Active Organizations
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {stats.activeOrganizations}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  of {totalOrgs} total
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <Building2 className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Council Donations
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {formatCurrency(stats.totalDonationsAmount)}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  {stats.totalDonationsCount} donations
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <Gift className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Volunteer Opportunities
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {stats.activeVolunteerNeeds}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  active postings
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <Users className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Towns Covered
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {snapshot.townCount}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  in Carteret County
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <MapPin className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {completenessReport.length > 0 && (
        <Card
          style={{
            backgroundColor: '#FFFFFF',
            borderLeft: '4px solid #D97706',
            borderColor: '#C4B8AD',
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: '#D97706' }} />
              </div>
              <div>
                <CardTitle style={{ color: '#1B2D3A' }}>
                  {criticalGaps.length > 0
                    ? `${criticalGaps.length} ${criticalGaps.length === 1 ? 'organization needs' : 'organizations need'} attention`
                    : `${completenessReport.length} ${completenessReport.length === 1 ? 'organization has' : 'organizations have'} incomplete data`}
                </CardTitle>
                <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
                  Imported rows often arrive with missing address, phone, or
                  hours. Fill these in so community members can actually use
                  each listing.
                </p>
              </div>
            </div>
            <Link href="/admin/organizations">
              <Button
                size="sm"
                variant="outline"
                style={{ borderColor: '#0D7C8F', color: '#0D7C8F' }}
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y" style={{ borderColor: '#C4B8AD' }}>
              {completenessReport.slice(0, 5).map(({ org, result }) => (
                <li key={org.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: '#1B2D3A' }}>
                      {org.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: result.criticalMissing.length > 0 ? '#D97706' : '#8C7E72',
                      }}
                    >
                      {result.missing.slice(0, 4).map((m) => m.label).join(' · ')}
                      {result.missing.length > 4 && ` +${result.missing.length - 4} more`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-mono" style={{ color: '#8C7E72' }}>
                      {result.score}%
                    </span>
                    <Link
                      href={`/admin/organizations?edit=${org.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#0D7C8F' }}
                    >
                      Complete →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Breakdown */}
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardHeader>
            <CardTitle style={{ color: '#1B2D3A' }}>Services by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.entries(snapshot.assistanceTypeCounts) as [AssistanceType, number][]).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#4A5568' }}>
                      {ASSISTANCE_TYPE_LABELS[type]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-32 h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#E8F4F3' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width:
                              stats.activeOrganizations > 0
                                ? `${(count / stats.activeOrganizations) * 100}%`
                                : '0%',
                            backgroundColor: '#0D7C8F',
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium w-8 text-right"
                        style={{ color: '#1B2D3A' }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle style={{ color: '#1B2D3A' }}>Recently Updated</CardTitle>
            <Link href="/admin/organizations">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                style={{ color: '#0D7C8F' }}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {snapshot.recentOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: '#C4B8AD' }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#1B2D3A' }}>
                      {org.name}
                    </p>
                    <p className="text-xs" style={{ color: '#8C7E72' }}>
                      {org.town}
                    </p>
                  </div>
                  <div className="flex items-center text-xs" style={{ color: '#8C7E72' }}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(org.last_updated)}
                  </div>
                </div>
              ))}
              {snapshot.recentOrganizations.length === 0 && (
                <p className="text-sm py-4 text-center" style={{ color: '#8C7E72' }}>
                  No organizations yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1B2D3A' }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/organizations">
              <Button style={{ backgroundColor: '#0D7C8F', color: '#FFFFFF' }}>
                <Building2 className="w-4 h-4 mr-2" />
                Manage Organizations
              </Button>
            </Link>
            <Link href="/admin/donations">
              <Button
                variant="outline"
                style={{ borderColor: '#0D7C8F', color: '#0D7C8F' }}
              >
                <Gift className="w-4 h-4 mr-2" />
                Log Donation
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button
                variant="outline"
                style={{ borderColor: '#C4B8AD', color: '#4A5568' }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
