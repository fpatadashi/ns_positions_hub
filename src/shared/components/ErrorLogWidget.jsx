import { useEffect, useState } from 'react';
import { Bug, X, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getErrorLog, subscribeErrorLog, clearErrorLog, formatErrorEntry } from '../lib/errorLog';
import './errorLogWidget.css';

// Ícone discreto no canto inferior direito, em toda tela do app (montado uma
// vez em main.jsx). Só ele visível por padrão; clicar abre o painel com o
// histórico de erros, pra copiar e colar numa IA ajustar.
export default function ErrorLogWidget() {
  const [entries, setEntries] = useState(() => getErrorLog());
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeErrorLog(setEntries), []);

  async function copyAll() {
    const text = entries.length
      ? entries.map(formatErrorEntry).join('\n\n---\n\n')
      : 'Nenhum erro registrado.';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard indisponível — sem feedback além de não marcar "copiado".
    }
  }

  return (
    <div className="error-log-widget">
      {open && (
        <div className="error-log-panel">
          <div className="error-log-panel-header">
            <span>Log de erros{entries.length > 0 ? ` (${entries.length})` : ''}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <button className="error-log-icon-btn" onClick={copyAll} title="Copiar tudo">
                {copied ? 'Copiado!' : <Copy size={14} />}
              </button>
              <button className="error-log-icon-btn" onClick={clearErrorLog} title="Limpar log">
                <Trash2 size={14} />
              </button>
              <button className="error-log-icon-btn" onClick={() => setOpen(false)} title="Fechar">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="error-log-panel-body">
            {entries.length === 0 && <p className="error-log-empty">Nenhum erro registrado ainda.</p>}
            {entries.map((e) => {
              const isExpanded = expandedId === e.id;
              return (
                <div className="error-log-entry" key={e.id}>
                  <button className="error-log-entry-head" onClick={() => setExpandedId(isExpanded ? null : e.id)}>
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <span className="error-log-entry-time">{new Date(e.time).toLocaleTimeString('pt-BR')}</span>
                    <span className="error-log-entry-msg">{e.message}</span>
                  </button>
                  {isExpanded && <pre className="error-log-entry-detail">{formatErrorEntry(e)}</pre>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button
        className={'error-log-fab' + (entries.length > 0 ? ' has-errors' : '')}
        onClick={() => setOpen((v) => !v)}
        title="Log de erros"
      >
        <Bug size={18} />
        {entries.length > 0 && <span className="error-log-badge">{entries.length > 99 ? '99+' : entries.length}</span>}
      </button>
    </div>
  );
}
