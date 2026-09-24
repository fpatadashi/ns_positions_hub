import * as XLSX from 'xlsx';

export function exportRows(rows, filename, sheetName = 'Dados') {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

// Copia linhas pra área de transferência em TSV — cola direto numa célula do
// Excel/Sheets, preservando colunas (diferente de um JSON.stringify solto).
export async function copyRowsToClipboard(rows, columns) {
  const header = columns.join('\t');
  const body = rows.map((r) => columns.map((c) => (r[c] ?? '')).join('\t')).join('\n');
  await navigator.clipboard.writeText(header + '\n' + body);
}

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(firstSheet, { defval: '' }));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
