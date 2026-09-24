import { useRef, useState } from 'react';
import { exportRows, parseFile, copyRowsToClipboard } from '../lib/excelIO';

export default function CadastroTable({ title, items, onUpsert, onDelete, onImportRows, exportFilename }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  async function handleAdd() {
    const n = nome.trim();
    const c = codigo.trim();
    if (!n || !c) return;
    setBusy(true);
    setError('');
    try {
      await onUpsert(n, c);
      setNome('');
      setCodigo('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

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
    exportRows(items.map((i) => ({ nome: i.nome, codigo: i.codigo })), exportFilename);
  }

  async function handleCopy() {
    await copyRowsToClipboard(items, ['nome', 'codigo']);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rules" style={{ maxWidth: 720 }}>
      <div className="cadastro-header">
        <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>{title}</h2>
        <div className="cadastro-header-actions">
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={busy}>Importar Excel</button>
          <button className="btn-secondary" onClick={handleExport} disabled={items.length === 0}>Exportar Excel</button>
          <button className="btn-secondary" onClick={handleCopy} disabled={items.length === 0}>{copied ? 'Copiado!' : 'Copiar'}</button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>

      <div className="cadastro-add-row">
        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        <button className="btn-primary" onClick={handleAdd} disabled={busy || !nome.trim() || !codigo.trim()}>Adicionar</button>
      </div>

      {error && <div className="modal-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="table-wrap">
        <table className="mov-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhum registro ainda.</td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.nome}>
                  <td className="strong">{i.nome}</td>
                  <td>{i.codigo}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-link" onClick={() => onDelete(i.nome)}>Remover</button>
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
