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
import { Loader2, Megaphone, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { AnnouncementSettings } from '@/types/settings';
import { toast } from 'sonner';

const TONE_PREVIEW: Record<
  AnnouncementSettings['tone'],
  { bg: string; border: string; text: string; Icon: typeof Info; label: string }
> = {
  info: {
    bg: '#E8F4F3',
    border: '#0D7C8F',
    text: '#0A6070',
    Icon: Info,
    label: 'Info',
  },
  warning: {
    bg: '#FEF3C7',
    border: '#D97706',
    text: '#92400E',
    Icon: AlertTriangle,
    label: 'Warning',
  },
  success: {
    bg: '#D1FAE5',
    border: '#16A34A',
    text: '#065F46',
    Icon: CheckCircle2,
    label: 'Success',
  },
};

export function AnnouncementForm() {
  const { settings, refresh } = useSettings();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<AnnouncementSettings>(settings.announcement);

  useEffect(() => {
    setDraft(settings.announcement);
  }, [settings.announcement]);

  const update = <K extends keyof AnnouncementSettings>(
    key: K,
    value: AnnouncementSettings[K]
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Normalize empty strings to undefined so the JSONB stays compact.
        const payload: AnnouncementSettings = {
          enabled: draft.enabled,
          message: draft.message.trim(),
          tone: draft.tone,
          linkLabel: draft.linkLabel?.trim() || undefined,
          linkHref: draft.linkHref?.trim() || undefined,
          startDate: draft.startDate || undefined,
          endDate: draft.endDate || undefined,
        };
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ announcement: payload }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (res.status === 401) {
          toast.error('Your admin session has expired — sign in again.');
          return;
        }
        if (json.ok) {
          toast.success('Announcement saved');
          await refresh();
        } else {
          toast.error(json.error ?? 'Failed to save announcement');
        }
      } catch {
        toast.error('Failed to save announcement');
      }
    });
  };

  const Preview = TONE_PREVIEW[draft.tone];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Announcement Banner
          </CardTitle>
          <CardDescription>
            Show a single message at the top of every public page. Useful for
            holiday closures, food drives, or other timely community notes.
            Leave disabled when not in use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="announcement-enabled"
              checked={draft.enabled}
              onCheckedChange={(checked) =>
                update('enabled', checked === true)
              }
            />
            <Label htmlFor="announcement-enabled" className="font-normal">
              Show the banner on the public site
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-message">Message *</Label>
            <Textarea
              id="announcement-message"
              value={draft.message}
              onChange={(e) => update('message', e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="e.g. The Beaufort pantry is closed Dec 24–26. Hot meals at First Baptist remain open."
            />
            <p className="text-xs text-gray-500">
              {draft.message.length}/500 characters
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-link-label">Link label</Label>
              <Input
                id="announcement-link-label"
                value={draft.linkLabel ?? ''}
                onChange={(e) => update('linkLabel', e.target.value)}
                placeholder="See details"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-link-href">Link URL or path</Label>
              <Input
                id="announcement-link-href"
                value={draft.linkHref ?? ''}
                onChange={(e) => update('linkHref', e.target.value)}
                placeholder="/volunteers or https://..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="announcement-start">Show starting (optional)</Label>
              <Input
                id="announcement-start"
                type="date"
                value={draft.startDate ?? ''}
                onChange={(e) => update('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-end">Hide after (optional)</Label>
              <Input
                id="announcement-end"
                type="date"
                value={draft.endDate ?? ''}
                onChange={(e) => update('endDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={draft.tone}
                onValueChange={(value) =>
                  update('tone', value as AnnouncementSettings['tone'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info (teal)</SelectItem>
                  <SelectItem value="warning">Warning (amber)</SelectItem>
                  <SelectItem value="success">Success (green)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.message.trim() && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Live preview</Label>
              <div
                className="rounded-md border px-4 py-2.5 flex items-center gap-3"
                style={{
                  backgroundColor: Preview.bg,
                  borderColor: Preview.border,
                  color: Preview.text,
                }}
              >
                <Preview.Icon className="w-4 h-4 shrink-0" />
                <p className="text-sm font-medium">
                  {draft.message}
                  {draft.linkHref && draft.linkLabel && (
                    <>
                      {' '}
                      <span className="underline font-semibold">
                        {draft.linkLabel}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save announcement
        </Button>
      </div>
    </div>
  );
}
