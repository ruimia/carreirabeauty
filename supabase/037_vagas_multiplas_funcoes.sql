-- Vaga pode servir pra várias funções ao mesmo tempo (ex: "Manicure/Pedicure"
-- e "Esteticista" pro mesmo posto) — mesmo padrão já usado em
-- professionals.funcoes. Mantém a coluna `funcao` (singular) como fallback
-- de leitura pra código ainda não migrado; `funcoes[0]` é mantida em sincronia.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS funcoes text[] NOT NULL DEFAULT '{}';

UPDATE jobs SET funcoes = ARRAY[funcao]
WHERE funcoes = '{}' AND funcao IS NOT NULL AND funcao <> '';
