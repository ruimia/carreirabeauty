-- Bairro separado de cidade/estado, para facilitar localização de vagas, profissionais e empresas
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '';
