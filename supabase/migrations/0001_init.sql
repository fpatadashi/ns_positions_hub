-- NS Position Hub — schema inicial + seed
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode.

create table if not exists chairs (
  id text primary key,
  torre text not null,
  cargo text not null,
  valor numeric not null,
  status text not null default 'vaga',
  ocupante text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists movements (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null,
  torre text not null default '—',
  cadeiras text not null default '—',
  cargo text not null default '—',
  valor numeric not null default 0,
  detalhes text not null default ''
);

create table if not exists app_settings (
  id integer primary key default 1,
  bolsao numeric not null default 0,
  budget_total numeric not null default 0,
  constraint app_settings_singleton check (id = 1)
);

alter table chairs enable row level security;
alter table movements enable row level security;
alter table app_settings enable row level security;

create policy "authenticated read chairs" on chairs for select to authenticated using (true);
create policy "authenticated write chairs" on chairs for insert to authenticated with check (true);
create policy "authenticated update chairs" on chairs for update to authenticated using (true);

create policy "authenticated read movements" on movements for select to authenticated using (true);
create policy "authenticated write movements" on movements for insert to authenticated with check (true);

create policy "authenticated read settings" on app_settings for select to authenticated using (true);
create policy "authenticated update settings" on app_settings for update to authenticated using (true);

-- Seed: 90 cadeiras (30 por torre), mesma estrutura em pirâmide do protótipo original.

insert into chairs (id, torre, cargo, valor, status, ocupante) values
  ('COR-01','Corporate','clevel',25000,'ocupada','Marcos Andrade'),
  ('COR-02','Corporate','gerente',12000,'ocupada','Fernanda Lopes'),
  ('COR-03','Corporate','gerente',12000,'vaga',''),
  ('COR-04','Corporate','analista',6000,'ocupada','Rafael Souza'),
  ('COR-05','Corporate','analista',6000,'ocupada','Juliana Alves'),
  ('COR-06','Corporate','junior',3500,'vaga',''),
  ('COR-07','Corporate','aprendiz',1800,'ocupada','Pedro Martins'),
  ('COR-08','Corporate','aprendiz',1800,'vaga',''),
  ('COR-09','Corporate','aprendiz',1800,'vaga',''),
  ('COR-10','Corporate','aprendiz',1800,'vaga',''),
  ('COR-11','Corporate','junior',3500,'vaga',''),
  ('COR-12','Corporate','junior',3500,'vaga',''),
  ('COR-13','Corporate','junior',3500,'vaga',''),
  ('COR-14','Corporate','analista',6000,'vaga',''),
  ('COR-15','Corporate','analista',6000,'vaga',''),
  ('COR-16','Corporate','analista',6000,'vaga',''),
  ('COR-17','Corporate','gerente',12000,'vaga',''),
  ('COR-18','Corporate','gerente',12000,'vaga',''),
  ('COR-19','Corporate','clevel',25000,'vaga',''),
  ('COR-20','Corporate','aprendiz',1800,'vaga',''),
  ('COR-21','Corporate','aprendiz',1800,'vaga',''),
  ('COR-22','Corporate','aprendiz',1800,'vaga',''),
  ('COR-23','Corporate','junior',3500,'vaga',''),
  ('COR-24','Corporate','junior',3500,'vaga',''),
  ('COR-25','Corporate','junior',3500,'vaga',''),
  ('COR-26','Corporate','analista',6000,'vaga',''),
  ('COR-27','Corporate','analista',6000,'vaga',''),
  ('COR-28','Corporate','analista',6000,'vaga',''),
  ('COR-29','Corporate','gerente',12000,'vaga',''),
  ('COR-30','Corporate','gerente',12000,'vaga',''),

  ('EMB-01','Embarcador','gerente',12000,'ocupada','Camila Rocha'),
  ('EMB-02','Embarcador','analista',6000,'ocupada','Lucas Ferreira'),
  ('EMB-03','Embarcador','analista',6000,'ocupada','Beatriz Costa'),
  ('EMB-04','Embarcador','analista',6000,'vaga',''),
  ('EMB-05','Embarcador','junior',3500,'ocupada','Gabriel Silva'),
  ('EMB-06','Embarcador','junior',3500,'vaga',''),
  ('EMB-07','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-08','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-09','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-10','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-11','Embarcador','junior',3500,'vaga',''),
  ('EMB-12','Embarcador','junior',3500,'vaga',''),
  ('EMB-13','Embarcador','junior',3500,'vaga',''),
  ('EMB-14','Embarcador','analista',6000,'vaga',''),
  ('EMB-15','Embarcador','analista',6000,'vaga',''),
  ('EMB-16','Embarcador','analista',6000,'vaga',''),
  ('EMB-17','Embarcador','gerente',12000,'vaga',''),
  ('EMB-18','Embarcador','gerente',12000,'vaga',''),
  ('EMB-19','Embarcador','clevel',25000,'vaga',''),
  ('EMB-20','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-21','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-22','Embarcador','aprendiz',1800,'vaga',''),
  ('EMB-23','Embarcador','junior',3500,'vaga',''),
  ('EMB-24','Embarcador','junior',3500,'vaga',''),
  ('EMB-25','Embarcador','junior',3500,'vaga',''),
  ('EMB-26','Embarcador','analista',6000,'vaga',''),
  ('EMB-27','Embarcador','analista',6000,'vaga',''),
  ('EMB-28','Embarcador','analista',6000,'vaga',''),
  ('EMB-29','Embarcador','gerente',12000,'vaga',''),
  ('EMB-30','Embarcador','gerente',12000,'vaga',''),

  ('PSL-01','PSL','gerente',12000,'ocupada','Renata Dias'),
  ('PSL-02','PSL','analista',6000,'ocupada','Thiago Nunes'),
  ('PSL-03','PSL','analista',6000,'ocupada','Larissa Pinto'),
  ('PSL-04','PSL','analista',6000,'vaga',''),
  ('PSL-05','PSL','junior',3500,'ocupada','Diego Ramos'),
  ('PSL-06','PSL','aprendiz',1800,'vaga',''),
  ('PSL-07','PSL','aprendiz',1800,'vaga',''),
  ('PSL-08','PSL','aprendiz',1800,'vaga',''),
  ('PSL-09','PSL','aprendiz',1800,'vaga',''),
  ('PSL-10','PSL','junior',3500,'vaga',''),
  ('PSL-11','PSL','junior',3500,'vaga',''),
  ('PSL-12','PSL','junior',3500,'vaga',''),
  ('PSL-13','PSL','analista',6000,'vaga',''),
  ('PSL-14','PSL','analista',6000,'vaga',''),
  ('PSL-15','PSL','analista',6000,'vaga',''),
  ('PSL-16','PSL','gerente',12000,'vaga',''),
  ('PSL-17','PSL','gerente',12000,'vaga',''),
  ('PSL-18','PSL','clevel',25000,'vaga',''),
  ('PSL-19','PSL','aprendiz',1800,'vaga',''),
  ('PSL-20','PSL','aprendiz',1800,'vaga',''),
  ('PSL-21','PSL','aprendiz',1800,'vaga',''),
  ('PSL-22','PSL','junior',3500,'vaga',''),
  ('PSL-23','PSL','junior',3500,'vaga',''),
  ('PSL-24','PSL','junior',3500,'vaga',''),
  ('PSL-25','PSL','analista',6000,'vaga',''),
  ('PSL-26','PSL','analista',6000,'vaga',''),
  ('PSL-27','PSL','analista',6000,'vaga',''),
  ('PSL-28','PSL','gerente',12000,'vaga',''),
  ('PSL-29','PSL','gerente',12000,'vaga',''),
  ('PSL-30','PSL','clevel',25000,'vaga','')
on conflict (id) do nothing;

insert into app_settings (id, bolsao, budget_total)
  values (1, 0, (select sum(valor) from chairs))
on conflict (id) do nothing;

insert into movements (tipo, torre, cadeiras, cargo, valor, detalhes)
  select 'Estrutura Inicial', '—', '90 cadeiras (30 por torre: Corporate, Embarcador, PSL)', '—',
         (select budget_total from app_settings where id = 1),
         'Carga inicial da simulação: 3 torres, 30 cadeiras cada, budget total de R$ ' ||
           to_char((select budget_total from app_settings where id = 1), 'FM999G999G999D00') || '.'
  where not exists (select 1 from movements);
