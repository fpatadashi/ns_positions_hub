-- NS Position Hub — Torre ganha BU direto (Fase 11)
-- Hoje a única forma de saber "de qual BU é essa Torre" é via relacao_bte —
-- mas relacao_bte exige também uma Empresa, e a estrutura real trouxe Torres
-- sem nenhuma Empresa embaixo (ex.: "Atua Redes", "G&A", "S&M", "R&D").
-- Sem essa coluna, essas Torres ficam órfãs — sem BU nenhum associado.
-- Cole no SQL Editor do Supabase e rode.

alter table torre add column if not exists bu text;

update torre set bu = 'PSL'
  where nome in ('Torre TMS', 'Fintech', 'Torre Mobilidade', 'Torre Buonny', 'Atua Redes', 'BU PSL');

update torre set bu = 'Embarcador'
  where nome in ('Torre VGR', 'Torre SW Embarcador', 'Insurance Market', 'Mídia', 'BU EMBARCADOR');

update torre set bu = 'Corporativo'
  where nome in ('G&A', 'S&M', 'R&D');
