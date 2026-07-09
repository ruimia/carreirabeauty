-- Múltiplas funções no profissional
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS funcoes text[] DEFAULT '{}';

-- Campo "Outro" personalizado para categoria de negócio
ALTER TABLE companies ADD COLUMN IF NOT EXISTS categoria_outro text;
