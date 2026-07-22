import { useEffect } from 'react';

interface SeoOptions {
  title?: string;
  description?: string;
}

const BASE_TITLE = 'Gian & Thalia';

/** Atualiza <title> e meta description sem dependências externas. */
export function useSeo({ title, description }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BASE_TITLE}` : `${BASE_TITLE} — Nosso Casamento`;
    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
