-- Tracking interno de visitas à página de Planos do profissional — permite
-- cruzar "quem viu conteúdo PRO" com "quem chegou na página de assinatura".

create table plano_views (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references professionals(id) on delete cascade,
  criado_em        timestamptz not null default now()
);

create index idx_plano_views_professional on plano_views(professional_id);

alter table plano_views enable row level security;

create policy "Profissional registra própria view de planos"
  on plano_views for insert
  with check (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

create policy "Profissional vê próprias views de planos"
  on plano_views for select
  using (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

create policy "Admin vê todas as views de planos"
  on plano_views for select
  using (public.is_admin());
