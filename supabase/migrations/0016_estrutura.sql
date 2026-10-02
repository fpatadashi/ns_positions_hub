-- NS Position Hub — "Estrutura" vira uma tabela de referência própria, plana,
-- com colunas livres (igual ao cadastro de Pessoas) — pedido do usuário pra
-- poder colar/importar Excel com colunas como Empresa Senior, Unidade Negócio
-- (KMM) etc. Independente de bu/torre/empresa/relacao_bte (essas continuam
-- alimentando os selects em cascata de Positions, sem mudança).
-- Cole no SQL Editor do Supabase e rode.

create table if not exists estrutura (
  id bigint generated always as identity primary key,
  bu text,
  torre text,
  empresa text,
  empresa_senior text,
  codigo text,
  senior text,
  unidade_negocio_kmm text,
  unidade_negocio_cod_kmm text,
  updated_at timestamptz not null default now()
);

alter table estrutura enable row level security;
create policy "authenticated read estrutura" on estrutura for select to authenticated using (true);
create policy "authenticated write estrutura" on estrutura for insert to authenticated with check (true);
create policy "authenticated update estrutura" on estrutura for update to authenticated using (true);
create policy "authenticated delete estrutura" on estrutura for delete to authenticated using (true);

-- Import inteligente (mesmo mecanismo da Pessoas) passa a poder criar coluna
-- nova em `estrutura` também.
create or replace function ensure_column(p_table text, p_column text, p_type text default 'text')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created boolean := false;
begin
  if p_table not in ('movements', 'pessoa', 'estrutura') then
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

-- Seed: parte do que já existe em bu/torre/relacao_bte hoje (BU, Torre, Empresa,
-- Código) — Empresa Senior / Senior / Unidade Negócio (KMM) ficam em branco,
-- pra você colar essa parte via Excel.
insert into estrutura (bu, torre, empresa, codigo)
select t.bu, t.nome, r.empresa, e.codigo
from torre t
left join relacao_bte r on r.bu = t.bu and r.torre = t.nome
left join empresa e on e.nome = r.empresa
where t.bu is not null;
