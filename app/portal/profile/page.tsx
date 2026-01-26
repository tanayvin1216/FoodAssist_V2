'use client';

import { useState } from 'react';
import { OrgForm } from '@/components/forms/OrgForm';
import { sampleOrganizations } from '@/lib/utils/sampleData';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { toast } from 'sonner';

export default function PortalProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  // In production, fetch the user's organization from Supabase
  const organization = sampleOrganizations[0];

  const handleSubmit = async (data: OrganizationFormValues) => {
    setIsLoading(true);
    try {
      // In production, update via Supabase
      console.log('Updating organization:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Organization profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Organization Profile</h1>
        <p className="text-gray-600 mt-1">
          Update your organization&apos;s information. Changes will be visible in the public directory.
        </p>
      </div>

      <OrgForm
        organization={organization}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
