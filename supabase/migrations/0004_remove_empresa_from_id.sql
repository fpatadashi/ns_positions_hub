-- NS Position Hub — remove o código da empresa do ID (fica só ID_<BU>_<F/O/C><seq>).
-- A empresa continua sendo um atributo normal da cadeira, só sai do texto do id.

update chairs
set id = regexp_replace(id, '_NST_', '_')
where id like 'ID\_%\_NST\_%' escape '\';
