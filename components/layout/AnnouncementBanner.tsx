'use client';

import Link from 'next/link';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

const TONE_STYLES: Record<
  'info' | 'warning' | 'success',
  { bg: string; border: string; text: string; Icon: typeof Info }
> = {
  info: {
    bg: '#E8F4F3',
    border: '#0D7C8F',
    text: '#0A6070',
    Icon: Info,
  },
  warning: {
    bg: '#FEF3C7',
    border: '#D97706',
    text: '#92400E',
    Icon: AlertTriangle,
  },
  success: {
    bg: '#D1FAE5',
    border: '#16A34A',
    text: '#065F46',
    Icon: CheckCircle2,
  },
};

/**
 * Return today's date as YYYY-MM-DD in the viewer's local timezone.
 * Using local rather than UTC keeps the banner's start/end windows aligned
 * with the day boundary the admin sees when picking dates.
 */
function todayLocalIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isWithinWindow(start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const today = todayLocalIso();
  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

export function AnnouncementBanner() {
  const { settings } = useSettings();
  const { enabled, message, linkLabel, linkHref, startDate, endDate, tone } =
    settings.announcement;
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal when the message itself changes so a new announcement is
  // never silently hidden by a prior "x" click.
  useEffect(() => {
    setDismissed(false);
  }, [message]);

  const visible = useMemo(
    () =>
      enabled && message.trim().length > 0 && isWithinWindow(startDate, endDate),
    [enabled, message, startDate, endDate]
  );

  if (!visible || dismissed) return null;

  const { bg, border, text, Icon } = TONE_STYLES[tone];

  return (
    <div
      role="status"
      className="w-full border-b"
      style={{ backgroundColor: bg, borderColor: border, color: text }}
    >
      <div className="container px-6 py-2.5 flex items-center gap-3 max-w-6xl mx-auto">
        <Icon className="w-4 h-4 shrink-0" aria-hidden />
        <p className="flex-1 text-sm font-medium">
          {message}
          {linkHref && linkLabel && (
            <>
              {' '}
              <Link
                href={linkHref}
                className="underline underline-offset-2 font-semibold"
              >
                {linkLabel}
              </Link>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
