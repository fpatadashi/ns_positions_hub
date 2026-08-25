export default function Modal({ children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">{children}</div>
    </div>
  );
}
