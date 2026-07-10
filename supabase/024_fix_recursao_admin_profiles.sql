-- Corrige "infinite recursion detected in policy for relation profiles"
-- causado pela migration 023: uma policy em profiles que consulta a
-- própria tabela profiles (mesmo filtrando por auth.uid()) é reavaliada
-- recursivamente pelo RLS. A solução padrão é usar uma função
-- SECURITY DEFINER, que roda com privilégios do dono (bypassa RLS).

DROP POLICY IF EXISTS "Admin lê todos os perfis" ON profiles;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;

CREATE POLICY "Admin lê todos os perfis"
  ON profiles FOR SELECT
  USING (public.is_admin());
