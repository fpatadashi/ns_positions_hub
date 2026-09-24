-- NS Position Hub — relação BU/Torre/Empresa (cascata nos dropdowns)
-- Cole no SQL Editor do Supabase e rode.

create table if not exists relacao_bte (
  id bigint generated always as identity primary key,
  bu text not null,
  torre text not null,
  empresa text not null,
  unique (bu, torre, empresa)
);

alter table relacao_bte enable row level security;

create policy "authenticated read relacao_bte" on relacao_bte for select to authenticated using (true);
create policy "authenticated write relacao_bte" on relacao_bte for insert to authenticated with check (true);
create policy "authenticated update relacao_bte" on relacao_bte for update to authenticated using (true);
create policy "authenticated delete relacao_bte" on relacao_bte for delete to authenticated using (true);
