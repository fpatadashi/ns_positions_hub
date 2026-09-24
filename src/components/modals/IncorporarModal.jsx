import { useState } from 'react';
import Modal from './Modal';
import DestinoFields from './DestinoFields';
import { useAppData } from '../../context/AppDataContext';
import { CARGO_ORDER, cargoLabel, MIN_CARGO_VALOR } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';
import { previewNewId, previewCompositionId } from '../../lib/chairActions';

export default function IncorporarModal({ presetOrigemId, onClose, onDone }) {
  const { chairs, buList, torreList, empresaList, relacaoBte, incorporarChair } = useAppData();
  const vagas = chairs.filter((c) => c.status === 'vaga');

  const [origemId, setOrigemId] = useState(
    presetOrigemId && vagas.some((c) => c.id === presetOrigemId) ? presetOrigemId : (vagas[0]?.id || '')
  );
  const [destTipo, setDestTipo] = useState('nova');
  const [destBu, setDestBu] = useState(buList[0]?.nome || '');
  const [destTorre, setDestTorre] = useState('');
  const [destEmpresa, setDestEmpresa] = useState('');
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
  const destChair = destChairId ? otherVagas.find((c) => c.id === destChairId) : null;
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
  } else if (destTipo === 'nova' && !destEmpresa) {
    msg = 'Selecione a empresa da nova vaga.';
    valid = false;
  } else if (v < Number(origem.valor) - 0.001 && Number(origem.valor) - v < MIN_CARGO_VALOR) {
    msg = 'O valor restante (' + fmtBRL(Number(origem.valor) - v) + ') ficaria abaixo do menor cargo (' + fmtBRL(MIN_CARGO_VALOR) + '). Mova o valor total ou deixe pelo menos esse valor.';
    valid = false;
  }

  const restante = Number(origem.valor) - v;
  const extinta = valid && restante <= 0.001;
  const novoIdOrigem = valid && !extinta ? previewCompositionId(origem.id) : null;
  const novoIdDestino = valid && destTipo === 'nova' ? previewNewId({ chairs, buList, empresaList }, destBu, 'C') : null;

  async function confirm() {
    setBusy(true);
    try {
      const destInfo = destTipo === 'nova' ? { bu: destBu, torre: destTorre, empresa: destEmpresa, cargo: destCargo } : { chairId: destChairId };
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

      <div className="modal-section">
        <label className="modal-label">Vaga a incorporar</label>
        <select value={origemId} onChange={(e) => { setOrigemId(e.target.value); setDestChairId(''); }}>
          {vagas.map((c) => (
            <option key={c.id} value={c.id}>{c.id} — {cargoLabel(c.cargo)} ({c.bu}) — {fmtBRL(c.valor)}</option>
          ))}
        </select>
        <div className="modal-preview" style={{ marginTop: 10, marginBottom: 0 }}>
          Selecionada: <strong>{origem.id}</strong> — {cargoLabel(origem.cargo)} ({fmtBRL(origem.valor)})
        </div>
      </div>

      <DestinoFields
        label="Incorporar em"
        destTipo={destTipo} setDestTipo={setDestTipo}
        destBu={destBu} setDestBu={setDestBu}
        destTorre={destTorre} setDestTorre={setDestTorre}
        destEmpresa={destEmpresa} setDestEmpresa={setDestEmpresa}
        destCargo={destCargo} setDestCargo={setDestCargo}
        destChairId={destChairId} setDestChairId={setDestChairId}
        buList={buList}
        torreList={torreList}
        empresaList={empresaList}
        relacaoBte={relacaoBte}
        otherVagas={otherVagas}
      />

      <div className="modal-section">
        <label className="modal-label">Valor a incorporar</label>
        <input type="number" min="0" step="100" value={valor} onChange={(e) => setValor(e.target.value)} />
      </div>

      <div className="modal-resumo">
        <div className="resumo-titulo">Resumo</div>
        {!valid ? (
          <div className="modal-error" style={{ marginTop: 0 }}>{msg}</div>
        ) : (
          <>
            {destTipo === 'nova' ? (
              <div>Vaga criada: <strong>{novoIdDestino}</strong> — {cargoLabel(destCargo)} ({fmtBRL(v)}).</div>
            ) : (
              <div>Vaga aumentada: <strong>{destChair.id}</strong> — {cargoLabel(destChair.cargo)} (novo valor {fmtBRL(Number(destChair.valor) + v)}).</div>
            )}
            <div>
              Vaga incorporada: <strong>{origem.id}</strong> — {cargoLabel(origem.cargo)} ({fmtBRL(origem.valor)}){' '}
              {extinta
                ? <span className="tag-extinta">— Extinta.</span>
                : <span className="tag-restante">— restante {fmtBRL(restante)}, novo id {novoIdOrigem}.</span>}
            </div>
          </>
        )}
        {error && <div className="modal-error">{error}</div>}
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Confirmar incorporação'}</button>
      </div>
    </Modal>
  );
}
