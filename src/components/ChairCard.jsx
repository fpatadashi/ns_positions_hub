import { cargoLabel } from '../data/cargo';

export default function ChairCard({ chair, selected, onClick }) {
  const isOcupada = chair.status === 'ocupada';
  return (
    <div
      className={'chair-card status-' + chair.status + (selected ? ' selected' : '')}
      data-id={chair.id}
      onClick={onClick}
    >
      <span className="status-badge">{isOcupada ? 'Ocupada' : 'Disponível'}</span>
      <div className="icon"><svg><use href="#chair-icon" /></svg></div>
      <div className="cid">{chair.id}</div>
      <div className="ccargo">{cargoLabel(chair.cargo)}</div>
      {isOcupada && <div className="cname">{chair.ocupante}</div>}
    </div>
  );
}
