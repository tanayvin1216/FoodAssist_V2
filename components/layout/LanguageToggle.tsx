'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LocaleContext';
import type { Locale } from '@/lib/i18n/dictionary';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Segmented EN / ES switch. Mirrors the visual shape of the
 * Card / List view switch in DirectoryList. Persists the choice
 * via cookie (server-readable) + localStorage (client-friendly)
 * and triggers a router.refresh() so Server Components re-render
 * with the new locale.
 */
export function LanguageToggle({ className, size = 'md' }: LanguageToggleProps) {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();

  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const rounded = size === 'sm' ? 'rounded-md' : 'rounded-lg';

  const onPick = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    // Refresh so any server-rendered copy (org detail headings, etc.)
    // re-fetches with the new cookie value.
    router.refresh();
  };

  const option = (value: Locale, label: string) => (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={locale === value}
      className={[
        pad,
        rounded,
        'font-medium transition-colors',
        locale === value
          ? 'bg-navy text-white'
          : 'text-navy hover:bg-navy/5',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className={['inline-flex items-center gap-0.5 p-0.5 border border-navy/20 rounded-xl bg-white', className].filter(Boolean).join(' ')}
    >
      {option('en', 'EN')}
      {option('es', 'ES')}
    </div>
  );
}
