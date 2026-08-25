import { useState } from 'react';
import Modal from './Modal';
import DestinoFields from './DestinoFields';
import { useAppData } from '../../context/AppDataContext';
import { TORRES, CARGO_ORDER, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';

export default function IncorporarModal({ presetOrigemId, onClose, onDone }) {
  const { chairs, incorporarChair } = useAppData();
  const vagas = chairs.filter((c) => c.status === 'vaga');

  const [origemId, setOrigemId] = useState(
    presetOrigemId && vagas.some((c) => c.id === presetOrigemId) ? presetOrigemId : (vagas[0]?.id || '')
  );
  const [destTipo, setDestTipo] = useState('nova');
  const [destTorre, setDestTorre] = useState(TORRES[0]);
  const [destCargo, setDestCargo] = useState(CARGO_ORDER[0]);
  const [destChairId, setDestChairId] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (vagas.length === 0) {
    return (
      <Modal onClose={onClose}>
        <h3>Incorporar</h3>
        <p className="modal-sub">Não há cadeiras vagas disponíveis para incorporar.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </Modal>
    );
  }

  const origem = chairs.find((c) => c.id === origemId);
  const otherVagas = vagas.filter((c) => c.id !== origemId);
  const v = parseFloat(valor) || 0;

  let msg = '';
  let valid = true;
  if (v <= 0) {
    msg = 'Informe um valor maior que zero.';
    valid = false;
  } else if (v > Number(origem.valor) + 0.001) {
    msg = 'O valor não pode ser maior que o disponível em ' + origem.id + ' (' + fmtBRL(origem.valor) + ').';
    valid = false;
  } else if (destTipo === 'existente' && !destChairId) {
    msg = 'Selecione a cadeira de destino.';
    valid = false;
  } else {
    const restante = Number(origem.valor) - v;
    msg = 'Restará em ' + origem.id + ': ' + fmtBRL(restante) + (restante <= 0.001 ? ' (será extinta)' : '');
  }

  async function confirm() {
    setBusy(true);
    try {
      const destInfo = destTipo === 'nova' ? { torre: destTorre, cargo: destCargo } : { chairId: destChairId };
      const res = await incorporarChair(origem.id, destTipo, destInfo, v);
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Incorporar</h3>
      <p className="modal-sub">Move valor de uma cadeira vaga (origem) para criar ou aumentar outra (destino).</p>
      <div className="modal-section">
        <label className="modal-label">Vaga a incorporar (origem)</label>
        <select value={origemId} onChange={(e) => { setOrigemId(e.target.value); setDestChairId(''); }}>
          {vagas.map((c) => (
            <option key={c.id} value={c.id}>{c.id} — {cargoLabel(c.cargo)} ({c.torre}) — {fmtBRL(c.valor)}</option>
          ))}
        </select>
      </div>
      <DestinoFields
        destTipo={destTipo} setDestTipo={setDestTipo}
        destTorre={destTorre} setDestTorre={setDestTorre}
        destCargo={destCargo} setDestCargo={setDestCargo}
        destChairId={destChairId} setDestChairId={setDestChairId}
        otherVagas={otherVagas}
      />
      <div className="modal-section">
        <label className="modal-label">Valor a incorporar</label>
        <input type="number" min="0" step="100" value={valor} onChange={(e) => setValor(e.target.value)} />
      </div>
      <div className="modal-summary">
        {valid ? msg : <span className="modal-error">{msg}</span>}
        {error && <div className="modal-error">{error}</div>}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Confirmar incorporação'}</button>
      </div>
    </Modal>
  );
}
