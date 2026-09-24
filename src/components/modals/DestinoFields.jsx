import { CARGO_ORDER, CARGO_INFO, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';
import { torresPermitidas, empresasPermitidas } from '../../lib/relacao';

export default function DestinoFields({
  label = 'Destino',
  destTipo, setDestTipo,
  destBu, setDestBu,
  destTorre, setDestTorre,
  destEmpresa, setDestEmpresa,
  destCargo, setDestCargo,
  destChairId, setDestChairId,
  buList,
  torreList,
  empresaList,
  relacaoBte,
  otherVagas
}) {
  const destChair = destChairId ? otherVagas.find((c) => c.id === destChairId) : null;
  const torreOpts = torresPermitidas(relacaoBte, destBu, torreList);
  const empresaOpts = empresasPermitidas(relacaoBte, destBu, destTorre, empresaList);

  function onBuChange(nome) {
    setDestBu(nome);
    setDestTorre('');
    setDestEmpresa('');
  }

  function onTorreChange(nome) {
    setDestTorre(nome);
    setDestEmpresa('');
  }

  return (
    <div className="modal-section">
      <label className="modal-label">{label}</label>
      <div className="radio-row">
        <label>
          <input type="radio" checked={destTipo === 'nova'} onChange={() => setDestTipo('nova')} /> Criar nova vaga
        </label>
        <label>
          <input
            type="radio"
            checked={destTipo === 'existente'}
            disabled={otherVagas.length === 0}
            onChange={() => setDestTipo('existente')}
          /> Cadeira vaga existente
        </label>
      </div>

      {destTipo === 'nova' ? (
        <>
          <select value={destBu} onChange={(e) => onBuChange(e.target.value)}>
            {buList.map((b) => <option key={b.nome} value={b.nome}>{b.nome}</option>)}
          </select>
          <select style={{ marginTop: 8 }} value={destTorre} onChange={(e) => onTorreChange(e.target.value)}>
            <option value="">— Sem torre —</option>
            {torreOpts.map((t) => <option key={t.nome} value={t.nome}>{t.nome}</option>)}
          </select>
          <select style={{ marginTop: 8 }} value={destEmpresa} onChange={(e) => setDestEmpresa(e.target.value)}>
            <option value="">Selecione a empresa</option>
            {empresaOpts.map((e) => <option key={e.nome} value={e.nome}>{e.nome}</option>)}
          </select>
          <select style={{ marginTop: 8 }} value={destCargo} onChange={(e) => setDestCargo(e.target.value)}>
            {CARGO_ORDER.map((k) => <option key={k} value={k}>{CARGO_INFO[k].label}</option>)}
          </select>
        </>
      ) : (
        <>
          <select value={destChairId} onChange={(e) => setDestChairId(e.target.value)}>
            {otherVagas.length === 0
              ? <option value="">Nenhuma outra vaga disponível</option>
              : otherVagas.map((c) => (
                  <option key={c.id} value={c.id}>{c.id} — {cargoLabel(c.cargo)} ({c.bu}) — {fmtBRL(c.valor)}</option>
                ))}
          </select>
          {destChair && (
            <div className="modal-preview" style={{ marginTop: 10, marginBottom: 0 }}>
              Selecionada: <strong>{destChair.id}</strong> — {cargoLabel(destChair.cargo)} ({fmtBRL(destChair.valor)})
            </div>
          )}
        </>
      )}
    </div>
  );
}
