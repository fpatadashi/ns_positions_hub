import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAppData } from '../../shared/context/AppDataContext';
import { CARGO_ORDER, cargoLabel } from '../../shared/data/cargo';
import { fmtBRL } from '../../shared/lib/format';
import ChairCard from '../../components/ChairCard';
import SidePanel from '../../components/SidePanel';
import SearchableMultiSelect from '../../components/SearchableMultiSelect';
import RegistrarContratacaoModal from '../../components/modals/RegistrarContratacaoModal';
import PromoverModal from '../../components/modals/PromoverModal';
import MeritoModal from '../../components/modals/MeritoModal';
import DecomporModal from '../../components/modals/DecomporModal';
import IncorporarModal from '../../components/modals/IncorporarModal';
import AplicarBolsaoModal from '../../components/modals/AplicarBolsaoModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import BatchModal from '../../components/modals/BatchModal';
import GerenciarVagaModal from '../../components/modals/GerenciarVagaModal';
import GerenciarOcupadaModal from '../../components/modals/GerenciarOcupadaModal';
import EfetivarPosicaoModal from '../../components/modals/EfetivarPosicaoModal';
import { filterChairs, chipCount, groupByBuTorre, hasRecentMerito } from './positionsLogic';
import './positions.css';

function toggle(setState, value) {
  setState((prev) => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  });
}

// Reaproveitada no resumo geral e no resumo de cada BU — mesmos 5 contadores,
// só muda o array de cadeiras que entra.
function ResumoStats({ chairs }) {
  const total = chairs.length;
  const ocupadas = chairs.filter((c) => c.status === 'ocupada').length;
  const reservadas = chairs.filter((c) => c.status === 'reservada').length;
  const extintas = chairs.filter((c) => c.status === 'extinta').length;
  const disponiveis = chairs.filter((c) => c.status === 'vaga').length;
  return (
    <div className="resumo-estrutura-stats">
      <div className="resumo-estrutura-stat">
        <span className="lbl">Total de posições</span>
        <span className="num">{total} P</span>
      </div>
      <div className="resumo-estrutura-stat">
        <span className="dot" style={{ background: 'var(--status-ocupada)' }} />
        <span className="lbl">Ocupadas</span>
        <span className="num">{ocupadas} P</span>
      </div>
      <div className="resumo-estrutura-stat">
        <span className="dot" style={{ background: 'var(--status-selecting)' }} />
        <span className="lbl">Em contratação</span>
        <span className="num">{reservadas} P</span>
      </div>
      <div className="resumo-estrutura-stat">
        <span className="dot" style={{ background: 'var(--status-extinta)' }} />
        <span className="lbl">Extintas</span>
        <span className="num">{extintas} P</span>
      </div>
      <div className="resumo-estrutura-stat">
        <span className="dot" style={{ background: 'var(--status-vaga)' }} />
        <span className="lbl">Disponíveis</span>
        <span className="num">{disponiveis} P</span>
      </div>
    </div>
  );
}

