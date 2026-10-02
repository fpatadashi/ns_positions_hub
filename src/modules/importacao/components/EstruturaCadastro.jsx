import { useState } from 'react';
import { Table2, ListTree, ChevronDown, ChevronRight } from 'lucide-react';
import EditableFlatTable from './EditableFlatTable';
import { useAppData } from '../../../shared/context/AppDataContext';
import { resolveColuna } from '../../../shared/lib/fieldMapping';

// Reflete o schema real da tabela `estrutura` hoje (renomeada ao longo desta
// sessão) — importante sobretudo quando a tabela está vazia, já que é essa
// lista que serve de "colunas conhecidas" pro primeiro import não confundir
// coluna já existente com coluna nova.
const BASE_COLUMNS = [
  { key: 'bu', label: 'BU' },
  { key: 'torre', label: 'TORRE' },
  { key: 'emp_gerencial', label: 'EMP_GERENCIAL' },
  { key: 'emp_app', label: 'EMP_APP' },
  { key: 'emp_senior_cod', label: 'EMP_SENIOR_COD' },
  { key: 'emp_kmm', label: 'EMP_KMM' },
  { key: 'emp_kmm_un_cod', label: 'EMP_KMM_UN_COD' },
  { key: 'emp_kmm_un', label: 'EMP_KMM_UN' },
  { key: 'emp_rateio_yn', label: 'EMP_RATEIO_YN' },
  { key: 'emp_senior', label: 'EMP_SENIOR' },
  { key: 'emp_n1', label: 'EMP_N1' }
];

// Agrupa as linhas da própria tabela `estrutura` em BU -> Torre -> Empresas,
// pra visão hierárquica refletir exatamente o que está na grade (mesma fonte
// de dado, não a bu/torre/relacao_bte antiga usada nos selects de Positions).
// `fields` resolve de qual coluna real ler cada conceito — ver "Associação de
// Tabelas": se você renomear a coluna que representa Empresa, é só atualizar
// o mapa lá que essa visão acompanha sozinha, sem editar código.
function buildHierarchy(items, fields) {
  const buMap = new Map();
  items.forEach((row) => {
    const bu = (row[fields.bu] || '').trim();
    if (!bu) return;
    const torre = (row[fields.torre] || '').trim();
    const empresa = (row[fields.empresa] || '').trim();
    if (!buMap.has(bu)) buMap.set(bu, new Map());
    const torreMap = buMap.get(bu);
    if (!torreMap.has(torre)) torreMap.set(torre, new Set());
    if (empresa) torreMap.get(torre).add(empresa);
  });
  return Array.from(buMap.entries())
    .map(([bu, torreMap]) => ({
      bu,
      torres: Array.from(torreMap.entries())
        .map(([torre, empresaSet]) => ({ torre, empresas: Array.from(empresaSet).sort() }))
        .sort((a, b) => a.torre.localeCompare(b.torre))
    }))
    .sort((a, b) => a.bu.localeCompare(b.bu));
}

// Estrutura (Fase 11/13) — tabela plana e livre, com 2 modos de visão: Grade
// (editável, Alterar/Salvar/Cancelar, vem do EditableFlatTable) e Hierarquia
// (BU -> Torre -> Empresa, só leitura, com drill down/expand-collapse).
export default function EstruturaCadastro({ items, onDelete, cadastro }) {
  const { associacaoTabelasList } = useAppData();
  const [viewMode, setViewMode] = useState('grade');
  const [collapsedBUs, setCollapsedBUs] = useState(() => new Set());
  const [collapsedTorres, setCollapsedTorres] = useState(() => new Set());

  // Fallback = os nomes de sempre (bu/torre/empresa) — sem associação
  // cadastrada, a Hierarquia continua funcionando exatamente como antes.
  const hierarchyFields = {
    bu: resolveColuna(associacaoTabelasList, 'Estrutura', 'BU', 'bu'),
    torre: resolveColuna(associacaoTabelasList, 'Estrutura', 'Torre', 'torre'),
    empresa: resolveColuna(associacaoTabelasList, 'Estrutura', 'Empresa', 'emp_gerencial')
  };

  function toggleBu(bu) {
    setCollapsedBUs((prev) => {
      const next = new Set(prev);
      if (next.has(bu)) next.delete(bu); else next.add(bu);
      return next;
    });
  }

  function toggleTorre(key) {
    setCollapsedTorres((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const viewToggle = (
    <div className="view-toggle">
      <button
        className={'view-toggle-btn' + (viewMode === 'grade' ? ' active' : '')}
        title="Modo grade (editável)"
        onClick={() => setViewMode('grade')}
      >
        <Table2 size={16} strokeWidth={1.75} />
      </button>
      <button
        className={'view-toggle-btn' + (viewMode === 'hierarquia' ? ' active' : '')}
        title="Modo hierarquia (somente visualização)"
        onClick={() => setViewMode('hierarquia')}
      >
        <ListTree size={16} strokeWidth={1.75} />
      </button>
    </div>
  );

  if (viewMode === 'hierarquia') {
    const tree = buildHierarchy(items, hierarchyFields);
    return (
      <div className="rules" style={{ maxWidth: 'none' }}>
        <div className="cadastro-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>Estrutura</h2>
            {viewToggle}
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: -8, marginBottom: 16 }}>
          Visão hierárquica BU → Torre → Empresa, a partir dos dados da grade (somente leitura). Clique para abrir/fechar.
        </p>

        <div className="estrutura-hierarquia">
          {tree.map((buGroup) => {
            const isCollapsed = collapsedBUs.has(buGroup.bu);
            return (
              <div className="estrutura-bu-group" key={buGroup.bu}>
                <button className="estrutura-bu-header" onClick={() => toggleBu(buGroup.bu)}>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <span className="estrutura-bu-title">{buGroup.bu}</span>
                </button>
                {!isCollapsed && buGroup.torres.map((t) => {
                  const key = buGroup.bu + '|' + t.torre;
                  const torreCollapsed = collapsedTorres.has(key);
                  return (
                    <div className="estrutura-torre-group" key={key}>
                      <button className="estrutura-torre-header" onClick={() => toggleTorre(key)}>
                        {torreCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        <span className="estrutura-torre-title">{t.torre || 'Sem torre'}</span>
                      </button>
                      {!torreCollapsed && (
                        t.empresas.length > 0 ? (
                          <div className="estrutura-empresa-list">
                            {t.empresas.map((e) => (
                              <div className="estrutura-empresa-row" key={e}>{e}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="estrutura-empresa-list">
                            <div className="estrutura-empresa-row" style={{ color: 'var(--text-faint)' }}>Nenhuma empresa nesta torre.</div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {tree.length === 0 && <p style={{ color: 'var(--text-faint)' }}>Nenhuma estrutura cadastrada ainda.</p>}
        </div>
      </div>
    );
  }

  return (
    <EditableFlatTable
      table="estrutura"
      title="Estrutura"
      description='Uma linha por combinação de BU/Torre/Empresa. Ao importar um Excel com uma coluna que ainda não existe aqui, o app avisa e cria a coluna antes de importar os dados.'
      baseColumns={BASE_COLUMNS}
      items={items}
      onDelete={onDelete}
      cadastro={cadastro}
      strongKey="bu"
      exportFilename="Configuracoes_Cadastros_Estrutura.xlsx"
      headerExtra={viewToggle}
    />
  );
}
