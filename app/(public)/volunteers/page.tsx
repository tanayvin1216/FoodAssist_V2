import Link from 'next/link';
import { Users, Clock, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sampleVolunteerNeeds, sampleOrganizations } from '@/lib/utils/sampleData';
import { formatDate } from '@/lib/utils/formatters';

export default function VolunteersPage() {
  const activeNeeds = sampleVolunteerNeeds.filter((v) => v.is_active);

  const getOrganization = (id: string) => {
    return sampleOrganizations.find((o) => o.id === id);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="container px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-purple-200" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Volunteer Opportunities
            </h1>
            <p className="text-lg text-purple-100">
              Make a difference in your community by volunteering with local
              food assistance organizations.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {activeNeeds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No Volunteer Opportunities Available
                </h2>
                <p className="text-gray-600">
                  Check back soon for new volunteer opportunities, or contact an
                  organization directly to offer your help.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600">
                {activeNeeds.length} volunteer{' '}
                {activeNeeds.length === 1 ? 'opportunity' : 'opportunities'}{' '}
                available
              </p>

              {activeNeeds.map((need) => {
                const org = getOrganization(need.organization_id);
                return (
                  <Card key={need.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl">{need.title}</CardTitle>
                          {org && (
                            <Link
                              href={`/organization/${org.id}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {org.name}
                            </Link>
                          )}
                        </div>
                        {need.needed_date && (
                          <Badge variant="outline" className="self-start">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(need.needed_date)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{need.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {need.time_commitment && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{need.time_commitment}</span>
                          </div>
                        )}
                        {need.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a
                              href={`mailto:${need.contact_email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {need.contact_email}
                            </a>
                          </div>
                        )}
                      </div>

                      {need.needed_skills && need.needed_skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Skills / Requirements:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {need.needed_skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {need.contact_email && (
                          <a href={`mailto:${need.contact_email}`}>
                            <Button>
                              <Mail className="w-4 h-4 mr-2" />
                              Contact to Volunteer
                            </Button>
                          </a>
                        )}
                        {org && (
                          <Link href={`/organization/${org.id}`}>
                            <Button variant="outline">
                              View Organization
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <Card className="mt-12 bg-blue-50 border-blue-100">
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Are you a food assistance organization?
              </h2>
              <p className="text-gray-600 mb-4">
                Post your volunteer needs to connect with community helpers.
              </p>
              <Link href="/portal/dashboard">
                <Button>
                  Access Organization Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
