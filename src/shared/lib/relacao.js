// Cascata BU -> Torre -> Empresa a partir da tabela relacao_bte. Se a relação
// ainda não foi importada (ou não tem linha para o BU/Torre escolhido), cai
// para "todas as opções" em vez de travar a tela numa lista vazia.
//
// As opções vêm direto dos nomes distintos em relacao_bte (não da interseção
// com os cadastros separados de torre/empresa) — assim a cascata funciona
// assim que a Relação é importada, mesmo que o cadastro de Torre (que só
// serve pra atribuir código) ainda esteja vazio ou com nomes diferentes.

export function torresPermitidas(relacao, buNome, torreList) {
  if (!buNome) return torreList;
  const nomes = [...new Set(relacao.filter((r) => r.bu === buNome).map((r) => r.torre))];
  if (nomes.length === 0) return torreList;
  return nomes.map((nome) => torreList.find((t) => t.nome === nome) || { nome, codigo: nome });
}

export function empresasPermitidas(relacao, buNome, torreNome, empresaList) {
  if (!buNome || !torreNome) return empresaList;
  const nomes = [...new Set(
    relacao.filter((r) => r.bu === buNome && r.torre === torreNome).map((r) => r.empresa)
  )];
  if (nomes.length === 0) return empresaList;
  return nomes.map((nome) => empresaList.find((e) => e.nome === nome) || { nome, codigo: nome });
}
