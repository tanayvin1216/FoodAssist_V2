import Link from 'next/link';
import { Users, Clock, Mail, Calendar, ArrowRight } from 'lucide-react';
import { sampleVolunteerNeeds, sampleOrganizations } from '@/lib/utils/sampleData';
import { formatDate } from '@/lib/utils/formatters';

export default function VolunteersPage() {
  const activeNeeds = sampleVolunteerNeeds.filter((v) => v.is_active);

  const getOrganization = (id: string) => {
    return sampleOrganizations.find((o) => o.id === id);
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[360px] md:min-h-[400px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/volunteer-hero.jpg)', backgroundColor: '#1E3A5F' }}
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/30" />
        <div className="container px-6 pb-10 pt-24 md:pb-14 md:pt-32 relative text-center max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium text-white/70 mb-4 tracking-wide uppercase">
              Get Involved
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white leading-[1.1] mb-6">
              Volunteer Opportunities
            </h1>
            <p className="text-lg text-white/80 max-w-lg mx-auto">
              Make a difference in your community by volunteering with local
              food assistance organizations.
            </p>
          </div>
        </div>
      </section>

      <section className="container px-6 pb-16">
        <div className="max-w-2xl">
          {activeNeeds.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-5 h-5 mx-auto mb-3 text-muted-text" />
              <h2 className="text-lg font-semibold text-navy mb-2">
                No Volunteer Opportunities Available
              </h2>
              <p className="text-sm text-body-text">
                Check back soon for new volunteer opportunities, or contact an
                organization directly to offer your help.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-text mb-2">
                {activeNeeds.length} volunteer{' '}
                {activeNeeds.length === 1 ? 'opportunity' : 'opportunities'}{' '}
                available
              </p>

              {activeNeeds.map((need) => {
                const org = getOrganization(need.organization_id);
                return (
                  <div key={need.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-navy">{need.title}</h3>
                        {org && (
                          <Link
                            href={`/organization/${org.id}`}
                            className="text-sm text-body-text hover:text-navy transition-colors"
                          >
                            {org.name}
                          </Link>
                        )}
                      </div>
                      {need.needed_date && (
                        <span className="inline-flex items-center gap-1 text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {formatDate(need.needed_date)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-body-text mb-4">{need.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-text mb-4">
                      {need.time_commitment && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-text" />
                          <span>{need.time_commitment}</span>
                        </div>
                      )}
                      {need.contact_email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-text" />
                          <a
                            href={`mailto:${need.contact_email}`}
                            className="hover:text-navy transition-colors"
                          >
                            {need.contact_email}
                          </a>
                        </div>
                      )}
                    </div>

                    {need.needed_skills && need.needed_skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-text mb-2 uppercase tracking-wider">
                          Requirements
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {need.needed_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {need.contact_email && (
                        <a href={`mailto:${need.contact_email}`}>
                          <button className="rounded-full h-11 px-6 text-sm font-medium text-white bg-navy hover:bg-navy-light transition-colors flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            Contact
                          </button>
                        </a>
                      )}
                      {org && (
                        <Link href={`/organization/${org.id}`}>
                          <button className="rounded-full h-11 px-6 text-sm font-medium text-navy border border-navy hover:bg-navy/5 transition-colors flex items-center gap-2">
                            View Organization
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 bg-navy rounded-2xl p-8 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-2">
              For Organizations
            </p>
            <p className="text-white text-xl font-semibold mb-2">
              Post your volunteer needs
            </p>
            <p className="text-white/60 text-sm mb-6">
              Connect with community helpers by listing your volunteer opportunities.
            </p>
            <Link href="/portal/dashboard">
              <button className="rounded-full h-11 px-6 text-sm font-medium text-navy bg-white hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                Access Organization Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
