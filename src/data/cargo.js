export const CARGO_ORDER = ['aprendiz', 'junior', 'analista', 'gerente', 'clevel'];

export const CARGO_INFO = {
  aprendiz: { label: 'Aprendiz', valor: 1800 },
  junior: { label: 'Júnior', valor: 3500 },
  analista: { label: 'Analista', valor: 6000 },
  gerente: { label: 'Gerente', valor: 12000 },
  clevel: { label: 'C-Level', valor: 25000 }
};

export function cargoLabel(key) {
  return CARGO_INFO[key] ? CARGO_INFO[key].label : key;
}

// Menor valor de cargo configurado — usado como piso do valor residual que uma
// vaga pode ficar após uma Decomposição/Incorporação parcial (ou 0, ou pelo
// menos isso). Calculado a partir de CARGO_INFO para nunca destoar dele.
export const MIN_CARGO_VALOR = Math.min(...Object.values(CARGO_INFO).map((c) => c.valor));

export const TAG_CLASS = {
  'Contratação': 'tag-contratacao',
  'Demissão': 'tag-demissao',
  'Promoção': 'tag-promocao',
  'Mérito': 'tag-merito',
  'Decomposição': 'tag-decomposicao',
  'Incorporação': 'tag-incorporacao',
  'Extinção': 'tag-extincao',
  'Aplicação de Bolsão': 'tag-bolsao',
  'Estrutura Inicial': 'tag-inicial'
};
