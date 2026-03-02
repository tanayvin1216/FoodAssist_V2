'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { useHeroSettings, useEmergencySettings } from '@/contexts/SettingsContext';
import {
  heroSettingsSchema,
  emergencySettingsSchema,
  HeroSettingsValues,
  EmergencySettingsValues,
} from '@/lib/validations/settings-schemas';
import { toast } from 'sonner';
import { useState } from 'react';

export function ContentForm() {
  return (
    <div className="space-y-6">
      <HeroForm />
      <EmergencyForm />
    </div>
  );
}

function HeroForm() {
  const { hero, updateHero } = useHeroSettings();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HeroSettingsValues>({
    resolver: zodResolver(heroSettingsSchema),
    defaultValues: hero,
  });

  const showStats = watch('showStats');

  const onSubmit = async (data: HeroSettingsValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateHero(data);
      toast.success('Hero section saved');
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
            <FileText className="w-5 h-5" />
            Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationBadge">Location Badge</Label>
            <Input
              id="locationBadge"
              {...register('locationBadge')}
              placeholder="Carteret County, NC"
            />
            {errors.locationBadge && (
              <p className="text-sm text-red-500">
                {errors.locationBadge.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Main Headline</Label>
            <Input
              id="headline"
              {...register('headline')}
              placeholder="Find Food Assistance Near You"
            />
            {errors.headline && (
              <p className="text-sm text-red-500">{errors.headline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              {...register('subtitle')}
              rows={2}
              placeholder="Connect with local food pantries..."
            />
            {errors.subtitle && (
              <p className="text-sm text-red-500">{errors.subtitle.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showStats"
              checked={showStats}
              onCheckedChange={(checked) => setValue('showStats', checked as boolean)}
            />
            <Label htmlFor="showStats" className="font-normal">
              Show statistics badges
            </Label>
          </div>

          {showStats && (
            <div className="grid gap-4 md:grid-cols-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="statsLabels.locations">Locations Label</Label>
                <Input
                  id="statsLabels.locations"
                  {...register('statsLabels.locations')}
                  placeholder="locations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statsLabels.towns">Towns Label</Label>
                <Input
                  id="statsLabels.towns"
                  {...register('statsLabels.towns')}
                  placeholder="towns"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statsLabels.services">Services Label</Label>
                <Input
                  id="statsLabels.services"
                  {...register('statsLabels.services')}
                  placeholder="Free services"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Hero
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function EmergencyForm() {
  const { emergency, updateEmergency } = useEmergencySettings();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmergencySettingsValues>({
    resolver: zodResolver(emergencySettingsSchema),
    defaultValues: emergency,
  });

  const enabled = watch('enabled');
  const currentIcon = watch('icon');

  const onSubmit = async (data: EmergencySettingsValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateEmergency(data);
      toast.success('Emergency section saved');
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
            <AlertCircle className="w-5 h-5" />
            Emergency Help Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setValue('enabled', checked as boolean)}
            />
            <Label htmlFor="enabled" className="font-normal">
              Show emergency help section on homepage
            </Label>
          </div>

          {enabled && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Section Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Need Immediate Help?"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={currentIcon}
                    onValueChange={(value) =>
                      setValue('icon', value as 'heart' | 'phone' | 'alert')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heart">Heart</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={2}
                  placeholder="Contact us for emergency food assistance..."
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPrimaryPhone"
                    checked={watch('showPrimaryPhone')}
                    onCheckedChange={(checked) =>
                      setValue('showPrimaryPhone', checked as boolean)
                    }
                  />
                  <Label htmlFor="showPrimaryPhone" className="font-normal">
                    Show phone button
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showExternalHelp"
                    checked={watch('showExternalHelp')}
                    onCheckedChange={(checked) =>
                      setValue('showExternalHelp', checked as boolean)
                    }
                  />
                  <Label htmlFor="showExternalHelp" className="font-normal">
                    Show external help link
                  </Label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Emergency Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
