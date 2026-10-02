const MES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function ultimosMeses(qtd) {
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

export function ativaNoMes(chair, mes) {
  if (!chair.data_inicio) return false;
  const inicio = new Date(chair.data_inicio);
  if (inicio > mes.fim) return false;
  if (chair.data_fim) {
    const fim = new Date(chair.data_fim);
    if (fim < mes.inicio) return false;
  }
  return true;
}
