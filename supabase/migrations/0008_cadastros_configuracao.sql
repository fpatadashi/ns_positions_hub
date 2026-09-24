-- NS Position Hub — novas Telas do módulo Configuração: Disciplina, C-Level,
-- Nível de Complexidade, Pessoa, Centro de Custo. Mesmo padrão nome/codigo
-- já usado em bu/torre/empresa (cadastro simples, isolado — não altera chairs).
-- Cole no SQL Editor do Supabase e rode.

create table if not exists disciplina (
  nome text primary key,
  codigo text not null unique
);

create table if not exists clevel (
  nome text primary key,
  codigo text not null unique
);

create table if not exists nivel_complexidade (
  nome text primary key,
  codigo text not null unique
);

create table if not exists pessoa (
  nome text primary key,
  codigo text not null unique
);

create table if not exists centro_custo (
  nome text primary key,
  codigo text not null unique
);

alter table disciplina enable row level security;
alter table clevel enable row level security;
alter table nivel_complexidade enable row level security;
alter table pessoa enable row level security;
alter table centro_custo enable row level security;

create policy "authenticated read disciplina" on disciplina for select to authenticated using (true);
create policy "authenticated write disciplina" on disciplina for insert to authenticated with check (true);
create policy "authenticated update disciplina" on disciplina for update to authenticated using (true);
create policy "authenticated delete disciplina" on disciplina for delete to authenticated using (true);

create policy "authenticated read clevel" on clevel for select to authenticated using (true);
create policy "authenticated write clevel" on clevel for insert to authenticated with check (true);
create policy "authenticated update clevel" on clevel for update to authenticated using (true);
create policy "authenticated delete clevel" on clevel for delete to authenticated using (true);

create policy "authenticated read nivel_complexidade" on nivel_complexidade for select to authenticated using (true);
create policy "authenticated write nivel_complexidade" on nivel_complexidade for insert to authenticated with check (true);
create policy "authenticated update nivel_complexidade" on nivel_complexidade for update to authenticated using (true);
create policy "authenticated delete nivel_complexidade" on nivel_complexidade for delete to authenticated using (true);

create policy "authenticated read pessoa" on pessoa for select to authenticated using (true);
create policy "authenticated write pessoa" on pessoa for insert to authenticated with check (true);
create policy "authenticated update pessoa" on pessoa for update to authenticated using (true);
create policy "authenticated delete pessoa" on pessoa for delete to authenticated using (true);

create policy "authenticated read centro_custo" on centro_custo for select to authenticated using (true);
create policy "authenticated write centro_custo" on centro_custo for insert to authenticated with check (true);
create policy "authenticated update centro_custo" on centro_custo for update to authenticated using (true);
create policy "authenticated delete centro_custo" on centro_custo for delete to authenticated using (true);

-- Seed de disciplina a partir da lista legada "dDisciplinas" (só a coluna de
-- exibição — não há um código separado nela ainda, então nome = codigo).
insert into disciplina (nome, codigo)
select distinct "Disciplina Display", "Disciplina Display"
from "dDisciplinas"
where "Disciplina Display" is not null
on conflict (nome) do nothing;
