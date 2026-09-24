import { supabase } from '../supabaseClient';
import { sanitizeColumnName } from './columnSanitize';

// Descobre quais colunas de um arquivo importado ainda nao existem na tabela.
// "Conhecidas" = colunas de uma linha real ja carregada (Object.keys de um
// item existente) ou, se a tabela ainda estiver vazia, uma lista base fixa
// passada pelo chamador. Uma coluna com nome mas sem nenhum valor preenchido
// e aceita normalmente - so entra como "nova" se o NOME dela for novo.
export function diffNewColumns(fileRows, knownColumns) {
  const known = new Set(knownColumns.map((c) => c.toLowerCase()));
  const found = new Set();
  fileRows.forEach((row) => {
    Object.keys(row).forEach((header) => {
      const nome = sanitizeColumnName(header);
      if (nome && !known.has(nome)) found.add(nome);
    });
  });
  return [...found];
}

// Cria, de fato, cada coluna nova na tabela via a funcao ensure_column do
// Postgres (RPC restrita por whitelist de tabela/tipo - ver migração 0009).
export async function ensureColumns(table, novasColunas, tipo = 'text') {
  for (const coluna of novasColunas) {
    const { error } = await supabase.rpc('ensure_column', { p_table: table, p_column: coluna, p_type: tipo });
    if (error) throw error;
  }
}
