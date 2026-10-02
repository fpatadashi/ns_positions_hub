// Converte datas vindas de planilhas de RH pra ISO (yyyy-mm-dd), que e o que
// colunas `date` do Postgres esperam sem ambiguidade. Aceita ISO (passa
// direto), "M/D/AA" e "M/D/AAAA" (formato comum de export do RH). Ano de 2
// digitos usa a heuristica: <= 30 vira 20AA, senao 19AA.
export function parseFlexibleDate(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yy] = m;
  let ano = parseInt(yy, 10);
  if (yy.length === 2) ano = ano <= 30 ? 2000 + ano : 1900 + ano;
  const mes = String(mm).padStart(2, '0');
  const dia = String(dd).padStart(2, '0');
  return ano + '-' + mes + '-' + dia;
}
