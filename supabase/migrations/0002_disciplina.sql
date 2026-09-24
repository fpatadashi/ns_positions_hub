-- NS Position Hub — adiciona disciplina às cadeiras e libera leitura da tabela de-para de disciplinas
-- Cole no SQL Editor do Supabase e rode.

alter table chairs add column if not exists disciplina text;

alter table "dDisciplinas" enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'dDisciplinas' and policyname = 'authenticated read disciplinas'
  ) then
    create policy "authenticated read disciplinas" on "dDisciplinas" for select to authenticated using (true);
  end if;
end $$;
