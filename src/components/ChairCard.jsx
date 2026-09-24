import { cargoLabel } from '../data/cargo';

export default function ChairCard({ chair, selected, onClick, batchMode, batchPicked }) {
  const isOcupada = chair.status === 'ocupada';
  const isExtinta = chair.status === 'extinta';
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
      {!isExtinta && <span className="status-badge">{isOcupada ? 'Ocupada' : 'Disponível'}</span>}
      <div className="icon"><svg><use href="#chair-icon" /></svg></div>
      <div className="cid">{chair.id}</div>
      <div className="ccargo">{cargoLabel(chair.cargo)}</div>
      {isOcupada && <div className="cname">{chair.ocupante}</div>}
      {isExtinta && <div className="ccargo">Extinta</div>}
    </div>
  );
}
