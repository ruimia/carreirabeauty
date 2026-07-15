-- Log de execuções da atualização manual do cache de vagas agregadas
-- (botão no admin, seção "Vagas externas") — substitui o cron por enquanto:
-- admin dispara manualmente e vê o resultado da última chamada.

create table vagas_externas_atualizacoes (
  id                    uuid primary key default gen_random_uuid(),
  iniciado_em           timestamptz not null default now(),
  concluido_em          timestamptz,
  cidades_processadas   int,
  chamadas_api          int,
  vagas_encontradas     int,
  erro                  text,
  executado_por         uuid references profiles(id)
);

alter table vagas_externas_atualizacoes enable row level security;

create policy "Admin vê e registra atualizações de vagas externas"
  on vagas_externas_atualizacoes for all
  using (public.is_admin())
  with check (public.is_admin());
