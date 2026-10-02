import { Star } from 'lucide-react';
import { cargoLabel } from '../shared/data/cargo';
import { usernameOf } from '../shared/lib/userIdentity';

export default function ChairCard({ chair, selected, onClick, batchMode, batchPicked, highlighted }) {
  const isOcupada = chair.status === 'ocupada';
  const isExtinta = chair.status === 'extinta';
  const isReservada = chair.status === 'reservada';
  const batchDisabled = batchMode && chair.status !== 'vaga';

  const classes = ['chair-card', 'status-' + chair.status];
  if (selected) classes.push('selected');
  if (batchPicked) classes.push('batch-picked');
  if (batchDisabled) classes.push('batch-disabled');

  return (
    <div
      className={classes.join(' ')}
      data-id={chair.id}
      onClick={batchDisabled ? undefined : onClick}
    >
      {!isExtinta && (
        <span className="status-badge">
          <span className="dot" />
          {isOcupada ? 'Ocupada' : isReservada ? 'Em Contratação' : 'Disponível'}
        </span>
      )}
      {highlighted && (
        <span className="chair-highlight-badge" title="Destaque recente">
          <Star size={11} fill="currentColor" />
        </span>
      )}
      <div className="icon"><svg><use href="#chair-icon" /></svg></div>
      <div className="cid">{chair.id}</div>
      <div className="ccargo">{cargoLabel(chair.cargo)}</div>
      {isOcupada && <div className="cname">{chair.ocupante}</div>}
      {isReservada && <div className="cname">{usernameOf(chair.reservado_por)}</div>}
      {isExtinta && <div className="ccargo">Extinta</div>}
    </div>
  );
}
