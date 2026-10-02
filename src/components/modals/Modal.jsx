export default function Modal({ children, onClose, wide }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={'modal-box' + (wide ? ' modal-box-wide' : '')}>{children}</div>
    </div>
  );
}