export default function PositionsPage() {
  const {
    chairs, movements, buList, torreList, disciplinas, bolsao, budgetTotal, bolsaoCap,
    loading, error, currentUserEmail,
    dismissChair, extinguishChair, reserveChair, releaseChair
  } = useAppData();

  const [selectedBUs, setSelectedBUs] = useState(() => new Set());
  const [selectedTorres, setSelectedTorres] = useState(() => new Set());
  const [selectedDisciplinas, setSelectedDisciplinas] = useState(() => new Set());
  const [empresaQuery, setEmpresaQuery] = useState('');
  const [idQuery, setIdQuery] = useState('');
  const [vagaQuery, setVagaQuery] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState(() => new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [collapsedBUs, setCollapsedBUs] = useState(() => new Set());

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;
  if (error) return <p className="modal-error" style={{ textAlign: 'center' }}>Erro ao carregar dados: {error}</p>;
  if (buList.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma BU cadastrada. Cadastre uma em Importação → BU.</p>;

  const filtered = filterChairs(chairs, {
    bus: selectedBUs, torres: selectedTorres, disciplinas: selectedDisciplinas,
    empresaQuery, idQuery, vagaQuery
  }, cargoLabel);

  const filteredActive = filtered.filter((c) => c.status !== 'extinta');
  const alocado = filteredActive.reduce((a, c) => a + Number(c.valor), 0);
  const ocupadasHC = filteredActive.filter((c) => c.status === 'ocupada').length;
  const vagasCount = filteredActive.filter((c) => c.status === 'vaga').length;
  const savingVagas = filteredActive.filter((c) => c.status === 'vaga').reduce((a, c) => a + Number(c.valor), 0);

  // Estrutura de cadeiras respeitando BU -> Torre -> Cargo -> Cadeira.
  const buTorreGroups = groupByBuTorre(filtered, buList, torreList);
  function levelsOf(chairsList) {
    return CARGO_ORDER.slice().reverse()
      .map((key) => ({ key, chairs: chairsList.filter((c) => c.cargo === key) }))
      .filter((l) => l.chairs.length > 0);
  }

  const selectedChair = selectedId ? chairs.find((c) => c.id === selectedId) : null;

  function selectChair(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function toggleBatch(id) {
    setBatchSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function cancelBatch() {
    setBatchMode(false);
    setBatchSelected(new Set());
  }

  function chairClick(id) {
    if (batchMode) toggleBatch(id);
    else selectChair(id);
  }

  function toggleBuCollapsed(bu) {
    toggle(setCollapsedBUs, bu);
  }

  // Reserva a vaga (trava real) antes de abrir o modal de ação; se já estiver
  // reservada por outra pessoa, retorna o erro sem abrir nada.
  async function handleVagaAction(chairId, type, extra) {
    const res = await reserveChair(chairId);
    if (!res.ok) return res;
    setModal({ type, chairId, ...extra });
    return { ok: true };
  }

  // Fecha qualquer modal de ação sobre vaga — se a cadeira ainda estiver
  // reservada (ação cancelada, não concluída), libera de novo.
  async function closeModal() {
    const chairId = modal?.chairId || modal?.presetOrigemId;
    if (chairId) {
      const c = chairs.find((x) => x.id === chairId);
      if (c && c.status === 'reservada' && c.reservado_por === currentUserEmail) {
        await releaseChair(chairId);
      }
    }
    setModal(null);
  }

  const confirmDemitirChair = modal?.type === 'confirmDemitir' ? chairs.find((c) => c.id === modal.chairId) : null;
  const confirmExtinguirChair = modal?.type === 'confirmExtinguir' ? chairs.find((c) => c.id === modal.chairId) : null;
  const wouldExceedCap = confirmExtinguirChair && bolsao + Number(confirmExtinguirChair.valor) > bolsaoCap + 0.001;

  return (
    <div>
      <div className="quick-filters">
        <div className="quick-filter-row">
          <span className="quick-filter-label">BU:</span>
          <div className="filter-chips">
            {buList.map((b) => {
              const { total, ocupadas } = chipCount(chairs, 'bu', b.nome);
              return (
                <button
                  key={b.nome}
                  className={'filter-chip' + (selectedBUs.has(b.nome) ? ' active' : '')}
                  onClick={() => toggle(setSelectedBUs, b.nome)}
                >
                  {b.nome} <span className="filter-chip-count">{ocupadas}/{total}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="quick-filter-row">
          <span className="quick-filter-label">Torres:</span>
          <div className="filter-chips">
            {torreList.map((t) => {
              const { total, ocupadas } = chipCount(chairs, 'torre', t.nome);
              return (
                <button
                  key={t.nome}
                  className={'filter-chip' + (selectedTorres.has(t.nome) ? ' active' : '')}
                  onClick={() => toggle(setSelectedTorres, t.nome)}
                >
                  {t.nome} <span className="filter-chip-count">{ocupadas}/{total}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="quick-search-row">
          <div className="quick-search-field">
            <label>Empresa</label>
            <input type="text" value={empresaQuery} onChange={(e) => setEmpresaQuery(e.target.value)} placeholder="Buscar empresa…" />
          </div>
          <div className="quick-search-field">
            <label>ID</label>
            <input type="text" value={idQuery} onChange={(e) => setIdQuery(e.target.value)} placeholder="Buscar ID da posição…" />
          </div>
          <div className="quick-search-field">
            <label>Posição</label>
            <input type="text" value={vagaQuery} onChange={(e) => setVagaQuery(e.target.value)} placeholder="Buscar cargo ou ocupante…" />
          </div>
        </div>
      </div>

      <div className="big-infos-grid">
        <div className="big-info-card">
          <div className="num">{fmtBRL(alocado)}</div>
          <div className="lbl">Budget alocado (seleção)</div>
        </div>
        <div className="big-info-card">
          <div className="num">{fmtBRL(savingVagas)}</div>
          <div className="lbl">Saving de posições (seleção)</div>
        </div>
        <div className="big-info-card">
          <div className="num">{ocupadasHC}</div>
          <div className="lbl">HC ocupado (seleção)</div>
        </div>
        <div className="big-info-card">
          <div className="num">{vagasCount}</div>
          <div className="lbl">Posições disponíveis (seleção)</div>
        </div>
      </div>

      <div className="resumo-estrutura-bar">
        <div className="resumo-estrutura-titulo">
          Estrutura selecionada: <b>{selectedBUs.size ? [...selectedBUs].join(', ') : 'Todas as BUs'}</b>
          {' – '}<b>{selectedTorres.size ? [...selectedTorres].join(', ') : 'Todas as Torres'}</b>
          {empresaQuery && <> {' – '}<b>{empresaQuery}</b></>}
        </div>
        <ResumoStats chairs={filtered} />
      </div>

      <div className="stage">
        <div className="torres-col">
          <div className="torre-card">
            <div className="torre-toolbar">
              <div className="torre-toolbar-disciplina">
                <span className="quick-filter-label">Disciplina:</span>
                <SearchableMultiSelect
                  options={disciplinas}
                  selected={selectedDisciplinas}
                  onToggle={(d) => toggle(setSelectedDisciplinas, d)}
                  placeholder="Buscar disciplina…"
                />
              </div>
              {!batchMode ? (
                <button className="btn-secondary" onClick={() => setBatchMode(true)}>Modificar Estrutura</button>
              ) : (
                <>
                  <button className="btn-secondary" onClick={cancelBatch}>Cancelar seleção</button>
                  <button className="btn-primary" disabled={batchSelected.size === 0} onClick={() => setBatchModalOpen(true)}>
                    Confirmar{batchSelected.size > 0 ? ' (' + batchSelected.size + ')' : ''}
                  </button>
                </>
              )}
            </div>
            {buTorreGroups.map((buGroup) => {
              const isCollapsed = collapsedBUs.has(buGroup.bu);
              return (
                <div className="bu-group" key={buGroup.bu}>
                  <button className="bu-group-header" onClick={() => toggleBuCollapsed(buGroup.bu)}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <span className="bu-group-title">{buGroup.bu}</span>
                  </button>
                  <div className="bu-group-resumo">
                    <ResumoStats chairs={buGroup.chairs} />
                  </div>

                  {!isCollapsed && buGroup.torreGroups.map((torreGroup) => (
                    <div className="torre-group" key={torreGroup.torre || '__sem_torre__'}>
                      <div className="torre-group-title">{torreGroup.torre || 'Sem torre'}</div>
                      {levelsOf(torreGroup.chairs).map((l) => (
                        <div className="level-section" key={l.key}>
                          <div className={'level-label level-' + l.key}>
                            {cargoLabel(l.key)} <span className="level-count">{l.chairs.length}</span>
                          </div>
                          <div className="chair-grid">
                            {l.chairs.map((c) => (
                              <ChairCard
                                key={c.id}
                                chair={c}
                                selected={selectedId === c.id}
                                onClick={() => chairClick(c.id)}
                                batchMode={batchMode}
                                batchPicked={batchSelected.has(c.id)}
                                highlighted={hasRecentMerito(c.id, movements)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
            {buTorreGroups.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma posição encontrada com os filtros atuais.</p>
            )}
          </div>
        </div>

        {batchMode ? (
          <aside className="panel">
            <h2>Modo de seleção</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              Clique nas posições disponíveis (não ocupadas/extintas/em contratação) para incluí-las no lote. {batchSelected.size} selecionada(s).
            </p>
          </aside>
        ) : (
          <SidePanel
            chair={selectedChair}
            onClose={() => setSelectedId(null)}
            bolsao={bolsao}
            bolsaoCap={bolsaoCap}
            setModal={setModal}
            onVagaAction={handleVagaAction}
          />
        )}
      </div>

      {batchModalOpen && (
        <BatchModal
          vagas={chairs.filter((c) => batchSelected.has(c.id))}
          onClose={() => setBatchModalOpen(false)}
          onDone={() => { setBatchModalOpen(false); cancelBatch(); }}
        />
      )}

      {modal?.type === 'gerenciar' && (
        <GerenciarVagaModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={closeModal}
          onAction={(type) => setModal({
            type: type === 'contratar' ? 'confirmContratacao' : type,
            chairId: modal.chairId,
            ...(type === 'incorporar' ? { presetOrigemId: modal.chairId } : {})
          })}
        />
      )}

      {modal?.type === 'gerenciarOcupada' && (
        <GerenciarOcupadaModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onAction={(type) => setModal({ type, chairId: modal.chairId })}
        />
      )}

      {modal?.type === 'confirmContratacao' && (
        <ConfirmModal
          title="Deseja iniciar o processo de contratação?"
          message={chairs.find((c) => c.id === modal.chairId)?.id + ' segue reservada e vai pedir os dados da contratação a seguir.'}
          confirmLabel="Sim"
          onConfirm={() => setModal({ type: 'registrarContratacao', chairId: modal.chairId })}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'registrarContratacao' && (
        <RegistrarContratacaoModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={closeModal}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'efetivarPosicao' && (
        <EfetivarPosicaoModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'promover' && (
        <PromoverModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'merito' && (
        <MeritoModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'decompor' && (
        <DecomporModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={closeModal}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'incorporar' && (
        <IncorporarModal
          presetOrigemId={modal.presetOrigemId}
          onClose={closeModal}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'aplicarBolsao' && (
        <AplicarBolsaoModal onClose={() => setModal(null)} onDone={() => setModal(null)} />
      )}

      {modal?.type === 'confirmDemitir' && confirmDemitirChair && (
        <ConfirmModal
          title={'Demitir ' + confirmDemitirChair.ocupante + '?'}
          message={confirmDemitirChair.id + ' voltará a ficar disponível, mantendo o valor de ' + fmtBRL(confirmDemitirChair.valor) + '.'}
          danger
          onConfirm={async () => { await dismissChair(confirmDemitirChair.id); setModal(null); setSelectedId(null); }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'confirmExtinguir' && confirmExtinguirChair && (
        <ConfirmModal
          title={'Extinguir ' + confirmExtinguirChair.id + '?'}
          message={wouldExceedCap
            ? 'Isso enviaria ' + fmtBRL(confirmExtinguirChair.valor) + ' ao Bolsão, ultrapassando o limite de 50% do Budget (' + fmtBRL(bolsaoCap) + '). Use "Decompor" para direcionar parte do valor a novas posições.'
            : 'O valor de ' + fmtBRL(confirmExtinguirChair.valor) + ' será enviado integralmente para o Bolsão.'}
          danger
          onConfirm={wouldExceedCap ? null : async () => { await extinguishChair(confirmExtinguirChair.id); setModal(null); setSelectedId(null); }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
