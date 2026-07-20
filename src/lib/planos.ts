export const PLANOS_EMPRESA = {
  gratis:  { nome: "Grátis",  vagas: 3, candidatos: 20, preco: 0 },
  premium: { nome: "Premium", vagas: 5, candidatos: 50, preco: 49 },
} as const;

export const PLANOS_PROFISSIONAL = {
  gratis: { nome: "Grátis", candidaturas_mes: 10,   preco: 0,     precoOriginal: null },
  // precoOriginal é só ancoragem visual ("de R$29 por R$14,90") — o valor
  // cobrado de verdade é o `preco`, que espelha o plano no Mercado Pago
  pro:    { nome: "Pro",    candidaturas_mes: null, preco: 14.90, precoOriginal: 29 },
} as const;

// Compra avulsa do certificado — proposital mais caro que a mensalidade PRO
// (R$14,90), funciona como âncora: ao lado do PRO (que dá isso + tudo mais),
// o avulso faz o PRO parecer a escolha óbvia em vez de ganhar do nada.
export const CERTIFICADO_AVULSO_PRECO = 29.90;

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
