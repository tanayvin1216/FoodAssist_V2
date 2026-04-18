'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { OrgForm } from '@/components/forms/OrgForm';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { Organization } from '@/types/database';
import { updateOwnOrganizationAction } from './actions';

interface ProfileEditorProps {
  organization: Organization;
}

/**
 * Client shell for the portal profile editor.
 * Wraps the shared OrgForm and strips `is_active` before submitting —
 * only admins can activate/deactivate organizations.
 */
export default function ProfileEditor({ organization }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: OrganizationFormValues): Promise<void> => {
    // Intentionally destructure to drop is_active — org users cannot change activation status.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_active: _dropped, ...safeData } = data;

    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await updateOwnOrganizationAction(safeData);
        if (result.ok) {
          toast.success('Profile updated successfully.');
        } else {
          toast.error(result.error);
        }
        resolve();
      });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
          Edit Organization Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
          Changes appear in the public directory once saved. Your listing status
          is managed by the Carteret County Food &amp; Health Council.
        </p>
      </div>

      {/*
        Hide the is_active checkbox that OrgForm renders.
        The [data-field-active] selector targets the wrapping div so the
        field is visually and interactively hidden without modifying OrgForm.
      */}
      <style>{`
        #active,
        label[for="active"],
        #active + label {
          display: none !important;
        }
      `}</style>

      <OrgForm
        organization={organization}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
