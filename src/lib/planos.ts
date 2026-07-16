export const PLANOS_EMPRESA = {
  gratis:  { nome: "Grátis",  vagas: 1,  candidatos: 10,  preco: 0 },
  basic:   { nome: "Basic",   vagas: 3,  candidatos: 100, preco: 49 },
  plus:    { nome: "Plus",    vagas: 5,  candidatos: null, preco: 99 },
  premium: { nome: "Premium", vagas: 10, candidatos: null, preco: 179 },
} as const;

export const PLANOS_PROFISSIONAL = {
  gratis: { nome: "Grátis", candidaturas_mes: 10,    preco: 0 },
  pro:    { nome: "Pro",    candidaturas_mes: null,  preco: 14.90 },
} as const;

export type PlanoEmpresa = keyof typeof PLANOS_EMPRESA;
export type PlanoProfissional = keyof typeof PLANOS_PROFISSIONAL;

/** Preço no formato brasileiro — só mostra centavos quando existem (49 → "49", 14.9 → "14,90") */
export function formatPreco(preco: number): string {
  return Number.isInteger(preco)
    ? String(preco)
    : preco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function limiteVagasEmpresa(plano: string): number {
  return PLANOS_EMPRESA[plano as PlanoEmpresa]?.vagas ?? PLANOS_EMPRESA.gratis.vagas;
}

export function limiteCandidatosEmpresa(plano: string): number | null {
  return plano in PLANOS_EMPRESA
    ? PLANOS_EMPRESA[plano as PlanoEmpresa].candidatos
    : PLANOS_EMPRESA.gratis.candidatos;
}

export function limiteCandidaturasMes(plano: string): number | null {
  return plano in PLANOS_PROFISSIONAL
    ? PLANOS_PROFISSIONAL[plano as PlanoProfissional].candidaturas_mes
    : PLANOS_PROFISSIONAL.gratis.candidaturas_mes;
}
