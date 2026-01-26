'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
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
import { sampleOrganizations } from '@/lib/utils/sampleData';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { COUNCIL_DONATION_TYPE_LABELS } from '@/lib/utils/constants';
import { CouncilDonation, CouncilDonationType } from '@/types/database';
import { toast } from 'sonner';

// Sample donation data
const initialDonations: CouncilDonation[] = [
  {
    id: '1',
    organization_id: '1',
    donation_date: '2024-01-15',
    amount: 500,
    donation_type: 'money',
    description: 'Monthly support allocation',
    recorded_by: 'Admin',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    organization_id: '2',
    donation_date: '2024-01-10',
    amount: 250,
    donation_type: 'food',
    description: 'Canned goods and dry goods',
    recorded_by: 'Admin',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    organization_id: '5',
    donation_date: '2024-01-08',
    amount: 1000,
    donation_type: 'money',
    description: 'Emergency fund support',
    recorded_by: 'Admin',
    created_at: '2024-01-08T10:00:00Z',
  },
];

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState(initialDonations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterOrg, setFilterOrg] = useState<string>('all');

  const filteredDonations =
    filterOrg === 'all'
      ? donations
      : donations.filter((d) => d.organization_id === filterOrg);

  const totalAmount = filteredDonations.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );

  const getOrgName = (id: string) => {
    return sampleOrganizations.find((o) => o.id === id)?.name || 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newDonation: CouncilDonation = {
      id: String(Date.now()),
      organization_id: formData.get('organization_id') as string,
      donation_date: formData.get('donation_date') as string,
      amount: parseFloat(formData.get('amount') as string) || undefined,
      donation_type: formData.get('donation_type') as CouncilDonationType,
      description: formData.get('description') as string,
      recorded_by: 'Admin',
      created_at: new Date().toISOString(),
    };

    setDonations([newDonation, ...donations]);
    setIsDialogOpen(false);
    toast.success('Donation recorded successfully');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this donation record?')) {
      setDonations(donations.filter((d) => d.id !== id));
      toast.success('Donation record deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Council Donations</h1>
          <p className="text-gray-600 mt-1">
            Track donations made by the Food & Health Council
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Donation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Donation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="organization_id">Organization *</Label>
                <Select name="organization_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donation_date">Date *</Label>
                  <Input
                    id="donation_date"
                    name="donation_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="donation_type">Type *</Label>
                  <Select name="donation_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COUNCIL_DONATION_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe the donation..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Log Donation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Donations
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredDonations.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Filter by Organization
              </p>
              <Select value={filterOrg} onValueChange={setFilterOrg}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {sampleOrganizations.map((org) => (
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
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
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
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{formatDate(donation.donation_date)}</TableCell>
                  <TableCell className="font-medium">
                    {getOrgName(donation.organization_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {COUNCIL_DONATION_TYPE_LABELS[donation.donation_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {donation.amount ? formatCurrency(donation.amount) : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {donation.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(donation.id)}
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
                    className="text-center py-8 text-gray-500"
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
