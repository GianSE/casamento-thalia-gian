-- ============================================================
-- Schema inicial — Casamento Gian & Thalia
-- ============================================================

-- Administradores do painel (os noivos)
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Configurações do site (chave/valor): nomes, data, local, PIX, redes,
-- e os toggles de moderação. Ver defaults em 0002_seed.sql.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Timeline "Nossa Jornada" (como se conheceram, primeiro encontro, pedido…)
CREATE TABLE IF NOT EXISTS timeline (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date_label TEXT,                       -- ex.: "Outubro 2018"
  title      TEXT NOT NULL,              -- ex.: "Como nos conhecemos"
  body       TEXT,
  image_id   TEXT,                       -- public_id no Cloudinary
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_timeline_order ON timeline (sort_order, id);

-- "O Grande Dia" / Local / Viagem — cartões de detalhes do evento
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL DEFAULT 'detalhe', -- 'cerimonia' | 'recepcao' | 'local' | 'viagem' | 'detalhe'
  title       TEXT NOT NULL,             -- ex.: "Quando", "Onde"
  subtitle    TEXT,                      -- ex.: "Villa Balbiano"
  info        TEXT,                      -- ex.: "Sábado, 14 de Setembro de 2025"
  info2       TEXT,                      -- linha extra (ex.: "Cerimônia às 16h")
  address     TEXT,
  map_url     TEXT,                      -- link do Google Maps
  image_id    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_events_order ON events (sort_order, id);

-- Lista de presentes: cota de lua de mel (PIX) e links externos
CREATE TABLE IF NOT EXISTS gifts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  image_id    TEXT,
  kind        TEXT NOT NULL DEFAULT 'link' CHECK (kind IN ('pix', 'link')),
  link_url    TEXT,                      -- usado quando kind = 'link'
  cta_label   TEXT,                      -- ex.: "Ver lista", "Contribuir"
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_gifts_order ON gifts (sort_order, id);

-- Mural de mensagens (recados dos convidados)
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages (status, created_at);

-- Confirmações de presença (RSVP)
CREATE TABLE IF NOT EXISTS rsvps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  attending  INTEGER NOT NULL DEFAULT 1, -- 1 = vai, 0 = não vai
  companions INTEGER NOT NULL DEFAULT 0, -- nº de acompanhantes
  message    TEXT,                       -- restrição alimentar / recado
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rsvps_created ON rsvps (created_at);

-- Galeria "Compartilhe Memórias".
-- source = 'curated' (fotos dos noivos, sempre visíveis)
--        | 'guest'   (enviadas por convidados, passam por moderação opcional)
CREATE TABLE IF NOT EXISTS photos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  image_id      TEXT NOT NULL,           -- public_id no Cloudinary
  caption       TEXT,
  uploader_name TEXT,                    -- nome de quem enviou (convidado)
  source        TEXT NOT NULL DEFAULT 'curated' CHECK (source IN ('curated', 'guest')),
  status        TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  width         INTEGER,
  height        INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_photos_gallery ON photos (status, source, sort_order);
