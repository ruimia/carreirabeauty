export const PLANOS_EMPRESA = {
  gratis:  { nome: "Grátis",  vagas: 3, candidatos: 20, preco: 0 },
  premium: { nome: "Premium", vagas: 5, candidatos: 50, preco: 49 },
} as const;

export const PLANOS_PROFISSIONAL = {
  gratis: { nome: "Grátis", candidaturas_mes: 10,   preco: 0,     precoOriginal: null },
  // precoOriginal é só ancoragem visual ("de R$29 por R$14,90") — o valor
  // cobrado de verdade é o do pacote escolhido (ver PACOTES_PRO_PROFISSIONAL)
  pro:    { nome: "Pro",    candidaturas_mes: null, preco: 14.90, precoOriginal: 29 },
} as const;

// Pacote PRO pré-pago (substitui assinatura recorrente — seção 4.5 do doc do
// projeto): sem cobrança automática, sem cancelamento — o acesso só expira
// na data (professionals.plano_validade), igual celular pré-pago. Preço por
// dia cai quanto mais longo o pacote, incentivando comprometimento maior.
export const PACOTES_PRO_PROFISSIONAL = {
  dias30:  { nome: "30 dias",   dias: 30,  preco: 14.90 },
  dias90:  { nome: "3 meses",   dias: 90,  preco: 39.90 },
  dias365: { nome: "12 meses",  dias: 365, preco: 139.90 },
} as const;

export type PacoteProKey = keyof typeof PACOTES_PRO_PROFISSIONAL;

// PRO só conta como ativo se tiver validade futura — sem cron de expiração,
// esse check no momento da leitura é o que "desliga" o benefício sozinho
// quando o pacote pré-pago vence (mesmo efeito do fallback de downgrade
// automático já usado nos templates de perfil).
export function isProAtivo(plano: string | null | undefined, planoValidade: string | null | undefined): boolean {
  if (plano !== "pro") return false;
  if (!planoValidade) return false;
  return new Date(planoValidade).getTime() > Date.now();
}

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
