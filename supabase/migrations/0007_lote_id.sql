-- NS Position Hub — identificador de lote nas movimentações em lote (Modificar/Confirmar)
-- Cole no SQL Editor do Supabase e rode.

alter table movements add column if not exists lote_id bigint;
