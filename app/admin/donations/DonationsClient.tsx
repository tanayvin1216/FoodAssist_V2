'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { COUNCIL_DONATION_TYPE_LABELS } from '@/lib/utils/constants';
import type { CouncilDonation, Organization } from '@/types/database';
import { councilDonationSchema, type CouncilDonationFormValues } from '@/lib/validations/schemas';
import { createDonationAction, deleteDonationAction } from './actions';

interface DonationsClientProps {
  initialDonations: CouncilDonation[];
  organizations: Organization[];
}

export function DonationsClient({ initialDonations, organizations }: DonationsClientProps) {
  const [donations, setDonations] = useState<CouncilDonation[]>(initialDonations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const form = useForm<CouncilDonationFormValues>({
    resolver: zodResolver(councilDonationSchema),
    defaultValues: {
      organization_id: '',
      donation_date: new Date().toISOString().split('T')[0],
      donation_type: 'money',
      description: '',
      amount: undefined,
    },
  });

  const filteredDonations =
    filterOrg === 'all'
      ? donations
      : donations.filter((d) => d.organization_id === filterOrg);

  const totalAmount = filteredDonations.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const getOrgName = (id: string) =>
    organizations.find((o) => o.id === id)?.name ?? 'Unknown';

  function handleSubmit(values: CouncilDonationFormValues) {
    startTransition(async () => {
      const result = await createDonationAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      form.reset();
      setIsDialogOpen(false);
      toast.success('Donation recorded.');
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this donation record?')) return;
    startTransition(async () => {
      const result = await deleteDonationAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDonations((prev) => prev.filter((d) => d.id !== id));
      toast.success('Donation deleted.');
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
            Council Donations
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
            Track donations made by the Food &amp; Health Council
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="min-h-11"
              style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Donation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ color: '#1B2D3A' }}>Log New Donation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="organization_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="donation_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="donation_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(COUNCIL_DONATION_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Describe the donation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
                  >
                    {isPending ? 'Saving…' : 'Log Donation'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
                  Total Donations
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8" style={{ color: '#0D7C8F' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
                  Total Records
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {filteredDonations.length}
                </p>
              </div>
              <Calendar className="h-8 w-8" style={{ color: '#0D7C8F' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div>
              <Label className="text-sm font-medium" style={{ color: '#8C7E72' }}>
                Filter by Organization
              </Label>
              <Select value={filterOrg} onValueChange={setFilterOrg}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card style={{ borderColor: '#C4B8AD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1B2D3A' }}>Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{formatDate(donation.donation_date)}</TableCell>
                  <TableCell className="font-medium">
                    {donation.organization?.name ?? getOrgName(donation.organization_id)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{ borderColor: '#C4B8AD', color: '#4A5568' }}
                    >
                      {COUNCIL_DONATION_TYPE_LABELS[donation.donation_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {donation.amount != null ? formatCurrency(donation.amount) : '—'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {donation.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(donation.id)}
                      aria-label="Delete donation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDonations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                    style={{ color: '#8C7E72' }}
                  >
                    No donations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
