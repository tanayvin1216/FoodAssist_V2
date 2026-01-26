import Link from 'next/link';
import {
  Building2,
  Gift,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sampleOrganizations, sampleVolunteerNeeds } from '@/lib/utils/sampleData';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ASSISTANCE_TYPE_LABELS } from '@/lib/utils/constants';

export default function AdminDashboardPage() {
  const organizations = sampleOrganizations;
  const activeOrgs = organizations.filter((o) => o.is_active);
  const volunteerNeeds = sampleVolunteerNeeds.filter((v) => v.is_active);

  // Mock donation data
  const totalDonations = 15750;
  const donationCount = 24;

  // Count by assistance type
  const assistanceTypeCounts = organizations.reduce(
    (acc, org) => {
      org.assistance_types.forEach((type) => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Recent organizations
  const recentOrgs = [...organizations]
    .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of food assistance resources in Carteret County
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Organizations
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {activeOrgs.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  of {organizations.length} total
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Council Donations
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalDonations)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {donationCount} donations
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Volunteer Opportunities
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {volunteerNeeds.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">active postings</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Towns Covered</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(organizations.map((o) => o.town)).size}
                </p>
                <p className="text-sm text-gray-500 mt-1">in Carteret County</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(assistanceTypeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {ASSISTANCE_TYPE_LABELS[type as keyof typeof ASSISTANCE_TYPE_LABELS]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(count / organizations.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recently Updated</CardTitle>
            <Link href="/admin/organizations">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <p className="text-sm text-gray-500">{org.town}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(org.last_updated)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/organizations">
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Manage Organizations
              </Button>
            </Link>
            <Link href="/admin/donations">
              <Button variant="outline">
                <Gift className="w-4 h-4 mr-2" />
                Log Donation
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline">
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
