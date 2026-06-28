import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

const SiteSettingsContext = createContext(null);

const applyThemeToDocument = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  const mapping = {
    primary: '--color-primary',
    secondary: '--color-secondary',
    accent: '--color-accent',
    background: '--color-background',
    surface: '--color-surface',
    text: '--color-text',
    headerBg: '--color-headerBg',
    headerText: '--color-headerText',
    footerBg: '--color-footerBg',
    footerText: '--color-footerText',
  };
  Object.entries(mapping).forEach(([key, cssVar]) => {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  });
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
      applyThemeToDocument(data.theme);
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Called by the admin panel right after saving, so the new colors apply instantly
  // without waiting for a refetch.
  const applyLocalTheme = (theme) => {
    setSettings((prev) => (prev ? { ...prev, theme: { ...prev.theme, ...theme } } : prev));
    applyThemeToDocument(theme);
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings, applyLocalTheme }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
};
