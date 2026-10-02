-- NS Position Hub — renomear/remover coluna em `estrutura` (Fase 13, edição
-- inline da tela de Estrutura: adicionar/remover linha e coluna, renomear
-- coluna, tudo direto na tabela). Mesmo padrão de segurança do ensure_column
-- (0009/0016) — restrito a uma única tabela, nomes validados por regex,
-- colunas de sistema protegidas.
-- Cole no SQL Editor do Supabase e rode.

create or replace function rename_column(p_table text, p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in ('estrutura') then
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
  if p_table not in ('estrutura') then
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
