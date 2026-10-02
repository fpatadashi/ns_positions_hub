-- NS Position Hub — catálogo de Highlights (selo de destaque nas cadeiras):
-- cada linha é um tipo de ocorrência + o ícone (emoji) usado pra representá-la.
-- Mesmo formato nome/codigo dos demais cadastros (codigo = emoji aqui).
-- Cole no SQL Editor do Supabase e rode.

create table if not exists highlight (
  nome text primary key,
  codigo text not null
);

alter table highlight enable row level security;

create policy "authenticated read highlight" on highlight for select to authenticated using (true);
create policy "authenticated write highlight" on highlight for insert to authenticated with check (true);
create policy "authenticated update highlight" on highlight for update to authenticated using (true);
create policy "authenticated delete highlight" on highlight for delete to authenticated using (true);

insert into highlight (nome, codigo) values ('Mérito recente', '⭐')
on conflict (nome) do nothing;
