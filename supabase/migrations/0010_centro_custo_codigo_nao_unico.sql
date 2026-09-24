-- centro_custo: o código real de RH não é único por descrição (o mesmo
-- código aparece em mais de um Centro de Custo Descrição no arquivo real,
-- por reorganizações/renomeações) — mesmo tipo de achado que já valeu pra
-- Matrícula em pessoa. Nome continua sendo a chave (PK); código vira só
-- informativo, sem unicidade forçada.
alter table centro_custo drop constraint if exists centro_custo_codigo_key;
