import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react';
import Modal from './Modal';

const STEP_ICON = {
  pending: <Circle size={16} className="import-step-icon-pending" />,
  skipped: <Circle size={16} className="import-step-icon-pending" />,
  running: <Loader2 size={16} className="save-status-spin import-step-icon-running" />,
  done: <CheckCircle2 size={16} className="import-step-icon-done" />,
  error: <XCircle size={16} className="import-step-icon-error" />
};

// Tela de status ao Importar Excel: mostra cada etapa da validação (ler
// arquivo, validar colunas, criar coluna nova se houver, importar linhas) com
// seu próprio ícone de progresso — se uma etapa falhar, para ali, mostra o
// erro (com "Mais" pro detalhe completo) e um botão pra cancelar e repetir.
export default function ImportStatusModal({ steps, phase, confirmMessage, onConfirmColumns, onCancel, errorMessage, errorDetail }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Modal onClose={phase === 'running' ? () => {} : onCancel}>
      <h3 style={{ marginBottom: 4 }}>Importando Excel</h3>
      <p className="modal-sub">Validação em etapas — se algo falhar, a etapa fica marcada e o erro aparece detalhado abaixo.</p>

      <div className="import-steps">
        {steps.map((s) => (
          <div className={'import-step import-step-' + s.status} key={s.key}>
            {STEP_ICON[s.status]}
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {phase === 'confirm-columns' && (
        <div style={{ marginTop: 4 }}>
          <p className="modal-sub" style={{ whiteSpace: 'pre-line', marginBottom: 14 }}>{confirmMessage}</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
            <button className="btn-primary" onClick={onConfirmColumns}>Criar e importar</button>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ marginTop: 4 }}>
          <p className="modal-error" style={{ marginBottom: showMore ? 8 : 14 }}>{errorMessage}</p>
          {!showMore ? (
            <button className="btn-link" onClick={() => setShowMore(true)}>Mais</button>
          ) : (
            <pre className="save-status-detail">{errorDetail}</pre>
          )}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCancel}>Cancelar e voltar</button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <p style={{ color: '#16A34A', fontWeight: 700, marginTop: 4 }}>Tudo certo — importação concluída.</p>
      )}
    </Modal>
  );
}
