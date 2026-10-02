-- NS Position Hub — base real de pessoas (Pessoas_ID) + ID_Position + De-Paras novos
-- Substitui a tabela `pessoa` (schema simples de nome/matricula/centro_custo/datas,
-- populado na Fase 4) por um schema mais rico, alinhado 1:1 com a planilha real
-- "Lista para ID.xlsx" (aba Pessoas_ID). Cole no SQL Editor do Supabase e rode.

-- 1) Novos cadastros De-Para (nome+codigo, mesmo padrão de bu/torre/empresa/disciplina) --

create table if not exists pessoa_status (nome text primary key, codigo text not null unique);
create table if not exists grupo (nome text primary key, codigo text not null unique);
create table if not exists departamento (nome text primary key, codigo text not null unique);
create table if not exists area_sistema (nome text primary key, codigo text not null unique);
create table if not exists modalidade (nome text primary key, codigo text not null unique);
create table if not exists squad (nome text primary key, codigo text not null unique);
create table if not exists produto (nome text primary key, codigo text not null unique);
create table if not exists cargo_real (nome text primary key, codigo text not null unique);
create table if not exists genero (nome text primary key, codigo text not null unique);
create table if not exists pcd (nome text primary key, codigo text not null unique);
create table if not exists cbo (nome text primary key, codigo text not null unique);
create table if not exists dedicado_compartilhado (nome text primary key, codigo text not null unique);

do $$
declare
  t text;
begin
  foreach t in array array['pessoa_status','grupo','departamento','area_sistema','modalidade',
                            'squad','produto','cargo_real','genero','pcd','cbo','dedicado_compartilhado']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "authenticated read %1$s" on %1$I for select to authenticated using (true)', t);
    execute format('create policy "authenticated write %1$s" on %1$I for insert to authenticated with check (true)', t);
    execute format('create policy "authenticated update %1$s" on %1$I for update to authenticated using (true)', t);
    execute format('create policy "authenticated delete %1$s" on %1$I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- 2) `pessoa` — substituída pelo schema real (Fase 10) -----------------------
-- Schema anterior (nome/matricula/centro_custo/data_admissao/data_demissao, Fase 4)
-- é descartado a pedido: a carga real desta fase já traz tudo de novo.

drop table if exists pessoa;

create table pessoa (
  nome text primary key,
  id_da_posicao text,
  id_position text,
  id_position_status text not null default 'ok' check (id_position_status in ('ok', 'revisar')),
  bu text,
  torre text,
  status text,
  status_ajustado text,
  cpf text,
  matricula text,
  grupo text,
  relacao text,
  linha_gerencial text,
  id_relationship_origem text,
  id_relationship_destino text,
  empresa_cnpj text,
  cod_emp text,
  cod_filial text,
  email text,
  gestor_imediato text,
  centro_custo_cod text,
  centro_custo_descricao text,
  disciplina text,
  area_sistema text,
  departamento text,
  data_nascimento date,
  data_admissao date,
  data_demissao date,
  data_afastamento date,
  genero text,
  pcd text,
  cargo_real text,
  nivel_complexidade text,
  cbo text,
  produto text,
  dedicado_compartilhado text,
  squad text,
  modalidade text,
  c_level text,
  updated_at timestamptz not null default now()
);

alter table pessoa enable row level security;
create policy "authenticated read pessoa" on pessoa for select to authenticated using (true);
create policy "authenticated write pessoa" on pessoa for insert to authenticated with check (true);
create policy "authenticated update pessoa" on pessoa for update to authenticated using (true);
create policy "authenticated delete pessoa" on pessoa for delete to authenticated using (true);
