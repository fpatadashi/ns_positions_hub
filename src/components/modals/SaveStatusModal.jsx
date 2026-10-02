import { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

// Tela de status ao clicar em Salvar: "Validando…" enquanto roda, "Tudo
// certo" por 3s e fecha sozinha em caso de sucesso, ou um resumo do erro
// com "Mais" pra ver o detalhe completo (útil pra copiar e colar numa IA).
export default function SaveStatusModal({ status, errorMessage, errorDetail, onClose }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Modal onClose={status === 'error' ? onClose : () => {}}>
      <div style={{ textAlign: 'center', padding: '10px 4px' }}>
        {status === 'saving' && (
          <>
            <Loader2 size={38} color="var(--accent)" className="save-status-spin" />
            <h3 style={{ marginTop: 14 }}>Validando e salvando…</h3>
            <p className="modal-sub">Gravando as alterações no banco de dados.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={38} color="#16A34A" />
            <h3 style={{ marginTop: 14, marginBottom: 0 }}>Tudo certo</h3>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle size={38} color="var(--danger)" />
            <h3 style={{ marginTop: 14, color: 'var(--danger)' }}>Não foi possível salvar</h3>
            <p className="modal-sub" style={{ marginBottom: showMore ? 8 : 18 }}>{errorMessage}</p>
            {!showMore ? (
              <button className="btn-link" onClick={() => setShowMore(true)}>Mais</button>
            ) : (
              <pre className="save-status-detail">{errorDetail}</pre>
            )}
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={onClose}>Fechar</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
