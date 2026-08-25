export const CARGO_ORDER = ['aprendiz', 'junior', 'analista', 'gerente', 'clevel'];

export const CARGO_INFO = {
  aprendiz: { label: 'Aprendiz', valor: 1800 },
  junior: { label: 'Júnior', valor: 3500 },
  analista: { label: 'Analista', valor: 6000 },
  gerente: { label: 'Gerente', valor: 12000 },
  clevel: { label: 'C-Level', valor: 25000 }
};

export const TORRES = ['Corporate', 'Embarcador', 'PSL'];

export const TORRE_PREFIX = { Corporate: 'COR', Embarcador: 'EMB', PSL: 'PSL' };

export function cargoLabel(key) {
  return CARGO_INFO[key] ? CARGO_INFO[key].label : key;
}

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
