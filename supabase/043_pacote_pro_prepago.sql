-- Pacote PRO pré-pago (30/90/365 dias) substitui a assinatura recorrente do
-- profissional (cobrança automática via Mercado Pago) — ver seção 4.5 do
-- doc do projeto. Sem assinantes ativos até o momento desta migration, então
-- não há dado existente pra migrar.
--
-- Reaproveita a tabela pagamentos_avulsos (mesmo padrão do certificado
-- avulso, migration 040) — só precisa saber por quantos dias o pacote
-- comprado vale.

alter table pagamentos_avulsos add column if not exists dias integer;
