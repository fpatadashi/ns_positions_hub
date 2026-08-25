import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../context/AppDataContext';
import { CARGO_ORDER, CARGO_INFO, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';

export default function PromoverModal({ chair, onClose, onDone }) {
  const { bolsao, promoteChair } = useAppData();
  const idx = CARGO_ORDER.indexOf(chair.cargo);
  const higher = CARGO_ORDER.slice(idx + 1);
  const [newCargo, setNewCargo] = useState(higher[0] || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (higher.length === 0) {
    return (
      <Modal onClose={onClose}>
        <h3>Promover {chair.ocupante}</h3>
        <p className="modal-sub">{chair.id} já está no nível máximo (C-Level). Não há cargo superior disponível.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </Modal>
    );
  }

  const delta = CARGO_INFO[newCargo].valor - chair.valor;
  const valid = delta <= bolsao;

  async function confirm() {
    setBusy(true);
    try {
      const res = await promoteChair(chair.id, newCargo);
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Promover {chair.ocupante}</h3>
      <p className="modal-sub">Cargo atual: {cargoLabel(chair.cargo)} ({fmtBRL(chair.valor)})</p>
      <div className="modal-section">
        <label className="modal-label">Novo cargo</label>
        <select value={newCargo} onChange={(e) => setNewCargo(e.target.value)}>
          {higher.map((k) => (
            <option key={k} value={k}>{CARGO_INFO[k].label} — {fmtBRL(CARGO_INFO[k].valor)}</option>
          ))}
        </select>
      </div>
      <div className="modal-summary">
        Diferença financiada pelo Bolsão: <strong>{fmtBRL(delta)}</strong> (saldo do Bolsão: {fmtBRL(bolsao)})
        {!valid && <div className="modal-error">Bolsão insuficiente para esta promoção.</div>}
        {error && <div className="modal-error">{error}</div>}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-gold" disabled={!valid || busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Confirmar promoção'}</button>
      </div>
    </Modal>
  );
}
