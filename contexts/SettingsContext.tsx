'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { SiteSettings } from '@/types/settings';
import { defaultSettings } from '@/config/default-settings';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  updateBranding: (branding: Partial<SiteSettings['branding']>) => void;
  updateContact: (contact: Partial<SiteSettings['contact']>) => void;
  updateHero: (hero: Partial<SiteSettings['hero']>) => void;
  updateEmergency: (emergency: Partial<SiteSettings['emergency']>) => void;
  updateNavigation: (navigation: Partial<SiteSettings['navigation']>) => void;
  /** Re-fetch settings from the API. Used after a successful admin save. */
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings ?? defaultSettings
  );

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (!res.ok) return; // keep current state on non-200
      const json = (await res.json()) as { ok: boolean; settings: SiteSettings };
      if (json.ok && json.settings) {
        setSettings(json.settings);
      }
    } catch {
      // Network failure — keep in-code defaults, do not crash
    }
  }, []);

  // Hydrate from DB on mount.
  // initialSettings (SSR-injected) skips the fetch to avoid a redundant round-trip.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialSettings) {
      void fetchSettings();
    }
    // fetchSettings is stable (useCallback with no deps); omitted from array intentionally
    // to run only once on mount.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateBranding = (branding: Partial<SiteSettings['branding']>) => {
    setSettings((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...branding },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateContact = (contact: Partial<SiteSettings['contact']>) => {
    setSettings((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...contact },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateHero = (hero: Partial<SiteSettings['hero']>) => {
    setSettings((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...hero },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateEmergency = (emergency: Partial<SiteSettings['emergency']>) => {
    setSettings((prev) => ({
      ...prev,
      emergency: { ...prev.emergency, ...emergency },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateNavigation = (
    navigation: Partial<SiteSettings['navigation']>
  ) => {
    setSettings((prev) => ({
      ...prev,
      navigation: { ...prev.navigation, ...navigation },
      lastUpdated: new Date().toISOString(),
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateBranding,
        updateContact,
        updateHero,
        updateEmergency,
        updateNavigation,
        refresh: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Convenience hooks for specific settings sections
export function useBranding() {
  const { settings, updateBranding } = useSettings();
  return { branding: settings.branding, updateBranding };
}

export function useContact() {
  const { settings, updateContact } = useSettings();
  return { contact: settings.contact, updateContact };
}

export function useHeroSettings() {
  const { settings, updateHero } = useSettings();
  return { hero: settings.hero, updateHero };
}

export function useEmergencySettings() {
  const { settings, updateEmergency } = useSettings();
  return { emergency: settings.emergency, updateEmergency };
}

export function useNavigation() {
  const { settings, updateNavigation } = useSettings();
  return { navigation: settings.navigation, updateNavigation };
}
