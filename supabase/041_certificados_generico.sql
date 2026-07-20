-- Generaliza o desbloqueio de certificado pra suportar várias trilhas (antes
-- só existia a coluna certificado_autoestima_desbloqueado_em, hardcoded pra
-- uma trilha só). Ver src/lib/quizContent.ts (TRILHAS) pro catálogo atual.

create table certificados (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references professionals(id) on delete cascade,
  trilha_slug      text not null,
  desbloqueado_em  timestamptz not null default now(),
  origem           text not null check (origem in ('pro', 'avulso')),
  unique (professional_id, trilha_slug)
);

create index idx_certificados_professional on certificados(professional_id);

alter table certificados enable row level security;

create policy "Profissional vê os próprios certificados"
  on certificados for select
  using (professional_id = (select id from professionals where user_id = auth.uid()));

-- O caminho PRO desbloqueia direto do client (ResgateCertificado chama
-- supabase.from("certificados").insert(...) autenticado) — mesmo padrão que
-- já existia pra escrever em professionals.certificado_autoestima_*; o
-- gate de "só se for PRO" é feito na aplicação, não na policy.
create policy "Profissional registra o próprio certificado"
  on certificados for insert
  with check (professional_id = (select id from professionals where user_id = auth.uid()));

-- Sem policy de update/delete — desbloqueio é definitivo, e o caminho avulso
-- só é escrito pelo webhook (service role, bypassa RLS).

create policy "Admin vê todos os certificados"
  on certificados for select
  using (public.is_admin());

-- Migra o único desbloqueio que já existia (se houver) pro formato novo
insert into certificados (professional_id, trilha_slug, desbloqueado_em, origem)
select id, 'autoestima-postura', certificado_autoestima_desbloqueado_em,
       coalesce(certificado_autoestima_origem, 'pro')
from professionals
where certificado_autoestima_desbloqueado_em is not null
on conflict (professional_id, trilha_slug) do nothing;

alter table professionals
  drop column if exists certificado_autoestima_desbloqueado_em,
  drop column if exists certificado_autoestima_origem;

-- pagamentos_avulsos precisa saber QUAL trilha foi comprada (antes só existia
-- uma, identificada pelo campo produto = 'certificado_autoestima')
alter table pagamentos_avulsos add column if not exists trilha_slug text;
update pagamentos_avulsos set trilha_slug = 'autoestima-postura' where produto = 'certificado_autoestima' and trilha_slug is null;
