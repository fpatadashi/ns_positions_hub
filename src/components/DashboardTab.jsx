import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { fmtBRL } from '../lib/format';

const MES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function ultimosMeses(qtd) {
  const hoje = new Date();
  const meses = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
    const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    meses.push({
      key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      label: MES_LABEL[d.getMonth()] + '/' + String(d.getFullYear()).slice(2),
      inicio,
      fim
    });
  }
  return meses;
}

function ativaNoMes(chair, mes) {
  if (!chair.data_inicio) return false;
  const inicio = new Date(chair.data_inicio);
  if (inicio > mes.fim) return false;
  if (chair.data_fim) {
    const fim = new Date(chair.data_fim);
    if (fim < mes.inicio) return false;
  }
  return true;
}

export default function DashboardTab() {
  const { chairs, disciplinas, buList, loading } = useAppData();
  const [buFiltro, setBuFiltro] = useState('todas');
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('todas');

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</p>;

  const active = chairs.filter((c) => c.status !== 'extinta');
  const filtered = active.filter((c) => {
    if (buFiltro !== 'todas' && c.bu !== buFiltro) return false;
    if (disciplinaFiltro !== 'todas' && (c.disciplina || '') !== disciplinaFiltro) return false;
    return true;
  });

  const hc = filtered.filter((c) => c.status === 'ocupada').length;
  const vagas = filtered.filter((c) => c.status === 'vaga').length;
  const savingVagas = filtered.filter((c) => c.status === 'vaga').reduce((a, c) => a + Number(c.valor), 0);
  const custoOcupado = filtered.filter((c) => c.status === 'ocupada').reduce((a, c) => a + Number(c.valor), 0);

  const porBu = buList.map((b) => {
    const bChairs = filtered.filter((c) => c.bu === b.nome);
    return {
      bu: b.nome,
      hc: bChairs.filter((c) => c.status === 'ocupada').length,
      vagas: bChairs.filter((c) => c.status === 'vaga').length,
      saving: bChairs.filter((c) => c.status === 'vaga').reduce((a, c) => a + Number(c.valor), 0)
    };
  });

  const meses = ultimosMeses(12);
  const porMes = meses.map((mes) => {
    const ativas = filtered.filter((c) => ativaNoMes(c, mes));
    return {
      mes,
      hc: ativas.filter((c) => c.status === 'ocupada').length,
      vagas: ativas.filter((c) => c.status === 'vaga').length,
      custo: ativas.reduce((a, c) => a + Number(c.valor), 0)
    };
  });
  const semDataInicio = filtered.filter((c) => !c.data_inicio).length;

  return (
    <div className="dash-panel">
      <div className="dash-filters">
        <div className="dash-filter">
          <label className="modal-label">BU</label>
          <select value={buFiltro} onChange={(e) => setBuFiltro(e.target.value)}>
            <option value="todas">Todas as BUs</option>
            {buList.map((b) => <option key={b.nome} value={b.nome}>{b.nome}</option>)}
          </select>
        </div>
        <div className="dash-filter">
          <label className="modal-label">Disciplina</label>
          <select value={disciplinaFiltro} onChange={(e) => setDisciplinaFiltro(e.target.value)}>
            <option value="todas">Todas as disciplinas</option>
            {disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="lbl">HC</div>
          <div className="num">{hc}</div>
          <div className="sub">cadeiras ocupadas</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Vagas</div>
          <div className="num">{vagas}</div>
          <div className="sub">cadeiras disponíveis</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Saving de vagas</div>
          <div className="num">{fmtBRL(savingVagas)}</div>
          <div className="sub">budget de vagas não preenchidas</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Custo do HC</div>
          <div className="num">{fmtBRL(custoOcupado)}</div>
          <div className="sub">budget de cadeiras ocupadas</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="mov-table">
          <thead>
            <tr>
              <th>BU</th>
              <th>HC</th>
              <th>Vagas</th>
              <th>Saving de vagas</th>
            </tr>
          </thead>
          <tbody>
            {porBu.map((r) => (
              <tr key={r.bu}>
                <td className="strong">{r.bu}</td>
                <td className="num">{r.hc}</td>
                <td className="num">{r.vagas}</td>
                <td className="num">{fmtBRL(r.saving)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dash-section-title">
        <h2 style={{ margin: '28px 0 4px' }}>Cadeiras mês a mês</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: '0 0 14px' }}>
          Baseado na Data início/Data fim cadastrada em cada cadeira (aba Estrutura) — usa o status atual da
          cadeira, não reconstrói o status histórico daquele mês.
          {semDataInicio > 0 && ' ' + semDataInicio + ' cadeira(s) sem Data início ainda não aparecem aqui.'}
        </p>
      </div>

      <div className="table-wrap">
        <table className="mov-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>HC</th>
              <th>Vagas</th>
              <th>Custo total</th>
            </tr>
          </thead>
          <tbody>
            {porMes.map((r) => (
              <tr key={r.mes.key}>
                <td className="strong">{r.mes.label}</td>
                <td className="num">{r.hc}</td>
                <td className="num">{r.vagas}</td>
                <td className="num">{fmtBRL(r.custo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
