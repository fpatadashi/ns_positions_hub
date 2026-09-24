import { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../../context/AppDataContext';
import { CARGO_ORDER, CARGO_INFO, cargoLabel, MIN_CARGO_VALOR } from '../../data/cargo';
import { fmtBRL, fmtNum } from '../../lib/format';
import { previewNewId, previewCompositionId, nextLoteId } from '../../lib/chairActions';
import { torresPermitidas, empresasPermitidas } from '../../lib/relacao';

function Field({ title, children }) {
  return (
    <div className="field-block">
      <div className="field-title">{title}</div>
      {children}
    </div>
  );
}

export default function BatchModal({ vagas, onClose, onDone }) {
  const {
    chairs, movements, buList, torreList, empresaList, relacaoBte,
    extinguishChair, moverValorVaga
  } = useAppData();

  const [loteId] = useState(() => nextLoteId(movements));
  const decomporDisabled = vagas.length >= 2;
  const TREE_OPTIONS = [
    { key: 'decompor', label: 'Decompor', hint: 'destino: criar uma vaga nova', disabled: decomporDisabled, disabledHint: 'disponível só com 1 vaga selecionada' },
    { key: 'incorporar', label: 'Incorporar', hint: 'destino: uma das vagas selecionadas', disabled: false },
    { key: 'extinguir', label: 'Extinguir', hint: 'destino: alocar no Bolsão', disabled: false }
  ];

  const [destTree, setDestTree] = useState(decomporDisabled ? 'incorporar' : 'decompor');
  const [valores, setValores] = useState(() => Object.fromEntries(vagas.map((v) => [v.id, String(v.valor)])));
  const [bolsaoValores, setBolsaoValores] = useState(() => Object.fromEntries(vagas.map((v) => [v.id, '0'])));
  const [destBu, setDestBu] = useState(buList[0]?.nome || '');
  const [destTorre, setDestTorre] = useState('');
  const [destEmpresa, setDestEmpresa] = useState('');
  const [destCargo, setDestCargo] = useState(CARGO_ORDER[0]);
  const [destChairId, setDestChairId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const torreOpts = torresPermitidas(relacaoBte, destBu, torreList);
  const empresaOpts = empresasPermitidas(relacaoBte, destBu, destTorre, empresaList);

  // Vagas que efetivamente movem valor: em Incorporar, a receptora não move
  // valor de si mesma — só recebe as demais.
  const sourceVagas = destTree === 'incorporar' ? vagas.filter((v) => v.id !== destChairId) : vagas;

  function setValor(id, v) {
    setValores((prev) => ({ ...prev, [id]: v }));
  }
  function setBolsaoValor(id, v) {
    setBolsaoValores((prev) => ({ ...prev, [id]: v }));
  }

  let msg = '';
  let valid = true;

  if (destTree === 'incorporar' && !destChairId) {
    msg = 'Selecione a vaga que vai receber o valor das demais.';
    valid = false;
  } else if (destTree === 'decompor' && !destEmpresa) {
    msg = 'Selecione a empresa da nova vaga.';
    valid = false;
  } else if (destTree !== 'extinguir') {
    for (const v of sourceVagas) {
      const full = Number(v.valor);
      const val = parseFloat(valores[v.id]) || 0;
      const bolsaoVal = parseFloat(bolsaoValores[v.id]) || 0;
      const movido = val + bolsaoVal;
      if (movido <= 0) { msg = 'Informe um valor a mover ou a alocar no Bolsão para ' + v.id + '.'; valid = false; break; }
      if (movido > full + 0.001) { msg = 'A soma do valor a mover e do valor ao Bolsão de ' + v.id + ' não pode passar de ' + fmtBRL(full) + '.'; valid = false; break; }
      const restante = full - movido;
      if (restante > 0.001 && restante < MIN_CARGO_VALOR) {
        msg = 'O restante de ' + v.id + ' (' + fmtBRL(restante) + ') ficaria abaixo do menor cargo (' + fmtBRL(MIN_CARGO_VALOR) + '). Mova o valor total ou deixe pelo menos esse valor.';
        valid = false;
        break;
      }
    }
    if (valid && destTree === 'decompor' && (parseFloat(valores[vagas[0].id]) || 0) <= 0) {
      msg = 'A primeira vaga do lote precisa contribuir com algum valor para a nova vaga.';
      valid = false;
    }
  }

  const novoIdDestino = valid && destTree === 'decompor' ? previewNewId({ chairs, buList, empresaList }, destBu, 'C') : null;
  const totalDestino = sourceVagas.reduce((a, v) => a + (parseFloat(valores[v.id]) || 0), 0);
  const totalBolsao = destTree === 'extinguir'
    ? vagas.reduce((a, v) => a + Number(v.valor), 0)
    : sourceVagas.reduce((a, v) => a + (parseFloat(bolsaoValores[v.id]) || 0), 0);

  async function confirm() {
    setBusy(true);
    try {
      if (destTree === 'extinguir') {
        for (const v of vagas) {
          const res = await extinguishChair(v.id, loteId);
          if (!res.ok) { setError(res.msg); setBusy(false); return; }
        }
      } else if (destTree === 'decompor') {
        const [first, ...rest] = vagas;
        const v0 = parseFloat(valores[first.id]) || 0;
        const b0 = parseFloat(bolsaoValores[first.id]) || 0;
        const res0 = await moverValorVaga(first.id, 'nova', { bu: destBu, torre: destTorre, empresa: destEmpresa, cargo: destCargo }, v0, b0, loteId);
        if (!res0.ok) { setError(res0.msg); setBusy(false); return; }
        const destId = res0.destId;
        for (const v of rest) {
          const vv = parseFloat(valores[v.id]) || 0;
          const bb = parseFloat(bolsaoValores[v.id]) || 0;
          const res = await moverValorVaga(v.id, 'existente', { chairId: destId }, vv, bb, loteId);
          if (!res.ok) { setError(res.msg); setBusy(false); return; }
        }
      } else {
        for (const v of sourceVagas) {
          const vv = parseFloat(valores[v.id]) || 0;
          const bb = parseFloat(bolsaoValores[v.id]) || 0;
          const res = await moverValorVaga(v.id, 'existente', { chairId: destChairId }, vv, bb, loteId);
          if (!res.ok) { setError(res.msg); setBusy(false); return; }
        }
      }
      onDone();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const receptora = destTree === 'incorporar' && destChairId ? vagas.find((v) => v.id === destChairId) : null;

  return (
    <Modal onClose={onClose}>
      <h3>Resumo do lote #{loteId}</h3>
      <p className="modal-sub">Cada movimentação gerada por esta operação será marcada com o lote #{loteId}.</p>

      <div className="lote-block">
        <div className="lote-block-title">Vagas selecionadas</div>
        <div className="field-value">{vagas.length} vaga(s)</div>
      </div>

      <div className="lote-block">
        <div className="lote-block-title">Cenário atual</div>
        {vagas.map((v) => (
          <Field title={v.id} key={v.id}>
            <div className="field-value">{v.bu} - {v.torre || '—'} - Vaga - {fmtNum(v.valor)}</div>
          </Field>
        ))}
      </div>

      <div className="lote-block">
        <div className="lote-block-title">Cenário novo</div>

        <Field title="Destino — Decompor / Incorporar / Extinguir">
          <div className="radio-row" style={{ flexWrap: 'wrap' }}>
            {TREE_OPTIONS.map((opt) => (
              <label key={opt.key} className={opt.disabled ? 'radio-disabled' : ''}>
                <input type="radio" checked={destTree === opt.key} disabled={opt.disabled} onChange={() => setDestTree(opt.key)} />
                {' '}{opt.label}{' '}
                <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>
                  ({opt.disabled ? opt.disabledHint : opt.hint})
                </span>
              </label>
            ))}
          </div>
        </Field>

        {destTree === 'decompor' && (
          <>
            <Field title="BU">
              <select value={destBu} onChange={(e) => { setDestBu(e.target.value); setDestTorre(''); setDestEmpresa(''); }}>
                {buList.map((b) => <option key={b.nome} value={b.nome}>{b.nome}</option>)}
              </select>
              <div className="field-value">{destBu}</div>
            </Field>
            <Field title="Torre">
              <select value={destTorre} onChange={(e) => { setDestTorre(e.target.value); setDestEmpresa(''); }}>
                <option value="">— Sem torre —</option>
                {torreOpts.map((t) => <option key={t.nome} value={t.nome}>{t.nome}</option>)}
              </select>
              <div className="field-value">{destTorre || '— Sem torre —'}</div>
            </Field>
            <Field title="Empresa">
              <select value={destEmpresa} onChange={(e) => setDestEmpresa(e.target.value)}>
                <option value="">Selecione a empresa</option>
                {empresaOpts.map((e) => <option key={e.nome} value={e.nome}>{e.nome}</option>)}
              </select>
              {destEmpresa && <div className="field-value">{destEmpresa}</div>}
            </Field>
            <Field title="Cargo">
              <select value={destCargo} onChange={(e) => setDestCargo(e.target.value)}>
                {CARGO_ORDER.map((k) => <option key={k} value={k}>{CARGO_INFO[k].label}</option>)}
              </select>
              <div className="field-value">{cargoLabel(destCargo)}</div>
            </Field>
          </>
        )}

        {destTree === 'incorporar' && (
          <Field title="Vaga selecionada (receptora)">
            <select value={destChairId} onChange={(e) => setDestChairId(e.target.value)}>
              <option value="">Selecione a vaga receptora</option>
              {vagas.map((v) => (
                <option key={v.id} value={v.id}>{v.id} — {cargoLabel(v.cargo)} ({fmtBRL(v.valor)})</option>
              ))}
            </select>
            {receptora && (
              <div className="field-value">{receptora.id} — {cargoLabel(receptora.cargo)} ({fmtBRL(receptora.valor)})</div>
            )}
          </Field>
        )}

        {destTree !== 'extinguir' && sourceVagas.map((v) => {
          const val = parseFloat(valores[v.id]) || 0;
          const bolsaoVal = parseFloat(bolsaoValores[v.id]) || 0;
          return (
            <Field title={v.id} key={v.id}>
              <div className="field-value">valor total {fmtBRL(v.valor)}</div>
              <div className="lote-value-row">
                <div className="lote-value-col">
                  <label className="field-subtitle">Valor a remover (destino) — parcial ou total</label>
                  <div className="field-value-row">
                    <input type="number" min="0" step="100" value={valores[v.id]} onChange={(e) => setValor(v.id, e.target.value)} />
                    <span className="field-value-fmt">{fmtBRL(val)}</span>
                  </div>
                </div>
                <div className="lote-value-col">
                  <label className="field-subtitle">Alocar ao Bolsão</label>
                  <div className="field-value-row">
                    <input type="number" min="0" step="100" value={bolsaoValores[v.id]} onChange={(e) => setBolsaoValor(v.id, e.target.value)} />
                    <span className="field-value-fmt">{fmtBRL(bolsaoVal)}</span>
                  </div>
                </div>
              </div>
            </Field>
          );
        })}

        {destTree === 'extinguir' && (
          <Field title="Bolsão">
            <div className="field-value">Cada vaga selecionada será extinta; o valor integral de cada uma vai para o Bolsão.</div>
          </Field>
        )}
      </div>

      <div className="lote-block">
        <div className="lote-block-title">Resumo — do cenário atual para o novo</div>
        {!valid ? (
          <div className="modal-error" style={{ marginTop: 0 }}>{msg}</div>
        ) : (
          <div className="field-items">
            {destTree === 'decompor' && (
              <div><strong>{novoIdDestino}</strong> — Criada ({fmtBRL(totalDestino)}).</div>
            )}
            {destTree === 'incorporar' && (
              <div><strong>{destChairId}</strong> — Incrementad{sourceVagas.length > 1 ? 'a parcialmente' : 'a'} (+{fmtNum(totalDestino)}, novo total {fmtBRL(Number(receptora?.valor || 0) + totalDestino)}).</div>
            )}
            {destTree !== 'extinguir' && sourceVagas.map((v) => {
              const full = Number(v.valor);
              const val = parseFloat(valores[v.id]) || 0;
              const bolsaoVal = parseFloat(bolsaoValores[v.id]) || 0;
              const restante = full - val - bolsaoVal;
              const extinta = restante <= 0.001;
              return (
                <div key={v.id}>
                  <strong>{v.id}</strong> — Vaga ({fmtBRL(full)}) → {extinta
                    ? <span className="tag-extinta">Extinta.</span>
                    : <span className="tag-restante">Restante {fmtBRL(restante)}, novo id {previewCompositionId(v.id)}.</span>}
                </div>
              );
            })}
            {destTree === 'extinguir' && vagas.map((v) => (
              <div key={v.id}><strong>{v.id}</strong> — Vaga ({fmtBRL(v.valor)}) → <span className="tag-extinta">Extinta.</span></div>
            ))}
            {totalBolsao > 0.001 && (
              <div><strong>Bolsão</strong> — recebeu (+{fmtNum(totalBolsao)}).</div>
            )}
          </div>
        )}
        {error && <div className="modal-error">{error}</div>}
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={!valid || busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Confirmar operação'}</button>
      </div>
    </Modal>
  );
}
