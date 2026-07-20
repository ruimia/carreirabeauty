export interface Depoimento {
  nomeCliente: string;
  estrelas: number;
  texto: string;
}

export interface PerfilTemplateData {
  nome: string;
  funcao: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoUrl: string | null;
  instagram: string | null;
  whatsapp: string | null;
  email: string | null;
  tags: string[];
  apresentacao: string | null;
  experiencia: string | null;
  disponibilidade: string | null;
  tipoVinculo: string | null;
  habilidades: string[];
  educacao: { curso: string; instituicao?: string; ano?: string }[];
  experienciaProf: { cargo: string; empresa?: string; periodo?: string }[];
  portfolioUrls: string[];
  depoimentos: Depoimento[];
}

export interface PerfilTemplateProps {
  p: PerfilTemplateData;
  // No seletor (dashboard), campos vazios mostram um placeholder de exemplo
  // em vez de sumir — empurrão pra completar o cadastro. Na página pública
  // real, seções vazias continuam ocultas (preview=false).
  preview?: boolean;
  // WhatsApp/email só aparecem pra quem já é PRO (p.whatsapp/p.email vêm
  // null do caller quando plano != "pro", mesmo que o dado exista). No
  // preview de um tema PRO pra quem ainda é grátis, em vez de simplesmente
  // sumir com os contatos, mostramos um botão bloqueado — é o próprio
  // benefício que o PRO desbloqueia, então esconder undersell a venda.
  contatosBloqueados?: boolean;
}

export function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

export const TEMPLATES = [
  { id: "classico", nome: "Clássico", pro: false },
  {
    id: "vitrine", nome: "Vitrine", pro: true,
    tagline: "Pra quem quer ser lembrado como uma marca, não só um nome na lista.",
  },
  {
    id: "elegante", nome: "Elegante", pro: true,
    tagline: "O visual que passa confiança pra fechar clientes de ticket mais alto.",
  },
  {
    id: "aurora", nome: "Aurora", pro: true,
    tagline: "Chama atenção logo de cara — combina com quem trabalha na régua da criatividade.",
  },
  {
    id: "estudio", nome: "Estúdio", pro: true,
    tagline: "Seu trabalho na frente, antes de qualquer palavra — ideal pra quem vive de portfólio.",
  },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];
