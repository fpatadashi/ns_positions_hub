import { useState } from 'react';
import { useAppData } from '../../shared/context/AppDataContext';
import { cargoLabel } from '../../shared/data/cargo';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { buSummary, filterPositions, STATUS_LABEL } from './idManagementLogic';
import './idmanagement.css';

export default function IdBudgetPage() {
  const { chairs, buList, loading, error, gerarIdsOrcamento } = useAppData();
  const [query, setQuery] = useState('');
  const [confirmBu, setConfirmBu] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;
  if (error) return <p className="modal-error" style={{ textAlign: 'center' }}>Erro ao carregar dados: {error}</p>;

  const summary = buSummary(chairs, buList);
  const filtered = filterPositions(chairs, query, cargoLabel)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  async function handleGerar() {
    setBusy(true);
    setErrMsg('');
    try {
      await gerarIdsOrcamento(confirmBu.nome, confirmBu.faltam);
      setConfirmBu(null);
    } catch (e) {
      setErrMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>ID para Budget</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.86rem', marginTop: -6 }}>
        Acompanhe quantos IDs cada BU já tem (ocupados e disponíveis) e complete até 300 por BU com novos IDs de Orçamento.
      </p>

      <div className="idmgmt-bu-grid">
        {summary.map((b) => (
          <div className="idmgmt-bu-card" key={b.nome}>
            <div className="idmgmt-bu-nome">{b.nome}</div>
            <div className="idmgmt-bu-nums">
              <span className="num">{b.total}</span>
              <span className="lbl">de 300 IDs já existentes</span>
            </div>
            {b.faltam > 0 ? (
              <button className="btn-primary" onClick={() => setConfirmBu(b)}>
                Gerar {b.faltam} novo(s) ID(s)
              </button>
            ) : (
              <span className="idmgmt-bu-completo">Meta completa</span>
            )}
          </div>
        ))}
        {summary.length === 0 && (
          <p style={{ color: 'var(--text-faint)' }}>Nenhuma BU cadastrada. Cadastre uma em Importação → BU.</p>
        )}
      </div>

      <div className="idmgmt-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por ID, BU, Torre, Empresa, Cargo, Ocupante ou Status…"
        />
      </div>

      <div className="idmgmt-table-wrap">
        <table className="idmgmt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>BU</th>
              <th>Torre</th>
              <th>Empresa</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ocupante</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="mono">{c.id}</td>
                <td>{c.bu}</td>
                <td>{c.torre || '—'}</td>
                <td>{c.empresa || '—'}</td>
                <td>{cargoLabel(c.cargo)}</td>
                <td><span className={'idmgmt-status idmgmt-status-' + c.status}>{STATUS_LABEL[c.status] || c.status}</span></td>
                <td>{c.ocupante || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma posição encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmBu && (
        <ConfirmModal
          title={'Gerar ' + confirmBu.faltam + ' novo(s) ID(s) para ' + confirmBu.nome + '?'}
          message={
            'Isso cria ' + confirmBu.faltam + ' posição(ões) nova(s), tipo Orçamento, status Disponível, cargo Aprendiz ' +
            '(ajustável depois em cada posição) — completando ' + confirmBu.nome + ' até 300 IDs.' +
            (errMsg ? ' ' + errMsg : '')
          }
          confirmLabel={busy ? 'Gerando…' : 'Gerar'}
          onConfirm={handleGerar}
          onClose={() => { setConfirmBu(null); setErrMsg(''); }}
        />
      )}
    </div>
  );
}
