'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Palette } from 'lucide-react';
import { useBranding, useSettings } from '@/contexts/SettingsContext';
import {
  brandingSettingsSchema,
  BrandingSettingsValues,
} from '@/lib/validations/settings-schemas';
import { toast } from 'sonner';

export function BrandingForm() {
  const { branding } = useBranding();
  const { refresh } = useSettings();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandingSettingsValues>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: branding,
  });

  // Re-sync form fields whenever the settings context changes (e.g. after a
  // successful save + refresh). useForm only reads defaultValues on mount, so
  // without this, the form stays pinned to the first render's values and
  // subsequent saves appear to "stick to the old value".
  useEffect(() => {
    reset(branding);
  }, [branding, reset]);

  const onSubmit = (data: BrandingSettingsValues) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branding: data }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string; details?: unknown };
        if (res.status === 401) {
          toast.error('Your admin session has expired — sign in again.');
          return;
        }
        if (json.ok) {
          toast.success('Branding settings saved');
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Branding Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                {...register('siteName')}
                placeholder="FoodAssist"
              />
              {errors.siteName && (
                <p className="text-sm text-red-500">{errors.siteName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoAbbreviation">Logo Abbreviation</Label>
              <Input
                id="logoAbbreviation"
                {...register('logoAbbreviation')}
                placeholder="FA"
                maxLength={3}
              />
              {errors.logoAbbreviation && (
                <p className="text-sm text-red-500">
                  {errors.logoAbbreviation.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                2-3 letters shown in the logo icon
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteTagline">Site Tagline</Label>
            <Input
              id="siteTagline"
              {...register('siteTagline')}
              placeholder="Food Assistance Directory"
            />
            {errors.siteTagline && (
              <p className="text-sm text-red-500">{errors.siteTagline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerTagline">Footer Description</Label>
            <Textarea
              id="footerTagline"
              {...register('footerTagline')}
              rows={3}
              placeholder="A project by..."
            />
            {errors.footerTagline && (
              <p className="text-sm text-red-500">
                {errors.footerTagline.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Shown in the footer under the logo
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
