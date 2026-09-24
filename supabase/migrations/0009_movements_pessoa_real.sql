-- NS Position Hub — alinhamento de `movements` com o modelo real de RH
-- (BaseConsolidada_2026_paraID.xlsx), `pessoa` virando cadastro real de gente,
-- e a função ensure_column usada pelo import inteligente de Excel.
-- Cole no SQL Editor do Supabase e rode.

-- 1) movements: corrige o nome legado (torre guardava BU desde a Fase 2) e
--    adiciona os campos reais de RH que ainda não existem. Tudo texto/nullable
--    — dado real vem sujo/formatado, isso evita falha de import por tipo.
alter table movements rename column torre to bu;

alter table movements
  add column if not exists torre text,
  add column if not exists empresa_cnpj text,
  add column if not exists grupo text,
  add column if not exists empresa_fpa text,
  add column if not exists emprecod text,
  add column if not exists ano_admissao text,
  add column if not exists cod_emp text,
  add column if not exists cod_filial text,
  add column if not exists id_da_posicao text,
  add column if not exists id_position text,
  add column if not exists id_number text,
  add column if not exists matricula text,
  add column if not exists nome_completo text,
  add column if not exists gestor_imediato text,
  add column if not exists centro_de_custo_cod text,
  add column if not exists centro_de_custo_descricao text,
  add column if not exists disciplina text,
  add column if not exists area_sistema text,
  add column if not exists departamento text,
  add column if not exists data_nascimento text,
  add column if not exists data_admissao text,
  add column if not exists data_desligamento text,
  add column if not exists data_afastamento text,
  add column if not exists genero text,
  add column if not exists pcd text,
  add column if not exists nivel_complexidade text,
  add column if not exists relacao text,
  add column if not exists cbo text,
  add column if not exists produto text,
  add column if not exists dedicado_compartilhado text,
  add column if not exists squad text,
  add column if not exists modalidade text,
  add column if not exists salario_mensal text,
  add column if not exists c_level text,
  add column if not exists responsavel_disciplina text,
  add column if not exists disciplina_vasco text,
  add column if not exists nivel_vasco text,
  add column if not exists status_ajustado text,
  add column if not exists hc text,
  add column if not exists custo_total text,
  add column if not exists area_disciplina text,
  add column if not exists salario_anterior text,
  add column if not exists obs_salario text;

-- 2) pessoa: vira cadastro real de gente (a tabela está vazia — criada na
--    Fase 3 só com nome/codigo, sem dado a preservar).
alter table pessoa drop column if exists codigo;
alter table pessoa
  add column if not exists matricula text,
  add column if not exists centro_custo text,
  add column if not exists data_admissao date,
  add column if not exists data_demissao date;

-- 3) ensure_column: cria uma coluna nova numa tabela em tempo real, chamada
--    pela tela de import quando o Excel tem uma coluna que o banco ainda não
--    tem. Restrita por design: só duas tabelas na whitelist, só 4 tipos
--    seguros, e o nome da coluna validado por regex — evita que qualquer
--    usuário autenticado altere tabelas arbitrárias ou injete SQL via
--    nome/tipo de coluna, mesmo rodando como security definer.
create or replace function ensure_column(p_table text, p_column text, p_type text default 'text')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created boolean := false;
begin
  if p_table not in ('movements', 'pessoa') then
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
