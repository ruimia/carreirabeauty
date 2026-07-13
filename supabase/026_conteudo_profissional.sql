-- Conteúdo (micro-conteúdos em PDF) para profissionais, com gate PRO e
-- tracking interno de visualização (seção 7.9.4/7.9.5 do doc do projeto).
--
-- Gating reusa professionals.plano ('pro'/'gratis') já existente — não
-- cria plano separado por enquanto (decisão de escopo, jul/2026).

create table conteudos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  slug        text not null unique,
  pdf_url     text not null,
  pro         boolean not null default false,
  ordem       int not null default 0,
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

create table conteudo_views (
  id               uuid primary key default gen_random_uuid(),
  conteudo_id      uuid not null references conteudos(id) on delete cascade,
  professional_id  uuid not null references professionals(id) on delete cascade,
  criado_em        timestamptz not null default now()
);

create index idx_conteudo_views_conteudo on conteudo_views(conteudo_id);
create index idx_conteudo_views_professional on conteudo_views(professional_id);

alter table conteudos enable row level security;
alter table conteudo_views enable row level security;

-- Qualquer usuário autenticado pode ver a lista/metadados de conteúdos
-- (o gate de PRO é aplicado na aplicação, não aqui — precisa mostrar o
-- item "bloqueado" pra quem não é PRO, não escondê-lo)
create policy "Usuários autenticados veem conteúdos ativos"
  on conteudos for select
  using (ativo and auth.uid() is not null);

-- Profissional registra e lê apenas as próprias views
create policy "Profissional registra própria view"
  on conteudo_views for insert
  with check (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

create policy "Profissional vê próprias views"
  on conteudo_views for select
  using (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

-- Admin vê todas as views (analytics de consumo)
create policy "Admin vê todas as views de conteúdo"
  on conteudo_views for select
  using (public.is_admin());
