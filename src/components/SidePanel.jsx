import { cargoLabel } from '../data/cargo';
import { fmtBRL } from '../lib/format';

export default function SidePanel({ chair, onClose, bolsao, bolsaoCap, setModal }) {
  if (chair) {
    const isOcupada = chair.status === 'ocupada';
    return (
      <aside className="panel">
        <h2>Detalhe da cadeira</h2>
        <div className="chair-detail">
          <span className="chip-id">{chair.id}</span>
          <div className="field"><span>Torre</span><b>{chair.torre}</b></div>
          <div className="field"><span>Cargo</span><b>{cargoLabel(chair.cargo)}</b></div>
          <div className="field"><span>Valor</span><b>{fmtBRL(chair.valor)}</b></div>
          <div className="field">
            <span>Status</span>
            <span className={'status-pill ' + chair.status}>{isOcupada ? 'Ocupada' : 'Vaga'}</span>
          </div>
          {isOcupada && <div className="field"><span>Ocupante</span><b>{chair.ocupante}</b></div>}
        </div>
        <div className="actions">
          {isOcupada ? (
            <>
              <button className="btn-gold" onClick={() => setModal({ type: 'promover', chairId: chair.id })}>Promover</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'merito', chairId: chair.id })}>Aplicar mérito</button>
              <button className="btn-danger" onClick={() => setModal({ type: 'confirmDemitir', chairId: chair.id })}>Demitir</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => setModal({ type: 'contratar', chairId: chair.id })}>Contratar</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'decompor', chairId: chair.id })}>Decompor</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'incorporar', presetOrigemId: chair.id })}>Incorporar</button>
              <button className="btn-danger" onClick={() => setModal({ type: 'confirmExtinguir', chairId: chair.id })}>Extinguir</button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </aside>
    );
  }

  const pct = Math.min(100, (bolsao / bolsaoCap) * 100);
  return (
    <aside className="panel">
      <h2>Bolsão</h2>
      <div className="chair-detail">
        <div className="field"><span>Saldo atual</span><b>{fmtBRL(bolsao)}</b></div>
        <div className="field"><span>Teto (50% do budget)</span><b>{fmtBRL(bolsaoCap)}</b></div>
        <div className="bolsao-bar"><div className="fill" style={{ width: pct + '%' }} /></div>
      </div>
      <div className="actions">
        <button className="btn-primary" disabled={bolsao <= 0} onClick={() => setModal({ type: 'aplicarBolsao' })}>Aplicar do Bolsão</button>
        <button className="btn-secondary" onClick={() => setModal({ type: 'incorporar', presetOrigemId: null })}>Incorporar</button>
      </div>
      <h2 style={{ marginTop: 6 }}>Legenda</h2>
      <div className="legend">
        <div className="legend-item vaga"><svg><use href="#chair-icon" /></svg> Vaga</div>
        <div className="legend-item ocupada"><svg><use href="#chair-icon" /></svg> Ocupada</div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Clique em uma cadeira para ver detalhes e ações.</p>
    </aside>
  );
}
