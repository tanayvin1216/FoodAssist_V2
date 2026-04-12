import Link from 'next/link';
import { Users, Clock, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleVolunteerNeeds, sampleOrganizations } from '@/lib/utils/sampleData';
import { formatDate } from '@/lib/utils/formatters';

export default function VolunteersPage() {
  const activeNeeds = sampleVolunteerNeeds.filter((v) => v.is_active);

  const getOrganization = (id: string) => {
    return sampleOrganizations.find((o) => o.id === id);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero with Background Image */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/volunteer-hero.jpg)' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

        <div className="content-container py-16 md:py-20 relative">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Volunteer Opportunities
            </h1>
            <p className="text-lg text-white/80">
              Make a difference in your community by volunteering with local
              food assistance organizations.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="content-container py-10">
        <div className="max-w-2xl mx-auto">
          {activeNeeds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                No Volunteer Opportunities Available
              </h2>
              <p className="text-slate-500">
                Check back soon for new volunteer opportunities, or contact an
                organization directly to offer your help.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-slate-500 text-sm">
                {activeNeeds.length} volunteer{' '}
                {activeNeeds.length === 1 ? 'opportunity' : 'opportunities'}{' '}
                available
              </p>

              {activeNeeds.map((need) => {
                const org = getOrganization(need.organization_id);
                return (
                  <div key={need.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{need.title}</h3>
                          {org && (
                            <Link
                              href={`/organization/${org.id}`}
                              className="text-sm text-slate-600 hover:text-slate-800"
                            >
                              {org.name}
                            </Link>
                          )}
                        </div>
                        {need.needed_date && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                            <Calendar className="w-3 h-3" />
                            {formatDate(need.needed_date)}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 mb-4">{need.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                        {need.time_commitment && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{need.time_commitment}</span>
                          </div>
                        )}
                        {need.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <a
                              href={`mailto:${need.contact_email}`}
                              className="text-slate-600 hover:text-slate-800"
                            >
                              {need.contact_email}
                            </a>
                          </div>
                        )}
                      </div>

                      {need.needed_skills && need.needed_skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-slate-500 mb-2">
                            Skills / Requirements:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {need.needed_skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {need.contact_email && (
                          <a
                            href={`mailto:${need.contact_email}`}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                          >
                              <Mail className="w-4 h-4" />
                              Contact to Volunteer
                          </a>
                        )}
                        {org && (
                          <Link
                            href={`/organization/${org.id}`}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                          >
                              View Organization
                              <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 bg-slate-700 rounded-2xl p-6 text-center text-white">
            <h2 className="text-xl font-semibold mb-2">
              Are you a food assistance organization?
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Post your volunteer needs to connect with community helpers.
            </p>
            <Link
              href="/portal/dashboard"
              className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors text-sm inline-flex items-center gap-2"
            >
                Access Organization Portal
                <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
