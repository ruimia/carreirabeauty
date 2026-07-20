-- Depoimentos de clientes: profissional compartilha um link público
-- (/depoimento/{slug}) e o cliente preenche sem precisar de conta.
-- Fica pendente até o profissional aprovar; só aprovados aparecem no
-- perfil público. Ver src/app/depoimento/[slug] (formulário público) e
-- src/app/dashboard/profissional/depoimentos (moderação).

create table depoimentos (
  id                uuid primary key default gen_random_uuid(),
  professional_id   uuid not null references professionals(id) on delete cascade,
  nome_cliente      text not null,
  telefone_cliente  text not null,
  estrelas          smallint not null check (estrelas between 1 and 5),
  texto             text not null,
  status            text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  criado_em         timestamptz not null default now(),
  unique (professional_id, telefone_cliente)
);

create index idx_depoimentos_professional on depoimentos(professional_id);

alter table depoimentos enable row level security;

-- Formulário público (sem login) só consegue criar em estado pendente —
-- nunca inserir já aprovado.
create policy "Qualquer um pode enviar um depoimento"
  on depoimentos for insert
  with check (status = 'pendente');

-- Profissional vê e modera (aprova/rejeita) só os próprios, em qualquer status.
create policy "Profissional vê os próprios depoimentos"
  on depoimentos for select
  using (professional_id = (select id from professionals where user_id = auth.uid()));

create policy "Profissional modera os próprios depoimentos"
  on depoimentos for update
  using (professional_id = (select id from professionals where user_id = auth.uid()));

-- Perfil público (visitante anônimo) só enxerga os já aprovados.
create policy "Depoimentos aprovados são públicos"
  on depoimentos for select
  using (status = 'aprovado');

create policy "Admin vê todos os depoimentos"
  on depoimentos for select
  using (public.is_admin());
