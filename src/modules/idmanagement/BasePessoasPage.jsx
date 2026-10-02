import { useState } from 'react';
import { ListTree, Table2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppData } from '../../shared/context/AppDataContext';
import { pessoaSummary, filterPessoas, groupPessoasByBuTorre } from './idManagementLogic';
import PessoaFichaModal from './PessoaFichaModal';
import './idmanagement.css';

export default function BasePessoasPage() {
  const { pessoaList, buList, torreList, loading, loadingPeople, error } = useAppData();
  const [pessoaQuery, setPessoaQuery] = useState('');
  const [onlyRevisar, setOnlyRevisar] = useState(false);
  const [viewMode, setViewMode] = useState('hierarquia');
  const [ficha, setFicha] = useState(null);
  const [collapsedBUs, setCollapsedBUs] = useState(() => new Set());
  const [collapsedTorres, setCollapsedTorres] = useState(() => new Set());

  if (loading || loadingPeople) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;
  if (error) return <p className="modal-error" style={{ textAlign: 'center' }}>Erro ao carregar dados: {error}</p>;

  function toggleBuCollapsed(bu) {
    setCollapsedBUs((prev) => {
      const next = new Set(prev);
      if (next.has(bu)) next.delete(bu); else next.add(bu);
      return next;
    });
  }

  function toggleTorreCollapsed(key) {
    setCollapsedTorres((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const pSummary = pessoaSummary(pessoaList);
  const pFiltered = filterPessoas(pessoaList, pessoaQuery, onlyRevisar)
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const buGroups = groupPessoasByBuTorre(pFiltered, buList, torreList);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Base de Pessoas</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.86rem', marginTop: -6 }}>
        Base real importada de "Lista para ID.xlsx" (aba Pessoas_ID) — cada pessoa mantém o <b>ID da Posição</b> antigo
        e ganha um <b>ID_Position</b>: igual ao antigo quando reconhecível, ou marcado "Revisar" quando o valor original
        era ambíguo/em branco (aguardando decisão manual antes de gerar um ID novo pra 2027).
      </p>

      <div className="idmgmt-bu-grid">
        <div className="idmgmt-bu-card">
          <div className="idmgmt-bu-nome">Total de pessoas</div>
          <div className="idmgmt-bu-nums"><span className="num">{pSummary.total}</span></div>
        </div>
        <div className="idmgmt-bu-card">
          <div className="idmgmt-bu-nome">ID_Position ok</div>
          <div className="idmgmt-bu-nums"><span className="num">{pSummary.ok}</span></div>
        </div>
        <div className="idmgmt-bu-card">
          <div className="idmgmt-bu-nome">A revisar</div>
          <div className="idmgmt-bu-nums"><span className="num">{pSummary.revisar}</span></div>
        </div>
      </div>

      <div className="idmgmt-search" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          style={{ flex: 1 }}
          value={pessoaQuery}
          onChange={(e) => setPessoaQuery(e.target.value)}
          placeholder="Buscar por Nome, ID_Position, ID antigo, BU, Torre, Cargo, Departamento ou Status…"
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={onlyRevisar} onChange={(e) => setOnlyRevisar(e.target.checked)} />
          Só "Revisar"
        </label>
        <div className="pessoa-view-toggle">
          <button
            className={'pessoa-view-btn' + (viewMode === 'hierarquia' ? ' active' : '')}
            title="Visão hierárquica (BU / Torre / Pessoa)"
            onClick={() => setViewMode('hierarquia')}
          >
            <ListTree size={16} strokeWidth={1.75} />
          </button>
          <button
            className={'pessoa-view-btn' + (viewMode === 'tabela' ? ' active' : '')}
            title="Visão em tabela"
            onClick={() => setViewMode('tabela')}
          >
            <Table2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {viewMode === 'hierarquia' ? (
        <div className="pessoa-hierarquia">
          {buGroups.map((buGroup) => {
            const isCollapsed = collapsedBUs.has(buGroup.bu);
            return (
              <div className="pessoa-bu-group" key={buGroup.bu || '__sem_bu__'}>
                <button className="pessoa-bu-header" onClick={() => toggleBuCollapsed(buGroup.bu)}>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <span className="pessoa-bu-title">{buGroup.bu || 'Sem BU'}</span>
                </button>
                {!isCollapsed && buGroup.torreGroups.map((t) => {
                  const torreKey = (buGroup.bu || '__sem_bu__') + '|' + (t.torre || '__sem_torre__');
                  const torreCollapsed = collapsedTorres.has(torreKey);
                  return (
                    <div className="pessoa-torre-group" key={torreKey}>
                      <button className="pessoa-torre-header" onClick={() => toggleTorreCollapsed(torreKey)}>
                        {torreCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        <span className="pessoa-torre-title">{t.torre || 'Sem torre'}</span>
                      </button>
                      {!torreCollapsed && (
                        <div className="pessoa-name-table">
                          <div className="pessoa-name-row pessoa-name-row-head">
                            <span>Nome</span>
                            <span>ID Posição</span>
                            <span>ID_Position</span>
                          </div>
                          {t.pessoas.map((p) => (
                            <button className="pessoa-name-row" key={p.nome} onClick={() => setFicha(p)}>
                              <span>{p.nome}</span>
                              <span className="mono">{p.id_da_posicao || '—'}</span>
                              <span className="mono">{p.id_position || '—'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {buGroups.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma pessoa encontrada.</p>
          )}
        </div>
      ) : (
        <div className="idmgmt-table-wrap">
          <table className="idmgmt-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>ID_Position</th>
                <th>Status ID</th>
                <th>ID da Posição (antigo)</th>
                <th>BU</th>
                <th>Torre</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pFiltered.map((p) => (
                <tr key={p.nome} className="idmgmt-row-clickable" onClick={() => setFicha(p)}>
                  <td>{p.nome}</td>
                  <td className="mono">{p.id_position || '—'}</td>
                  <td>
                    <span className={'idmgmt-status ' + (p.id_position_status === 'ok' ? 'idmgmt-status-vaga' : 'idmgmt-status-reservada')}>
                      {p.id_position_status === 'ok' ? 'Ok' : 'Revisar'}
                    </span>
                  </td>
                  <td className="mono">{p.id_da_posicao || '—'}</td>
                  <td>{p.bu || '—'}</td>
                  <td>{p.torre || '—'}</td>
                  <td>{p.cargo_real || '—'}</td>
                  <td>{p.departamento || '—'}</td>
                  <td>{p.status || '—'}</td>
                </tr>
              ))}
              {pFiltered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma pessoa encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {ficha && <PessoaFichaModal pessoa={ficha} onClose={() => setFicha(null)} />}
    </div>
  );
}
