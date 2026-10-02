import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import * as actions from '../lib/chairActions';
import { makeCadastro, makeRelacaoBteCadastro, makeFlatTableCadastro } from '../../modules/importacao/importacaoApi';
import { usernameOf } from '../lib/userIdentity';

const AppDataContext = createContext(null);

// Cadastros De-Para simples (nome+codigo) trazidos junto com a base real de
// pessoas (Fase 10) — carregados/expostos em bloco pra não repetir 12x o
// mesmo useState/query dos cadastros mais antigos (bu/torre/empresa/...).
const NOVOS_CADASTROS = [
  'grupo', 'departamento', 'area_sistema', 'modalidade', 'squad', 'produto',
  'cargo_real', 'genero', 'pcd', 'cbo', 'dedicado_compartilhado', 'pessoa_status'
];

// `select('*')` sozinho só traz até o "Max Rows" configurado no projeto
// Supabase (por padrão 1000) — `pessoa` tem ~5.900 linhas, então metade da
// base sumia silenciosamente (nada de erro, só menos linhas). Pagina com
// `.range()` até a página vir mais curta que o tamanho pedido.
const PAGE_SIZE = 1000;

async function fetchAllRows(table, orderCol) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select('*').order(orderCol).range(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return { data: all, error: null };
}

export function AppDataProvider({ children, currentUserEmail }) {
  const [chairs, setChairs] = useState([]);
  const [movements, setMovements] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaList, setDisciplinaList] = useState([]);
  const [clevelList, setClevelList] = useState([]);
  const [nivelComplexidadeList, setNivelComplexidadeList] = useState([]);
  const [pessoaList, setPessoaList] = useState([]);
  const [centroCustoList, setCentroCustoList] = useState([]);
  const [highlightList, setHighlightList] = useState([]);
  const [estruturaList, setEstruturaList] = useState([]);
  const [contasList, setContasList] = useState([]);
  const [associacaoTabelasList, setAssociacaoTabelasList] = useState([]);
  const [novosCadastros, setNovosCadastros] = useState(() => Object.fromEntries(NOVOS_CADASTROS.map((t) => [t, []])));
  const [buList, setBuList] = useState([]);
  const [torreList, setTorreList] = useState([]);
  const [empresaList, setEmpresaList] = useState([]);
  const [relacaoBte, setRelacaoBte] = useState([]);
  const [bolsao, setBolsao] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [error, setError] = useState(null);

  // Separado do resto (Fase 12): `pessoa` (~5.900 linhas paginadas) + os 12
  // De-Para da Fase 10 demoravam demais e travavam o `loading` compartilhado
  // — Positions/Dashboard/etc. ficavam esperando dado que nem usam. Esse
  // grupo carrega em paralelo, com seu próprio `loadingPeople`.
  const refreshCore = useCallback(async () => {
    const [
      chairsRes, movementsRes, settingsRes,
      buRes, torreRes, empresaRes, relacaoRes,
      disciplinaRes, clevelRes, nivelComplexidadeRes, centroCustoRes, highlightRes, estruturaRes, contasRes,
      associacaoTabelasRes
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
      supabase.from('centro_custo').select('*').order('nome'),
      supabase.from('highlight').select('*').order('nome'),
      supabase.from('estrutura').select('*').order('id'),
      supabase.from('contas').select('*').order('id'),
      supabase.from('associacao_tabelas').select('*').order('id')
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

    if (centroCustoRes.error) { console.warn('Não foi possível carregar centro_custo:', centroCustoRes.error.message); setCentroCustoList([]); }
    else setCentroCustoList(centroCustoRes.data);

    if (highlightRes.error) { console.warn('Não foi possível carregar highlight:', highlightRes.error.message); setHighlightList([]); }
    else setHighlightList(highlightRes.data);

    if (estruturaRes.error) { console.warn('Não foi possível carregar estrutura:', estruturaRes.error.message); setEstruturaList([]); }
    else setEstruturaList(estruturaRes.data);

    if (contasRes.error) { console.warn('Não foi possível carregar contas:', contasRes.error.message); setContasList([]); }
    else setContasList(contasRes.data);

    if (associacaoTabelasRes.error) { console.warn('Não foi possível carregar associacao_tabelas:', associacaoTabelasRes.error.message); setAssociacaoTabelasList([]); }
    else setAssociacaoTabelasList(associacaoTabelasRes.data);
  }, []);

  const refreshPeople = useCallback(async () => {
    const [pessoaRes, ...novosRes] = await Promise.all([
      fetchAllRows('pessoa', 'nome'),
      ...NOVOS_CADASTROS.map((t) => fetchAllRows(t, 'nome'))
    ]);

    if (pessoaRes.error) { console.warn('Não foi possível carregar pessoa:', pessoaRes.error.message); setPessoaList([]); }
    else setPessoaList(pessoaRes.data);

    const novosData = {};
    NOVOS_CADASTROS.forEach((t, i) => {
      if (novosRes[i].error) { console.warn('Não foi possível carregar ' + t + ':', novosRes[i].error.message); novosData[t] = []; }
      else novosData[t] = novosRes[i].data;
    });
    setNovosCadastros(novosData);
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshCore().catch((e) => setError(e.message)).finally(() => setLoading(false));

    setLoadingPeople(true);
    refreshPeople().catch((e) => setError(e.message)).finally(() => setLoadingPeople(false));
  }, [refreshCore, refreshPeople]);

  async function updateChairFields(chairId, patch) {
    const { error } = await supabase.from('chairs').update(patch).eq('id', chairId);
    if (error) throw error;
    await refreshCore();
  }

  // Registra o início do processo de contratação (fluxo do botão "Contratar")
  // — não muda o status da cadeira (ela já está "reservada" desde que o
  // Gerenciar foi aberto); só grava os dados do formulário.
  async function registrarContratacao(fields) {
    const { error } = await supabase.from('contratacao_registro').insert({ ...fields, criado_por: currentUserEmail });
    if (error) throw error;
  }

  // CRUD dos cadastros importáveis (Excel) — implementação mora no "back" do
  // módulo Importação (src/modules/importacao/importacaoApi.js); aqui só
  // instanciamos passando o `refresh` do contexto global.
  const buCadastro = makeCadastro('bu', refreshCore);
  const torreCadastro = makeCadastro('torre', refreshCore);
  const empresaCadastro = makeCadastro('empresa', refreshCore);
  const disciplinaCadastro = makeCadastro('disciplina', refreshCore);
  const clevelCadastro = makeCadastro('clevel', refreshCore);
  const nivelComplexidadeCadastro = makeCadastro('nivel_complexidade', refreshCore);
  const centroCustoCadastro = makeCadastro('centro_custo', refreshCore);
  const highlightCadastro = makeCadastro('highlight', refreshCore);
  const relacaoBteCadastro = makeRelacaoBteCadastro(refreshCore);
  const estruturaCadastro = makeFlatTableCadastro('estrutura', refreshCore);
  const contasCadastro = makeFlatTableCadastro('contas', refreshCore);
  const associacaoTabelasCadastro = makeFlatTableCadastro('associacao_tabelas', refreshCore);
  const grupoCadastro = makeCadastro('grupo', refreshPeople);
  const departamentoCadastro = makeCadastro('departamento', refreshPeople);
  const areaSistemaCadastro = makeCadastro('area_sistema', refreshPeople);
  const modalidadeCadastro = makeCadastro('modalidade', refreshPeople);
  const squadCadastro = makeCadastro('squad', refreshPeople);
  const produtoCadastro = makeCadastro('produto', refreshPeople);
  const cargoRealCadastro = makeCadastro('cargo_real', refreshPeople);
  const generoCadastro = makeCadastro('genero', refreshPeople);
  const pcdCadastro = makeCadastro('pcd', refreshPeople);
  const cboCadastro = makeCadastro('cbo', refreshPeople);
  const dedicadoCompartilhadoCadastro = makeCadastro('dedicado_compartilhado', refreshPeople);
  const pessoaStatusCadastro = makeCadastro('pessoa_status', refreshPeople);

  const currentUsername = usernameOf(currentUserEmail);

  function snapshot() {
    return { chairs, bolsao, budgetTotal, buList, empresaList, currentUserEmail, currentUsername };
  }

  // Wraps a chairActions function: runs it against the current snapshot, and
  // refetches everything from Supabase on success so every screen stays in sync.
  function wrap(fn) {
    return async (...args) => {
      const result = await fn(snapshot(), ...args);
      if (result.ok) await refreshCore();
      return result;
    };
  }

  const value = {
    chairs,
    movements,
    currentUserEmail,
    currentUsername,
    disciplinas,
    disciplinaList,
    clevelList,
    nivelComplexidadeList,
    pessoaList,
    centroCustoList,
    highlightList,
    estruturaList,
    contasList,
    associacaoTabelasList,
    buList,
    torreList,
    empresaList,
    relacaoBte,
    bolsao,
    budgetTotal,
    bolsaoCap: budgetTotal * 0.5,
    loading,
    loadingPeople,
    error,
    refreshCore,
    refreshPeople,
    updateChairFields,
    registrarContratacao,
    buCadastro,
    torreCadastro,
    empresaCadastro,
    relacaoBteCadastro,
    estruturaCadastro,
    contasCadastro,
    associacaoTabelasCadastro,
    disciplinaCadastro,
    clevelCadastro,
    nivelComplexidadeCadastro,
    centroCustoCadastro,
    highlightCadastro,
    grupoList: novosCadastros.grupo,
    departamentoList: novosCadastros.departamento,
    areaSistemaList: novosCadastros.area_sistema,
    modalidadeList: novosCadastros.modalidade,
    squadList: novosCadastros.squad,
    produtoList: novosCadastros.produto,
    cargoRealList: novosCadastros.cargo_real,
    generoList: novosCadastros.genero,
    pcdList: novosCadastros.pcd,
    cboList: novosCadastros.cbo,
    dedicadoCompartilhadoList: novosCadastros.dedicado_compartilhado,
    pessoaStatusList: novosCadastros.pessoa_status,
    grupoCadastro,
    departamentoCadastro,
    areaSistemaCadastro,
    modalidadeCadastro,
    squadCadastro,
    produtoCadastro,
    cargoRealCadastro,
    generoCadastro,
    pcdCadastro,
    cboCadastro,
    dedicadoCompartilhadoCadastro,
    pessoaStatusCadastro,
    hireChair: wrap(actions.hireChair),
    dismissChair: wrap(actions.dismissChair),
    promoteChair: wrap(actions.promoteChair),
    meritoStandalone: wrap(actions.meritoStandalone),
    decomposeChair: wrap(actions.decomposeChair),
    incorporarChair: wrap(actions.incorporarChair),
    extinguishChair: wrap(actions.extinguishChair),
    moverValorVaga: wrap(actions.moverValorVaga),
    applyBolsaoNovaVaga: wrap(actions.applyBolsaoNovaVaga),
    reserveChair: wrap(actions.reserveChair),
    releaseChair: wrap(actions.releaseChair),
    gerarIdsOrcamento: wrap(actions.gerarIdsOrcamento)
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData precisa estar dentro de <AppDataProvider>.');
  return ctx;
}
