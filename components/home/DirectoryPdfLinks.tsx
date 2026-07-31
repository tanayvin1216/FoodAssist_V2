'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Organization } from '@/types/database';
import type { CategoriesSettings } from '@/types/settings';
import { dictionary, type Locale } from '@/lib/i18n/dictionary';
import { useTranslation } from '@/contexts/LocaleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { buildCategoryLabelMap } from '@/lib/utils/category-labels';

interface DirectoryPdfLinksProps {
  organizations: Organization[];
}

const PDF_DATE_LOCALE: Record<Locale, string> = { en: 'en-US', es: 'es-ES' };

/**
 * Admin-managed category labels are stored in English only. For the Spanish
 * PDF we prefer the translated label from the i18n dictionary when the slug
 * has one, and fall back to the admin label otherwise.
 */
function buildPdfLabels(
  categories: CategoriesSettings,
  locale: Locale
): Record<string, string> {
  const base = buildCategoryLabelMap(categories);
  if (locale === 'en') return base;
  const translated = dictionary[locale] as Record<string, string>;
  return Object.fromEntries(
    Object.entries(base).map(([slug, label]) => [
      slug,
      translated[`assistance.${slug}`] ?? translated[`donation.${slug}`] ?? label,
    ])
  );
}

export function DirectoryPdfLinks({ organizations }: DirectoryPdfLinksProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  async function handleGenerate(pdfLocale: Locale) {
    if (pendingLocale) return;
    setPendingLocale(pdfLocale);
    // Opened synchronously so the popup blocker treats it as user-initiated;
    // the URL is filled in once the blob is ready.
    const viewer = window.open('', '_blank');
    try {
      const [{ pdf }, { DirectoryPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/admin/DirectoryPdfDocument'),
      ]);
      const generatedAt = new Date().toLocaleDateString(
        PDF_DATE_LOCALE[pdfLocale],
        { month: 'long', day: 'numeric', year: 'numeric' }
      );
      const blob = await pdf(
        <DirectoryPdfDocument
          title={`${settings.branding.siteName} ${
            pdfLocale === 'es' ? 'Directorio' : 'Directory'
          }`}
          subtitle={settings.branding.siteTagline}
          generatedAt={generatedAt}
          organizations={organizations}
          categoryLabels={buildPdfLabels(settings.categories, pdfLocale)}
          locale={pdfLocale}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const filename = `food-assistance-directory-${pdfLocale}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;

      if (viewer) {
        viewer.location.href = url;
      } else {
        // Popup blocked — fall back to a direct download.
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      }
      // Revoke late so the new tab has time to load the blob.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      viewer?.close();
      console.error('[directory-pdf] generation failed:', error);
      toast.error(t('hero.pdf.error'));
    } finally {
      setPendingLocale(null);
    }
  }

  const linkClass =
    'inline-flex items-center gap-1.5 underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors disabled:opacity-60 disabled:no-underline';

  return (
    <div className="mt-5 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-sm text-white/70">
      <span className="inline-flex items-center gap-1.5">
        <FileDown className="w-4 h-4" />
        {t('hero.pdf.label')}
      </span>
      <button
        type="button"
        onClick={() => handleGenerate('en')}
        disabled={pendingLocale !== null}
        className={linkClass}
      >
        {pendingLocale === 'en' ? t('hero.pdf.generating') : t('hero.pdf.english')}
      </button>
      <span aria-hidden className="text-white/30">
        ·
      </span>
      <button
        type="button"
        onClick={() => handleGenerate('es')}
        disabled={pendingLocale !== null}
        className={linkClass}
      >
        {pendingLocale === 'es' ? t('hero.pdf.generating') : t('hero.pdf.spanish')}
      </button>
    </div>
  );
}
