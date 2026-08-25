import { useState } from 'react';
import Modal from './Modal';
import DestinoFields from './DestinoFields';
import { useAppData } from '../../context/AppDataContext';
import { TORRES, CARGO_ORDER, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';

export default function DecomporModal({ chair, onClose, onDone }) {
  const { chairs, decomposeChair } = useAppData();
  const [destTipo, setDestTipo] = useState('nova');
  const [destTorre, setDestTorre] = useState(TORRES[0]);
  const [destCargo, setDestCargo] = useState(CARGO_ORDER[0]);
  const [destChairId, setDestChairId] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const otherVagas = chairs.filter((c) => c.status === 'vaga' && c.id !== chair.id);
  const v = parseFloat(valor) || 0;

  let msg = '';
  let valid = true;
  if (v <= 0) {
    msg = 'Informe um valor maior que zero.';
    valid = false;
  } else if (v > Number(chair.valor) + 0.001) {
    msg = 'O valor não pode ser maior que o disponível (' + fmtBRL(chair.valor) + ').';
    valid = false;
  } else if (destTipo === 'existente' && !destChairId) {
    msg = 'Selecione a cadeira de destino.';
    valid = false;
  } else {
    const restante = Number(chair.valor) - v;
    msg = 'Restará em ' + chair.id + ': ' + fmtBRL(restante) + (restante <= 0.001 ? ' (cadeira será extinta)' : '');
  }

  async function confirm() {
    setBusy(true);
    try {
      const destInfo = destTipo === 'nova' ? { torre: destTorre, cargo: destCargo } : { chairId: destChairId };
      const res = await decomposeChair(chair.id, destTipo, destInfo, v);
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Decompor {chair.id}</h3>
      <p className="modal-sub">Origem: <strong>{chair.id}</strong> · {cargoLabel(chair.cargo)} · {chair.torre} · valor disponível {fmtBRL(chair.valor)}</p>
      <DestinoFields
        destTipo={destTipo} setDestTipo={setDestTipo}
        destTorre={destTorre} setDestTorre={setDestTorre}
        destCargo={destCargo} setDestCargo={setDestCargo}
        destChairId={destChairId} setDestChairId={setDestChairId}
        otherVagas={otherVagas}
      />
      <div className="modal-section">
        <label className="modal-label">Valor a decompor</label>
        <input type="number" min="0" step="100" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={'Ex: ' + chair.valor} />
      </div>
      <div className="modal-summary">
        {valid ? msg : <span className="modal-error">{msg}</span>}
        {error && <div className="modal-error">{error}</div>}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Confirmar decomposição'}</button>
      </div>
    </Modal>
  );
}
