import { supabase } from '../supabaseClient';
import { CARGO_INFO, cargoLabel } from '../data/cargo';
import { fmtBRL } from './format';

// ctx = { chairs, bolsao, budgetTotal, buList, empresaList } — a read-only snapshot
// from AppDataContext, used to validate rules and to resolve BU/Empresa codes for IDs.
// buList/empresaList are arrays of { nome, codigo } loaded from the bu/empresa registries.

function getChair(ctx, id) {
  return ctx.chairs.find((c) => c.id === id) || null;
}

function codigoOf(list, nome) {
  const found = list.find((x) => x.nome === nome);
  return found ? found.codigo : nome;
}

// Gera o próximo id de um novo tipo (F/O/C). A sequência é global por tipo —
// não reinicia por BU — então varremos todos os ids existentes. A empresa não
// entra mais no id (só fica guardada como atributo da cadeira).
function genNewId(ctx, buNome, tipo) {
  const buCodigo = codigoOf(ctx.buList, buNome);
  const re = new RegExp('_' + tipo + '(\\d{4})(?:_\\d+)?$');
  let max = 0;
  ctx.chairs.forEach((c) => {
    const m = c.id.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  const seq = String(max + 1).padStart(4, '0');
  return 'ID_' + buCodigo + '_' + tipo + seq;
}

// Cadeiras que sobrevivem parcialmente a uma Decomposição/Incorporação (viram
// origem de uma transferência sem zerar) ganham um sufixo de composição no
// próprio id: ID_..._F0001 -> ID_..._F0001_01 na primeira vez, _02 na segunda etc.
function nextCompositionId(currentId) {
  const m = currentId.match(/^(ID_.+_[FOC]\d{4})(?:_(\d{2}))?$/);
  if (!m) return currentId + '_01';
  const base = m[1];
  const nextSeq = String((m[2] ? parseInt(m[2], 10) : 0) + 1).padStart(2, '0');
  return base + '_' + nextSeq;
}

// Exportadas para os modais mostrarem, ao vivo, qual id vai ser gerado/alterado
// antes de confirmar a ação (o resumo "o que está sendo feito").
export function previewNewId(ctx, buNome, tipo) {
  return genNewId(ctx, buNome, tipo);
}

export function previewCompositionId(currentId) {
  return nextCompositionId(currentId);
}

async function logMovement(m) {
  const { error } = await supabase.from('movements').insert({
    tipo: m.tipo,
    bu: m.bu || '—',
    cadeiras: m.cadeiras || '—',
    cargo: m.cargo || '—',
    valor: m.valor || 0,
    detalhes: m.detalhes || '',
    origem_id: m.origemId || null,
    destino_id: m.destinoId || null,
    lote_id: m.loteId || null
  });
  if (error) throw error;
}

// Próximo número de lote — sequência global simples, varrendo o maior lote_id
// já usado nas movimentações (não é uma sequence do Postgres porque o lote
// nasce no cliente, antes de qualquer insert, pra marcar todas as
// movimentações da mesma operação em lote com o mesmo número).
export function nextLoteId(movements) {
  let max = 1000;
  movements.forEach((m) => {
    if (m.lote_id) max = Math.max(max, Number(m.lote_id));
  });
  return max + 1;
}

async function setBolsao(valor) {
  const { error } = await supabase.from('app_settings').update({ bolsao: valor }).eq('id', 1);
  if (error) throw error;
}

async function insertChair(chair) {
  const { error } = await supabase.from('chairs').insert(chair);
  if (error) throw error;
}

async function updateChair(id, patch) {
  const { error } = await supabase.from('chairs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function hireChair(ctx, chairId, nome) {
  const chair = getChair(ctx, chairId);
  const ocupante = nome && nome.trim() ? nome.trim() : 'Colaborador(a)';
  await updateChair(chairId, { status: 'ocupada', ocupante });
  await logMovement({
    tipo: 'Contratação', bu: chair.bu, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: ocupante + ' contratado(a) para ' + chair.id + '.',
    origemId: chair.id
  });
  return { ok: true };
}

export async function dismissChair(ctx, chairId) {
  const chair = getChair(ctx, chairId);
  const nome = chair.ocupante;
  await updateChair(chairId, { status: 'vaga', ocupante: '' });
  await logMovement({
    tipo: 'Demissão', bu: chair.bu, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: nome + ' desligado(a) de ' + chair.id + '. Cadeira permanece com ' + fmtBRL(chair.valor) + ', agora vaga.',
    origemId: chair.id
  });
  return { ok: true };
}

export async function promoteChair(ctx, chairId, newCargo) {
  const chair = getChair(ctx, chairId);
  const newValor = CARGO_INFO[newCargo].valor;
  const delta = newValor - chair.valor;
  if (delta > 0 && ctx.bolsao < delta) {
    return { ok: false, msg: 'Bolsão insuficiente (disponível ' + fmtBRL(ctx.bolsao) + ', necessário ' + fmtBRL(delta) + ').' };
  }
  const oldCargo = chair.cargo, oldValor = chair.valor;
  await updateChair(chairId, { cargo: newCargo, valor: newValor });
  await setBolsao(ctx.bolsao - delta);
  await logMovement({
    tipo: 'Promoção', bu: chair.bu, cadeiras: chair.id,
    cargo: cargoLabel(oldCargo) + ' → ' + cargoLabel(newCargo), valor: delta,
    detalhes: chair.ocupante + ' promovido(a) de ' + cargoLabel(oldCargo) + ' (' + fmtBRL(oldValor) + ') para ' + cargoLabel(newCargo) + ' (' + fmtBRL(newValor) + '), diferença financiada pelo Bolsão.',
    origemId: chair.id
  });
  return { ok: true };
}

export async function meritoStandalone(ctx, chairId, valor) {
  if (!(valor > 0)) return { ok: false, msg: 'Informe um valor maior que zero.' };
  if (valor > ctx.bolsao) return { ok: false, msg: 'Bolsão insuficiente (disponível ' + fmtBRL(ctx.bolsao) + ').' };
  const chair = getChair(ctx, chairId);
  const novoValor = chair.valor + valor;
  await updateChair(chairId, { valor: novoValor });
  await setBolsao(ctx.bolsao - valor);
  await logMovement({
    tipo: 'Mérito', bu: chair.bu, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor,
    detalhes: 'Aumento de mérito para ' + chair.ocupante + ', financiado pelo Bolsão. Novo valor da cadeira: ' + fmtBRL(novoValor) + '.',
    origemId: chair.id
  });
  return { ok: true };
}

// destInfo para 'nova': { bu, torre, empresa, cargo }. Para 'existente': { chairId }.
async function transferChairValue(ctx, origemId, destType, destInfo, valor) {
  const origem = getChair(ctx, origemId);
  const restante = origem.valor - valor;
  const extinta = restante <= 0.001;

  let destId;
  if (destType === 'nova') {
    destId = genNewId(ctx, destInfo.bu, 'C');
    await insertChair({
      id: destId, bu: destInfo.bu, torre: destInfo.torre || null, empresa: destInfo.empresa,
      cargo: destInfo.cargo, valor, status: 'vaga', ocupante: ''
    });
  } else {
    const dest = getChair(ctx, destInfo.chairId);
    await updateChair(dest.id, { valor: dest.valor + valor });
    destId = dest.id;
  }

  let origemFinalId = origemId;
  if (extinta) {
    await updateChair(origemId, { valor: 0, status: 'extinta' });
  } else {
    origemFinalId = nextCompositionId(origem.id);
    await updateChair(origemId, { id: origemFinalId, valor: restante });
  }

  return { destId, extinta, origem, origemFinalId, restante: extinta ? 0 : restante };
}

export async function decomposeChair(ctx, chairId, destType, destInfo, valor, loteId) {
  const result = await transferChairValue(ctx, chairId, destType, destInfo, valor);
  await logMovement({
    tipo: 'Decomposição', bu: result.origem.bu,
    cadeiras: chairId + ' → ' + result.destId,
    cargo: cargoLabel(result.origem.cargo), valor,
    detalhes: fmtBRL(valor) + ' movidos de ' + chairId + ' para ' + result.destId +
      (result.extinta ? ' — origem extinta.' : ' — restante em ' + result.origemFinalId + ': ' + fmtBRL(result.restante) + '.'),
    origemId: result.origemFinalId,
    destinoId: result.destId,
    loteId
  });
  return { ok: true, destId: result.destId, origemFinalId: result.origemFinalId };
}

export async function incorporarChair(ctx, origemId, destType, destInfo, valor, loteId) {
  const result = await transferChairValue(ctx, origemId, destType, destInfo, valor);
  await logMovement({
    tipo: 'Incorporação', bu: result.origem.bu,
    cadeiras: origemId + ' → ' + result.destId,
    cargo: cargoLabel(result.origem.cargo), valor,
    detalhes: fmtBRL(valor) + ' incorporados de ' + origemId + ' para ' + result.destId +
      (result.extinta ? ' — origem extinta.' : ' — restante em ' + result.origemFinalId + ': ' + fmtBRL(result.restante) + '.'),
    origemId: result.origemFinalId,
    destinoId: result.destId,
    loteId
  });
  return { ok: true, destId: result.destId, origemFinalId: result.origemFinalId };
}

export async function extinguishChair(ctx, chairId, loteId) {
  const chair = getChair(ctx, chairId);
  const cap = ctx.budgetTotal * 0.5;
  if (ctx.bolsao + chair.valor > cap + 0.001) {
    return { ok: false, msg: 'O Bolsão ultrapassaria o limite de 50% do Budget (' + fmtBRL(cap) + '). Use "Decompor" para direcionar parte do valor a novas vagas.' };
  }
  await updateChair(chairId, { status: 'extinta' });
  await setBolsao(ctx.bolsao + chair.valor);
  await logMovement({
    tipo: 'Extinção', bu: chair.bu, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: 'Cadeira extinta; valor integral enviado ao Bolsão.',
    origemId: chair.id,
    loteId
  });
  return { ok: true };
}

// Variante usada pela seleção em lote: parte do valor da vaga pode ir pro
// destino (nova vaga ou vaga existente) e outra parte, opcionalmente, direto
// pro Bolsão — na mesma operação. O que sobrar na origem segue a mesma regra
// das demais transferências (fica 0, extinguindo, ou pelo menos o piso do
// menor cargo).
export async function moverValorVaga(ctx, origemId, destType, destInfo, destValor, bolsaoValor, loteId) {
  const origem = getChair(ctx, origemId);
  const totalMovido = destValor + bolsaoValor;
  const restante = origem.valor - totalMovido;
  const extinta = restante <= 0.001;

  if (bolsaoValor > 0.001) {
    const cap = ctx.budgetTotal * 0.5;
    if (ctx.bolsao + bolsaoValor > cap + 0.001) {
      return { ok: false, msg: 'O Bolsão ultrapassaria o limite de 50% do Budget (' + fmtBRL(cap) + ').' };
    }
  }

  let destId = null;
  if (destValor > 0.001) {
    if (destType === 'nova') {
      destId = genNewId(ctx, destInfo.bu, 'C');
      await insertChair({
        id: destId, bu: destInfo.bu, torre: destInfo.torre || null, empresa: destInfo.empresa,
        cargo: destInfo.cargo, valor: destValor, status: 'vaga', ocupante: ''
      });
    } else {
      const dest = getChair(ctx, destInfo.chairId);
      await updateChair(dest.id, { valor: dest.valor + destValor });
      destId = dest.id;
    }
  }

  if (bolsaoValor > 0.001) {
    await setBolsao(ctx.bolsao + bolsaoValor);
  }

  let origemFinalId = origemId;
  if (extinta) {
    await updateChair(origemId, { valor: 0, status: 'extinta' });
  } else {
    origemFinalId = nextCompositionId(origem.id);
    await updateChair(origemId, { id: origemFinalId, valor: restante });
  }

  if (destValor > 0.001) {
    await logMovement({
      tipo: destType === 'nova' ? 'Decomposição' : 'Incorporação',
      bu: origem.bu, cadeiras: origemId + ' → ' + destId, cargo: cargoLabel(origem.cargo), valor: destValor,
      detalhes: fmtBRL(destValor) + ' movidos de ' + origemId + ' para ' + destId + '.',
      origemId: origemFinalId, destinoId: destId, loteId
    });
  }
  if (bolsaoValor > 0.001) {
    await logMovement({
      tipo: 'Extinção', bu: origem.bu, cadeiras: origemId, cargo: cargoLabel(origem.cargo), valor: bolsaoValor,
      detalhes: fmtBRL(bolsaoValor) + ' de ' + origemId + ' enviados direto ao Bolsão (extinção parcial).',
      origemId: origemFinalId, loteId
    });
  }

  return { ok: true, destId, origemFinalId, extinta, restante: extinta ? 0 : restante };
}

export async function applyBolsaoNovaVaga(ctx, bu, torre, empresa, cargo, valor) {
  if (!(valor > 0)) return { ok: false, msg: 'Informe um valor maior que zero.' };
  if (valor > ctx.bolsao) return { ok: false, msg: 'Bolsão insuficiente (disponível ' + fmtBRL(ctx.bolsao) + ').' };
  const id = genNewId(ctx, bu, 'C');
  await insertChair({ id, bu, torre: torre || null, empresa, cargo, valor, status: 'vaga', ocupante: '' });
  await setBolsao(ctx.bolsao - valor);
  await logMovement({
    tipo: 'Aplicação de Bolsão', bu: bu, cadeiras: id, cargo: cargoLabel(cargo), valor,
    detalhes: 'Nova vaga criada a partir do saldo do Bolsão.',
    destinoId: id
  });
  return { ok: true };
}
