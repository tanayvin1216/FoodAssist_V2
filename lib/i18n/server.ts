import { cookies } from 'next/headers';
import { dictionary, translate, type Locale, type MessageKey, LOCALES } from './dictionary';

export const LOCALE_COOKIE = 'fa_locale';

/**
 * Reads the locale cookie on the server. Defaults to 'en' when the
 * cookie is missing or holds an unrecognized value.
 */
export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  if (raw && (LOCALES as string[]).includes(raw)) {
    return raw as Locale;
  }
  return 'en';
}

/**
 * Returns a bound translator for the current request. Use this from
 * Server Components to avoid threading `locale` through every call.
 */
export async function getServerTranslator(): Promise<{
  locale: Locale;
  t: (key: MessageKey) => string;
}> {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key) => translate(key, locale),
  };
}

export { dictionary, translate };
