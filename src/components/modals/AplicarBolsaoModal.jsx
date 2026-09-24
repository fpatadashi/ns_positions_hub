import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../context/AppDataContext';
import { CARGO_ORDER, CARGO_INFO, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';
import { torresPermitidas, empresasPermitidas } from '../../lib/relacao';

export default function AplicarBolsaoModal({ onClose, onDone }) {
  const { chairs, bolsao, buList, torreList, empresaList, relacaoBte, meritoStandalone, applyBolsaoNovaVaga } = useAppData();
  const occupied = chairs.filter((c) => c.status === 'ocupada');

  const [mode, setMode] = useState('merito');
  const [meritoTarget, setMeritoTarget] = useState(occupied[0]?.id || '');
  const [meritoValor, setMeritoValor] = useState('');
  const [nvBu, setNvBu] = useState(buList[0]?.nome || '');
  const [nvTorre, setNvTorre] = useState('');
  const [nvEmpresa, setNvEmpresa] = useState('');
  const [nvCargo, setNvCargo] = useState(CARGO_ORDER[0]);
  const [nvValor, setNvValor] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  let msg = '';
  let valid = true;

  if (mode === 'merito') {
    const v = parseFloat(meritoValor) || 0;
    if (!meritoTarget) { msg = 'Nenhuma cadeira ocupada disponível.'; valid = false; }
    else if (v <= 0) { msg = 'Informe um valor maior que zero.'; valid = false; }
    else if (v > bolsao) { msg = 'Bolsão insuficiente (disponível ' + fmtBRL(bolsao) + ').'; valid = false; }
    else {
      const target = chairs.find((c) => c.id === meritoTarget);
      msg = 'Novo valor de ' + meritoTarget + ': ' + fmtBRL(Number(target.valor) + v);
    }
  } else {
    const v2 = parseFloat(nvValor) || 0;
    if (!nvEmpresa) { msg = 'Selecione a empresa da nova vaga.'; valid = false; }
    else if (v2 <= 0) { msg = 'Informe um valor maior que zero.'; valid = false; }
    else if (v2 > bolsao) { msg = 'Bolsão insuficiente (disponível ' + fmtBRL(bolsao) + ').'; valid = false; }
    else msg = 'Nova vaga será criada com ' + fmtBRL(v2) + '.';
  }

  async function confirm() {
    setBusy(true);
    try {
      const res = mode === 'merito'
        ? await meritoStandalone(meritoTarget, parseFloat(meritoValor) || 0)
        : await applyBolsaoNovaVaga(nvBu, nvTorre, nvEmpresa, nvCargo, parseFloat(nvValor) || 0);
      if (!res.ok) { setError(res.msg); setBusy(false); return; }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>Aplicar do Bolsão</h3>
      <p className="modal-sub">Saldo disponível: <strong>{fmtBRL(bolsao)}</strong></p>
      <div className="radio-row">
        <label><input type="radio" checked={mode === 'merito'} onChange={() => setMode('merito')} /> Mérito em cadeira ocupada</label>
        <label><input type="radio" checked={mode === 'novaVaga'} onChange={() => setMode('novaVaga')} /> Criar nova vaga</label>
      </div>
      {mode === 'merito' ? (
        <div className="modal-section">
          <label className="modal-label">Cadeira ocupada</label>
          <select value={meritoTarget} onChange={(e) => setMeritoTarget(e.target.value)}>
            {occupied.length === 0
              ? <option value="">Nenhuma cadeira ocupada</option>
              : occupied.map((c) => (
                  <option key={c.id} value={c.id}>{c.id} — {cargoLabel(c.cargo)} ({c.bu}) — {c.ocupante}</option>
                ))}
          </select>
          <label className="modal-label" style={{ marginTop: 10 }}>Valor</label>
          <input type="number" min="0" step="100" value={meritoValor} onChange={(e) => setMeritoValor(e.target.value)} placeholder="Ex: 500" />
        </div>
      ) : (
        <div className="modal-section">
          <label className="modal-label">BU</label>
          <select value={nvBu} onChange={(e) => { setNvBu(e.target.value); setNvTorre(''); setNvEmpresa(''); }}>
            {buList.map((b) => <option key={b.nome} value={b.nome}>{b.nome}</option>)}
          </select>
          <label className="modal-label" style={{ marginTop: 10 }}>Torre</label>
          <select value={nvTorre} onChange={(e) => { setNvTorre(e.target.value); setNvEmpresa(''); }}>
            <option value="">— Sem torre —</option>
            {torresPermitidas(relacaoBte, nvBu, torreList).map((t) => <option key={t.nome} value={t.nome}>{t.nome}</option>)}
          </select>
          <label className="modal-label" style={{ marginTop: 10 }}>Empresa</label>
          <select value={nvEmpresa} onChange={(e) => setNvEmpresa(e.target.value)}>
            <option value="">Selecione a empresa</option>
            {empresasPermitidas(relacaoBte, nvBu, nvTorre, empresaList).map((e) => <option key={e.nome} value={e.nome}>{e.nome}</option>)}
          </select>
          <label className="modal-label" style={{ marginTop: 10 }}>Cargo</label>
          <select value={nvCargo} onChange={(e) => setNvCargo(e.target.value)}>
            {CARGO_ORDER.map((k) => <option key={k} value={k}>{CARGO_INFO[k].label}</option>)}
          </select>
          <label className="modal-label" style={{ marginTop: 10 }}>Valor</label>
          <input type="number" min="0" step="100" value={nvValor} onChange={(e) => setNvValor(e.target.value)} placeholder="Ex: 3000" />
        </div>
      )}
      <div className="modal-summary">
        {valid ? msg : <span className="modal-error">{msg}</span>}
        {error && <div className="modal-error">{error}</div>}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Aplicando…' : 'Aplicar'}</button>
      </div>
    </Modal>
  );
}
