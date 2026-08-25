import Modal from './Modal';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmar', danger, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose}>
      <h3>{title}</h3>
      <p className="modal-sub">{message}</p>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>{onConfirm ? 'Cancelar' : 'Fechar'}</button>
        {onConfirm && (
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        )}
      </div>
    </Modal>
  );
}
