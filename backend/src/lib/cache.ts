/**
 * Cache de borda (Cache API do Cloudflare) para as leituras públicas.
 *
 * Por que isso importa: uma resposta gerada por Worker NÃO é cacheada
 * automaticamente pela Cloudflare — sem isto, todo visitante executa a query no
 * D1. Guardando a resposta em `caches.default`, o PoP mais próximo do convidado
 * devolve o JSON em poucos milissegundos sem tocar no banco.
 *
 * Invalidação: o painel lê tudo por `/api/admin/*` (nunca cacheado), então o
 * cache só afeta o site público e um TTL curto já resolve sozinho. Escritas de
 * convidado (recado/foto) são refeitas com `?_=timestamp` no cliente, que muda
 * a chave e sempre traz o dado novo.
 */

import type { Context, MiddlewareHandler } from 'hono';
import type { Env, Variables } from '../types';

type Ctx = Context<{ Bindings: Env; Variables: Variables }>;

interface CacheOptions {
  /** Segundos de cache no navegador. Use 0 para revalidar sempre. */
  browser: number;
  /** Segundos de cache na borda da Cloudflare. */
  edge: number;
  /** Janela em que a borda pode servir o conteúdo velho enquanto revalida. */
  swr?: number;
}

/**
 * Validade gravada na própria entrada.
 *
 * A Cache API da Cloudflare expira pelo `Cache-Control`, mas a emulação local
 * (Miniflare) devolve entradas vencidas — o que faz o conteúdo parecer
 * "grudado" em dev. Com o carimbo explícito o comportamento é o mesmo nos dois
 * ambientes, e uma entrada sem carimbo (formato antigo) conta como vencida.
 */
const EXPIRES_HEADER = 'X-Cache-Expires';

function expired(res: Response): boolean {
  const at = Number(res.headers.get(EXPIRES_HEADER));
  return !at || Date.now() > at;
}

export function edgeCache(
  opts: CacheOptions
): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  const header =
    `public, max-age=${opts.browser}, s-maxage=${opts.edge}, ` +
    `stale-while-revalidate=${opts.swr ?? 86400}`;

  return async (c, next) => {
    if (c.req.method !== 'GET') return next();

    const cache = caches.default;
    const key = new Request(c.req.url, { method: 'GET' });

    const hit = await cache.match(key).catch(() => undefined);
    if (hit && !expired(hit)) {
      const res = new Response(hit.body, hit);
      res.headers.set('X-Cache', 'HIT');
      return res;
    }

    await next();

    if (c.res.status !== 200) return;
    c.res.headers.set('Cache-Control', header);
    c.res.headers.set(EXPIRES_HEADER, String(Date.now() + opts.edge * 1000));
    c.res.headers.set('X-Cache', 'MISS');

    // Guarda em background: não atrasa a resposta do convidado.
    try {
      c.executionCtx.waitUntil(cache.put(key, c.res.clone()));
    } catch {
      /* fora do runtime da Cloudflare (dev local) — segue sem cachear */
    }
  };
}

/**
 * Memoiza na borda o resultado de uma consulta ao D1 (usado para as settings
 * injetadas no HTML). A chave é sintética — não corresponde a nenhuma rota.
 */
export async function cachedJson<T>(
  c: Ctx,
  name: string,
  ttlSeconds: number,
  load: () => Promise<T>
): Promise<T> {
  const cache = caches.default;
  const key = new Request(`https://cache.internal/${name}`, { method: 'GET' });

  const hit = await cache.match(key).catch(() => undefined);
  if (hit && !expired(hit)) return (await hit.json()) as T;

  const data = await load();
  const stored = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttlSeconds}`,
      [EXPIRES_HEADER]: String(Date.now() + ttlSeconds * 1000),
    },
  });

  try {
    c.executionCtx.waitUntil(cache.put(key, stored));
  } catch {
    /* dev local */
  }

  return data;
}
