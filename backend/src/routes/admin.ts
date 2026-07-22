import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { uploadImage, deleteImage } from '../lib/cloudinary';
import { hashPassword } from '../lib/crypto';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Tudo aqui exige autenticação.
adminRoutes.use('*', requireAuth);

// ============================================================
// DASHBOARD — contadores para a visão geral
// ============================================================
adminRoutes.get('/stats', async (c) => {
  const q = (sql: string) => c.env.DB.prepare(sql).first<{ n: number }>();
  const [rsvpsYes, rsvpsNo, guestsTotal, pendingPhotos, pendingMessages, photos] =
    await Promise.all([
      q(`SELECT COUNT(*) AS n FROM rsvps WHERE attending = 1`),
      q(`SELECT COUNT(*) AS n FROM rsvps WHERE attending = 0`),
      q(`SELECT COALESCE(SUM(1 + companions), 0) AS n FROM rsvps WHERE attending = 1`),
      q(`SELECT COUNT(*) AS n FROM photos WHERE status = 'pending'`),
      q(`SELECT COUNT(*) AS n FROM messages WHERE status = 'pending'`),
      q(`SELECT COUNT(*) AS n FROM photos WHERE status = 'approved'`),
    ]);
  return c.json({
    rsvps_yes: rsvpsYes?.n ?? 0,
    rsvps_no: rsvpsNo?.n ?? 0,
    guests_total: guestsTotal?.n ?? 0,
    pending_photos: pendingPhotos?.n ?? 0,
    pending_messages: pendingMessages?.n ?? 0,
    photos: photos?.n ?? 0,
  });
});

// ============================================================
// UPLOAD avulso (capa de timeline / evento / presente) → Cloudinary
// ============================================================
adminRoutes.post('/upload', async (c) => {
  const form = await c.req.formData();
  const raw = form.get('file') as unknown as File | string | null;
  if (!raw || typeof raw === 'string') {
    return c.json({ error: 'Nenhum arquivo enviado' }, 400);
  }
  const { publicId } = await uploadImage(c.env, raw, 'casamento/covers');
  return c.json({ cover_id: publicId }, 201);
});

