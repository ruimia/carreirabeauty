-- Permite que administradores leiam todos os perfis (necessário para
-- a lista "Últimos cadastros" no admin, que precisa ver profiles sem
-- companies/professionals associados ainda — cadastros incompletos).
-- Sem isso, RLS restringe cada usuário a ver apenas o próprio profile.

DROP POLICY IF EXISTS "Admin lê todos os perfis" ON profiles;
CREATE POLICY "Admin lê todos os perfis"
  ON profiles FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);
