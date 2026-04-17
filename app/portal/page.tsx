import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationById, getVolunteerNeeds } from '@/lib/supabase/queries';
import Link from 'next/link';
import { Building2, Clock, Users, ArrowRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, getShortHoursSummary } from '@/lib/utils/formatters';

export default async function PortalPage() {
  const ctx = await requireOrganization();
  const supabase = await createClient();

  const [org, volunteerNeeds] = await Promise.all([
    getOrganizationById(supabase, ctx.organizationId),
    getVolunteerNeeds(supabase, ctx.organizationId, false),
  ]);

  if (!org) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
          Organization not found
        </h1>
        <p style={{ color: '#4A5568' }}>
          Your account is not linked to an active organization. Contact your administrator.
        </p>
      </div>
    );
  }

  const activeVolunteerCount = volunteerNeeds.filter((v) => v.is_active).length;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
          {org.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
          Manage your organization&apos;s listing and volunteer opportunities
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8C7E72' }}>
            Profile Status
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: org.is_active ? '#16A34A' : '#8C7E72' }}
          >
            {org.is_active ? 'Active' : 'Inactive'}
          </p>
          <Building2 className="h-8 w-8 mt-2" style={{ color: '#C4B8AD' }} />
        </div>

        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8C7E72' }}>
            Last Updated
          </p>
          <p className="text-lg font-semibold" style={{ color: '#1B2D3A' }}>
            {formatDate(org.last_updated)}
          </p>
          <Clock className="h-8 w-8 mt-2" style={{ color: '#C4B8AD' }} />
        </div>

        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8C7E72' }}>
            Active Volunteer Posts
          </p>
          <p className="text-lg font-semibold" style={{ color: '#1B2D3A' }}>
            {activeVolunteerCount}
          </p>
          <Users className="h-8 w-8 mt-2" style={{ color: '#C4B8AD' }} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="rounded-lg border p-6 space-y-4"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <h2 className="font-semibold text-base" style={{ color: '#1B2D3A' }}>
            Organization Profile
          </h2>
          <div>
            <p className="text-sm" style={{ color: '#4A5568' }}>
              {org.address}, {org.town}, NC {org.zip}
            </p>
            <p className="text-sm mt-1" style={{ color: '#8C7E72' }}>
              {getShortHoursSummary(org.operating_hours)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {org.assistance_types.slice(0, 2).map((type) => (
              <span
                key={type}
                className="inline-block px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: '#E8F4F3', color: '#0D7C8F' }}
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Link href="/portal/profile">
              <Button
                size="sm"
                style={{ backgroundColor: '#0D7C8F', color: '#FFFFFF' }}
                className="hover:opacity-90"
              >
                Edit Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/organization/${org.id}`}>
              <Button
                variant="outline"
                size="sm"
                style={{ borderColor: '#C4B8AD', color: '#4A5568' }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Listing
              </Button>
            </Link>
          </div>
        </div>

        <div
          className="rounded-lg border p-6 space-y-4"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <h2 className="font-semibold text-base" style={{ color: '#1B2D3A' }}>
            Volunteer Needs
          </h2>
          {volunteerNeeds.length === 0 ? (
            <p className="text-sm" style={{ color: '#8C7E72' }}>
              No volunteer needs posted yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {volunteerNeeds.slice(0, 3).map((need) => (
                <li
                  key={need.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1B2D3A' }}>
                      {need.title}
                    </p>
                    <p className="text-xs" style={{ color: '#8C7E72' }}>
                      Posted {formatDate(need.posted_date)}
                    </p>
                  </div>
                  <Badge
                    variant={need.is_active ? 'default' : 'secondary'}
                    className="text-xs"
                    style={
                      need.is_active
                        ? { backgroundColor: '#E8F4F3', color: '#0D7C8F', border: 'none' }
                        : undefined
                    }
                  >
                    {need.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/portal/volunteers">
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              style={{ borderColor: '#C4B8AD', color: '#4A5568' }}
            >
              Manage Volunteer Needs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Tips */}
      <div
        className="rounded-lg border-l-4 p-6"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#C4B8AD',
          borderLeftColor: '#0D7C8F',
        }}
      >
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: '#1B2D3A' }}>
          Keeping your listing accurate
        </h3>
        <ul className="text-sm space-y-1.5" style={{ color: '#4A5568' }}>
          <li>Keep your hours and contact information current — community members rely on this.</li>
          <li>Add notes about holiday closures or special events in the Hours Notes field.</li>
          <li>List all accepted donation types to help donors find the right match.</li>
          <li>Post volunteer opportunities to engage community helpers.</li>
        </ul>
      </div>
    </div>
  );
}
