-- Campos adicionais para profissionais
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS cep text NOT NULL DEFAULT '';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS data_nascimento date;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS genero text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS instagram text;

-- Endereço nas vagas (auto-copiado da empresa, editável)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cep text NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT '';
