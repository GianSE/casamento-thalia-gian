# Deploy — Casamento Gian & Thalia (Cloudflare + Cloudinary)

Tudo no plano **grátis, sem cartão**. Faça o setup uma vez; depois cada `git push` publica.

## 1. Cloudinary (fotos)

1. Crie uma conta grátis em https://cloudinary.com (sem cartão).
2. No **Dashboard**, copie: **Cloud name**, **API Key** e **API Secret**.
3. Preencha:
   - `backend/wrangler.toml` → `CLOUDINARY_CLOUD_NAME` e `CLOUDINARY_API_KEY`
   - `frontend/src/data/site.ts` → `CLOUDINARY_CLOUD` (o mesmo cloud name)
   - O **API Secret** entra como secret (passo 4), **nunca** no código.

## 2. Cloudflare + D1 (banco)

```bash
npm install
npx wrangler login

# cria o banco e copia o database_id retornado
npx wrangler d1 create casamento-db
```

Cole o `database_id` em `backend/wrangler.toml` (campo `database_id`).

Aplique o schema no banco remoto:

```bash
npm run migrate:remote
```

## 3. Secrets do Worker

```bash
cd backend
npx wrangler secret put JWT_SECRET            # uma frase secreta longa e aleatória
npx wrangler secret put CLOUDINARY_API_SECRET # o API Secret do Cloudinary
cd ..
```

## 4. Criar o primeiro admin (noivos)

```bash
npm run create-admin -- "gianpedrodev@gmail.com" "Gian" "umaSenhaForte"
```

Copie o `INSERT` impresso e rode:

```bash
npx wrangler d1 execute casamento-db --remote --command "COLE_O_INSERT_AQUI"
```

> `gianpedrodev@gmail.com` é a **conta principal** (não pode ser removida pelo painel).
> Para trocar, ajuste `PRIMARY_ADMIN_EMAIL` em `backend/src/routes/admin.ts` e
> `frontend/src/data/site.ts`.

## 5. Deploy

### Opção A — manual
```bash
npm run deploy
```

### Opção B — automático a cada push (recomendado)
No painel da Cloudflare → **Workers & Pages → Workers Builds**, conecte o repositório com:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy -c backend/wrangler.toml`

A partir daí, todo push na branch principal publica sozinho.

## 6. Domínio próprio (opcional)

No Worker → **Settings → Domains & Routes**, adicione seu domínio (ex.: `gianethalia.com.br`).
Migre os nameservers para a Cloudflare antes.

## Rodando localmente

```bash
# terminal 1 — Worker + D1 local
cp backend/.dev.vars.example backend/.dev.vars   # edite os valores
npm run migrate:local
npm run dev:backend

# terminal 2 — Vite
npm run dev:frontend    # abre http://localhost:5173  (admin em /admin)
```

## Checklist rápido

- [ ] Conta Cloudinary criada; cloud name/key em `wrangler.toml` + `site.ts`
- [ ] `wrangler d1 create casamento-db` e `database_id` colado no `wrangler.toml`
- [ ] `npm run migrate:remote`
- [ ] Secrets `JWT_SECRET` e `CLOUDINARY_API_SECRET` definidos
- [ ] Admin inicial criado
- [ ] Deploy (manual ou via Workers Builds)
- [ ] Entrar em `/admin` e preencher **Configurações** (data, PIX, textos, moderação)
