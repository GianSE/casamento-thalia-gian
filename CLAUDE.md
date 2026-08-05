# CLAUDE.md — Site de Casamento Gian & Thalia

Contexto para o Claude Code trabalhar neste projeto. Leia antes de editar.

## O que é

Site do casamento de **Gian & Thalia**, com site público + painel administrativo para
os noivos gerenciarem **história, detalhes, presentes, RSVP, recados e fotos** sem mexer
em código. Roda 100% grátis: **Cloudflare** (Workers + D1) + **Cloudinary** (fotos) — sem cartão.

Design "Ethereal Union": editorial moderno + glassmorphism sutil, paleta azul (navy →
azul céu), títulos em **Playfair Display**, corpo em **Inter**. Os designs de referência
(desktop + mobile) estão em `site-stitch/`.

## Stack e arquitetura

Monorepo com **npm workspaces** (`frontend` + `backend`).

- **frontend/** — React 18 + Vite 6 + TypeScript + React Router + Framer Motion + CSS Modules.
  Site público (SPA) e painel em `/admin`. Navegação: navbar no desktop, **barra inferior
  (tab bar) no mobile**.
- **backend/** — Hono no Cloudflare Workers. **D1** (SQLite) para dados, **Cloudinary**
  para as fotos (upload/exclusão assinados, `backend/src/lib/cloudinary.ts`).
  Autenticação por sessão (JWT HS256 em cookie httpOnly, senha PBKDF2 via Web Crypto).

**Deploy unificado, sem CORS:** o Worker serve a API em `/api/*` **e** os assets estáticos
de `frontend/dist` (binding `[assets]` com `not_found_handling = "single-page-application"`).
Em dev, o Vite (5173) faz proxy de `/api` → Worker (8787).

## Comandos

Rodar da **raiz** (`casamento-thalia-gian/`):

```bash
npm install                 # instala frontend + backend (workspaces)
npm run dev:backend         # Worker local (D1 simulado) em :8787
npm run dev:frontend        # Vite em :5173 (proxy /api → :8787)
npm run build               # build do frontend → frontend/dist
npm run migrate:local       # aplica migrações no D1 local
npm run migrate:remote      # aplica migrações no D1 remoto (produção)
npm run create-admin -- "email" "Nome" "senha"   # gera SQL do admin
npm run deploy              # build + wrangler deploy (precisa login + setup)
```

Para dev local, crie `.dev.vars` na raiz (veja `.dev.vars.example`):
```
JWT_SECRET=algum-segredo-de-dev
APP_ENV=development
CLOUDINARY_API_SECRET=seu-cloudinary-api-secret
```

## Estrutura de dados (D1) — ver `backend/migrations/`

- `admin_users` — noivos/administradores (senha PBKDF2)
- `settings` — chave/valor: nomes, data, textos, PIX, redes e **toggles de moderação**
  (`moderate_photos`, `moderate_messages`)
- `timeline` — "Nossa Jornada" (como se conheceram, pedido…)
- `events` — cartões "O Grande Dia" (Quando, Onde, Viagem…) por `kind`
- `gifts` — presentes: `kind` = `pix` (cota da lua de mel) | `link` (lista externa)
- `messages` — mural de recados (moderação por `status`)
- `rsvps` — confirmações de presença (nome, vai/não vai, acompanhantes, mensagem)
- `photos` — galeria; `source` = `curated` (dos noivos) | `guest` (convidados),
  `status` = `approved` | `pending` (moderação)

## API (Hono) — ver `backend/src/routes/`

- **Público (GET):** `/api/settings`, `/api/timeline`, `/api/events`, `/api/gifts`,
  `/api/photos`, `/api/messages`
- **Público (POST, sem login):** `/api/rsvp`, `/api/messages` (recado),
  `/api/photos` (upload de convidado) — os dois últimos respeitam os toggles de moderação
- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Admin (protegido, `requireAuth`):** `/api/admin/stats`, CRUD de `timeline`, `events`,
  `gifts`, moderação de `messages`/`photos`, `rsvps` (listar/excluir), `PUT /settings`,
  `users`, `POST /upload` (imagem avulsa)

## Conteúdo: tudo editável no /admin

Diferente de um site estático, aqui **todo o conteúdo** (história, detalhes, presentes,
textos das seções, PIX, contato) é editável pelo painel. Os defaults ficam em
`frontend/src/data/site.ts` (`SETTINGS_DEFAULTS`) e no seed `backend/migrations/0002_seed.sql`.

## Moderação (decisão do projeto)

Os noivos ligam/desligam a moderação de **fotos** e **recados** independentemente, em
`/admin/configuracoes`. Ligado → envio entra como `pending` e só aparece após aprovação.
Desligado → aparece na hora. Lógica no backend (`routes/public.ts`, `getSetting`).

## Convenções

- Upload de fotos é **comprimido no navegador** antes de subir
  (`frontend/src/lib/imageCompress.ts`) — máx. 1920px, JPEG 0.82.
- O Cloudinary entrega com `f_auto,q_auto`; `imgUrl(publicId, width?)` monta a URL
  (`frontend/src/lib/api.ts`). Cloud name em `frontend/src/data/site.ts`.
- Público **não** faz login; só o admin. RSVP e recados são abertos.
- Respeitar `prefers-reduced-motion` e acessibilidade: contraste, foco visível.

## Deploy no Cloudflare

Ver **DEPLOY.md**. Resumo: após o setup único (criar D1, conta Cloudinary, `database_id`
no `wrangler.toml` (raiz), `cloud_name`/`api_key` nas vars e em `frontend/src/data/site.ts`,
secrets `JWT_SECRET` + `CLOUDINARY_API_SECRET`, admin inicial), conectar o repositório no
**Cloudflare → Workers & Pages → Workers Builds** com:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

Cada `git push` na branch principal dispara build + deploy. Mudanças de schema exigem
`npm run migrate:remote` manual.
