import Modal from './Modal';
import { useAppData } from '../../shared/context/AppDataContext';
import { cargoLabel } from '../../shared/data/cargo';
import { fmtBRL } from '../../shared/lib/format';
import { torresPermitidas, empresasPermitidas } from '../../shared/lib/relacao';

export default function GerenciarVagaModal({ chair, onClose, onAction }) {
  const { torreList, empresaList, relacaoBte, disciplinas, updateChairFields } = useAppData();

  const torreOpts = torresPermitidas(relacaoBte, chair.bu, torreList);
  const empresaOpts = empresasPermitidas(relacaoBte, chair.bu, chair.torre, empresaList);

  return (
    <Modal onClose={onClose}>
      <h3>Gerenciar posição</h3>
      <div className="modal-preview" style={{ marginBottom: 16 }}>
        Selecionada: <strong>{chair.id}</strong> — {cargoLabel(chair.cargo)} ({fmtBRL(chair.valor)})
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

      <div className="actions" style={{ marginTop: 18 }}>
        <button className="btn-primary" onClick={() => onAction('contratar')}>Contratar</button>
        <button className="btn-secondary" onClick={() => onAction('decompor')}>Decompor</button>
        <button className="btn-secondary" onClick={() => onAction('incorporar')}>Incorporar</button>
        <button className="btn-danger" onClick={() => onAction('confirmExtinguir')}>Extinguir</button>
        <button className="btn-secondary" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
