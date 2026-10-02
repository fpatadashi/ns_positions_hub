// Filtra as cadeiras pelos chips (BU/Torre/Disciplina, cada um com E lógico
// entre dimensões e OU dentro da mesma dimensão) + os 3 campos de busca por
// texto (Empresa/ID/Vaga). Set vazio numa dimensão = sem filtro nela.
export function filterChairs(chairs, { bus, torres, disciplinas, empresaQuery, idQuery, vagaQuery }, cargoLabelFn) {
  const empresaQ = empresaQuery.trim().toLowerCase();
  const idQ = idQuery.trim().toLowerCase();
  const vagaQ = vagaQuery.trim().toLowerCase();

  return chairs.filter((c) => {
    if (bus.size > 0 && !bus.has(c.bu)) return false;
    if (torres.size > 0 && !torres.has(c.torre)) return false;
    if (disciplinas.size > 0 && !disciplinas.has(c.disciplina)) return false;
    if (empresaQ && !String(c.empresa || '').toLowerCase().includes(empresaQ)) return false;
    if (idQ && !c.id.toLowerCase().includes(idQ)) return false;
    if (vagaQ) {
      const matchCargo = cargoLabelFn(c.cargo).toLowerCase().includes(vagaQ);
      const matchOcupante = String(c.ocupante || '').toLowerCase().includes(vagaQ);
      if (!matchCargo && !matchOcupante) return false;
    }
    return true;
  });
}

// Contagem de um chip (ex.: BU "Corporativo"): total x ocupadas, sempre sobre
// TODAS as cadeiras daquela categoria — não combina com os outros filtros já
// ativos (contagem "facetada" fica pra depois, ver plano).
export function chipCount(chairs, field, value) {
  const subset = chairs.filter((c) => c[field] === value && c.status !== 'extinta');
  return {
    total: subset.length,
    ocupadas: subset.filter((c) => c.status === 'ocupada').length
  };
}

// Agrupa as cadeiras já filtradas em BU -> Torre -> Cargo, respeitando a
// ordem do cadastro de BU/Torre; "Sem torre" sempre por último dentro da BU.
export function groupByBuTorre(chairs, buList, torreList) {
  const buOrder = buList.map((b) => b.nome);
  const torreOrder = torreList.map((t) => t.nome);

  const buGroups = buOrder
    .map((bu) => ({ bu, chairs: chairs.filter((c) => c.bu === bu) }))
    .filter((g) => g.chairs.length > 0);

  return buGroups.map((buGroup) => {
    const torresPresentes = [...new Set(buGroup.chairs.map((c) => c.torre || null))];
    torresPresentes.sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return torreOrder.indexOf(a) - torreOrder.indexOf(b);
    });
    const torreGroups = torresPresentes.map((torre) => ({
      torre,
      chairs: buGroup.chairs.filter((c) => (c.torre || null) === torre)
    }));
    return { bu: buGroup.bu, chairs: buGroup.chairs, torreGroups };
  });
}

// Uma cadeira ganha o selo de destaque se teve um Mérito registrado dentro
// da janela de meses informada (regra fixa por enquanto — o cadastro de
// Highlights guarda o catálogo de tipos/ícones, não as regras de disparo).
export function hasRecentMerito(chairId, movements, meses = 11) {
  const limite = new Date();
  limite.setMonth(limite.getMonth() - meses);
  return movements.some((m) => m.tipo === 'Mérito' && m.origem_id === chairId && new Date(m.created_at) >= limite);
}
