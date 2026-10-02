import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../shared/context/AppDataContext';
import { cargoLabel } from '../../shared/data/cargo';
import { fmtBRL } from '../../shared/lib/format';

// Conclui de verdade uma contratação em andamento (posição "Em Contratação")
// — pede o nome de quem foi efetivamente contratado e chama `hireChair`, que
// vira a cadeira "Ocupada" e limpa a reserva.
export default function EfetivarPosicaoModal({ chair, onClose, onDone }) {
  const { hireChair } = useAppData();
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const res = await hireChair(chair.id, nome.trim());
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Efetivar posição</h3>
      <div className="modal-preview" style={{ marginBottom: 16 }}>
        {chair.id} — {cargoLabel(chair.cargo)} ({fmtBRL(chair.valor)})
      </div>
      <div className="modal-section">
        <label className="modal-label">Nome do colaborador contratado</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" autoFocus />
      </div>
      {error && <div className="modal-error">{error}</div>}
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!nome.trim() || busy} onClick={confirm}>{busy ? 'Efetivando…' : 'Efetivar'}</button>
      </div>
    </Modal>
  );
}
