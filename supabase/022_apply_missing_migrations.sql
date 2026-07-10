-- ============================================================
-- 022 — Aplica todas as migrations que faltam na produção
-- Rode no Supabase SQL Editor (é idempotente — pode rodar mais de uma vez)
-- ============================================================

-- 006: múltiplas funções profissional
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS funcoes text[] DEFAULT '{}';

-- 007: campos adicionais
ALTER TABLE companies     ADD COLUMN IF NOT EXISTS categoria_outro text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS cep           text NOT NULL DEFAULT '';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS endereco      text NOT NULL DEFAULT '';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS data_nascimento date;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS genero        text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS instagram     text;
ALTER TABLE jobs          ADD COLUMN IF NOT EXISTS cep           text NOT NULL DEFAULT '';
ALTER TABLE jobs          ADD COLUMN IF NOT EXISTS endereco      text NOT NULL DEFAULT '';
ALTER TABLE jobs          ADD COLUMN IF NOT EXISTS cidade        text NOT NULL DEFAULT '';
ALTER TABLE jobs          ADD COLUMN IF NOT EXISTS estado        text NOT NULL DEFAULT '';

-- 008: slugs
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE jobs      ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 008: policies públicas
DROP POLICY IF EXISTS "Empresa pública legível por todos" ON companies;
CREATE POLICY "Empresa pública legível por todos" ON companies FOR SELECT USING (true);

-- 009: título e foto da vaga
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS titulo   text NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS foto_url text;

-- 011: perfil profissional rico
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS educacao        jsonb   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experiencia_prof jsonb  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio_urls  text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS habilidades     text[]  DEFAULT '{}';

CREATE TABLE IF NOT EXISTS habilidades (
  id    uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome  text    NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  ordem int     NOT NULL DEFAULT 0
);
ALTER TABLE habilidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Habilidades legíveis por todos"   ON habilidades;
DROP POLICY IF EXISTS "Habilidades gerenciadas por admin" ON habilidades;
CREATE POLICY "Habilidades legíveis por todos"   ON habilidades FOR SELECT USING (true);
CREATE POLICY "Habilidades gerenciadas por admin" ON habilidades FOR ALL
  USING     ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

INSERT INTO habilidades (nome, ordem) VALUES
  ('Corte feminino', 1), ('Corte masculino', 2), ('Colorimetria', 3), ('Mechas', 4),
  ('Balayage', 5), ('Escova', 6), ('Progressiva / Alisamento', 7), ('Botox capilar', 8),
  ('Tratamento capilar', 9), ('Penteados', 10), ('Tranças', 11), ('Extensão capilar', 12),
  ('Manicure', 13), ('Pedicure', 14), ('Unhas em gel', 15), ('Unhas acrílicas', 16),
  ('Nail art', 17), ('Esmaltação em gel', 18), ('Alongamento de unhas', 19),
  ('Fibra de vidro', 20), ('Limpeza de pele', 21), ('Peeling', 22),
  ('Microagulhamento', 23), ('Design de sobrancelha', 24), ('Extensão de cílios', 25),
  ('Lifting de cílios', 26), ('Massagem relaxante', 27), ('Massagem modeladora', 28),
  ('Drenagem linfática', 29), ('Depilação a cera', 30), ('Depilação a laser', 31),
  ('Maquiagem social', 32), ('Maquiagem para noivas', 33), ('Airbrush', 34),
  ('Barboterapia', 35), ('Micropigmentação', 36), ('Podologia', 37),
  ('Spa dos pés', 38), ('Pressoterapia', 39), ('Aromaterapia', 40)
ON CONFLICT DO NOTHING;

-- 013: tipo_vinculo para text
ALTER TABLE jobs          ALTER COLUMN tipo_vinculo TYPE text;
ALTER TABLE professionals ALTER COLUMN tipo_vinculo TYPE text;

-- 014: remuneração e comissão
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS modelo_remuneracao text NOT NULL DEFAULT 'a_combinar';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS comissao           text NOT NULL DEFAULT '';

-- 015: moderação (já deve ter sido aplicado, mas idempotente)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS motivo_rejeicao text;

-- 016: mensagem na candidatura
ALTER TABLE applications ADD COLUMN IF NOT EXISTS mensagem text;

-- 018: planos
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS plano          text NOT NULL DEFAULT 'gratis'
    CHECK (plano IN ('gratis','basic','plus','premium')),
  ADD COLUMN IF NOT EXISTS plano_status   text NOT NULL DEFAULT 'ativo'
    CHECK (plano_status IN ('ativo','cancelado','expirado')),
  ADD COLUMN IF NOT EXISTS plano_validade timestamptz;

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS plano          text NOT NULL DEFAULT 'gratis'
    CHECK (plano IN ('gratis','pro')),
  ADD COLUMN IF NOT EXISTS plano_status   text NOT NULL DEFAULT 'ativo'
    CHECK (plano_status IN ('ativo','cancelado','expirado')),
  ADD COLUMN IF NOT EXISTS plano_validade timestamptz,
  ADD COLUMN IF NOT EXISTS cpf            text;

-- 019: mercado pago
ALTER TABLE companies     ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS mp_subscription_id text;

-- Recarrega schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
