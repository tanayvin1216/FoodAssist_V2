import Link from 'next/link';
import {
  Building2,
  Clock,
  Eye,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sampleOrganizations, sampleVolunteerNeeds } from '@/lib/utils/sampleData';
import { formatDate, getShortHoursSummary } from '@/lib/utils/formatters';
import { ASSISTANCE_TYPE_LABELS } from '@/lib/utils/constants';
import { AssistanceType } from '@/types/database';

export default function PortalDashboardPage() {
  // In production, fetch the user's organization from Supabase
  const organization = sampleOrganizations[0];
  const volunteerNeeds = sampleVolunteerNeeds.filter(
    (v) => v.organization_id === organization.id
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {organization.contact_name || 'Organization Admin'}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your organization&apos;s listing and volunteer opportunities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Profile Status
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-lg font-semibold text-green-600">
                    Active
                  </span>
                </div>
              </div>
              <Building2 className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatDate(organization.last_updated)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Volunteer Posts
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {volunteerNeeds.filter((v) => v.is_active).length}
                </p>
              </div>
              <Users className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Organization Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{organization.name}</h3>
              <p className="text-sm text-gray-600">
                {organization.address}, {organization.town}, NC {organization.zip}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {organization.assistance_types.slice(0, 2).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {ASSISTANCE_TYPE_LABELS[type as AssistanceType] ?? type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              {getShortHoursSummary(organization.operating_hours)}
            </div>

            <div className="flex gap-2 pt-2">
              <Link href="/portal/profile">
                <Button>
                  Edit Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href={`/organization/${organization.id}`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Listing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volunteer Needs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {volunteerNeeds.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No volunteer needs posted yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {volunteerNeeds.slice(0, 3).map((need) => (
                  <li key={need.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{need.title}</p>
                      <p className="text-xs text-gray-500">
                        Posted {formatDate(need.posted_date)}
                      </p>
                    </div>
                    <Badge
                      variant={need.is_active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {need.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/portal/volunteers">
              <Button variant="outline" className="w-full mt-2">
                Manage Volunteer Needs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Tips for Your Listing
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              Keep your hours and contact information up to date
            </li>
            <li>
              Add notes about holiday closures or special events
            </li>
            <li>
              List all types of donations you accept to attract more donors
            </li>
            <li>
              Post volunteer opportunities to engage community helpers
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
