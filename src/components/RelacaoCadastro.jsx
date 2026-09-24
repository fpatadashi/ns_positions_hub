import { useRef, useState } from 'react';
import { exportRows, parseFile } from '../lib/excelIO';

export default function RelacaoCadastro({ items, onImportRows, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const rows = await parseFile(file);
      await onImportRows(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    exportRows(items.map((i) => ({ bu: i.bu, torre: i.torre, empresa: i.empresa })), 'Configuracoes_Cadastros_RelacaoBTE.xlsx');
  }

  return (
    <div className="rules" style={{ maxWidth: 820 }}>
      <div className="cadastro-header">
        <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>Relação BU / Torre / Empresa</h2>
        <div className="cadastro-header-actions">
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={busy}>Importar Excel</button>
          <button className="btn-secondary" onClick={handleExport} disabled={items.length === 0}>Exportar Excel</button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: -8, marginBottom: 16 }}>
        Define a cascata BU → Torre → Empresa usada nos formulários de nova vaga. Colunas esperadas no Excel: <code>bu</code>, <code>torre</code>, <code>empresa</code>.
      </p>

      {error && <div className="modal-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="table-wrap">
        <table className="mov-table">
          <thead>
            <tr>
              <th>BU</th>
              <th>Torre</th>
              <th>Empresa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhum registro ainda — importe o Excel de relação.</td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.id}>
                  <td className="strong">{i.bu}</td>
                  <td>{i.torre}</td>
                  <td>{i.empresa}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-link" onClick={() => onDelete(i.id)}>Remover</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
