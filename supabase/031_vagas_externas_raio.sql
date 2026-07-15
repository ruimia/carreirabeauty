-- Passa a buscar vagas externas (Adzuna) por raio em torno da cidade do
-- profissional (parâmetro `distance` da Adzuna), não só match exato de cidade —
-- resolve o caso de profissionais na periferia/região metropolitana. Precisa
-- separar a "cidade de busca" (âncora usada na query) da cidade real da vaga
-- (que pode ser uma cidade vizinha), senão o filtro do dashboard quebra.

alter table vagas_externas add column cidade_busca text;

-- Uma mesma vaga pode aparecer pra mais de uma cidade-âncora (raios que se
-- sobrepõem) — sem isso, o upsert por (fonte, external_id) faria a 2ª busca
-- sobrescrever a 1ª, escondendo a vaga de quem buscou pela âncora anterior.
alter table vagas_externas drop constraint vagas_externas_fonte_external_id_key;
alter table vagas_externas add constraint vagas_externas_fonte_external_id_busca_key
  unique (fonte, external_id, cidade_busca);

create index idx_vagas_externas_cidade_busca on vagas_externas(cidade_busca);
