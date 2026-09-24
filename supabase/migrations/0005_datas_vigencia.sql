-- NS Position Hub — datas de vigência por cadeira (para a visão mês a mês do Dashboard)

alter table chairs add column if not exists data_inicio date;
alter table chairs add column if not exists data_fim date;
