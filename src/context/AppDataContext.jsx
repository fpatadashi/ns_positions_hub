import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as actions from '../lib/chairActions';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [chairs, setChairs] = useState([]);
  const [movements, setMovements] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaList, setDisciplinaList] = useState([]);
  const [clevelList, setClevelList] = useState([]);
  const [nivelComplexidadeList, setNivelComplexidadeList] = useState([]);
  const [pessoaList, setPessoaList] = useState([]);
  const [centroCustoList, setCentroCustoList] = useState([]);
  const [buList, setBuList] = useState([]);
  const [torreList, setTorreList] = useState([]);
  const [empresaList, setEmpresaList] = useState([]);
  const [relacaoBte, setRelacaoBte] = useState([]);
  const [bolsao, setBolsao] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const [
      chairsRes, movementsRes, settingsRes,
      buRes, torreRes, empresaRes, relacaoRes,
      disciplinaRes, clevelRes, nivelComplexidadeRes, pessoaRes, centroCustoRes
    ] = await Promise.all([
      supabase.from('chairs').select('*').order('id'),
      supabase.from('movements').select('*').order('created_at', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 1).single(),
      supabase.from('bu').select('*').order('nome'),
      supabase.from('torre').select('*').order('nome'),
      supabase.from('empresa').select('*').order('nome'),
      supabase.from('relacao_bte').select('*'),
      supabase.from('disciplina').select('*').order('nome'),
      supabase.from('clevel').select('*').order('nome'),
      supabase.from('nivel_complexidade').select('*').order('nome'),
      supabase.from('pessoa').select('*').order('nome'),
      supabase.from('centro_custo').select('*').order('nome')
    ]);
    if (chairsRes.error) throw chairsRes.error;
    if (movementsRes.error) throw movementsRes.error;
    if (settingsRes.error) throw settingsRes.error;

    setChairs(chairsRes.data);
    setMovements(movementsRes.data);
    setBolsao(Number(settingsRes.data.bolsao));
    setBudgetTotal(Number(settingsRes.data.budget_total));

    // Tabelas opcionais/de uma fase mais nova: se a migração correspondente ainda
    // não rodou, não derruba o app inteiro — só fica sem essas opções.
    if (buRes.error) { console.warn('Não foi possível carregar bu:', buRes.error.message); setBuList([]); }
    else setBuList(buRes.data);

    if (torreRes.error) { console.warn('Não foi possível carregar torre:', torreRes.error.message); setTorreList([]); }
    else setTorreList(torreRes.data);

    if (empresaRes.error) { console.warn('Não foi possível carregar empresa:', empresaRes.error.message); setEmpresaList([]); }
    else setEmpresaList(empresaRes.data);

    if (relacaoRes.error) { console.warn('Não foi possível carregar relacao_bte:', relacaoRes.error.message); setRelacaoBte([]); }
    else setRelacaoBte(relacaoRes.data);

    if (disciplinaRes.error) {
      console.warn('Não foi possível carregar disciplina:', disciplinaRes.error.message);
      setDisciplinaList([]); setDisciplinas([]);
    } else {
      setDisciplinaList(disciplinaRes.data);
      setDisciplinas(disciplinaRes.data.map((r) => r.nome));
    }

    if (clevelRes.error) { console.warn('Não foi possível carregar clevel:', clevelRes.error.message); setClevelList([]); }
    else setClevelList(clevelRes.data);

    if (nivelComplexidadeRes.error) { console.warn('Não foi possível carregar nivel_complexidade:', nivelComplexidadeRes.error.message); setNivelComplexidadeList([]); }
    else setNivelComplexidadeList(nivelComplexidadeRes.data);

    if (pessoaRes.error) { console.warn('Não foi possível carregar pessoa:', pessoaRes.error.message); setPessoaList([]); }
    else setPessoaList(pessoaRes.data);

    if (centroCustoRes.error) { console.warn('Não foi possível carregar centro_custo:', centroCustoRes.error.message); setCentroCustoList([]); }
    else setCentroCustoList(centroCustoRes.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  async function updateChairFields(chairId, patch) {
    const { error } = await supabase.from('chairs').update(patch).eq('id', chairId);
    if (error) throw error;
    await refresh();
  }

  // CRUD genérico para os cadastros bu/torre/empresa — todos com o mesmo formato {nome, codigo}.
  function makeCadastro(table) {
    return {
      async upsert(nome, codigo) {
        const { error } = await supabase.from(table).upsert({ nome, codigo });
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

  const buCadastro = makeCadastro('bu');
  const torreCadastro = makeCadastro('torre');
  const empresaCadastro = makeCadastro('empresa');
  const disciplinaCadastro = makeCadastro('disciplina');
  const clevelCadastro = makeCadastro('clevel');
  const nivelComplexidadeCadastro = makeCadastro('nivel_complexidade');
  const centroCustoCadastro = makeCadastro('centro_custo');

  // Pessoa não segue o formato nome+codigo dos demais — colunas variam (pode
  // ganhar novas via import inteligente), então tem seu próprio cadastro.
  const pessoaCadastro = {
    async remove(nome) {
      const { error } = await supabase.from('pessoa').delete().eq('nome', nome);
      if (error) throw error;
      await refresh();
    },
    async importRows(cleanRows) {
      if (cleanRows.length === 0) return;
      const { error } = await supabase.from('pessoa').upsert(cleanRows, { onConflict: 'nome' });
      if (error) throw error;
      await refresh();
    }
  };

  const relacaoBteCadastro = {
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

  function snapshot() {
    return { chairs, bolsao, budgetTotal, buList, empresaList };
  }

  // Wraps a chairActions function: runs it against the current snapshot, and
  // refetches everything from Supabase on success so every screen stays in sync.
  function wrap(fn) {
    return async (...args) => {
      const result = await fn(snapshot(), ...args);
      if (result.ok) await refresh();
      return result;
    };
  }

  const value = {
    chairs,
    movements,
    disciplinas,
    disciplinaList,
    clevelList,
    nivelComplexidadeList,
    pessoaList,
    centroCustoList,
    buList,
    torreList,
    empresaList,
    relacaoBte,
    bolsao,
    budgetTotal,
    bolsaoCap: budgetTotal * 0.5,
    loading,
    error,
    refresh,
    updateChairFields,
    buCadastro,
    torreCadastro,
    empresaCadastro,
    relacaoBteCadastro,
    disciplinaCadastro,
    clevelCadastro,
    nivelComplexidadeCadastro,
    pessoaCadastro,
    centroCustoCadastro,
    hireChair: wrap(actions.hireChair),
    dismissChair: wrap(actions.dismissChair),
    promoteChair: wrap(actions.promoteChair),
    meritoStandalone: wrap(actions.meritoStandalone),
    decomposeChair: wrap(actions.decomposeChair),
    incorporarChair: wrap(actions.incorporarChair),
    extinguishChair: wrap(actions.extinguishChair),
    moverValorVaga: wrap(actions.moverValorVaga),
    applyBolsaoNovaVaga: wrap(actions.applyBolsaoNovaVaga)
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData precisa estar dentro de <AppDataProvider>.');
  return ctx;
}
