import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from './types';
import { publicRoutes } from './routes/public';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';
import { cachedJson } from './lib/cache';

/**
 * Worker do casamento Gian & Thalia.
 *  - API REST sob /api/* (Hono)
 *  - O frontend estático (SPA) é servido pelo binding [assets].
 *    Requests que não casam com /api/* e não são arquivos caem no index.html
 *    (not_found_handling = single-page-application).
 */
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'casamento-thalia-gian', env: c.env.APP_ENV ?? 'unknown' })
);

app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api', publicRoutes);

// Rotas de API inexistentes → 404 JSON (não devolve HTML).
app.all('/api/*', (c) => c.json({ error: 'Rota não encontrada' }, 404));

/**
 * Injeta as configurações do site no HTML entregue ao navegador.
 *
 * Sem isto o carregamento é uma cascata: HTML → bundle JS → React monta →
 * `fetch('/api/settings')` → só então os nomes, a data e os textos aparecem.
 * Com o JSON já dentro do documento, o primeiro render sai com o conteúdo
 * certo e uma ida ao servidor some do caminho crítico.
 *
 * O HTMLRewriter transforma em streaming (não bufferiza a página) e o mapa de
 * settings fica memoizado na borda, então o custo extra é praticamente zero.
 */
function loadSettingsMap(c: Context<{ Bindings: Env; Variables: Variables }>) {
  return cachedJson(c, 'settings-map', 60, async () => {
    const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{
      key: string;
      value: string;
    }>();
    const map: Record<string, string> = {};
    for (const row of results) map[row.key] = row.value;
    return map;
  });
}

// SPA fallback: qualquer outra rota (ex.: /admin, /galeria) entrega o index.html
// para o React Router assumir no cliente. Sem isso, o acesso direto dá 404.
app.all('*', async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);

  if (!res.headers.get('content-type')?.includes('text/html')) {
    // O servidor de assets devolve `max-age=0, must-revalidate` por padrão, o
    // que faz o convidado revalidar cada arquivo a cada visita. Os bundles têm
    // hash no nome (o conteúdo nunca muda sob o mesmo caminho), então podem
    // ficar imutáveis; as fontes, sem hash, levam um cache generoso mas finito.
    const path = new URL(c.req.url).pathname;
    const maxAge = path.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : path.startsWith('/fonts/')
        ? 'public, max-age=2592000'
        : null;

    if (!maxAge) return res;

    const asset = new Response(res.body, res);
    asset.headers.set('Cache-Control', maxAge);
    return asset;
  }

  // Carrega antes de tocar no corpo: se o banco falhar, entrega o HTML intacto
  // e o frontend busca /api/settings como antes.
  const settings = await loadSettingsMap(c).catch(() => null);
  if (!settings) return res;

  // Escapar "<" impede que um valor com "</script>" quebre o bloco.
  const json = JSON.stringify(settings).replace(/</g, '\\u003c');

  // Cópia com headers mutáveis: o HTML agora é dinâmico, então revalida sempre
  // (os assets com hash no nome mantêm o cache longo do binding).
  const html = new Response(res.body, res);
  html.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

  return new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(`<script>window.__SETTINGS__=${json}</script>`, { html: true });
      },
    })
    .transform(html);
});

// Erros não tratados → JSON consistente.
app.onError((err, c) => {
  console.error('Erro não tratado:', err);
  return c.json({ error: 'Erro interno do servidor' }, 500);
});

export default app;
