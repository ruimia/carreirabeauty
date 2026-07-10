-- =============================================================
-- 021 — Corrige problemas de produção
-- Rode no Supabase SQL Editor
-- =============================================================

-- 1. Converte jobs.status de enum para text (evita problema com pendente_moderacao/rejeitada)
ALTER TABLE jobs ALTER COLUMN status TYPE text;
ALTER TABLE jobs ALTER COLUMN tipo_vinculo TYPE text;

-- 2. Converte professionals.tipo_vinculo de enum para text (se ainda não foi feito)
ALTER TABLE professionals ALTER COLUMN tipo_vinculo TYPE text;

-- 3. Cria tabela categorias_negocio (estava faltando em todas as migrations)
CREATE TABLE IF NOT EXISTS categorias_negocio (
  id     serial PRIMARY KEY,
  nome   text NOT NULL UNIQUE,
  ativo  boolean NOT NULL DEFAULT true,
  ordem  int NOT NULL DEFAULT 99
);

INSERT INTO categorias_negocio (nome, ativo, ordem) VALUES
  ('Salão de beleza',               true, 1),
  ('Barbearia',                     true, 2),
  ('Esmalteria',                    true, 3),
  ('Clínica de estética',           true, 4),
  ('Spa / Massoterapia',            true, 5),
  ('Estúdio de sobrancelha/cílios', true, 6),
  ('Clínica de depilação',          true, 7),
  ('Clínica de micropigmentação',   true, 8),
  ('Centro de podologia',           true, 9),
  ('Outro',                         true, 99)
ON CONFLICT (nome) DO NOTHING;

-- 4. RLS na categorias_negocio
ALTER TABLE categorias_negocio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categorias legíveis por todos" ON categorias_negocio;
DROP POLICY IF EXISTS "Categorias gerenciadas por admin" ON categorias_negocio;
CREATE POLICY "Categorias legíveis por todos"
  ON categorias_negocio FOR SELECT USING (true);
CREATE POLICY "Categorias gerenciadas por admin"
  ON categorias_negocio FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- 5. RLS na profissoes (pode ter falhado antes porque a tabela não existia)
DROP POLICY IF EXISTS "Profissões legíveis por todos" ON profissoes;
DROP POLICY IF EXISTS "Profissões gerenciadas por admin" ON profissoes;
CREATE POLICY "Profissões legíveis por todos"
  ON profissoes FOR SELECT USING (true);
CREATE POLICY "Profissões gerenciadas por admin"
  ON profissoes FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- 6. habilidades.profissao column (migration 012 pode ter falhado)
ALTER TABLE habilidades ADD COLUMN IF NOT EXISTS profissao text;

-- 7. Garante dados mínimos em profissoes
INSERT INTO profissoes (nome, ativo, ordem) VALUES
  ('Cabeleireiro(a)',                 true,  1),
  ('Manicure/Pedicure',               true,  2),
  ('Esteticista',                     true,  3),
  ('Maquiador(a)',                    true,  4),
  ('Barbeiro',                        true,  5),
  ('Massoterapeuta',                  true,  6),
  ('Designer de sobrancelha/cílios',  true,  7),
  ('Depilador(a)',                    true,  8),
  ('Podólogo(a)',                     true,  9),
  ('Recepcionista',                   true, 10),
  ('Auxiliar/assistente',             true, 11),
  ('Micropigmentista',                true, 12)
ON CONFLICT (nome) DO NOTHING;
