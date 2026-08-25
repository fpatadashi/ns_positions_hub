export function fmtBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(isoString) {
  const d = new Date(isoString);
  const p2 = (n) => (n < 10 ? '0' + n : '' + n);
  return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
}
