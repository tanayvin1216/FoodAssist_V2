'use client';

import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import type { VolunteerApplication } from '@/types/database';
import { reviewApplicationAction } from './actions';

interface PortalApplicationsClientProps {
  applications: VolunteerApplication[];
}

export function PortalApplicationsClient({ applications }: PortalApplicationsClientProps) {
  return (
    <ApplicationsTable
      applications={applications}
      exportFilename="our-volunteer-applications.csv"
      onReview={reviewApplicationAction}
    />
  );
}
