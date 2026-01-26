'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Organization } from '@/types/database';
import { organizationSchema, OrganizationFormValues } from '@/lib/validations/schemas';
import {
  ASSISTANCE_TYPE_LABELS,
  DONATION_TYPE_LABELS,
  SERVED_POPULATION_LABELS,
  COST_LABELS,
  DAY_LABELS,
  CARTERET_COUNTY_TOWNS,
  ASSISTANCE_TYPES,
  DONATION_TYPES,
  SERVED_POPULATIONS,
  DAYS_OF_WEEK,
} from '@/lib/utils/constants';
import { formatPhone } from '@/lib/utils/formatters';

interface OrgFormProps {
  organization?: Organization;
  onSubmit: (data: OrganizationFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function OrgForm({ organization, onSubmit, isLoading }: OrgFormProps) {
  const defaultOperatingHours = DAYS_OF_WEEK.map((day) => {
    const existing = organization?.operating_hours?.find((h) => h.day === day);
    return (
      existing || {
        day,
        open_time: '09:00',
        close_time: '17:00',
        is_closed: day === 'saturday' || day === 'sunday',
      }
    );
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      address: organization?.address || '',
      town: organization?.town || '',
      zip: organization?.zip || '',
      contact_name: organization?.contact_name || '',
      phone: organization?.phone ? formatPhone(organization.phone) : '',
      email: organization?.email || '',
      website: organization?.website || '',
      facebook: organization?.facebook || '',
      assistance_types: organization?.assistance_types || [],
      who_served: organization?.who_served || ['all'],
      cost: organization?.cost || 'free',
      num_meals_available: organization?.num_meals_available,
      operating_hours: defaultOperatingHours,
      hours_notes: organization?.hours_notes || '',
      donations_accepted: organization?.donations_accepted || [],
      storage_capacity: organization?.storage_capacity || {
        refrigerator: false,
        freezer: false,
        dry_storage: true,
      },
      comments: organization?.comments || '',
      is_active: organization?.is_active ?? true,
      spanish_available: organization?.spanish_available ?? false,
    },
  });

  const operatingHours = watch('operating_hours');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input id="address" {...register('address')} />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="town">Town *</Label>
              <Controller
                name="town"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select town" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARTERET_COUNTY_TOWNS.map((town) => (
                        <SelectItem key={town} value={town}>
                          {town}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.town && (
                <p className="text-sm text-red-600 mt-1">{errors.town.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input id="zip" {...register('zip')} placeholder="28XXX" />
              {errors.zip && (
                <p className="text-sm text-red-600 mt-1">{errors.zip.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contact_name">Contact Person</Label>
              <Input id="contact_name" {...register('contact_name')} />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(252) 555-0123"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://"
              />
              {errors.website && (
                <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="facebook">Facebook Page</Label>
              <Input
                id="facebook"
                {...register('facebook')}
                placeholder="https://facebook.com/..."
              />
              {errors.facebook && (
                <p className="text-sm text-red-600 mt-1">{errors.facebook.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Provided</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Type of Assistance *</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {ASSISTANCE_TYPES.map((type) => (
                <Controller
                  key={type}
                  name="assistance_types"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`assistance-${type}`}
                        checked={field.value?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          if (checked) {
                            field.onChange([...current, type]);
                          } else {
                            field.onChange(current.filter((t) => t !== type));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`assistance-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {ASSISTANCE_TYPE_LABELS[type]}
                      </Label>
                    </div>
                  )}
                />
              ))}
            </div>
            {errors.assistance_types && (
              <p className="text-sm text-red-600 mt-1">
                {errors.assistance_types.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-3 block">Population Served</Label>
              <div className="space-y-2">
                {SERVED_POPULATIONS.map((pop) => (
                  <Controller
                    key={pop}
                    name="who_served"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`served-${pop}`}
                          checked={field.value?.includes(pop)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, pop]);
                            } else {
                              field.onChange(current.filter((p) => p !== pop));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`served-${pop}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {SERVED_POPULATION_LABELS[pop]}
                        </Label>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Controller
                name="cost"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COST_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="num_meals_available">Meals Available (per day)</Label>
              <Input
                id="num_meals_available"
                type="number"
                {...register('num_meals_available', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-24 font-medium">{DAY_LABELS[day]}</div>
                <Controller
                  name={`operating_hours.${index}.is_closed`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`closed-${day}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor={`closed-${day}`}
                        className="text-sm font-normal"
                      >
                        Closed
                      </Label>
                    </div>
                  )}
                />
                {!operatingHours?.[index]?.is_closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`operating_hours.${index}.open_time`)}
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`operating_hours.${index}.close_time`)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="hours_notes">Hours Notes</Label>
            <Textarea
              id="hours_notes"
              {...register('hours_notes')}
              placeholder="E.g., Closed on holidays, special hours during summer..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Donations Accepted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {DONATION_TYPES.map((type) => (
              <Controller
                key={type}
                name="donations_accepted"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`donation-${type}`}
                      checked={field.value?.includes(type)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        if (checked) {
                          field.onChange([...current, type]);
                        } else {
                          field.onChange(current.filter((t) => t !== type));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`donation-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {DONATION_TYPE_LABELS[type]}
                    </Label>
                  </div>
                )}
              />
            ))}
          </div>

          <Separator />

          <div>
            <Label className="mb-3 block">Storage Capacity</Label>
            <div className="flex flex-wrap gap-4">
              <Controller
                name="storage_capacity.refrigerator"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="storage-fridge"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label
                      htmlFor="storage-fridge"
                      className="text-sm font-normal"
                    >
                      Refrigerator
                    </Label>
                  </div>
                )}
              />
              <Controller
                name="storage_capacity.freezer"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="storage-freezer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label
                      htmlFor="storage-freezer"
                      className="text-sm font-normal"
                    >
                      Freezer
                    </Label>
                  </div>
                )}
              />
              <Controller
                name="storage_capacity.dry_storage"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="storage-dry"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label
                      htmlFor="storage-dry"
                      className="text-sm font-normal"
                    >
                      Dry Storage
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="comments">Comments / Special Notes</Label>
            <Textarea
              id="comments"
              {...register('comments')}
              placeholder="Any additional information about your organization..."
              rows={4}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <Controller
              name="spanish_available"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spanish"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="spanish" className="font-normal">
                    Spanish language services available
                  </Label>
                </div>
              )}
            />

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="active" className="font-normal">
                    Listing is active (visible in directory)
                  </Label>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
