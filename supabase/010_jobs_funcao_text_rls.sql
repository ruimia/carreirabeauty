-- funcao: trocar enum por text (compatível com profissoes dinâmicas do DB)
ALTER TABLE jobs ALTER COLUMN funcao TYPE text;
ALTER TABLE professionals ALTER COLUMN funcao TYPE text;

-- Leitura pública nas tabelas de configuração
CREATE POLICY IF NOT EXISTS "Profissões legíveis por todos"
  ON profissoes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Categorias legíveis por todos"
  ON categorias_negocio FOR SELECT USING (true);
