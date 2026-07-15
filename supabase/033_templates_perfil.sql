-- Templates visuais de perfil (seção 7.9.6 do doc do projeto) — hipótese 2 de
-- teste: oferecer 2-3 temas visuais prontos pra página pública, com preview
-- livre pra todo mundo e paywall só no momento de salvar um tema PRO.

alter table professionals add column template_id text not null default 'classico';

-- Tracking dos 3 sinais definidos no doc: (a) chegou no preview de um tema PRO,
-- (b) tentou salvar e bateu no paywall, (c) aplicou de fato (grátis ou já PRO)
create table template_eventos (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references professionals(id) on delete cascade,
  template_id      text not null,
  tipo             text not null check (tipo in ('preview', 'paywall_hit', 'aplicado')),
  criado_em        timestamptz not null default now()
);

create index idx_template_eventos_professional on template_eventos(professional_id);

alter table template_eventos enable row level security;

create policy "Profissional registra próprio evento de template"
  on template_eventos for insert
  with check (
    professional_id = (select id from professionals where user_id = auth.uid())
  );

create policy "Admin vê todos os eventos de template"
  on template_eventos for select
  using (public.is_admin());
