-- NS Position Hub — cadastro de Contas (e-mail + cargo/role de quem usa o
-- app), no mesmo padrão de tabela plana e editável da Estrutura. Também
-- estende as 3 RPCs de edição de coluna (ensure_column/rename_column/
-- drop_column) pra aceitarem 'contas' além de 'estrutura'.
-- Cole no SQL Editor do Supabase e rode.

create table if not exists contas (
  id bigint generated always as identity primary key,
  email text,
  cargo text,
  updated_at timestamptz not null default now()
);

alter table contas enable row level security;
create policy "authenticated read contas" on contas for select to authenticated using (true);
create policy "authenticated write contas" on contas for insert to authenticated with check (true);
create policy "authenticated update contas" on contas for update to authenticated using (true);
create policy "authenticated delete contas" on contas for delete to authenticated using (true);

insert into contas (email, cargo) values ('emerson.nakamura@nstech.com.br', 'Administrador');

create or replace function ensure_column(p_table text, p_column text, p_type text default 'text')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created boolean := false;
begin
  if p_table not in ('movements', 'pessoa', 'estrutura', 'contas') then
    raise exception 'tabela não permitida: %', p_table;
  end if;

  if p_type not in ('text', 'numeric', 'date', 'boolean') then
    raise exception 'tipo não permitido: %', p_type;
  end if;

  if p_column !~ '^[a-z][a-z0-9_]*$' then
    raise exception 'nome de coluna inválido: %', p_column;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = p_table and column_name = p_column
  ) then
    execute format('alter table public.%I add column %I %s', p_table, p_column, p_type);
    v_created := true;
  end if;

  return v_created;
end;
$$;

revoke all on function ensure_column(text, text, text) from public;
grant execute on function ensure_column(text, text, text) to authenticated;

create or replace function rename_column(p_table text, p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in ('estrutura', 'contas') then
    raise exception 'tabela não permitida: %', p_table;
  end if;
  if p_old_name !~ '^[a-z][a-z0-9_]*$' or p_new_name !~ '^[a-z][a-z0-9_]*$' then
    raise exception 'nome de coluna inválido';
  end if;
  if p_old_name in ('id', 'updated_at') then
    raise exception 'coluna protegida: %', p_old_name;
  end if;
  execute format('alter table public.%I rename column %I to %I', p_table, p_old_name, p_new_name);
end;
$$;

revoke all on function rename_column(text, text, text) from public;
grant execute on function rename_column(text, text, text) to authenticated;

create or replace function drop_column(p_table text, p_column text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in ('estrutura', 'contas') then
    raise exception 'tabela não permitida: %', p_table;
  end if;
  if p_column !~ '^[a-z][a-z0-9_]*$' then
    raise exception 'nome de coluna inválido: %', p_column;
  end if;
  if p_column in ('id', 'updated_at') then
    raise exception 'coluna protegida: %', p_column;
  end if;
  execute format('alter table public.%I drop column if exists %I', p_table, p_column);
end;
$$;

revoke all on function drop_column(text, text) from public;
grant execute on function drop_column(text, text) to authenticated;
