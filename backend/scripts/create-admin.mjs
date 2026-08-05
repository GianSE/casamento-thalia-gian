#!/usr/bin/env node
/**
 * Gera o SQL para criar/atualizar um administrador (hash PBKDF2 compatível com o Worker).
 *
 * Uso:
 *   node scripts/create-admin.mjs "email@exemplo.com" "Nome" "senha"
 *
 * O hash contém caracteres "$". Passar esse SQL inline no PowerShell/CMD faz o shell
 * tentar expandir "$..." como variável e CORROMPE o hash (login dá "senha inválida").
 * Por isso este script grava o SQL em `backend/admin-seed.sql` e você o aplica com --file,
 * o que evita qualquer problema de aspas/escape:
 *
 *   npx wrangler d1 execute casamento-db --remote --file=backend/admin-seed.sql
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const [, , email, name, password] = process.argv;

if (!email || !name || !password) {
  console.error('Uso: node scripts/create-admin.mjs "email" "Nome" "senha"');
  process.exit(1);
}

const enc = new TextEncoder();
const ITER = 100_000;

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return Buffer.from(bin, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
  'deriveBits',
]);
const bits = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
  key,
  256
);
const hash = `pbkdf2$${ITER}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;

const safeEmail = email.trim().toLowerCase().replace(/'/g, "''");
const safeName = name.replace(/'/g, "''");

// INSERT OR REPLACE: se o e-mail já existir (ex.: um hash quebrado de uma tentativa
// anterior), a linha é substituída pela nova — corrige o cadastro.
const sql = `INSERT OR REPLACE INTO admin_users (email, name, password_hash) VALUES ('${safeEmail}', '${safeName}', '${hash}');\n`;

// Grava o arquivo na raiz de backend/ (../ a partir de scripts/)
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'admin-seed.sql');
writeFileSync(outPath, sql, 'utf8');

console.log('\n✅ SQL gravado em: backend/admin-seed.sql\n');
console.log('Agora aplique no banco REMOTO (produção):\n');
console.log('  npx wrangler d1 execute casamento-db --remote --file=backend/admin-seed.sql\n');
console.log('Ou no banco LOCAL (dev):\n');
console.log('  npx wrangler d1 execute casamento-db --local --file=backend/admin-seed.sql\n');
console.log('Depois, apague o arquivo (contém o hash da senha): del backend\\admin-seed.sql\n');
