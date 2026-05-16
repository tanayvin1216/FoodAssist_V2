'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Tag, MapPin } from 'lucide-react';
import { useCategories, useSettings } from '@/contexts/SettingsContext';
import { CategoryItem } from '@/types/settings';
import { toast } from 'sonner';

type CatalogKind = 'assistanceTypes' | 'donationTypes';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

function withReorderedIndexes(items: CategoryItem[]): CategoryItem[] {
  return items.map((item, idx) => ({ ...item, order: idx }));
}

function CatalogEditor({
  title,
  description,
  kind,
  initial,
  onChange,
}: {
  title: string;
  description: string;
  kind: CatalogKind;
  initial: CategoryItem[];
  onChange: (items: CategoryItem[]) => void;
}) {
  const [items, setItems] = useState<CategoryItem[]>(initial);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const updateItem = (slug: string, patch: Partial<CategoryItem>) => {
    const next = items.map((item) =>
      item.slug === slug ? { ...item, ...patch } : item
    );
    setItems(next);
    onChange(next);
  };

  const removeItem = (slug: string) => {
    const next = withReorderedIndexes(items.filter((item) => item.slug !== slug));
    setItems(next);
    onChange(next);
  };

  const addItem = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      toast.error('Enter a label first');
      return;
    }
    const slug = slugify(trimmed);
    if (!slug) {
      toast.error('Label must contain letters or numbers');
      return;
    }
    if (items.some((item) => item.slug === slug)) {
      toast.error(`A ${title.toLowerCase()} with that slug already exists`);
      return;
    }
    const next = withReorderedIndexes([
      ...items,
      { slug, label: trimmed, isActive: true, order: items.length },
    ]);
    setItems(next);
    onChange(next);
    setNewLabel('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.slug}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 p-3 border rounded-lg bg-gray-50"
          >
            <Checkbox
              checked={item.isActive}
              onCheckedChange={(checked) =>
                updateItem(item.slug, { isActive: checked === true })
              }
              aria-label={`${item.label} active`}
            />
            <div className="flex-1 grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Display label
                </Label>
                <Input
                  value={item.label}
                  onChange={(e) =>
                    updateItem(item.slug, { label: e.target.value })
                  }
                  placeholder="e.g. Hot Meals (Eat In)"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Identifier (immutable)
                </Label>
                <Input
                  value={item.slug}
                  disabled
                  className="font-mono text-xs"
                />
              </div>
            </div>
            {!item.isActive && (
              <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                Hidden
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 self-start sm:self-auto"
              onClick={() => removeItem(item.slug)}
              aria-label={`Remove ${item.label}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No entries yet. Add one below.
          </p>
        )}

        <div className="flex items-end gap-2 pt-2 border-t">
          <div className="flex-1">
            <Label className="text-xs text-gray-500 mb-1 block">
              Add new {title.toLowerCase()}
            </Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem();
                }
              }}
              placeholder="e.g. Mobile Food Truck"
            />
          </div>
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          New entries auto-generate a stable identifier from the label.
          Deactivating an entry hides it from the public filters and admin
          forms while preserving any organizations already tagged with it.
        </p>
      </CardContent>
    </Card>
  );
}

export function CategoriesForm() {
  const { categories } = useCategories();
  const { refresh } = useSettings();
  const [isPending, startTransition] = useTransition();
  const [assistance, setAssistance] = useState<CategoryItem[]>(
    categories.assistanceTypes
  );
  const [donation, setDonation] = useState<CategoryItem[]>(
    categories.donationTypes
  );
  const [towns, setTowns] = useState<string[]>(categories.towns);
  const [newTown, setNewTown] = useState('');

  useEffect(() => {
    setAssistance(categories.assistanceTypes);
    setDonation(categories.donationTypes);
    setTowns(categories.towns);
  }, [categories]);

  const addTown = () => {
    const trimmed = newTown.trim();
    if (!trimmed) {
      toast.error('Enter a town name first');
      return;
    }
    if (towns.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('That town is already in the list');
      return;
    }
    setTowns([...towns, trimmed].sort((a, b) => a.localeCompare(b)));
    setNewTown('');
  };

  const removeTown = (town: string) => {
    setTowns(towns.filter((t) => t !== town));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories: {
              assistanceTypes: withReorderedIndexes(assistance),
              donationTypes: withReorderedIndexes(donation),
              towns,
            },
          }),
        });
        const json = (await res.json()) as {
          ok: boolean;
          error?: string;
          details?: unknown;
        };
        if (res.status === 401) {
          toast.error('Your admin session has expired — sign in again.');
          return;
        }
        if (json.ok) {
          toast.success('Categories saved');
          await refresh();
        } else {
          toast.error(json.error ?? 'Failed to save categories');
        }
      } catch {
        toast.error('Failed to save categories');
      }
    });
  };

  return (
    <div className="space-y-6">
      <CatalogEditor
        title="Assistance types"
        description="Service categories shown on the public directory filter and the organization form. Examples: Hot Meals (Eat In), Staffed Food Pantry."
        kind="assistanceTypes"
        initial={assistance}
        onChange={setAssistance}
      />

      <CatalogEditor
        title="Donation types"
        description="What an organization will accept as donations. Shown on the organization detail page and admin import."
        kind="donationTypes"
        initial={donation}
        onChange={setDonation}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Towns
          </CardTitle>
          <CardDescription>
            Towns offered in the organization edit form. Removing a town does
            not change existing organization records — only what admins can
            pick going forward.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {towns.map((town) => (
              <span
                key={town}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 border border-gray-200"
              >
                {town}
                <button
                  type="button"
                  onClick={() => removeTown(town)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${town}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {towns.length === 0 && (
              <p className="text-sm text-gray-500">No towns yet. Add one below.</p>
            )}
          </div>

          <div className="flex items-end gap-2 pt-2 border-t">
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1 block">
                Add new town
              </Label>
              <Input
                value={newTown}
                onChange={(e) => setNewTown(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTown();
                  }
                }}
                placeholder="e.g. Cape Carteret"
              />
            </div>
            <Button type="button" variant="outline" onClick={addTown}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save categories
        </Button>
      </div>
    </div>
  );
}
