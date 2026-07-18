-- applications ficou de fora da migration 036 (que deu bypass de RLS pro
-- admin em jobs/companies/professionals) — admin não enxergava candidaturas
-- de vagas que não eram dele, mesmo existindo de verdade no banco.
create policy "Admin gerencia todas as candidaturas" on applications for all
  using (public.is_admin()) with check (public.is_admin());
