// Roda um arquivo .sql direto no Postgres do Supabase, lendo DATABASE_URL do .env.local.
// Uso: node scripts/run-sql.js supabase/migrations/000X_arquivo.sql
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

async function main() {
  const sqlPath = process.argv[2];
  if (!sqlPath) {
    console.error('Uso: node scripts/run-sql.js <caminho-do-arquivo.sql>');
    process.exit(1);
  }

  const env = loadEnvLocal();
  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL não encontrado em .env.local');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(root, sqlPath), 'utf8');
  const client = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  await client.connect();
  try {
    await client.query(sql);
    console.log('OK — ' + sqlPath + ' aplicado com sucesso.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Erro ao rodar SQL:', err.message);
  process.exit(1);
});
