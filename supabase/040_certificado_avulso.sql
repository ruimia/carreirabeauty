-- Compra avulsa do certificado (R$29,90), alternativa a virar PRO — ver
-- discussão de pricing: avulso custa mais que a mensalidade PRO de propósito,
-- funciona como âncora que faz o PRO parecer a escolha óbvia.

alter table professionals
  add column if not exists certificado_autoestima_origem text
    check (certificado_autoestima_origem in ('pro', 'avulso'));

create table pagamentos_avulsos (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references professionals(id) on delete cascade,
  produto          text not null, -- ex: 'certificado_autoestima'
  mp_payment_id    text unique,
  mp_preference_id text,
  valor            numeric(10,2) not null,
  status           text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create index idx_pagamentos_avulsos_professional on pagamentos_avulsos(professional_id);
create index idx_pagamentos_avulsos_mp_payment on pagamentos_avulsos(mp_payment_id);

alter table pagamentos_avulsos enable row level security;

create policy "Profissional vê seus próprios pagamentos avulsos"
  on pagamentos_avulsos for select
  using (professional_id = (select id from professionals where user_id = auth.uid()));

create policy "Profissional cria seu próprio pagamento avulso"
  on pagamentos_avulsos for insert
  with check (professional_id = (select id from professionals where user_id = auth.uid()));

-- Sem policy de update: só o webhook (service role, bypassa RLS) confirma o
-- pagamento — o profissional não pode se auto-aprovar.

create policy "Admin vê todos os pagamentos avulsos"
  on pagamentos_avulsos for select
  using (public.is_admin());
