import { useAppData } from '../context/AppDataContext';
import { cargoLabel } from '../data/cargo';
import { fmtBRL } from '../lib/format';
import { torresPermitidas, empresasPermitidas } from '../lib/relacao';

function ChairHistory({ chair, movements }) {
  const related = movements.filter((m) => m.origem_id === chair.id || m.destino_id === chair.id);
  const grouped = [];
  const byTipo = {};
  related.forEach((m) => {
    const otherId = m.origem_id === chair.id ? m.destino_id : m.origem_id;
    if (!otherId) return;
    if (!byTipo[m.tipo]) {
      byTipo[m.tipo] = { tipo: m.tipo, items: [] };
      grouped.push(byTipo[m.tipo]);
    }
    byTipo[m.tipo].items.push({ id: otherId, valor: m.valor });
  });

  return (
    <div className="chair-history">
      <h2>Histórico de movimentação</h2>
      {grouped.length === 0 ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Nenhuma movimentação registrada para esta cadeira ainda.</p>
      ) : (
        <div className="history-lines">
          {grouped.map((g) => (
            <div className="history-line" key={g.tipo}>
              <strong>{g.tipo}:</strong> {g.items.map((i) => i.id + '(' + fmtBRL(i.valor) + ')').join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidePanel({ chair, onClose, bolsao, bolsaoCap, setModal }) {
  const { torreList, empresaList, relacaoBte, disciplinas, movements, updateChairFields } = useAppData();

  if (chair && chair.status === 'extinta') {
    return (
      <aside className="panel">
        <h2>Cadeira extinta</h2>
        <div className="chair-detail">
          <span className="chip-id">{chair.id}</span>
          <div className="field"><span>BU</span><b>{chair.bu}</b></div>
          <div className="field"><span>Cargo</span><b>{cargoLabel(chair.cargo)}</b></div>
          <div className="field"><span>Valor (na extinção)</span><b>{fmtBRL(chair.valor || 0)}</b></div>
        </div>
        <ChairHistory chair={chair} movements={movements} />
        <div className="actions">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </aside>
    );
  }

  if (chair) {
    const isOcupada = chair.status === 'ocupada';
    const torreOpts = torresPermitidas(relacaoBte, chair.bu, torreList);
    const empresaOpts = empresasPermitidas(relacaoBte, chair.bu, chair.torre, empresaList);
    return (
      <aside className="panel">
        <h2>Detalhe da cadeira</h2>
        <div className="chair-detail">
          <span className="chip-id">{chair.id}</span>
          <div className="field"><span>BU</span><b>{chair.bu}</b></div>
          <div className="field"><span>Cargo</span><b>{cargoLabel(chair.cargo)}</b></div>
          <div className="field"><span>Valor</span><b>{fmtBRL(chair.valor)}</b></div>
          <div className="field">
            <span>Status</span>
            <span className={'status-pill ' + chair.status}>{isOcupada ? 'Ocupada' : 'Vaga'}</span>
          </div>
          {isOcupada && <div className="field"><span>Ocupante</span><b>{chair.ocupante}</b></div>}
        </div>

        <div className="modal-section" style={{ marginBottom: 0 }}>
          <label className="modal-label">Torre</label>
          <select
            value={chair.torre || ''}
            onChange={(e) => updateChairFields(chair.id, { torre: e.target.value || null, empresa: null })}
          >
            <option value="">— Sem torre —</option>
            {torreOpts.map((t) => <option key={t.nome} value={t.nome}>{t.nome}</option>)}
          </select>
        </div>
        <div className="modal-section" style={{ marginBottom: 0, marginTop: 10 }}>
          <label className="modal-label">Empresa</label>
          <select value={chair.empresa || ''} onChange={(e) => updateChairFields(chair.id, { empresa: e.target.value || null })}>
            <option value="">— Sem empresa —</option>
            {empresaOpts.map((e) => <option key={e.nome} value={e.nome}>{e.nome}</option>)}
          </select>
        </div>
        <div className="modal-section" style={{ marginBottom: 0, marginTop: 10 }}>
          <label className="modal-label">Disciplina</label>
          <select value={chair.disciplina || ''} onChange={(e) => updateChairFields(chair.id, { disciplina: e.target.value || null })}>
            <option value="">— Sem disciplina —</option>
            {disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="vigencia-row">
          <div className="modal-section" style={{ marginBottom: 0 }}>
            <label className="modal-label">Data início</label>
            <input
              type="date"
              value={chair.data_inicio || ''}
              onChange={(e) => updateChairFields(chair.id, { data_inicio: e.target.value || null })}
            />
          </div>
          <div className="modal-section" style={{ marginBottom: 0 }}>
            <label className="modal-label">Data fim</label>
            <input
              type="date"
              value={chair.data_fim || ''}
              onChange={(e) => updateChairFields(chair.id, { data_fim: e.target.value || null })}
            />
          </div>
        </div>

        <div className="actions">
          {isOcupada ? (
            <>
              <button className="btn-gold" onClick={() => setModal({ type: 'promover', chairId: chair.id })}>Promover</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'merito', chairId: chair.id })}>Aplicar mérito</button>
              <button className="btn-danger" onClick={() => setModal({ type: 'confirmDemitir', chairId: chair.id })}>Demitir</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => setModal({ type: 'contratar', chairId: chair.id })}>Contratar</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'decompor', chairId: chair.id })}>Decompor</button>
              <button className="btn-secondary" onClick={() => setModal({ type: 'incorporar', presetOrigemId: chair.id })}>Incorporar</button>
              <button className="btn-danger" onClick={() => setModal({ type: 'confirmExtinguir', chairId: chair.id })}>Extinguir</button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>

        <ChairHistory chair={chair} movements={movements} />
      </aside>
    );
  }

  const pct = Math.min(100, (bolsao / bolsaoCap) * 100);
  return (
    <aside className="panel">
      <h2>Bolsão</h2>
      <div className="chair-detail">
        <div className="field"><span>Saldo atual</span><b>{fmtBRL(bolsao)}</b></div>
        <div className="field"><span>Teto (50% do budget)</span><b>{fmtBRL(bolsaoCap)}</b></div>
        <div className="bolsao-bar"><div className="fill" style={{ width: pct + '%' }} /></div>
      </div>
      <div className="actions">
        <button className="btn-primary" disabled={bolsao <= 0} onClick={() => setModal({ type: 'aplicarBolsao' })}>Aplicar do Bolsão</button>
        <button className="btn-secondary" onClick={() => setModal({ type: 'incorporar', presetOrigemId: null })}>Incorporar</button>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Clique em uma cadeira para ver detalhes e ações.</p>
    </aside>
  );
}
