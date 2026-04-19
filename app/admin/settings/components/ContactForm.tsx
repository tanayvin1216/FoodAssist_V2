'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Mail } from 'lucide-react';
import { useContact, useSettings } from '@/contexts/SettingsContext';
import {
  contactSettingsSchema,
  ContactSettingsValues,
} from '@/lib/validations/settings-schemas';
import { toast } from 'sonner';

export function ContactForm() {
  const { contact } = useContact();
  const { refresh } = useSettings();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSettingsValues>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: contact,
  });

  // Re-sync form fields when context updates (see BrandingForm for rationale).
  useEffect(() => {
    reset(contact);
  }, [contact, reset]);

  const onSubmit = (data: ContactSettingsValues) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: data }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string; details?: unknown };
        if (res.status === 401) {
          toast.error('Your admin session has expired — sign in again.');
          return;
        }
        if (json.ok) {
          toast.success('Contact settings saved');
          await refresh();
        } else {
          toast.error(json.error ?? 'Failed to save settings');
        }
      } catch {
        toast.error('Failed to save settings');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              {...register('organizationName')}
              placeholder="Carteret County Food & Health Council"
            />
            {errors.organizationName && (
              <p className="text-sm text-red-500">
                {errors.organizationName.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="Beaufort" />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="NC"
                maxLength={2}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="info@example.org"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="2525551234"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone (digits only)</Label>
              <Input
                id="emergencyPhone"
                {...register('emergencyPhone')}
                placeholder="2527287000"
              />
              {errors.emergencyPhone && (
                <p className="text-sm text-red-500">
                  {errors.emergencyPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhoneDisplay">Display Format</Label>
              <Input
                id="emergencyPhoneDisplay"
                {...register('emergencyPhoneDisplay')}
                placeholder="(252) 728-7000"
              />
              {errors.emergencyPhoneDisplay && (
                <p className="text-sm text-red-500">
                  {errors.emergencyPhoneDisplay.message}
                </p>
              )}
              <p className="text-xs text-gray-500">How the phone appears to users</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="externalHelpUrl">External Help URL</Label>
              <Input
                id="externalHelpUrl"
                {...register('externalHelpUrl')}
                placeholder="https://211.org"
              />
              {errors.externalHelpUrl && (
                <p className="text-sm text-red-500">
                  {errors.externalHelpUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalHelpLabel">External Help Label</Label>
              <Input
                id="externalHelpLabel"
                {...register('externalHelpLabel')}
                placeholder="Dial 211 for Help"
              />
              {errors.externalHelpLabel && (
                <p className="text-sm text-red-500">
                  {errors.externalHelpLabel.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Contact Info
        </Button>
      </div>
    </form>
  );
}
