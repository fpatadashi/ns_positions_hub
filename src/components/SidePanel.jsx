import { useState } from 'react';
import { useAppData } from '../shared/context/AppDataContext';
import { cargoLabel } from '../shared/data/cargo';
import { fmtBRL, fmtDate, fmtDateOnly } from '../shared/lib/format';
import { usernameOf } from '../shared/lib/userIdentity';

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

export default function SidePanel({ chair, onClose, bolsao, bolsaoCap, setModal, onVagaAction }) {
  const { movements, currentUserEmail, releaseChair } = useAppData();
  const [reserveError, setReserveError] = useState('');

  async function handleVagaAction(type, extra) {
    setReserveError('');
    const res = await onVagaAction(chair.id, type, extra);
    if (res && !res.ok) setReserveError(res.msg);
  }

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

  if (chair && chair.status === 'reservada') {
    const isMine = chair.reservado_por === currentUserEmail;
    return (
      <aside className="panel">
        <h2>Resumo da Posição</h2>
        <div className="chair-detail">
          <span className="chip-id">{chair.id}</span>
          <div className="field"><span>BU</span><b>{chair.bu}</b></div>
          <div className="field"><span>Cargo</span><b>{cargoLabel(chair.cargo)}</b></div>
          <div className="field"><span>Valor</span><b>{fmtBRL(chair.valor)}</b></div>
          <div className="field">
            <span>Status</span>
            <span className="status-pill reservada">Em Contratação</span>
          </div>
          <div className="field"><span>Reservado por</span><b>{usernameOf(chair.reservado_por)}</b></div>
          {chair.reservado_em && <div className="field"><span>Desde</span><b>{fmtDate(chair.reservado_em)}</b></div>}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
          {isMine
            ? 'Efetive a posição quando a contratação for concluída, ou cancele o status pra voltar a ficar disponível.'
            : 'Esta posição está em contratação por outra pessoa — nenhuma ação é permitida nela até ser liberada.'}
        </p>
        <div className="actions">
          {isMine && (
            <>
              <button className="btn-primary" onClick={() => setModal({ type: 'efetivarPosicao', chairId: chair.id })}>Efetivar posição</button>
              <button className="btn-secondary" onClick={() => releaseChair(chair.id)}>Cancelar status</button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
        <ChairHistory chair={chair} movements={movements} />
      </aside>
    );
  }

  if (chair) {
    const isOcupada = chair.status === 'ocupada';
    return (
      <aside className="panel">
        <h2>Resumo da Posição</h2>
        <div className="chair-detail">
          <span className="chip-id">{chair.id}</span>
          <div className="field"><span>BU</span><b>{chair.bu}</b></div>
          <div className="field"><span>Cargo</span><b>{cargoLabel(chair.cargo)}</b></div>
          <div className="field"><span>Valor</span><b>{fmtBRL(chair.valor)}</b></div>
          <div className="field">
            <span>Status</span>
            <span className={'status-pill ' + chair.status}>{isOcupada ? 'Ocupada' : 'Disponível'}</span>
          </div>
          {isOcupada && <div className="field"><span>Ocupante</span><b>{chair.ocupante}</b></div>}
        </div>

        <div className="chair-detail" style={{ marginTop: 4 }}>
          <div className="field"><span>Torre</span><b>{chair.torre || 'Não informado'}</b></div>
          <div className="field"><span>Empresa</span><b>{chair.empresa || 'Não informado'}</b></div>
          <div className="field"><span>Disciplina</span><b>{chair.disciplina || 'Não informado'}</b></div>
          <div className="field"><span>Data início</span><b>{fmtDateOnly(chair.data_inicio) || 'Não informado'}</b></div>
          <div className="field"><span>Data fim</span><b>{fmtDateOnly(chair.data_fim) || 'Não informado'}</b></div>
        </div>

        {reserveError && <div className="modal-error">{reserveError}</div>}

        <div className="actions">
          {isOcupada ? (
            <button className="btn-primary" onClick={() => setModal({ type: 'gerenciarOcupada', chairId: chair.id })}>Gerenciar</button>
          ) : (
            <button className="btn-primary" onClick={() => handleVagaAction('gerenciar')}>Gerenciar</button>
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
