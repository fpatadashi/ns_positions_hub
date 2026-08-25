import { TORRES, CARGO_ORDER, CARGO_INFO, cargoLabel } from '../../data/cargo';
import { fmtBRL } from '../../lib/format';

export default function DestinoFields({
  destTipo, setDestTipo,
  destTorre, setDestTorre,
  destCargo, setDestCargo,
  destChairId, setDestChairId,
  otherVagas
}) {
  return (
    <div className="modal-section">
      <label className="modal-label">Destino</label>
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
          <select value={destTorre} onChange={(e) => setDestTorre(e.target.value)}>
            {TORRES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={{ marginTop: 8 }} value={destCargo} onChange={(e) => setDestCargo(e.target.value)}>
            {CARGO_ORDER.map((k) => <option key={k} value={k}>{CARGO_INFO[k].label}</option>)}
          </select>
        </>
      ) : (
        <select value={destChairId} onChange={(e) => setDestChairId(e.target.value)}>
          {otherVagas.length === 0
            ? <option value="">Nenhuma outra vaga disponível</option>
            : otherVagas.map((c) => (
                <option key={c.id} value={c.id}>{c.id} — {cargoLabel(c.cargo)} ({c.torre}) — {fmtBRL(c.valor)}</option>
              ))}
        </select>
      )}
    </div>
  );
}
