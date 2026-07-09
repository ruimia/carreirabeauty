-- Planos para empresas
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'gratis'
    CHECK (plano IN ('gratis', 'basic', 'plus', 'premium')),
  ADD COLUMN IF NOT EXISTS plano_status text NOT NULL DEFAULT 'ativo'
    CHECK (plano_status IN ('ativo', 'cancelado', 'expirado')),
  ADD COLUMN IF NOT EXISTS plano_validade timestamptz;

-- Planos para profissionais
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'gratis'
    CHECK (plano IN ('gratis', 'pro')),
  ADD COLUMN IF NOT EXISTS plano_status text NOT NULL DEFAULT 'ativo'
    CHECK (plano_status IN ('ativo', 'cancelado', 'expirado')),
  ADD COLUMN IF NOT EXISTS plano_validade timestamptz,
  ADD COLUMN IF NOT EXISTS cpf text;

-- Limites por plano (referência, enforcement feito no app)
-- Empresa gratis:   1 vaga,  10 candidatos visíveis
-- Empresa basic:    3 vagas, 100 candidatos visíveis
-- Empresa plus:     5 vagas, ilimitado
-- Empresa premium: 10 vagas, ilimitado
-- Profissional gratis: 3 candidaturas/mês
-- Profissional pro:    ilimitado
