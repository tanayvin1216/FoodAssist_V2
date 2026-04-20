'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import {
  volunteerApplicationSchema,
  type VolunteerApplicationFormValues,
} from '@/lib/validations/schemas';
import { submitVolunteerApplicationAction } from '@/app/(public)/volunteers/actions';

interface NeedOption {
  id: string;
  title: string;
  organization_id?: string | null;
}

interface VolunteerApplicationFormProps {
  needs: NeedOption[];
  heading: string;
  subheading: string;
  fields: {
    opportunity: string;
    opportunityGeneral: string;
    name: string;
    email: string;
    phone: string;
    willing: string;
    willingPlaceholder: string;
    hours: string;
    hoursPlaceholder: string;
    availability: string;
    availabilityPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
  };
}

export function VolunteerApplicationForm({
  needs,
  heading,
  subheading,
  fields,
}: VolunteerApplicationFormProps) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VolunteerApplicationFormValues>({
    resolver: zodResolver(volunteerApplicationSchema),
    defaultValues: {
      volunteer_need_id: '',
      organization_id: '',
      applicant_name: '',
      applicant_email: '',
      applicant_phone: '',
      willing_to_do: '',
      hours_per_week: '',
      availability: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    const matched = needs.find((n) => n.id === values.volunteer_need_id);
    const payload: VolunteerApplicationFormValues = {
      ...values,
      volunteer_need_id: matched ? matched.id : '',
      organization_id: matched?.organization_id || '',
    };
    startTransition(async () => {
      const result = await submitVolunteerApplicationAction(payload);
      if (result.ok) {
        toast.success(fields.success);
        reset();
        setSubmitted(true);
      } else {
        toast.error(result.error);
      }
    });
  });

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <h3 className="text-lg font-semibold text-navy mb-2">{fields.success}</h3>
        <p className="text-sm text-body-text">
          {subheading}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-navy underline hover:text-navy-light"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-display text-navy mb-1">{heading}</h2>
        <p className="text-sm text-body-text">{subheading}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="volunteer_need_id" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
            {fields.opportunity}
          </label>
          <select
            id="volunteer_need_id"
            {...register('volunteer_need_id')}
            className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
          >
            <option value="">{fields.opportunityGeneral}</option>
            {needs.map((need) => (
              <option key={need.id} value={need.id}>
                {need.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="applicant_name" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
              {fields.name}
            </label>
            <input
              id="applicant_name"
              type="text"
              {...register('applicant_name')}
              className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
            />
            {errors.applicant_name && (
              <p className="text-xs text-red-600 mt-1">{errors.applicant_name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="applicant_email" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
              {fields.email}
            </label>
            <input
              id="applicant_email"
              type="email"
              {...register('applicant_email')}
              className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
            />
            {errors.applicant_email && (
              <p className="text-xs text-red-600 mt-1">{errors.applicant_email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="applicant_phone" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
            {fields.phone}
          </label>
          <input
            id="applicant_phone"
            type="tel"
            {...register('applicant_phone')}
            className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
          />
        </div>

        <div>
          <label htmlFor="willing_to_do" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
            {fields.willing}
          </label>
          <textarea
            id="willing_to_do"
            rows={4}
            placeholder={fields.willingPlaceholder}
            {...register('willing_to_do')}
            className="w-full rounded-2xl border border-divider bg-white px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy resize-none"
          />
          {errors.willing_to_do && (
            <p className="text-xs text-red-600 mt-1">{errors.willing_to_do.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hours_per_week" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
              {fields.hours}
            </label>
            <input
              id="hours_per_week"
              type="text"
              placeholder={fields.hoursPlaceholder}
              {...register('hours_per_week')}
              className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
            />
          </div>
          <div>
            <label htmlFor="availability" className="block text-xs uppercase tracking-wider text-muted-text mb-1.5">
              {fields.availability}
            </label>
            <input
              id="availability"
              type="text"
              placeholder={fields.availabilityPlaceholder}
              {...register('availability')}
              className="w-full h-11 rounded-full border border-divider bg-white px-4 text-sm text-navy focus:outline-none focus:border-navy"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-11 px-6 rounded-full bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors inline-flex items-center gap-2 disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {pending ? fields.submitting : fields.submit}
        </button>
      </form>
    </div>
  );
}
