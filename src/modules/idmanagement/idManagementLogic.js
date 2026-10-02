// Meta de IDs por BU — inclui tudo que já existe (ocupada/disponível/em
// contratação/extinta, qualquer tipo F/O/C); o que faltar até esse número
// vira novos IDs tipo Orçamento (O) ao clicar "Gerar".
export const META_IDS_POR_BU = 300;

export function buSummary(chairs, buList) {
  return buList.map((b) => {
    const total = chairs.filter((c) => c.bu === b.nome).length;
    return { nome: b.nome, codigo: b.codigo, total, faltam: Math.max(0, META_IDS_POR_BU - total) };
  });
}

export const STATUS_LABEL = {
  ocupada: 'Ocupada',
  vaga: 'Disponível',
  reservada: 'Em Contratação',
  extinta: 'Extinta'
};

export function pessoaSummary(pessoaList) {
  const total = pessoaList.length;
  const ok = pessoaList.filter((p) => p.id_position_status === 'ok').length;
  const revisar = total - ok;
  return { total, ok, revisar };
}

export function filterPessoas(pessoaList, query, onlyRevisar) {
  const base = onlyRevisar ? pessoaList.filter((p) => p.id_position_status === 'revisar') : pessoaList;
  const q = query.trim().toLowerCase();
  if (!q) return base;
  return base.filter((p) => {
    const haystack = [p.nome, p.id_position, p.id_da_posicao, p.bu, p.torre, p.cargo_real, p.departamento, p.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

// Agrupa pessoas já filtradas em BU -> Torre, na mesma ordem do cadastro de
// BU/Torre — igual ao groupByBuTorre de Positions, só que sobre `pessoa`.
export function groupPessoasByBuTorre(pessoas, buList, torreList) {
  const buOrder = buList.map((b) => b.nome);
  const torreOrder = torreList.map((t) => t.nome);

  const presentesBu = [...new Set(pessoas.map((p) => p.bu || null))];
  presentesBu.sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    const ia = buOrder.indexOf(a), ib = buOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return presentesBu.map((bu) => {
    const doBu = pessoas.filter((p) => (p.bu || null) === bu);
    const presentesTorre = [...new Set(doBu.map((p) => p.torre || null))];
    presentesTorre.sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      const ia = torreOrder.indexOf(a), ib = torreOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    const torreGroups = presentesTorre.map((torre) => ({
      torre,
      pessoas: doBu.filter((p) => (p.torre || null) === torre).sort((a, b) => a.nome.localeCompare(b.nome))
    }));
    return { bu, pessoas: doBu, torreGroups };
  });
}

export function filterPositions(chairs, query, cargoLabel) {
  const q = query.trim().toLowerCase();
  if (!q) return chairs;
  return chairs.filter((c) => {
    const haystack = [c.id, c.bu, c.torre, c.empresa, cargoLabel(c.cargo), c.ocupante, STATUS_LABEL[c.status]]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
