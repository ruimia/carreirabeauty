-- Novos campos no perfil do profissional
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS educacao jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experiencia_prof jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS habilidades text[] DEFAULT '{}';

-- Tabela de habilidades (administrável pelo admin)
CREATE TABLE IF NOT EXISTS habilidades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0
);

ALTER TABLE habilidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Habilidades legíveis por todos"
  ON habilidades FOR SELECT USING (true);

CREATE POLICY "Habilidades gerenciadas por admin"
  ON habilidades FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Pré-popular habilidades
INSERT INTO habilidades (nome, ordem) VALUES
  ('Corte feminino', 1),
  ('Corte masculino', 2),
  ('Colorimetria', 3),
  ('Mechas', 4),
  ('Balayage', 5),
  ('Escova', 6),
  ('Progressiva / Alisamento', 7),
  ('Botox capilar', 8),
  ('Tratamento capilar', 9),
  ('Penteados', 10),
  ('Tranças', 11),
  ('Extensão capilar', 12),
  ('Manicure', 13),
  ('Pedicure', 14),
  ('Unhas em gel', 15),
  ('Unhas acrílicas', 16),
  ('Nail art', 17),
  ('Esmaltação em gel', 18),
  ('Alongamento de unhas', 19),
  ('Fibra de vidro', 20),
  ('Limpeza de pele', 21),
  ('Peeling', 22),
  ('Microagulhamento', 23),
  ('Design de sobrancelha', 24),
  ('Extensão de cílios', 25),
  ('Lifting de cílios', 26),
  ('Massagem relaxante', 27),
  ('Massagem modeladora', 28),
  ('Drenagem linfática', 29),
  ('Depilação a cera', 30),
  ('Depilação a laser', 31),
  ('Maquiagem social', 32),
  ('Maquiagem para noivas', 33),
  ('Airbrush', 34),
  ('Barboterapia', 35),
  ('Micropigmentação', 36),
  ('Podologia', 37),
  ('Spa dos pés', 38),
  ('Pressoterapia', 39),
  ('Aromaterapia', 40);
