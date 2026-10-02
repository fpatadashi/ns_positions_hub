import { useEffect, useState } from 'react';
import { fetchTableCatalog } from '../../../shared/lib/fieldMapping';
import { SYSTEM_VARIABLES } from '../../../shared/data/systemVariables';
import { logError, formatErrorEntry } from '../../../shared/lib/errorLog';
import SaveStatusModal from '../../../components/modals/SaveStatusModal';

// "Associação de Tabelas" — matriz Campo (variável do sistema) x Aplicativo x
// Tabela x Coluna: diz de onde cada conceito repetido pelo app (BU, Torre,
// Empresa, Cargo...) deve vir, pra sobreviver a um rename de coluna sem
// quebrar a tela que consome aquele campo (ver src/shared/lib/fieldMapping.js).
export default function AssociacaoTabelasCadastro({ items, cadastro }) {
  const [catalog, setCatalog] = useState(new Map());
  const [catalogError, setCatalogError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftRows, setDraftRows] = useState([]);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveErrorDetail, setSaveErrorDetail] = useState('');

  useEffect(() => {
    fetchTableCatalog()
      .then(setCatalog)
      .catch((e) => {
        logError(e, { where: 'AssociacaoTabelasCadastro.fetchTableCatalog' });
        setCatalogError(e.message);
      });
  }, []);

  const tableNames = Array.from(catalog.keys()).sort();

  function startEdit() {
    setDraftRows(items.map((i) => ({ id: i.id, campo: i.campo, aplicativo: i.aplicativo, tabela: i.tabela, coluna: i.coluna })));
    setError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraftRows([]);
    setError('');
  }

  function addRow() {
    setDraftRows((prev) => [...prev, { id: null, campo: SYSTEM_VARIABLES[0], aplicativo: '', tabela: '', coluna: '' }]);
  }

  function removeRow(idx) {
    setDraftRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function setField(idx, field, value) {
    setDraftRows((prev) => prev.map((r, i) => {
      if (i !== idx) return r;
      if (field === 'tabela') return { ...r, tabela: value, coluna: '' };
      return { ...r, [field]: value };
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaveStatus('saving');
    try {
      const draftIds = new Set(draftRows.filter((r) => r.id != null).map((r) => r.id));
      for (const item of items) {
        if (!draftIds.has(item.id)) await cadastro.removeRaw(item.id);
      }
      for (const row of draftRows) {
        const payload = {
          campo: row.campo.trim(),
          aplicativo: row.aplicativo.trim(),
          tabela: row.tabela.trim(),
          coluna: row.coluna.trim()
        };
        if (!payload.campo || !payload.aplicativo || !payload.tabela || !payload.coluna) {
          throw new Error('Preencha Campo, Aplicativo, Tabela e Coluna em todas as linhas antes de salvar.');
        }
        if (row.id == null) await cadastro.insertRow(payload);
        else await cadastro.updateRow(row.id, payload);
      }
      await cadastro.refresh();
      setEditing(false);
      setDraftRows([]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      const entry = logError(e, { where: 'AssociacaoTabelasCadastro.handleSave' });
      setError(e.message);
      setSaveErrorDetail(formatErrorEntry(entry));
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const displayRows = editing ? draftRows : items;

  return (
    <div className="rules" style={{ maxWidth: 'none' }}>
      <div className="cadastro-header">
        <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>Associação de Tabelas</h2>
        <div className="cadastro-header-actions">
          {!editing ? (
            <button className="btn-secondary" onClick={startEdit}>Alterar</button>
          ) : (
            <>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn-secondary" onClick={cancelEdit} disabled={saving}>Cancelar</button>
            </>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: -8, marginBottom: 16 }}>
        {editing
          ? 'Modo de edição: escolha de onde cada variável do sistema deve vir. Nada é gravado até clicar em Salvar.'
          : 'Diz, por variável do sistema (BU, Torre, Empresa, Cargo...) e por tela do app, de qual tabela e coluna reais aquele conceito deve vir. Trocar a associação aqui não altera nada no banco — só onde a tela vai buscar o dado.'}
      </p>

      {catalogError && (
        <div className="modal-error" style={{ marginBottom: 12 }}>
          Não foi possível carregar o catálogo de tabelas/colunas: {catalogError}
        </div>
      )}
      {error && <div className="modal-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="table-wrap">
        <table className="mov-table estrutura-resizable">
          <thead>
            <tr>
              <th className="estrutura-th"><span className="estrutura-th-label">CAMPO (VARIÁVEL DO SISTEMA)</span></th>
              <th className="estrutura-th"><span className="estrutura-th-label">APLICATIVO / TELA</span></th>
              <th className="estrutura-th"><span className="estrutura-th-label">TABELA</span></th>
              <th className="estrutura-th"><span className="estrutura-th-label">COLUNA</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhuma associação cadastrada ainda.</td></tr>
            ) : (
              displayRows.map((row, idx) => (
                <tr key={row.id ?? 'new-' + idx}>
                  <td className="estrutura-td">
                    {editing ? (
                      <select className="estrutura-td-input" value={row.campo} onChange={(e) => setField(idx, 'campo', e.target.value)}>
                        {SYSTEM_VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : row.campo}
                  </td>
                  <td className="estrutura-td" title={editing ? undefined : row.aplicativo}>
                    {editing ? (
                      <input
                        className="estrutura-td-input"
                        value={row.aplicativo}
                        placeholder="Ex.: Estrutura, Positions..."
                        onChange={(e) => setField(idx, 'aplicativo', e.target.value)}
                      />
                    ) : row.aplicativo}
                  </td>
                  <td className="estrutura-td" title={editing ? undefined : row.tabela}>
                    {editing ? (
                      <select className="estrutura-td-input" value={row.tabela} onChange={(e) => setField(idx, 'tabela', e.target.value)}>
                        <option value="">Selecione…</option>
                        {tableNames.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : row.tabela}
                  </td>
                  <td className="estrutura-td" title={editing ? undefined : row.coluna}>
                    {editing ? (
                      <select className="estrutura-td-input" value={row.coluna} onChange={(e) => setField(idx, 'coluna', e.target.value)} disabled={!row.tabela}>
                        <option value="">Selecione…</option>
                        {(catalog.get(row.tabela) || []).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : row.coluna}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {editing && <button className="btn-link" onClick={() => removeRow(idx)}>Remover</button>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={addRow}>+ Nova associação</button>
      )}

      {saveStatus && (
        <SaveStatusModal
          status={saveStatus}
          errorMessage={error}
          errorDetail={saveErrorDetail}
          onClose={() => setSaveStatus(null)}
        />
      )}
    </div>
  );
}
