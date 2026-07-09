-- Slugs para empresas e vagas
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug text unique;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug text unique;

-- Empresas e vagas ativas são públicas
CREATE POLICY IF NOT EXISTS "Empresa pública legível por todos"
  ON companies FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Vagas ativas são legíveis por todos"
  ON jobs FOR SELECT USING (true);
