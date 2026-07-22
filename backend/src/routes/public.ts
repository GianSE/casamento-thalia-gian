import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { uploadImage } from '../lib/cloudinary';

/** Rotas públicas: leitura do conteúdo + envios dos convidados (RSVP, recados, fotos). */
export const publicRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/** Lê uma configuração do banco (usada para os toggles de moderação). */
async function getSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = ?`)
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? null;
}

// ---------- Configurações do site ----------
publicRoutes.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{
    key: string;
    value: string;
  }>();
  const map: Record<string, string> = {};
  for (const row of results) map[row.key] = row.value;
  // O segredo do PIX não é sensível, mas mantemos só o necessário no público.
  return c.json(map);
});

// ---------- Timeline (Nossa Jornada) ----------
publicRoutes.get('/timeline', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, date_label, title, body, image_id, sort_order
       FROM timeline WHERE published = 1 ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

// ---------- Detalhes do grande dia ----------
publicRoutes.get('/events', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, kind, title, subtitle, info, info2, address, map_url, image_id, sort_order
       FROM events WHERE published = 1 ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

// ---------- Presentes ----------
publicRoutes.get('/gifts', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, description, image_id, kind, link_url, cta_label, sort_order
       FROM gifts WHERE published = 1 ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

// ---------- Galeria (fotos aprovadas) ----------
publicRoutes.get('/photos', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, image_id, caption, uploader_name, source, width, height, sort_order, created_at
       FROM photos WHERE status = 'approved'
      ORDER BY sort_order, created_at DESC, id DESC`
  ).all();
  return c.json(results);
});

// ---------- Mural de recados (aprovados) ----------
publicRoutes.get('/messages', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, message, created_at
       FROM messages WHERE status = 'approved' ORDER BY created_at DESC, id DESC`
  ).all();
  return c.json(results);
});

// ============================================================
// Envios dos convidados (escrita pública, sem login)
// ============================================================

// ---------- Confirmar presença (RSVP) ----------
publicRoutes.post('/rsvp', async (c) => {
  type RsvpBody = { name?: string; attending?: boolean; companions?: number; message?: string };
  const b = await c.req.json<RsvpBody>().catch(() => ({}) as RsvpBody);
  const name = (b.name ?? '').trim();
  if (!name) return c.json({ error: 'Informe seu nome' }, 400);

  const attending = b.attending === false ? 0 : 1;
  const companions = Math.max(0, Math.min(20, Number(b.companions) || 0));
  const message = (b.message ?? '').trim().slice(0, 1000) || null;

  await c.env.DB.prepare(
    `INSERT INTO rsvps (name, attending, companions, message) VALUES (?, ?, ?, ?)`
  )
    .bind(name.slice(0, 160), attending, attending ? companions : 0, message)
    .run();

  return c.json({ ok: true }, 201);
});

// ---------- Deixar um recado no mural ----------
publicRoutes.post('/messages', async (c) => {
  const b = await c.req
    .json<{ name?: string; message?: string }>()
    .catch(() => ({}) as { name?: string; message?: string });
  const name = (b.name ?? '').trim();
  const message = (b.message ?? '').trim();
  if (!name || !message) return c.json({ error: 'Preencha nome e mensagem' }, 400);

  const moderate = (await getSetting(c.env, 'moderate_messages')) === '1';
  const status = moderate ? 'pending' : 'approved';

  await c.env.DB.prepare(
    `INSERT INTO messages (name, message, status) VALUES (?, ?, ?)`
  )
    .bind(name.slice(0, 120), message.slice(0, 800), status)
    .run();

  return c.json({ ok: true, status }, 201);
});

// ---------- Enviar foto para a galeria ----------
publicRoutes.post('/photos', async (c) => {
  const form = await c.req.formData();
  const raw = form.getAll('files') as unknown as Array<File | string>;
  const files = raw.filter((f): f is File => typeof f !== 'string').slice(0, 10);
  if (files.length === 0) return c.json({ error: 'Nenhuma foto enviada' }, 400);

  const uploaderName = ((form.get('uploader_name') as string) ?? '').trim().slice(0, 120) || null;

  const moderate = (await getSetting(c.env, 'moderate_photos')) === '1';
  const status = moderate ? 'pending' : 'approved';

  const created: { id: number; image_id: string }[] = [];
  for (const file of files) {
    const { publicId, width, height } = await uploadImage(c.env, file, 'casamento/convidados');
    const res = await c.env.DB.prepare(
      `INSERT INTO photos (image_id, uploader_name, source, status, width, height)
       VALUES (?, ?, 'guest', ?, ?, ?)`
    )
      .bind(publicId, uploaderName, status, width, height)
      .run();
    created.push({ id: res.meta.last_row_id as number, image_id: publicId });
  }

  return c.json({ uploaded: created.length, status }, 201);
});
