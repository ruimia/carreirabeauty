export const PLANOS_EMPRESA = {
  gratis:  { nome: "Grátis",  vagas: 1,  candidatos: 10,  preco: 0 },
  basic:   { nome: "Basic",   vagas: 3,  candidatos: 100, preco: 49 },
  plus:    { nome: "Plus",    vagas: 5,  candidatos: null, preco: 99 },
  premium: { nome: "Premium", vagas: 10, candidatos: null, preco: 179 },
} as const;

export const PLANOS_PROFISSIONAL = {
  gratis: { nome: "Grátis", candidaturas_mes: 3,    preco: 0 },
  pro:    { nome: "Pro",    candidaturas_mes: null,  preco: 29 },
} as const;

export type PlanoEmpresa = keyof typeof PLANOS_EMPRESA;
export type PlanoProfissional = keyof typeof PLANOS_PROFISSIONAL;

export function limiteVagasEmpresa(plano: string): number {
  return PLANOS_EMPRESA[plano as PlanoEmpresa]?.vagas ?? 1;
}

export function limiteCandidatosEmpresa(plano: string): number | null {
  return PLANOS_EMPRESA[plano as PlanoEmpresa]?.candidatos ?? 10;
}

export function limiteCandidaturasMes(plano: string): number | null {
  return PLANOS_PROFISSIONAL[plano as PlanoProfissional]?.candidaturas_mes ?? 3;
}
