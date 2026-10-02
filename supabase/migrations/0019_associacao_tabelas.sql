-- NS Position Hub — "Associação de Tabelas": matriz que diz, por variável do
-- sistema (BU, Torre, Empresa, Cargo...) e por aplicativo/tela, de qual
-- tabela.coluna real aquele conceito deve vir. Existe pra sobreviver a um
-- rename de coluna (ex.: Estrutura.empresa virou emp_gerencial) sem quebrar a
-- tela que consome aquele campo — quem lê ajusta o mapa em vez de mexer em
-- código. Cole no SQL Editor do Supabase e rode.

create table if not exists associacao_tabelas (
  id bigint generated always as identity primary key,
  campo text not null,
  aplicativo text not null,
  tabela text not null,
  coluna text not null,
  updated_at timestamptz not null default now(),
  unique (campo, aplicativo)
);

alter table associacao_tabelas enable row level security;
create policy "authenticated read associacao_tabelas" on associacao_tabelas for select to authenticated using (true);
create policy "authenticated write associacao_tabelas" on associacao_tabelas for insert to authenticated with check (true);
create policy "authenticated update associacao_tabelas" on associacao_tabelas for update to authenticated using (true);
create policy "authenticated delete associacao_tabelas" on associacao_tabelas for delete to authenticated using (true);

-- Catálogo somente-leitura de tabela.coluna do schema public, pra popular os
-- selects da tela (usuário escolhe de uma lista real, não digita à mão).
create or replace function list_public_columns()
returns table(table_name text, column_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.table_name::text, c.column_name::text
  from information_schema.columns c
  join information_schema.tables t
    on t.table_schema = c.table_schema and t.table_name = c.table_name
  where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
  order by c.table_name, c.ordinal_position;
$$;

revoke all on function list_public_columns() from public;
grant execute on function list_public_columns() to authenticated;

-- Seed: mapeia BU/Torre/Empresa da Estrutura pro estado real de hoje —
-- inclusive já corrigindo Empresa pra emp_gerencial (renomeada nesta sessão),
-- pra tela de Hierarquia voltar a funcionar assim que o resolver for ligado.
insert into associacao_tabelas (campo, aplicativo, tabela, coluna) values
  ('BU', 'Estrutura', 'estrutura', 'bu'),
  ('Torre', 'Estrutura', 'estrutura', 'torre'),
  ('Empresa', 'Estrutura', 'estrutura', 'emp_gerencial')
on conflict (campo, aplicativo) do nothing;
