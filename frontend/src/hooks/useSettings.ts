import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { SETTINGS_DEFAULTS, type Settings } from '../data/site';

/**
 * Configurações do site (nomes, data, textos, PIX…) combinadas com os defaults.
 *
 * Em produção o Worker injeta o JSON no `<head>` (`window.__SETTINGS__`), então
 * o primeiro render já sai com o conteúdo real — sem request nenhum. O fetch só
 * acontece quando a injeção não existe: `npm run dev:frontend` (o HTML vem do
 * Vite, não do Worker) ou falha de banco.
 */
declare global {
  interface Window {
    __SETTINGS__?: Record<string, string>;
  }
}

const INJECTED = typeof window !== 'undefined' ? window.__SETTINGS__ : undefined;

const INITIAL = { ...SETTINGS_DEFAULTS, ...(INJECTED ?? {}) } as Settings;

const SettingsContext = createContext<Settings>(INITIAL);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(INITIAL);

  useEffect(() => {
    if (INJECTED) return; // já veio no HTML

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
