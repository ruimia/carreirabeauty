-- Quiz-certificado (piloto trilha "Autoestima e Postura Profissional", seção 7.9.7)
-- Conteúdo dos módulos/perguntas vive em código (src/lib/quizContent.ts), não no banco —
-- essas tabelas guardam só progresso e sinais de intenção de compra pro teste.

create table quiz_progresso (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  trilha_slug     text not null,
  modulo_slug     text not null,
  acertos         int not null,
  total           int not null,
  concluido_em    timestamptz not null default now(),
  unique (professional_id, trilha_slug, modulo_slug)
);

create index idx_quiz_progresso_professional on quiz_progresso(professional_id);

-- Log de eventos do funil do certificado — é o que responde "esse módulo
-- incentiva virar PRO?": conta tentativa de resgate vs. desbloqueio de fato.
create table quiz_eventos (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  trilha_slug     text not null,
  evento          text not null, -- 'certificado_tentativa' | 'certificado_desbloqueado'
  criado_em       timestamptz not null default now()
);

create index idx_quiz_eventos_professional on quiz_eventos(professional_id);

-- Marca quando o certificado da trilha foi desbloqueado (hoje só via plano PRO)
alter table professionals add column if not exists certificado_autoestima_desbloqueado_em timestamptz;

alter table quiz_progresso enable row level security;
alter table quiz_eventos enable row level security;

create policy "Profissional gerencia próprio progresso de quiz"
  on quiz_progresso for all
  using (professional_id = (select id from professionals where user_id = auth.uid()))
  with check (professional_id = (select id from professionals where user_id = auth.uid()));

create policy "Profissional registra e lê próprios eventos de quiz"
  on quiz_eventos for all
  using (professional_id = (select id from professionals where user_id = auth.uid()))
  with check (professional_id = (select id from professionals where user_id = auth.uid()));

create policy "Admin vê todo progresso de quiz"
  on quiz_progresso for select
  using (public.is_admin());

create policy "Admin vê todos os eventos de quiz"
  on quiz_eventos for select
  using (public.is_admin());
