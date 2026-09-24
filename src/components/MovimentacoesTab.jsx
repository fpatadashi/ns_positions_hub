import { useAppData } from '../context/AppDataContext';
import { TAG_CLASS } from '../data/cargo';
import { fmtBRL, fmtDate } from '../lib/format';

export default function MovimentacoesTab() {
  const { movements, loading } = useAppData();

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;

  return (
    <div className="table-wrap">
      <table className="mov-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Data/Hora</th>
            <th>Tipo</th>
            <th>BU</th>
            <th>Cadeira(s)</th>
            <th>Cargo</th>
            <th>Valor</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma movimentação ainda.</td></tr>
          ) : (
            movements.map((m, i) => (
              <tr key={m.id}>
                <td className="num">{movements.length - i}</td>
                <td className="num">{fmtDate(m.created_at)}</td>
                <td><span className={'tag ' + (TAG_CLASS[m.tipo] || 'tag-inicial')}>{m.tipo}</span></td>
                <td>{m.bu}</td>
                <td className="strong">{m.cadeiras}</td>
                <td>{m.cargo}</td>
                <td className="num">{fmtBRL(m.valor)}</td>
                <td>{m.detalhes}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
