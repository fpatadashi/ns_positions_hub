import { useRef, useState } from 'react';
import { exportRows, parseFile, copyRowsToClipboard } from '../lib/excelIO';
import { sanitizeColumnName } from '../lib/columnSanitize';
import { diffNewColumns, ensureColumns } from '../lib/smartImport';
import { parseFlexibleDate } from '../lib/dates';
import ConfirmModal from './modals/ConfirmModal';

const BASE_COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'centro_custo', label: 'Centro de Custo' },
  { key: 'data_admissao', label: 'Data Admissão' },
  { key: 'data_demissao', label: 'Data Demissão' }
];
const DATE_COLUMNS = new Set(['data_admissao', 'data_demissao']);

export default function PessoaCadastro({ items, onImportRows, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);

  const baseKeys = BASE_COLUMNS.map((c) => c.key);
  const extraKeys = items.length ? Object.keys(items[0]).filter((k) => !baseKeys.includes(k)) : [];
  const columns = [...BASE_COLUMNS, ...extraKeys.map((k) => ({ key: k, label: k }))];

  function toCleanRows(rawRows) {
    return rawRows
      .map((row) => {
        const clean = {};
        Object.keys(row).forEach((header) => {
          const key = sanitizeColumnName(header);
          if (!key) return;
          const val = String(row[header] ?? '').trim();
          clean[key] = DATE_COLUMNS.has(key) ? parseFlexibleDate(val) : (val || null);
        });
        return clean;
      })
      .filter((r) => r.nome);
  }

  async function runImport(cleanRows) {
    setBusy(true);
    setError('');
    try {
      await onImportRows(cleanRows);
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
    setError('');
    try {
      const rawRows = await parseFile(file);
      const cleanRows = toCleanRows(rawRows);
      const knownColumns = items.length ? Object.keys(items[0]) : baseKeys;
      const novasColunas = diffNewColumns(rawRows, knownColumns);
      if (novasColunas.length > 0) {
        setPendingImport({ cleanRows, novasColunas });
      } else {
        await runImport(cleanRows);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function confirmPendingImport() {
    const { cleanRows, novasColunas } = pendingImport;
    setPendingImport(null);
    setBusy(true);
    setError('');
    try {
      await ensureColumns('pessoa', novasColunas);
      await runImport(cleanRows);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  function handleExport() {
    exportRows(items.map((i) => Object.fromEntries(columns.map((c) => [c.key, i[c.key]]))), 'Configuracoes_Cadastros_Pessoa.xlsx');
  }

  async function handleCopy() {
    await copyRowsToClipboard(items, columns.map((c) => c.key));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rules" style={{ maxWidth: 1100 }}>
      <div className="cadastro-header">
        <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>Cadastro de Pessoas</h2>
        <div className="cadastro-header-actions">
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={busy}>Importar Excel</button>
          <button className="btn-secondary" onClick={handleExport} disabled={items.length === 0}>Exportar Excel</button>
          <button className="btn-secondary" onClick={handleCopy} disabled={items.length === 0}>{copied ? 'Copiado!' : 'Copiar'}</button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: -8, marginBottom: 16 }}>
        Ao importar um Excel com uma coluna que ainda não existe aqui, o app avisa e cria a coluna antes de importar os dados.
      </p>

      {error && <div className="modal-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="table-wrap">
        <table className="mov-table">
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhum registro ainda.</td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.nome}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.key === 'nome' ? 'strong' : undefined}>{i[c.key]}</td>
                  ))}
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-link" onClick={() => onDelete(i.nome)}>Remover</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pendingImport && (
        <ConfirmModal
          title="Nova(s) coluna(s) no Excel"
          message={'Deseja criar\n' + pendingImport.novasColunas.map((c) => c + '.').join('\n') + '\nna tabela "pessoa"?'}
          confirmLabel="Criar e importar"
          onConfirm={confirmPendingImport}
          onClose={() => setPendingImport(null)}
        />
      )}
    </div>
  );
}
