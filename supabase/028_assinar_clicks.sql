-- Tracking interno de cliques no botão "Assinar" (qualquer plano, empresa ou
-- profissional) — fecha o funil junto com conteudo_views e plano_views:
-- viu conteúdo PRO -> chegou na página de planos -> clicou em assinar -> assinou (tabela subscriptions/mp).

create table assinar_clicks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  plano_key   text not null,
  criado_em   timestamptz not null default now()
);

create index idx_assinar_clicks_user on assinar_clicks(user_id);

alter table assinar_clicks enable row level security;

create policy "Usuário registra próprio clique de assinar"
  on assinar_clicks for insert
  with check (user_id = auth.uid());

create policy "Usuário vê próprios cliques de assinar"
  on assinar_clicks for select
  using (user_id = auth.uid());

create policy "Admin vê todos os cliques de assinar"
  on assinar_clicks for select
  using (public.is_admin());
