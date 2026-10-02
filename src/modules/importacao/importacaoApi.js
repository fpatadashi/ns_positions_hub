import { supabase } from '../../supabaseClient';

// "Back" do módulo Importação — CRUD dos cadastros importáveis por Excel.
// Cada fábrica recebe `refresh` (do AppDataContext) pra re-sincronizar o
// estado global depois de qualquer escrita, do mesmo jeito que já acontecia
// quando essas funções viviam inline dentro do contexto.

// CRUD genérico pros cadastros nome+codigo (bu/torre/empresa/disciplina/
// clevel/nivel_complexidade/centro_custo).
export function makeCadastro(table, refresh) {
  return {
    async upsert(nome, codigo, extra) {
      const { error } = await supabase.from(table).upsert({ nome, codigo, ...extra });
      if (error) throw error;
      await refresh();
    },
    async remove(nome) {
      const { error } = await supabase.from(table).delete().eq('nome', nome);
      if (error) throw error;
      await refresh();
    },
    async importRows(rows) {
      const clean = rows
        .map((r) => ({ nome: String(r.nome ?? r.Nome ?? '').trim(), codigo: String(r.codigo ?? r.Codigo ?? r.Código ?? '').trim() }))
        .filter((r) => r.nome && r.codigo);
      if (clean.length === 0) return;
      const { error } = await supabase.from(table).upsert(clean);
      if (error) throw error;
      await refresh();
    }
  };
}

// Tabela plana e livre, com modo de edição (Alterar/Salvar/Cancelar) — usada
// por Estrutura e Contas (Fase 13/14). Sem chave natural: linhas podem se
// repetir de propósito (ex. mesma Torre com Empresas diferentes), então
// import só insere linhas novas, não faz upsert.
export function makeFlatTableCadastro(table, refresh) {
  return {
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await refresh();
    },
    async importRows(cleanRows) {
      if (cleanRows.length === 0) return;
      const { error } = await supabase.from(table).insert(cleanRows);
      if (error) throw error;
      await refresh();
    },
    // Usados pelo modo de edição da tabela — cada um sem `refresh` próprio,
    // porque rodam em sequência dentro de um único salvamento; quem chama
    // dispara o refresh uma vez no final.
    async insertRow(row) {
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
    },
    async updateRow(id, patch) {
      const { error } = await supabase.from(table).update(patch).eq('id', id);
      if (error) throw error;
    },
    async removeRaw(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    async addColumn(nome) {
      const { error } = await supabase.rpc('ensure_column', { p_table: table, p_column: nome, p_type: 'text' });
      if (error) throw error;
    },
    async renameColumn(nomeAntigo, nomeNovo) {
      const { error } = await supabase.rpc('rename_column', { p_table: table, p_old_name: nomeAntigo, p_new_name: nomeNovo });
      if (error) throw error;
    },
    async dropColumn(nome) {
      const { error } = await supabase.rpc('drop_column', { p_table: table, p_column: nome });
      if (error) throw error;
    },
    async refresh() {
      await refresh();
    }
  };
}

export function makeRelacaoBteCadastro(refresh) {
  return {
    async upsert(bu, torre, empresa) {
      const { error } = await supabase.from('relacao_bte').upsert({ bu, torre, empresa }, { onConflict: 'bu,torre,empresa' });
      if (error) throw error;
      await refresh();
    },
    async remove(id) {
      const { error } = await supabase.from('relacao_bte').delete().eq('id', id);
      if (error) throw error;
      await refresh();
    },
    async importRows(rows) {
      const clean = rows
        .map((r) => ({
          bu: String(r.bu ?? r.BU ?? '').trim(),
          torre: String(r.torre ?? r.Torre ?? '').trim(),
          empresa: String(r.empresa ?? r.Empresa ?? '').trim()
        }))
        .filter((r) => r.bu && r.torre && r.empresa);
      if (clean.length === 0) return;
      const { error } = await supabase.from('relacao_bte').upsert(clean, { onConflict: 'bu,torre,empresa' });
      if (error) throw error;
      await refresh();
    }
  };
}
