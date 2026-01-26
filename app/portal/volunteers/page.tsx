'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { sampleVolunteerNeeds, sampleOrganizations } from '@/lib/utils/sampleData';
import { formatDate } from '@/lib/utils/formatters';
import { toast } from 'sonner';

export default function PortalVolunteersPage() {
  const organization = sampleOrganizations[0];
  const [volunteerNeeds, setVolunteerNeeds] = useState(
    sampleVolunteerNeeds.filter((v) => v.organization_id === organization.id)
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<(typeof sampleVolunteerNeeds)[0] | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newNeed = {
      id: editingNeed?.id || String(Date.now()),
      organization_id: organization.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      time_commitment: formData.get('time_commitment') as string,
      contact_email: formData.get('contact_email') as string,
      is_active: formData.get('is_active') === 'on',
      posted_date: editingNeed?.posted_date || new Date().toISOString(),
    };

    if (editingNeed) {
      setVolunteerNeeds(volunteerNeeds.map((v) => (v.id === editingNeed.id ? newNeed : v)));
      toast.success('Volunteer need updated');
    } else {
      setVolunteerNeeds([newNeed, ...volunteerNeeds]);
      toast.success('Volunteer need created');
    }

    setIsDialogOpen(false);
    setEditingNeed(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this volunteer need?')) {
      setVolunteerNeeds(volunteerNeeds.filter((v) => v.id !== id));
      toast.success('Volunteer need deleted');
    }
  };

  const handleEdit = (need: (typeof sampleVolunteerNeeds)[0]) => {
    setEditingNeed(need);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Needs</h1>
          <p className="text-gray-600 mt-1">
            Post volunteer opportunities to attract community helpers
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingNeed(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingNeed ? 'Edit Volunteer Need' : 'Create Volunteer Need'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={editingNeed?.title}
                  placeholder="e.g., Food Pantry Volunteer"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  defaultValue={editingNeed?.description}
                  placeholder="Describe what volunteers will do..."
                />
              </div>

              <div>
                <Label htmlFor="time_commitment">Time Commitment</Label>
                <Input
                  id="time_commitment"
                  name="time_commitment"
                  defaultValue={editingNeed?.time_commitment}
                  placeholder="e.g., 3-4 hours per shift"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={editingNeed?.contact_email}
                  placeholder="volunteer@example.org"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingNeed?.is_active ?? true}
                />
                <Label htmlFor="is_active" className="font-normal">
                  Active (visible to public)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingNeed(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNeed ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {volunteerNeeds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You haven&apos;t posted any volunteer needs yet.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {volunteerNeeds.map((need) => (
            <Card key={need.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{need.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted {formatDate(need.posted_date)}
                    </p>
                  </div>
                  <Badge variant={need.is_active ? 'default' : 'secondary'}>
                    {need.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{need.description}</p>

                {need.time_commitment && (
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {need.time_commitment}
                  </p>
                )}

                {need.contact_email && (
                  <p className="text-sm text-gray-600">
                    <strong>Contact:</strong> {need.contact_email}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(need)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(need.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
