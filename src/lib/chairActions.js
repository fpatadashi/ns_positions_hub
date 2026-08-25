import { supabase } from '../supabaseClient';
import { CARGO_INFO, TORRE_PREFIX, cargoLabel } from '../data/cargo';
import { fmtBRL } from './format';

// ctx = { chairs, bolsao, budgetTotal } — a read-only snapshot from AppDataContext,
// used only to validate the same rules the original prototype enforced client-side.

function getChair(ctx, id) {
  return ctx.chairs.find((c) => c.id === id) || null;
}

function genId(ctx, torre) {
  const prefix = TORRE_PREFIX[torre];
  let max = 0;
  ctx.chairs.forEach((c) => {
    if (c.torre === torre) {
      const m = c.id.match(/-(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  });
  const seq = max + 1;
  return prefix + '-' + (seq < 10 ? '0' + seq : '' + seq);
}

async function logMovement(m) {
  const { error } = await supabase.from('movements').insert({
    tipo: m.tipo,
    torre: m.torre || '—',
    cadeiras: m.cadeiras || '—',
    cargo: m.cargo || '—',
    valor: m.valor || 0,
    detalhes: m.detalhes || ''
  });
  if (error) throw error;
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
    tipo: 'Contratação', torre: chair.torre, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: ocupante + ' contratado(a) para ' + chair.id + '.'
  });
  return { ok: true };
}

export async function dismissChair(ctx, chairId) {
  const chair = getChair(ctx, chairId);
  const nome = chair.ocupante;
  await updateChair(chairId, { status: 'vaga', ocupante: '' });
  await logMovement({
    tipo: 'Demissão', torre: chair.torre, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: nome + ' desligado(a) de ' + chair.id + '. Cadeira permanece com ' + fmtBRL(chair.valor) + ', agora vaga.'
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
    tipo: 'Promoção', torre: chair.torre, cadeiras: chair.id,
    cargo: cargoLabel(oldCargo) + ' → ' + cargoLabel(newCargo), valor: delta,
    detalhes: chair.ocupante + ' promovido(a) de ' + cargoLabel(oldCargo) + ' (' + fmtBRL(oldValor) + ') para ' + cargoLabel(newCargo) + ' (' + fmtBRL(newValor) + '), diferença financiada pelo Bolsão.'
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
    tipo: 'Mérito', torre: chair.torre, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor,
    detalhes: 'Aumento de mérito para ' + chair.ocupante + ', financiado pelo Bolsão. Novo valor da cadeira: ' + fmtBRL(novoValor) + '.'
  });
  return { ok: true };
}

async function transferChairValue(ctx, origemId, destType, destInfo, valor) {
  const origem = getChair(ctx, origemId);
  const restante = origem.valor - valor;
  const extinta = restante <= 0.001;

  let destId;
  if (destType === 'nova') {
    destId = genId(ctx, destInfo.torre);
    await insertChair({ id: destId, torre: destInfo.torre, cargo: destInfo.cargo, valor, status: 'vaga', ocupante: '' });
  } else {
    const dest = getChair(ctx, destInfo.chairId);
    await updateChair(dest.id, { valor: dest.valor + valor });
    destId = dest.id;
  }

  await updateChair(origemId, extinta ? { valor: 0, status: 'extinta' } : { valor: restante });

  return { destId, extinta, origem, restante: extinta ? 0 : restante };
}

export async function decomposeChair(ctx, chairId, destType, destInfo, valor) {
  const result = await transferChairValue(ctx, chairId, destType, destInfo, valor);
  await logMovement({
    tipo: 'Decomposição', torre: result.origem.torre,
    cadeiras: chairId + ' → ' + result.destId,
    cargo: cargoLabel(result.origem.cargo), valor,
    detalhes: fmtBRL(valor) + ' movidos de ' + chairId + ' para ' + result.destId +
      (result.extinta ? ' — origem extinta.' : ' — restante em ' + chairId + ': ' + fmtBRL(result.restante) + '.')
  });
  return { ok: true };
}

export async function incorporarChair(ctx, origemId, destType, destInfo, valor) {
  const result = await transferChairValue(ctx, origemId, destType, destInfo, valor);
  await logMovement({
    tipo: 'Incorporação', torre: result.origem.torre,
    cadeiras: origemId + ' → ' + result.destId,
    cargo: cargoLabel(result.origem.cargo), valor,
    detalhes: fmtBRL(valor) + ' incorporados de ' + origemId + ' para ' + result.destId +
      (result.extinta ? ' — origem extinta.' : ' — restante em ' + origemId + ': ' + fmtBRL(result.restante) + '.')
  });
  return { ok: true };
}

export async function extinguishChair(ctx, chairId) {
  const chair = getChair(ctx, chairId);
  const cap = ctx.budgetTotal * 0.5;
  if (ctx.bolsao + chair.valor > cap + 0.001) {
    return { ok: false, msg: 'O Bolsão ultrapassaria o limite de 50% do Budget (' + fmtBRL(cap) + '). Use "Decompor" para direcionar parte do valor a novas vagas.' };
  }
  await updateChair(chairId, { status: 'extinta' });
  await setBolsao(ctx.bolsao + chair.valor);
  await logMovement({
    tipo: 'Extinção', torre: chair.torre, cadeiras: chair.id, cargo: cargoLabel(chair.cargo), valor: chair.valor,
    detalhes: 'Cadeira extinta; valor integral enviado ao Bolsão.'
  });
  return { ok: true };
}

export async function applyBolsaoNovaVaga(ctx, torre, cargo, valor) {
  if (!(valor > 0)) return { ok: false, msg: 'Informe um valor maior que zero.' };
  if (valor > ctx.bolsao) return { ok: false, msg: 'Bolsão insuficiente (disponível ' + fmtBRL(ctx.bolsao) + ').' };
  const id = genId(ctx, torre);
  await insertChair({ id, torre, cargo, valor, status: 'vaga', ocupante: '' });
  await setBolsao(ctx.bolsao - valor);
  await logMovement({
    tipo: 'Aplicação de Bolsão', torre, cadeiras: id, cargo: cargoLabel(cargo), valor,
    detalhes: 'Nova vaga criada a partir do saldo do Bolsão.'
  });
  return { ok: true };
}
