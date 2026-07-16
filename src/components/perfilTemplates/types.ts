export interface PerfilTemplateData {
  nome: string;
  funcao: string;
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
}

export interface PerfilTemplateProps {
  p: PerfilTemplateData;
  // No seletor (dashboard), campos vazios mostram um placeholder de exemplo
  // em vez de sumir — empurrão pra completar o cadastro. Na página pública
  // real, seções vazias continuam ocultas (preview=false).
  preview?: boolean;
}

export function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

export const TEMPLATES = [
  { id: "classico", nome: "Clássico", pro: false },
  { id: "vitrine", nome: "Vitrine", pro: true },
  { id: "elegante", nome: "Elegante", pro: true },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];
