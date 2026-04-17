'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  dictionary,
  translate,
  LOCALES,
  type Locale,
  type MessageKey,
} from '@/lib/i18n/dictionary';

const LOCALE_COOKIE = 'fa_locale';
const LOCAL_STORAGE_KEY = 'fa_locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persistLocale(next: Locale) {
  if (typeof document === 'undefined') return;
  // 1 year, site-wide, available to server via cookies()
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, next);
  } catch {
    // localStorage unavailable (private window etc.) — cookie is enough
  }
}

function readInitialLocale(initial: Locale): Locale {
  if (typeof document === 'undefined') return initial;
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && (LOCALES as string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
  }
  return initial;
}

export function LocaleProvider({
  initialLocale = 'en',
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // On hydration, reconcile with localStorage in case the stored
  // preference disagrees with the server-rendered cookie value.
  useEffect(() => {
    const resolved = readInitialLocale(initialLocale);
    if (resolved !== locale) {
      setLocaleState(resolved);
      persistLocale(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => translate(key, locale),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Defensive fallback: if a consumer renders outside the provider
    // we return a safe no-op translator rather than throwing.
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key) => dictionary.en[key] ?? (key as string),
    };
  }
  return ctx;
}
