// Transforma um cabecalho de planilha (acentuado, com espacos/simbolos) num
// nome de coluna Postgres seguro: sem acento, minusculo, snake_case, nunca
// comecando com digito. Cabecalho vazio (celula em branco) vira string vazia
// - quem chama deve descartar essas colunas antes de oferecer a criacao.
export function sanitizeColumnName(header) {
  const semAcento = String(header ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  let nome = semAcento
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (nome && /^[0-9]/.test(nome)) nome = 'c_' + nome;
  return nome;
}
