import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../context/AppDataContext';
import { cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';

export default function ContratarModal({ chair, onClose, onDone }) {
  const { hireChair } = useAppData();
  const [nome, setNome] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    try {
      await hireChair(chair.id, nome);
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Contratar para {chair.id}</h3>
      <p className="modal-sub">{cargoLabel(chair.cargo)} · {chair.bu} · {fmtBRL(chair.valor)}</p>
      <div className="modal-section">
        <label className="modal-label">Nome do(a) colaborador(a)</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ana Souza" />
      </div>
      {error && <div className="modal-error">{error}</div>}
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={busy} onClick={confirm}>{busy ? 'Contratando…' : 'Contratar'}</button>
      </div>
    </Modal>
  );
}
