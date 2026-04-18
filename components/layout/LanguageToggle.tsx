'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LocaleContext';
import type { Locale } from '@/lib/i18n/dictionary';

interface LanguageToggleProps {
  className?: string;
}

/**
 * Segmented EN / ES switch styled to match the Card / List view
 * toggle in DirectoryList. Persists the choice via cookie (so
 * Server Components can read it) + localStorage, then calls
 * router.refresh() so server-rendered routes pick up the new locale.
 */
export function LanguageToggle({ className }: LanguageToggleProps) {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();

  const onPick = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    router.refresh();
  };

  const option = (value: Locale, label: string) => (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={locale === value}
      className={[
        'px-4 py-1.5 rounded-full text-xs font-medium transition-colors',
        locale === value
          ? 'bg-navy text-white shadow-sm'
          : 'text-body-text hover:text-navy',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className={['flex bg-tag-bg rounded-full p-1', className].filter(Boolean).join(' ')}
    >
      {option('en', 'EN')}
      {option('es', 'ES')}
    </div>
  );
}
