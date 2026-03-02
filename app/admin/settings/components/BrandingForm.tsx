'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Palette } from 'lucide-react';
import { useBranding } from '@/contexts/SettingsContext';
import {
  brandingSettingsSchema,
  BrandingSettingsValues,
} from '@/lib/validations/settings-schemas';
import { toast } from 'sonner';
import { useState } from 'react';

export function BrandingForm() {
  const { branding, updateBranding } = useBranding();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandingSettingsValues>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: branding,
  });

  const onSubmit = async (data: BrandingSettingsValues) => {
    setIsLoading(true);
    try {
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateBranding(data);
      toast.success('Branding settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
