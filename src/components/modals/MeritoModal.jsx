import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../context/AppDataContext';
import { fmtBRL } from '../../lib/format';

export default function MeritoModal({ chair, onClose, onDone }) {
  const { bolsao, meritoStandalone } = useAppData();
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const v = parseFloat(valor) || 0;
  const valid = v > 0 && v <= bolsao;

  async function confirm() {
    setBusy(true);
    try {
      const res = await meritoStandalone(chair.id, v);
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Aumento de mérito — {chair.ocupante}</h3>
      <p className="modal-sub">{chair.id} · valor atual {fmtBRL(chair.valor)} · saldo do Bolsão: {fmtBRL(bolsao)}</p>
      <div className="modal-section">
        <label className="modal-label">Valor do aumento</label>
        <input type="number" min="0" step="100" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex: 500" />
      </div>
      <div className="modal-summary">
        {v > bolsao
          ? <div className="modal-error">Bolsão insuficiente (disponível {fmtBRL(bolsao)}).</div>
          : v <= 0
            ? 'Informe um valor maior que zero.'
            : <>Novo valor da cadeira: <strong>{fmtBRL(chair.valor + v)}</strong></>}
        {error && <div className="modal-error">{error}</div>}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Aplicando…' : 'Aplicar mérito'}</button>
      </div>
    </Modal>
  );
}
