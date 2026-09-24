-- NS Position Hub — cadastros de BU/Torre/Empresa, novo esquema de ID, histórico por cadeira
-- Cole no SQL Editor do Supabase e rode.

-- 1) Cadastros novos --------------------------------------------------------

create table if not exists bu (
  nome text primary key,
  codigo text not null unique
);

create table if not exists torre (
  nome text primary key,
  codigo text not null unique
);

create table if not exists empresa (
  nome text primary key,
  codigo text not null unique
);

alter table bu enable row level security;
alter table torre enable row level security;
alter table empresa enable row level security;

create policy "authenticated read bu" on bu for select to authenticated using (true);
create policy "authenticated write bu" on bu for insert to authenticated with check (true);
create policy "authenticated update bu" on bu for update to authenticated using (true);
create policy "authenticated delete bu" on bu for delete to authenticated using (true);

create policy "authenticated read torre" on torre for select to authenticated using (true);
create policy "authenticated write torre" on torre for insert to authenticated with check (true);
create policy "authenticated update torre" on torre for update to authenticated using (true);
create policy "authenticated delete torre" on torre for delete to authenticated using (true);

create policy "authenticated read empresa" on empresa for select to authenticated using (true);
create policy "authenticated write empresa" on empresa for insert to authenticated with check (true);
create policy "authenticated update empresa" on empresa for update to authenticated using (true);
create policy "authenticated delete empresa" on empresa for delete to authenticated using (true);

-- Seed BU (renomeado do que hoje é "Torre" no app)
insert into bu (nome, codigo) values
  ('Corporativo', 'CRP'),
  ('Embarcador', 'EMB'),
  ('PSL', 'PSL')
on conflict (nome) do nothing;

-- Seed Empresa (as 33 empresas reais do grupo Nstech)
insert into empresa (nome, codigo) values
  ('Nstech', 'NST'),
  ('KMM', 'KMM'),
  ('IM', 'IM'),
  ('LogOne', 'LG1'),
  ('Trizy', 'TRI'),
  ('Comprovei', 'COM'),
  ('Fusion', 'FUS'),
  ('RoutEasy', 'ROU'),
  ('Multisoftware', 'MUL'),
  ('Runtec', 'RUN'),
  ('GBM', 'GBM'),
  ('BRK', 'BRK'),
  ('Onisys', 'ONI'),
  ('Opentech', 'OPE'),
  ('Buonny', 'BUO'),
  ('Trafegus', 'TRA'),
  ('Mundo Logística', 'MUN'),
  ('e-frete', 'E-F'),
  ('Qualp', 'QUA'),
  ('Digitalcomm', 'DIG'),
  ('Gasola', 'GAS'),
  ('Praxio', 'PRA'),
  ('Bsoft', 'BSO'),
  ('Datamex', 'DAT'),
  ('Hivecloud', 'HIV'),
  ('Otimizy', 'OTI'),
  ('Atua', 'ATU'),
  ('Signa', 'SIG'),
  ('99Kote', '99K'),
  ('Praxio - Avacorp', 'PAV'),
  ('ATS Log', 'ATS'),
  ('LogRisk', 'LOG'),
  ('Frete Rápido', 'FRE')
on conflict (nome) do nothing;

-- torre (granular) começa vazio — populado depois pela tela de Configurações

-- 2) chairs: Torre vira BU, novos campos Torre (granular) e Empresa ---------

alter table chairs rename column torre to bu;
alter table chairs add column if not exists torre text;
alter table chairs add column if not exists empresa text;

update chairs set bu = case bu
  when 'Corporate' then 'Corporativo'
  when 'Embarcador' then 'Embarcador'
  when 'PSL' then 'PSL'
  else bu
end;

update chairs set empresa = 'Nstech' where empresa is null and status <> 'extinta';

-- 3) movements: rastreabilidade por cadeira ---------------------------------

alter table movements add column if not exists origem_id text;
alter table movements add column if not exists destino_id text;

-- 4) Novo esquema de ID para as 90 cadeiras existentes ----------------------
-- F = ocupada, O = vaga. Sequência global por tipo. Cadeiras já extintas
-- (se houver, de testes) mantêm o id antigo — não entram nesta renumeração.

with numbered as (
  select
    id as old_id,
    row_number() over (partition by status order by id) as seq,
    case bu when 'Corporativo' then 'CRP' when 'Embarcador' then 'EMB' when 'PSL' then 'PSL' end as bu_codigo,
    case status when 'ocupada' then 'F' when 'vaga' then 'O' end as tipo
  from chairs
  where status in ('ocupada', 'vaga')
)
update chairs c
set id = 'ID_' || n.bu_codigo || '_NST_' || n.tipo || lpad(n.seq::text, 4, '0')
from numbered n
where c.id = n.old_id;

-- Observação: movimentações gravadas ANTES desta migração continuam com o texto
-- de "cadeiras"/"detalhes" citando os ids antigos (COR-01 etc.) — é esperado,
-- é um retrato de um momento passado. `origem_id`/`destino_id` dessas linhas
-- antigas ficam nulos; só passam a ser preenchidos a partir de agora.
