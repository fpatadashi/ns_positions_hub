import { useRef, useState } from 'react';
import { X, Plus, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { exportRows, parseFile, copyRowsToClipboard } from '../../../shared/lib/excelIO';
import { sanitizeColumnName } from '../../../shared/lib/columnSanitize';
import { diffNewColumns, ensureColumns } from '../../../shared/lib/smartImport';
import { logError, formatErrorEntry } from '../../../shared/lib/errorLog';
import SaveStatusModal from '../../../components/modals/SaveStatusModal';
import ImportStatusModal from '../../../components/modals/ImportStatusModal';

const DEFAULT_COL_WIDTH = 150;
const MIN_COL_WIDTH = 60;
const REMOVER_COL_WIDTH = 90;
const COL_ORDER_PREFIX = 'ns-position-hub:col-order:';

// Ordem de coluna é só preferência de visualização (salva no navegador,
// por tabela) — não mexe na estrutura real gravada no banco.
function loadColOrder(table) {
  try {
    const raw = window.localStorage.getItem(COL_ORDER_PREFIX + table);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveColOrder(table, order) {
  try {
    window.localStorage.setItem(COL_ORDER_PREFIX + table, JSON.stringify(order));
  } catch {
    // localStorage indisponível (modo privado, etc.) — reordenação só não persiste.
  }
}

// Aplica a ordem salva às colunas atuais: coluna nova (ainda não salva) entra
// no fim; coluna removida some sozinha (não está mais em `cols`).
function applyColOrder(cols, order) {
  if (!order || !order.length) return cols;
  const byKey = new Map(cols.map((c) => [c.key, c]));
  const ordered = order.filter((k) => byKey.has(k)).map((k) => byKey.get(k));
  const missing = cols.filter((c) => !order.includes(c.key));
  return [...ordered, ...missing];
}

// Tabela plana e livre, com modo de edição (Alterar/Salvar/Cancelar): editar
// célula, renomear/adicionar/remover coluna, adicionar/remover linha — nada
// grava no banco até Salvar. Extraído da Estrutura (Fase 13) pra reaproveitar
// em qualquer cadastro que precise desse formato (Estrutura, Contas, ...).
export default function EditableFlatTable({
  table, title, description, baseColumns, items, onDelete, cadastro, strongKey, exportFilename, headerExtra
}) {
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [importSteps, setImportSteps] = useState([]);
  const [importPhase, setImportPhase] = useState(null);
  const [importPendingData, setImportPendingData] = useState(null);
  const [importError, setImportError] = useState('');
  const [importErrorDetail, setImportErrorDetail] = useState('');
  const [colWidths, setColWidths] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [colOrder, setColOrder] = useState(() => loadColOrder(table));
  const [draggedKey, setDraggedKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveErrorDetail, setSaveErrorDetail] = useState('');
  const fileInputRef = useRef(null);

  function toggleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  }

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftColumns, setDraftColumns] = useState([]);
  const [draftRows, setDraftRows] = useState([]);

  // As colunas "base" (BASE_COLUMNS) são só um esqueleto inicial — se o
  // usuário renomear uma delas no banco, o nome antigo deixa de existir e não
  // pode continuar sendo tratado como coluna válida (senão qualquer tentativa
  // de mexer nela de novo tenta renomear algo que já não existe). Por isso a
  // lista final de colunas só considera base column que ainda existe na linha
  // real; com a tabela vazia (sem nenhuma linha pra checar), usa o esqueleto
  // inteiro como ponto de partida.
  const baseKeysAll = baseColumns.map((c) => c.key);
  const presentBaseColumns = items.length
    ? baseColumns.filter((c) => Object.prototype.hasOwnProperty.call(items[0], c.key))
    : baseColumns;
  const baseKeys = presentBaseColumns.map((c) => c.key);
  const extraKeys = items.length
    ? Object.keys(items[0]).filter((k) => !baseKeysAll.includes(k) && k !== 'id' && k !== 'updated_at')
    : [];
  const columns = [...presentBaseColumns, ...extraKeys.map((k) => ({ key: k, label: k }))];
  const orderedColumns = applyColOrder(columns, colOrder);

  // Arrastar o cabeçalho reordena só a visualização (não editing) — solta em
  // cima de outra coluna pra colocar a arrastada logo antes dela.
  function handleDropColumn(targetKey) {
    if (!draggedKey || draggedKey === targetKey) {
      setDraggedKey(null);
      setDragOverKey(null);
      return;
    }
    const current = orderedColumns.map((c) => c.key);
    const from = current.indexOf(draggedKey);
    if (from === -1 || !current.includes(targetKey)) {
      setDraggedKey(null);
      setDragOverKey(null);
      return;
    }
    current.splice(from, 1);
    current.splice(current.indexOf(targetKey), 0, draggedKey);
    setColOrder(current);
    saveColOrder(table, current);
    setDraggedKey(null);
    setDragOverKey(null);
  }

  function widthOf(key) {
    return colWidths[key] ?? DEFAULT_COL_WIDTH;
  }

  // Arrasta a borda direita do cabeçalho pra redimensionar aquela coluna —
  // pedido do usuário pra conseguir enxergar a tabela toda (8+ colunas).
  function startResize(e, key) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widthOf(key);
    function onMove(ev) {
      const next = Math.max(MIN_COL_WIDTH, startWidth + (ev.clientX - startX));
      setColWidths((prev) => ({ ...prev, [key]: next }));
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function toCleanRows(rawRows) {
    return rawRows.map((row) => {
      const clean = {};
      Object.keys(row).forEach((header) => {
        const key = sanitizeColumnName(header);
        if (!key) return;
        const val = String(row[header] ?? '').trim();
        clean[key] = val || null;
      });
      return clean;
    });
  }

  // Import Excel em etapas visíveis (ler arquivo / validar colunas / criar
  // coluna nova se houver / importar linhas) — cada etapa marca seu próprio
  // status, e um erro em qualquer uma para o fluxo ali, mostrando o motivo
  // específico em vez de só "deu erro" (ver ImportStatusModal).
  const IMPORT_STEPS = [
    { key: 'read', label: 'Lendo arquivo' },
    { key: 'validate', label: 'Validando colunas' },
    { key: 'columns', label: 'Criando coluna(s) nova(s)' },
    { key: 'insert', label: 'Importando linhas' }
  ];

  function setStepStatus(key, status) {
    setImportSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status } : s)));
  }

  function failImportStep(key, e) {
    const entry = logError(e, { where: 'EditableFlatTable.import.' + key, table });
    setStepStatus(key, 'error');
    setImportError(e.message);
    setImportErrorDetail(formatErrorEntry(entry));
    setImportPhase('error');
  }

  // Linha do Excel com um `id` que já existe na tabela ATUALIZA essa linha em
  // vez de duplicar — é o que permite exportar, editar no Excel e reimportar
  // pra atualizar de verdade. Linha sem `id` (nova, digitada direto na
  // planilha) é inserida como registro novo, igual sempre foi.
  async function doInsertRows(cleanRows) {
    try {
      setStepStatus('insert', 'running');
      const existingIds = new Set(items.map((i) => String(i.id)));
      for (const row of cleanRows) {
        const { id, ...rest } = row;
        const idStr = id != null ? String(id).trim() : '';
        if (idStr && existingIds.has(idStr)) {
          await cadastro.updateRow(Number(idStr), rest);
        } else {
          await cadastro.insertRow(rest);
        }
      }
      await cadastro.refresh();
      setStepStatus('insert', 'done');
      setImportPhase('done');
      setTimeout(() => { setImportPhase(null); setImportSteps([]); }, 3000);
    } catch (e) {
      failImportStep('insert', e);
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setImportError('');
    setImportSteps(IMPORT_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setImportPhase('running');

    let currentStep = 'read';
    try {
      setStepStatus('read', 'running');
      const rawRows = await parseFile(file);
      const cleanRows = toCleanRows(rawRows);
      setStepStatus('read', 'done');

      currentStep = 'validate';
      setStepStatus('validate', 'running');
      const knownColumns = items.length ? Object.keys(items[0]) : baseKeys;
      const novasColunas = diffNewColumns(rawRows, knownColumns);
      setStepStatus('validate', 'done');

      if (novasColunas.length > 0) {
        setImportPendingData({ cleanRows, novasColunas });
        setImportPhase('confirm-columns');
        return;
      }

      setStepStatus('columns', 'skipped');
      await doInsertRows(cleanRows);
    } catch (e) {
      failImportStep(currentStep, e);
    }
  }

  async function confirmImportColumns() {
    const { cleanRows, novasColunas } = importPendingData;
    setImportPendingData(null);
    setImportPhase('running');
    try {
      setStepStatus('columns', 'running');
      await ensureColumns(table, novasColunas);
      setStepStatus('columns', 'done');
      await doInsertRows(cleanRows);
    } catch (e) {
      failImportStep('columns', e);
    }
  }

  function cancelImport() {
    setImportPhase(null);
    setImportSteps([]);
    setImportPendingData(null);
  }

  // Inclui o `id` no export — reimportar esse arquivo depois de editado
  // reconhece o id e ATUALIZA a linha existente em vez de duplicá-la; uma
  // linha nova (sem id, digitada direto na planilha) continua sendo inserida.
  function handleExport() {
    exportRows(items.map((i) => ({ id: i.id, ...Object.fromEntries(columns.map((c) => [c.key, i[c.key]])) })), exportFilename);
  }

  async function handleCopy() {
    await copyRowsToClipboard(items, columns.map((c) => c.key));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // --- Modo de edição (Alterar / Salvar / Cancelar) --------------------
  // Colunas e linhas viram um rascunho local (não mexe no banco até Salvar).
  // Cada coluna do rascunho tem um `uid` estável — se o usuário renomear a
  // coluna, o rascunho não perde a referência de qual coluna real (dbKey) ou
  // se é uma coluna nova (dbKey null) ainda sem criar no banco.
  function startEdit() {
    // Entra na edição com a MESMA ordem visual que você já organizou
    // arrastando (orderedColumns) — não a ordem física do banco. A posição na
    // tela é só preferência de visualização; o Salvar identifica cada coluna
    // pelo dbKey, não pela posição, então isso nunca afeta o que é gravado.
    const cols = orderedColumns.map((c) => ({ uid: c.key, dbKey: c.key, label: c.label }));
    const rows = items.map((i) => ({
      id: i.id,
      values: Object.fromEntries(cols.map((c) => [c.uid, i[c.dbKey] ?? '']))
    }));
    setDraftColumns(cols);
    setDraftRows(rows);
    setError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraftColumns([]);
    setDraftRows([]);
    setError('');
  }

  function addDraftColumn() {
    const uid = 'new-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setDraftColumns((prev) => [...prev, { uid, dbKey: null, label: '' }]);
    setDraftRows((prev) => prev.map((r) => ({ ...r, values: { ...r.values, [uid]: '' } })));
  }

  function removeDraftColumn(uid) {
    setDraftColumns((prev) => prev.filter((c) => c.uid !== uid));
    setDraftRows((prev) => prev.map((r) => {
      const values = { ...r.values };
      delete values[uid];
      return { ...r, values };
    }));
  }

  function renameDraftColumn(uid, label) {
    setDraftColumns((prev) => prev.map((c) => (c.uid === uid ? { ...c, label } : c)));
  }

  function addDraftRow() {
    setDraftRows((prev) => [...prev, { id: null, values: Object.fromEntries(draftColumns.map((c) => [c.uid, ''])) }]);
  }

  function removeDraftRow(idx) {
    setDraftRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function setCellValue(idx, uid, value) {
    setDraftRows((prev) => prev.map((r, i) => (i === idx ? { ...r, values: { ...r.values, [uid]: value } } : r)));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaveStatus('saving');
    try {
      // 1) Diferenças de coluna: renomear/criar antes de mexer em linha,
      // pra já ter o nome final de cada coluna na hora de montar o payload.
      const uidToDbKey = {};
      for (const col of draftColumns) {
        const label = col.label.trim();
        if (col.dbKey === null) {
          const sanitized = sanitizeColumnName(label) || ('coluna_' + Math.random().toString(36).slice(2, 6));
          await cadastro.addColumn(sanitized);
          uidToDbKey[col.uid] = sanitized;
        } else {
          const sanitized = sanitizeColumnName(label) || col.dbKey;
          if (sanitized !== col.dbKey) {
            await cadastro.renameColumn(col.dbKey, sanitized);
          }
          uidToDbKey[col.uid] = sanitized;
        }
      }

      // Grava o dbKey resolvido de volta no rascunho assim que a coluna já
      // existe no banco com o nome novo — se um passo mais adiante falhar e
      // o usuário clicar em Salvar de novo, o retry não tenta renomear uma
      // coluna que já foi renomeada (o nome antigo não existe mais).
      setDraftColumns((prev) => prev.map((c) => ({ ...c, dbKey: uidToDbKey[c.uid] ?? c.dbKey })));

      // 2) Colunas removidas (existiam antes, não estão mais no rascunho).
      const remainingDbKeys = new Set(draftColumns.filter((c) => c.dbKey !== null).map((c) => c.dbKey));
      for (const key of baseKeys.concat(extraKeys)) {
        if (!remainingDbKeys.has(key)) await cadastro.dropColumn(key);
      }

      // 3) Linhas removidas (existiam antes, não estão mais no rascunho).
      const draftIds = new Set(draftRows.filter((r) => r.id != null).map((r) => r.id));
      for (const item of items) {
        if (!draftIds.has(item.id)) await cadastro.removeRaw(item.id);
      }

      // 4) Linhas novas/alteradas.
      for (const row of draftRows) {
        const payload = {};
        for (const col of draftColumns) {
          const dbKey = uidToDbKey[col.uid];
          const val = String(row.values[col.uid] ?? '').trim();
          payload[dbKey] = val || null;
        }
        if (row.id == null) await cadastro.insertRow(payload);
        else await cadastro.updateRow(row.id, payload);
      }

      await cadastro.refresh();
      setEditing(false);
      setDraftColumns([]);
      setDraftRows([]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      const entry = logError(e, { where: 'EditableFlatTable.handleSave', table });
      setError(e.message);
      setSaveErrorDetail(formatErrorEntry(entry));
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const displayColumns = editing ? draftColumns : orderedColumns.map((c) => ({ uid: c.key, dbKey: c.key, label: c.label }));
  let displayRows = editing
    ? draftRows
    : items.map((i) => ({ id: i.id, values: Object.fromEntries(displayColumns.map((c) => [c.uid, i[c.dbKey]])) }));

  // Ordenação só faz sentido fora do modo de edição — em edição, os índices
  // das linhas do rascunho precisam bater com removeDraftRow/setCellValue.
  if (!editing && sortKey) {
    const dir = sortDir === 'asc' ? 1 : -1;
    displayRows = [...displayRows].sort((a, b) => {
      const av = String(a.values[sortKey] ?? '');
      const bv = String(b.values[sortKey] ?? '');
      return dir * av.localeCompare(bv, 'pt-BR', { numeric: true, sensitivity: 'base' });
    });
  }

  return (
    <div className="rules" style={{ maxWidth: 'none' }}>
      <div className="cadastro-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{ color: 'var(--accent)', fontSize: '1.1rem', margin: 0 }}>{title}</h2>
          {headerExtra}
        </div>
        <div className="cadastro-header-actions">
          {!editing ? (
            <button className="btn-secondary" onClick={startEdit}>Alterar</button>
          ) : (
            <>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn-secondary" onClick={cancelEdit} disabled={saving}>Cancelar</button>
            </>
          )}
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={importPhase !== null || editing}>Importar Excel</button>
          <button className="btn-secondary" onClick={handleExport} disabled={items.length === 0 || editing}>Exportar Excel</button>
          <button className="btn-secondary" onClick={handleCopy} disabled={items.length === 0 || editing}>{copied ? 'Copiado!' : 'Copiar'}</button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: -8, marginBottom: 16 }}>
        {editing
          ? 'Modo de edição: edite células, renomeie/adicione/remova colunas, adicione/remova linhas. Nada é gravado até clicar em Salvar.'
          : description}
      </p>

      {error && <div className="modal-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="table-wrap">
        <table className="mov-table estrutura-resizable" style={{ tableLayout: 'fixed', minWidth: 0 }}>
          <colgroup>
            {displayColumns.map((c) => <col key={c.uid} style={{ width: widthOf(c.dbKey || c.uid) }} />)}
            <col style={{ width: REMOVER_COL_WIDTH }} />
          </colgroup>
          <thead>
            <tr>
              {displayColumns.map((c) => (
                <th
                  key={c.uid}
                  className={
                    'estrutura-th' +
                    (!editing && dragOverKey === c.dbKey && draggedKey && draggedKey !== c.dbKey ? ' estrutura-th-dragover' : '')
                  }
                  onDragOver={editing ? undefined : (e) => { e.preventDefault(); setDragOverKey(c.dbKey); }}
                  onDrop={editing ? undefined : (e) => { e.preventDefault(); handleDropColumn(c.dbKey); }}
                >
                  {editing ? (
                    <div className="estrutura-th-edit">
                      <input
                        className="estrutura-th-input"
                        value={c.label}
                        placeholder="Nome da coluna"
                        onChange={(e) => renameDraftColumn(c.uid, e.target.value)}
                      />
                      <button className="estrutura-th-remove" title="Remover coluna" onClick={() => removeDraftColumn(c.uid)}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="estrutura-th-view"
                        draggable
                        onDragStart={(e) => {
                          setDraggedKey(c.dbKey);
                          e.dataTransfer.effectAllowed = 'move';
                          try { e.dataTransfer.setData('text/plain', c.dbKey); } catch { /* Firefox exige setData */ }
                        }}
                        onDragEnd={() => { setDraggedKey(null); setDragOverKey(null); }}
                        onClick={() => toggleSort(c.dbKey)}
                        title="Clique para ordenar. Clique e arraste para reordenar a coluna."
                      >
                        <span className="estrutura-th-label">{c.label}</span>
                        {sortKey === c.dbKey
                          ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                          : <ArrowUpDown size={12} className="estrutura-th-sort-icon" />}
                      </button>
                      <span className="estrutura-col-resize" onMouseDown={(e) => startResize(e, c.dbKey)} />
                    </>
                  )}
                </th>
              ))}
              <th>
                {editing && (
                  <button className="btn-link" onClick={addDraftColumn} title="Nova coluna">
                    <Plus size={14} /> Coluna
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr><td colSpan={displayColumns.length + 1} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>Nenhum registro ainda.</td></tr>
            ) : (
              displayRows.map((row, idx) => (
                <tr key={row.id ?? 'new-' + idx}>
                  {displayColumns.map((c) => (
                    <td key={c.uid} className={'estrutura-td' + (!editing && c.dbKey === strongKey ? ' strong' : '')} title={editing ? undefined : (row.values[c.uid] || '')}>
                      {editing ? (
                        <input
                          className="estrutura-td-input"
                          value={row.values[c.uid] ?? ''}
                          onChange={(e) => setCellValue(idx, c.uid, e.target.value)}
                        />
                      ) : row.values[c.uid]}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right' }}>
                    {editing ? (
                      <button className="btn-link" onClick={() => removeDraftRow(idx)}>Remover</button>
                    ) : (
                      <button className="btn-link" onClick={() => onDelete(row.id)}>Remover</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={addDraftRow}>+ Nova linha</button>
      )}

      {importPhase && (
        <ImportStatusModal
          steps={importSteps}
          phase={importPhase}
          confirmMessage={importPendingData ? 'Deseja criar\n' + importPendingData.novasColunas.map((c) => c + '.').join('\n') + '\nna tabela "' + table + '"?' : ''}
          onConfirmColumns={confirmImportColumns}
          onCancel={cancelImport}
          errorMessage={importError}
          errorDetail={importErrorDetail}
        />
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
