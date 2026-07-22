import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { SETTINGS_DEFAULTS, type Settings } from '../data/site';

/**
 * Configurações do site (nomes, data, textos, PIX…) vindas de /api/settings,
 * combinadas com os defaults. Carregadas uma vez e disponibilizadas por contexto.
 */
const SettingsContext = createContext<Settings>(SETTINGS_DEFAULTS as Settings);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULTS as Settings);

  useEffect(() => {
    api
      .get<Record<string, string>>('/settings')
      .then((data) => setSettings({ ...SETTINGS_DEFAULTS, ...data } as Settings))
      .catch(() => {
        /* mantém defaults se a API falhar */
      });
  }, []);

  return createElement(SettingsContext.Provider, { value: settings }, children);
}

export function useSettings(): Settings {
  return useContext(SettingsContext);
}
