-- Vagas Agregadas (Fase 6.5 do doc do projeto) — vagas de fontes externas
-- (Adzuna) exibidas numa seção separada das vagas nativas, pra dar
-- percepção de volume/liquidez enquanto a base própria de empresas ainda
-- é pequena. Populado por job/script periódico (scripts/fetch-vagas-adzuna.mjs),
-- não por chamada direta do usuário — respeita o limite do plano free da Adzuna.

create table vagas_externas (
  id             uuid primary key default gen_random_uuid(),
  fonte          text not null default 'adzuna',
  external_id    text not null,
  titulo         text not null,
  empresa        text,
  cidade         text,
  estado         text,
  url            text not null,
  descricao      text,
  salario_min    numeric,
  salario_max    numeric,
  publicado_em   timestamptz,
  categoria      text,
  atualizado_em  timestamptz not null default now(),
  criado_em      timestamptz not null default now(),
  unique (fonte, external_id)
);

create index idx_vagas_externas_cidade on vagas_externas(cidade, estado);

alter table vagas_externas enable row level security;

create policy "Usuários autenticados veem vagas externas"
  on vagas_externas for select
  using (auth.uid() is not null);

-- Tracking interno de cliques (métrica de validação: engajamento em
-- vaga agregada vs. nativa) — mesmo padrão de assinar_clicks/conteudo_views
create table vagas_externas_clicks (
  id               uuid primary key default gen_random_uuid(),
  vaga_externa_id  uuid not null references vagas_externas(id) on delete cascade,
  professional_id  uuid not null references professionals(id) on delete cascade,
  criado_em        timestamptz not null default now()
);

create index idx_vagas_externas_clicks_vaga on vagas_externas_clicks(vaga_externa_id);

alter table vagas_externas_clicks enable row level security;

create policy "Profissional registra próprio clique em vaga externa"
  on vagas_externas_clicks for insert
  with check (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

create policy "Admin vê todos os cliques em vagas externas"
  on vagas_externas_clicks for select
  using (public.is_admin());
