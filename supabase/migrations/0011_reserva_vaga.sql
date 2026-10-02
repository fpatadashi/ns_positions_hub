-- NS Position Hub — reserva de vaga ("Em Contratação"): trava real pra evitar
-- que duas pessoas mexam na mesma vaga ao mesmo tempo.
-- Cole no SQL Editor do Supabase e rode.

alter table chairs
  add column if not exists reservado_por text,
  add column if not exists reservado_em timestamptz;
