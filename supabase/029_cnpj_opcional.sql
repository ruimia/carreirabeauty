-- Permite cadastrar empresa sem CNPJ (usuário pode pular a etapa no onboarding
-- e preencher os dados manualmente). Unique continua valendo — Postgres trata
-- múltiplos NULL como distintos, então não há conflito entre empresas sem CNPJ.
alter table public.companies alter column cnpj drop not null;
