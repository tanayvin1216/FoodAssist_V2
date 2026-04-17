import Link from 'next/link';
import {
  Building2,
  Gift,
  Users,
  MapPin,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getAdminStats, getDashboardSnapshot } from '@/lib/supabase/queries';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ASSISTANCE_TYPE_LABELS } from '@/lib/utils/constants';
import type { AssistanceType } from '@/types/database';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [stats, snapshot] = await Promise.all([
    getAdminStats(supabase),
    getDashboardSnapshot(supabase),
  ]);

  const totalOrgs = stats.totalOrganizations;

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
