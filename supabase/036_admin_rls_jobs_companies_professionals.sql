-- Corrige lacuna de RLS: admin não conseguia ver nem aprovar/rejeitar vagas
-- de empresas que não fossem o próprio dono (só existia policy de dono e de
-- "vaga ativa é pública" — vaga pendente/rejeitada de outra empresa ficava
-- 100% invisível e imutável pro admin). Mesma lacuna existia, de forma mais
-- silenciosa, em companies/professionals: SELECT funcionava (têm policy
-- pública de leitura), mas UPDATE (bloquear/desbloquear) só valia pro dono.

create policy "Admin gerencia todas as vagas"
  on jobs for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin gerencia todas as empresas"
  on companies for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin gerencia todos os profissionais"
  on professionals for all
  using (public.is_admin())
  with check (public.is_admin());
