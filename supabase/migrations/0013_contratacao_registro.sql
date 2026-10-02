-- NS Position Hub — registro do processo de contratação (novo fluxo do botão
-- "Contratar"): confirma → preenche um formulário → registra. A vaga fica
-- "Em Contratação" (reservada) a partir do registro — a conclusão real da
-- contratação (virar "ocupada" com um nome) é um passo futuro, ainda não
-- ligado a este registro.
-- Cole no SQL Editor do Supabase e rode.

create table if not exists contratacao_registro (
  id bigint generated always as identity primary key,
  chair_id text not null references chairs(id) on update cascade,
  id_referencia text not null,
  tipo text not null check (tipo in ('substituicao', 'nova_vaga')),
  nome_posicao text,
  data_prevista date,
  centro_custo_inhire text,
  empresa_kmm text,
  filial_kmm text,
  criado_por text,
  criado_em timestamptz not null default now()
);

alter table contratacao_registro enable row level security;

create policy "authenticated read contratacao_registro" on contratacao_registro for select to authenticated using (true);
create policy "authenticated write contratacao_registro" on contratacao_registro for insert to authenticated with check (true);
