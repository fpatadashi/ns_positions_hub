import { supabase } from '../../supabaseClient';

// Lê o catálogo de tabela.coluna do schema public (RPC list_public_columns,
// migração 0019) — usado só pra popular os selects da tela de Associação de
// Tabelas, nunca pra montar SQL dinâmico livre.
export async function fetchTableCatalog() {
  const { data, error } = await supabase.rpc('list_public_columns');
  if (error) throw error;
  const byTable = new Map();
  for (const row of data) {
    if (!byTable.has(row.table_name)) byTable.set(row.table_name, []);
    byTable.get(row.table_name).push(row.column_name);
  }
  return byTable;
}

// Resolve, pra um (aplicativo, campo), qual coluna real usar — cai no
// `fallbackColuna` se não houver associação cadastrada, então a tela nunca
// quebra por falta de mapeamento (só ignora e usa o nome de sempre).
export function resolveColuna(associacaoList, aplicativo, campo, fallbackColuna) {
  const found = associacaoList.find((a) => a.aplicativo === aplicativo && a.campo === campo);
  return found ? found.coluna : fallbackColuna;
}
