import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { TORRES, CARGO_ORDER, cargoLabel } from '../data/cargo';
import { fmtBRL } from '../lib/format';
import ChairCard from './ChairCard';
import SidePanel from './SidePanel';
import ContratarModal from './modals/ContratarModal';
import PromoverModal from './modals/PromoverModal';
import MeritoModal from './modals/MeritoModal';
import DecomporModal from './modals/DecomporModal';
import IncorporarModal from './modals/IncorporarModal';
import AplicarBolsaoModal from './modals/AplicarBolsaoModal';
import ConfirmModal from './modals/ConfirmModal';

export default function EstruturaTab() {
  const { chairs, bolsao, budgetTotal, bolsaoCap, loading, error, dismissChair, extinguishChair } = useAppData();
  const [torreTab, setTorreTab] = useState(TORRES[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;
  if (error) return <p className="modal-error" style={{ textAlign: 'center' }}>Erro ao carregar dados: {error}</p>;

  const active = chairs.filter((c) => c.status !== 'extinta');
  const alocado = active.reduce((a, c) => a + Number(c.valor), 0);
  const ocupadas = active.filter((c) => c.status === 'ocupada').length;
  const vagas = active.filter((c) => c.status === 'vaga').length;
  const extintas = chairs.filter((c) => c.status === 'extinta').length;
  const pct = Math.min(100, (bolsao / bolsaoCap) * 100);

  const selectedChair = selectedId ? active.find((c) => c.id === selectedId) : null;

  function selectChair(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const cards = [
    { lbl: 'Budget total', num: fmtBRL(budgetTotal), sub: 'fixo, conservado' },
    { lbl: 'Alocado em cadeiras', num: fmtBRL(alocado), sub: active.length + ' cadeiras ativas' },
    { lbl: 'Bolsão', num: fmtBRL(bolsao), sub: 'teto ' + fmtBRL(bolsaoCap), bar: pct },
    { lbl: 'Ocupadas', num: ocupadas, sub: 'com pessoa alocada' },
    { lbl: 'Vagas', num: vagas, sub: 'disponíveis' },
    { lbl: 'Extintas', num: extintas, sub: 'histórico' }
  ];

  const torreChairs = active.filter((c) => c.torre === torreTab);
  const torreOcupadas = torreChairs.filter((c) => c.status === 'ocupada').length;
  const torreVagas = torreChairs.filter((c) => c.status === 'vaga').length;
  const torreSubtotal = torreChairs.reduce((a, c) => a + Number(c.valor), 0);

  const levels = CARGO_ORDER.slice().reverse()
    .map((key) => ({ key, chairs: torreChairs.filter((c) => c.cargo === key) }))
    .filter((l) => l.chairs.length > 0);

  const confirmDemitirChair = modal?.type === 'confirmDemitir' ? chairs.find((c) => c.id === modal.chairId) : null;
  const confirmExtinguirChair = modal?.type === 'confirmExtinguir' ? chairs.find((c) => c.id === modal.chairId) : null;
  const wouldExceedCap = confirmExtinguirChair && bolsao + Number(confirmExtinguirChair.valor) > bolsaoCap + 0.001;

  return (
    <div>
      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.lbl}>
            <div className="lbl">{c.lbl}</div>
            <div className="num">{c.num}</div>
            <div className="sub">{c.sub}</div>
            {c.bar !== undefined && (
              <div className="bolsao-bar"><div className="fill" style={{ width: c.bar + '%' }} /></div>
            )}
          </div>
        ))}
      </div>

      <div className="conservation-note">
        Conservação — alocado ({fmtBRL(alocado)}) + Bolsão ({fmtBRL(bolsao)}) = {fmtBRL(alocado + bolsao)} (Budget Total: {fmtBRL(budgetTotal)})
      </div>

      <div className="torre-subtabs">
        {TORRES.map((t) => {
          const tChairs = active.filter((c) => c.torre === t);
          const tOcupadas = tChairs.filter((c) => c.status === 'ocupada').length;
          return (
            <button
              key={t}
              className={'torre-subtab' + (torreTab === t ? ' active' : '')}
              onClick={() => { setTorreTab(t); setSelectedId(null); }}
            >
              {t}<span className="subtab-count">{tOcupadas}/{tChairs.length}</span>
            </button>
          );
        })}
      </div>

      <div className="stage">
        <div className="torres-col">
          <div className="torre-card">
            <div className="torre-header">
              <h3>{torreTab}</h3>
              <div className="meta">{torreOcupadas} ocupadas · {torreVagas} vagas · subtotal {fmtBRL(torreSubtotal)}</div>
            </div>
            <div className="level-eyebrow">Níveis de cargo</div>
            {levels.map((l) => (
              <div className="level-section" key={l.key}>
                <div className={'level-label level-' + l.key}>
                  {cargoLabel(l.key)} <span className="level-count">{l.chairs.length}</span>
                </div>
                <div className="chair-grid">
                  {l.chairs.map((c) => (
                    <ChairCard key={c.id} chair={c} selected={selectedId === c.id} onClick={() => selectChair(c.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <SidePanel
          chair={selectedChair}
          onClose={() => setSelectedId(null)}
          bolsao={bolsao}
          bolsaoCap={bolsaoCap}
          setModal={setModal}
        />
      </div>

      {modal?.type === 'contratar' && (
        <ContratarModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}

      {modal?.type === 'promover' && (
        <PromoverModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}

      {modal?.type === 'merito' && (
        <MeritoModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}

      {modal?.type === 'decompor' && (
        <DecomporModal
          chair={chairs.find((c) => c.id === modal.chairId)}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'incorporar' && (
        <IncorporarModal
          presetOrigemId={modal.presetOrigemId}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setSelectedId(null); }}
        />
      )}

      {modal?.type === 'aplicarBolsao' && (
        <AplicarBolsaoModal onClose={() => setModal(null)} onDone={() => setModal(null)} />
      )}

      {modal?.type === 'confirmDemitir' && confirmDemitirChair && (
        <ConfirmModal
          title={'Demitir ' + confirmDemitirChair.ocupante + '?'}
          message={confirmDemitirChair.id + ' voltará a ficar vaga, mantendo o valor de ' + fmtBRL(confirmDemitirChair.valor) + '.'}
          danger
          onConfirm={async () => { await dismissChair(confirmDemitirChair.id); setModal(null); setSelectedId(null); }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'confirmExtinguir' && confirmExtinguirChair && (
        <ConfirmModal
          title={'Extinguir ' + confirmExtinguirChair.id + '?'}
          message={wouldExceedCap
            ? 'Isso enviaria ' + fmtBRL(confirmExtinguirChair.valor) + ' ao Bolsão, ultrapassando o limite de 50% do Budget (' + fmtBRL(bolsaoCap) + '). Use "Decompor" para direcionar parte do valor a novas vagas.'
            : 'O valor de ' + fmtBRL(confirmExtinguirChair.valor) + ' será enviado integralmente para o Bolsão.'}
          danger
          onConfirm={wouldExceedCap ? null : async () => { await extinguishChair(confirmExtinguirChair.id); setModal(null); setSelectedId(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
