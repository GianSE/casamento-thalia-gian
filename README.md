# 💍 Gian & Thalia — Site de Casamento

Site do casamento com site público + painel dos noivos, rodando 100% grátis na
**Cloudflare** (Workers + D1) com fotos no **Cloudinary**.

- 🎨 Design "Ethereal Union" (Playfair Display + Inter, paleta azul, glassmorphism)
- 📱 Responsivo: navbar no desktop, barra de navegação inferior no mobile
- ✅ **RSVP** aberto (confirmação de presença) com exportação CSV
- 🎁 **Presentes**: cota da lua de mel via **PIX** (copiar chave) + links externos
- 📸 **Galeria**: convidados enviam fotos (com moderação opcional)
- 💌 **Mural de recados** (com moderação opcional)
- 🛠️ Painel `/admin`: os noivos editam **tudo** (história, detalhes, presentes, textos, contato)

## Início rápido

```bash
npm install
cp .dev.vars.example .dev.vars   # edite
npm run migrate:local
npm run dev:backend     # terminal 1  → :8787
npm run dev:frontend    # terminal 2  → :5173
```

Site em http://localhost:5173 · Painel em http://localhost:5173/admin

## Estrutura

```
frontend/   React + Vite (site público + /admin)
backend/    Worker Hono (API /api/*) + D1 + Cloudinary
site-stitch/  designs de referência (desktop + mobile)
```

Detalhes de arquitetura em [CLAUDE.md](CLAUDE.md) · Deploy em [DEPLOY.md](DEPLOY.md).

## Antes de publicar

Preencha o Cloudinary (`wrangler.toml` + `frontend/src/data/site.ts`), crie o D1,
os secrets e o admin — passo a passo em **[DEPLOY.md](DEPLOY.md)**. Depois, entre em `/admin`
→ **Configurações** para definir data do casamento, chave PIX, textos e moderação.