// ============================================================
// TIMELINE (Nossa Jornada)
// ============================================================
adminRoutes.get('/timeline', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM timeline ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

interface TimelineInput {
  date_label?: string;
  title?: string;
  body?: string;
  image_id?: string;
  sort_order?: number;
  published?: boolean;
}

adminRoutes.post('/timeline', async (c) => {
  const b = await c.req.json<TimelineInput>().catch(() => ({}) as TimelineInput);
  if (!b.title) return c.json({ error: 'Título é obrigatório' }, 400);
  const last = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM timeline`
  ).first<{ max: number }>();
  const res = await c.env.DB.prepare(
    `INSERT INTO timeline (date_label, title, body, image_id, sort_order, published)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      b.date_label ?? null,
      b.title,
      b.body ?? null,
      b.image_id ?? null,
      b.sort_order ?? (last?.max ?? 0) + 1,
      b.published === false ? 0 : 1
    )
    .run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

adminRoutes.put('/timeline/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<TimelineInput>().catch(() => ({}) as TimelineInput);
  await c.env.DB.prepare(
    `UPDATE timeline SET
       date_label = ?,
       title = COALESCE(?, title),
       body = ?,
       image_id = ?,
       sort_order = COALESCE(?, sort_order),
       published = COALESCE(?, published)
     WHERE id = ?`
  )
    .bind(
      b.date_label ?? null,
      b.title ?? null,
      b.body ?? null,
      b.image_id ?? null,
      b.sort_order ?? null,
      b.published === undefined ? null : b.published ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/timeline/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT image_id FROM timeline WHERE id = ?`)
    .bind(id)
    .first<{ image_id: string | null }>();
  if (row?.image_id) await deleteImage(c.env, row.image_id);
  await c.env.DB.prepare(`DELETE FROM timeline WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// ============================================================
// EVENTS (detalhes do grande dia / local / viagem)
// ============================================================
adminRoutes.get('/events', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM events ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

interface EventInput {
  kind?: string;
  title?: string;
  subtitle?: string;
  info?: string;
  info2?: string;
  address?: string;
  map_url?: string;
  image_id?: string;
  sort_order?: number;
  published?: boolean;
}

const EVENT_KINDS = ['cerimonia', 'recepcao', 'local', 'viagem', 'detalhe'];
const normKind = (k?: string) => (k && EVENT_KINDS.includes(k) ? k : 'detalhe');

adminRoutes.post('/events', async (c) => {
  const b = await c.req.json<EventInput>().catch(() => ({}) as EventInput);
  if (!b.title) return c.json({ error: 'Título é obrigatório' }, 400);
  const last = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM events`
  ).first<{ max: number }>();
  const res = await c.env.DB.prepare(
    `INSERT INTO events (kind, title, subtitle, info, info2, address, map_url, image_id, sort_order, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      normKind(b.kind),
      b.title,
      b.subtitle ?? null,
      b.info ?? null,
      b.info2 ?? null,
      b.address ?? null,
      b.map_url ?? null,
      b.image_id ?? null,
      b.sort_order ?? (last?.max ?? 0) + 1,
      b.published === false ? 0 : 1
    )
    .run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

adminRoutes.put('/events/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<EventInput>().catch(() => ({}) as EventInput);
  await c.env.DB.prepare(
    `UPDATE events SET
       kind = COALESCE(?, kind),
       title = COALESCE(?, title),
       subtitle = ?,
       info = ?,
       info2 = ?,
       address = ?,
       map_url = ?,
       image_id = ?,
       sort_order = COALESCE(?, sort_order),
       published = COALESCE(?, published)
     WHERE id = ?`
  )
    .bind(
      b.kind ? normKind(b.kind) : null,
      b.title ?? null,
      b.subtitle ?? null,
      b.info ?? null,
      b.info2 ?? null,
      b.address ?? null,
      b.map_url ?? null,
      b.image_id ?? null,
      b.sort_order ?? null,
      b.published === undefined ? null : b.published ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/events/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT image_id FROM events WHERE id = ?`)
    .bind(id)
    .first<{ image_id: string | null }>();
  if (row?.image_id) await deleteImage(c.env, row.image_id);
  await c.env.DB.prepare(`DELETE FROM events WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// ============================================================
// GIFTS (presentes)
// ============================================================
adminRoutes.get('/gifts', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM gifts ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

interface GiftInput {
  title?: string;
  description?: string;
  image_id?: string;
  kind?: string;
  link_url?: string;
  cta_label?: string;
  sort_order?: number;
  published?: boolean;
}

const normGiftKind = (k?: string) => (k === 'pix' ? 'pix' : 'link');

adminRoutes.post('/gifts', async (c) => {
  const b = await c.req.json<GiftInput>().catch(() => ({}) as GiftInput);
  if (!b.title) return c.json({ error: 'Título é obrigatório' }, 400);
  const last = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM gifts`
  ).first<{ max: number }>();
  const res = await c.env.DB.prepare(
    `INSERT INTO gifts (title, description, image_id, kind, link_url, cta_label, sort_order, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      b.title,
      b.description ?? null,
      b.image_id ?? null,
      normGiftKind(b.kind),
      b.link_url ?? null,
      b.cta_label ?? null,
      b.sort_order ?? (last?.max ?? 0) + 1,
      b.published === false ? 0 : 1
    )
    .run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

adminRoutes.put('/gifts/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<GiftInput>().catch(() => ({}) as GiftInput);
  await c.env.DB.prepare(
    `UPDATE gifts SET
       title = COALESCE(?, title),
       description = ?,
       image_id = ?,
       kind = COALESCE(?, kind),
       link_url = ?,
       cta_label = ?,
       sort_order = COALESCE(?, sort_order),
       published = COALESCE(?, published)
     WHERE id = ?`
  )
    .bind(
      b.title ?? null,
      b.description ?? null,
      b.image_id ?? null,
      b.kind ? normGiftKind(b.kind) : null,
      b.link_url ?? null,
      b.cta_label ?? null,
      b.sort_order ?? null,
      b.published === undefined ? null : b.published ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/gifts/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT image_id FROM gifts WHERE id = ?`)
    .bind(id)
    .first<{ image_id: string | null }>();
  if (row?.image_id) await deleteImage(c.env, row.image_id);
  await c.env.DB.prepare(`DELETE FROM gifts WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// ============================================================
// MESSAGES (mural de recados — moderação)
// ============================================================
adminRoutes.get('/messages', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM messages ORDER BY (status = 'pending') DESC, created_at DESC, id DESC`
  ).all();
  return c.json(results);
});

adminRoutes.put('/messages/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ status?: string }>().catch(() => ({}) as { status?: string });
  const status = b.status === 'approved' ? 'approved' : 'pending';
  await c.env.DB.prepare(`UPDATE messages SET status = ? WHERE id = ?`).bind(status, id).run();
  return c.json({ ok: true });
});

adminRoutes.delete('/messages/:id', async (c) => {
  await c.env.DB.prepare(`DELETE FROM messages WHERE id = ?`).bind(c.req.param('id')).run();
  return c.body(null, 204);
});

// ============================================================
// PHOTOS (galeria — curadoria dos noivos + moderação de convidados)
// ============================================================
adminRoutes.get('/photos', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM photos ORDER BY (status = 'pending') DESC, sort_order, created_at DESC, id DESC`
  ).all();
  return c.json(results);
});

// Upload de fotos dos noivos (entram já aprovadas, source = 'curated').
adminRoutes.post('/photos', async (c) => {
  const form = await c.req.formData();
  const raw = form.getAll('files') as unknown as Array<File | string>;
  const files = raw.filter((f): f is File => typeof f !== 'string');
  if (files.length === 0) return c.json({ error: 'Nenhum arquivo enviado' }, 400);

  const last = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM photos`
  ).first<{ max: number }>();
  let order = (last?.max ?? 0) + 1;

  const created: { id: number; image_id: string }[] = [];
  for (const file of files) {
    const { publicId, width, height } = await uploadImage(c.env, file, 'casamento/galeria');
    const res = await c.env.DB.prepare(
      `INSERT INTO photos (image_id, source, status, width, height, sort_order)
       VALUES (?, 'curated', 'approved', ?, ?, ?)`
    )
      .bind(publicId, width, height, order++)
      .run();
    created.push({ id: res.meta.last_row_id as number, image_id: publicId });
  }
  return c.json({ uploaded: created.length, photos: created }, 201);
});

// Aprovar / reprovar / editar legenda de uma foto.
adminRoutes.put('/photos/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req
    .json<{ status?: string; caption?: string }>()
    .catch(() => ({}) as { status?: string; caption?: string });
  await c.env.DB.prepare(
    `UPDATE photos SET
       status = COALESCE(?, status),
       caption = COALESCE(?, caption)
     WHERE id = ?`
  )
    .bind(
      b.status === 'approved' || b.status === 'pending' ? b.status : null,
      b.caption ?? null,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/photos/:id', async (c) => {
  const id = c.req.param('id');
  const photo = await c.env.DB.prepare(`SELECT image_id FROM photos WHERE id = ?`)
    .bind(id)
    .first<{ image_id: string }>();
  if (photo) await deleteImage(c.env, photo.image_id);
  await c.env.DB.prepare(`DELETE FROM photos WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// Reordenar fotos: recebe { order: number[] } com IDs na nova sequência.
adminRoutes.put('/photos/order', async (c) => {
  const b = await c.req.json<{ order?: number[] }>().catch(() => ({}) as { order?: number[] });
  if (!Array.isArray(b.order)) return c.json({ error: 'order inválido' }, 400);
  const stmt = c.env.DB.prepare(`UPDATE photos SET sort_order = ? WHERE id = ?`);
  await c.env.DB.batch(b.order.map((photoId, i) => stmt.bind(i + 1, photoId)));
  return c.json({ ok: true });
});

// ============================================================
// RSVPS (confirmações — lista + exclusão)
// ============================================================
adminRoutes.get('/rsvps', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM rsvps ORDER BY created_at DESC, id DESC`
  ).all();
  return c.json(results);
});

adminRoutes.delete('/rsvps/:id', async (c) => {
  await c.env.DB.prepare(`DELETE FROM rsvps WHERE id = ?`).bind(c.req.param('id')).run();
  return c.body(null, 204);
});

// ============================================================
// SETTINGS
// ============================================================
adminRoutes.put('/settings', async (c) => {
  const b = await c.req.json<Record<string, string>>().catch(() => ({}));
  const stmt = c.env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  );
  const entries = Object.entries(b);
  if (entries.length) {
    await c.env.DB.batch(entries.map(([k, v]) => stmt.bind(k, String(v))));
  }
  return c.json({ ok: true });
});

// ============================================================
// ADMIN USERS — gerenciamento de contas do painel
// ============================================================

// Conta principal (dono do projeto) — nunca pode ser removida do painel.
const PRIMARY_ADMIN_EMAIL = 'gianpedrodev@gmail.com';

adminRoutes.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, email, name, created_at FROM admin_users ORDER BY created_at`
  ).all<{ email: string }>();
  const withFlag = results.map((u) => ({
    ...u,
    is_primary: u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL,
  }));
  return c.json(withFlag);
});

interface UserInput {
  email?: string;
  name?: string;
  password?: string;
}

adminRoutes.post('/users', async (c) => {
  const b = await c.req.json<UserInput>().catch(() => ({}) as UserInput);
  const email = (b.email ?? '').trim().toLowerCase();
  const name = (b.name ?? '').trim();
  const password = b.password ?? '';

  if (!email || !name || !password) {
    return c.json({ error: 'E-mail, nome e senha são obrigatórios' }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: 'A senha deve ter pelo menos 8 caracteres' }, 400);
  }

  const existing = await c.env.DB.prepare(`SELECT 1 FROM admin_users WHERE email = ?`)
    .bind(email)
    .first();
  if (existing) return c.json({ error: 'Já existe uma conta com este e-mail' }, 409);

  const password_hash = await hashPassword(password);
  const res = await c.env.DB.prepare(
    `INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)`
  )
    .bind(email, name, password_hash)
    .run();

  return c.json({ id: res.meta.last_row_id, email, name }, 201);
});

adminRoutes.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  const target = await c.env.DB.prepare(`SELECT email FROM admin_users WHERE id = ?`)
    .bind(id)
    .first<{ email: string }>();
  if (!target) return c.json({ error: 'Não encontrado' }, 404);

  if (target.email.toLowerCase() === PRIMARY_ADMIN_EMAIL) {
    return c.json({ error: 'Esta é a conta principal e não pode ser removida' }, 400);
  }
  if (Number(id) === user.sub) {
    return c.json({ error: 'Você não pode excluir sua própria conta' }, 400);
  }
  const { results } = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM admin_users`).all<{
    n: number;
  }>();
  if ((results[0]?.n ?? 0) <= 1) {
    return c.json({ error: 'Deve existir ao menos um administrador' }, 400);
  }

  await c.env.DB.prepare(`DELETE FROM admin_users WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});
