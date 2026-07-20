// Conquistas de ativação (fase 1) — privadas e motivacionais, calculadas na
// hora a partir do que já existe, sem tabela própria.
// Ver badges-conquistas-selos-carreirabeauty.md para a taxonomia completa:
// engajamento vira Conquista (privada), nunca Selo público.

export interface Conquista {
  slug: string;
  nome: string;
  icon: string;
  /** o que a pessoa precisa fazer, na voz dela */
  comoConquistar: string;
  done: boolean;
  /** progresso parcial, quando a conquista é contável (ex: "2 de 5") */
  progresso?: string;
  /** pra onde o CTA leva enquanto não conquistada — omitido quando done */
  href?: string;
  /** rótulo do CTA (ex: "Editar perfil") — omitido quando done */
  cta?: string;
}

export interface EntradaConquistas {
  temFoto: boolean;
  itensPerfilFeitos: number;
  itensPerfilTotal: number;
  portfolioCount: number;
  candidaturas: number;
  /** soma de módulos concluídos em TODAS as trilhas (não uma só) */
  modulosFeitosTotal: number;
  /** quantas trilhas inteiras já foram concluídas */
  trilhasConcluidas: number;
  trilhasTotal: number;
}

const PORTFOLIO_META = 3;
const CANDIDATURAS_META = 5;

export function calcularConquistas(e: EntradaConquistas): Conquista[] {
  return [
    {
      slug: "perfil-no-ar",
      nome: "Perfil no ar",
      icon: "ph-fill ph-rocket-launch",
      comoConquistar: "Você ganhou assim que criou sua conta — seu site já está no ar!",
      done: true,
    },
    {
      slug: "primeira-foto",
      nome: "Primeira foto",
      icon: "ph-fill ph-camera",
      comoConquistar: "Coloque uma foto sua no perfil",
      done: e.temFoto,
      href: "/dashboard/profissional/perfil",
      cta: "Adicionar foto",
    },
    {
      slug: "perfil-completo",
      nome: "Perfil completo",
      icon: "ph-fill ph-user-circle-check",
      comoConquistar: "Preencha os 6 itens do seu perfil",
      done: e.itensPerfilFeitos >= e.itensPerfilTotal,
      progresso: `${Math.min(e.itensPerfilFeitos, e.itensPerfilTotal)} de ${e.itensPerfilTotal}`,
      href: "/dashboard/profissional/perfil",
      cta: "Completar perfil",
    },
    {
      slug: "portfolio",
      nome: "Portfólio caprichado",
      icon: "ph-fill ph-images",
      comoConquistar: `Adicione ${PORTFOLIO_META} fotos do seu trabalho`,
      done: e.portfolioCount >= PORTFOLIO_META,
      progresso: `${Math.min(e.portfolioCount, PORTFOLIO_META)} de ${PORTFOLIO_META}`,
      href: "/dashboard/profissional/perfil",
      cta: "Adicionar fotos",
    },
    {
      slug: "primeira-candidatura",
      nome: "Primeira vaga",
      icon: "ph-fill ph-paper-plane-tilt",
      comoConquistar: "Candidate-se a uma vaga",
      done: e.candidaturas >= 1,
      href: "/dashboard/profissional",
      cta: "Ver vagas",
    },
    {
      slug: "em-movimento",
      nome: "Em movimento",
      icon: "ph-fill ph-lightning",
      comoConquistar: `Candidate-se a ${CANDIDATURAS_META} vagas`,
      done: e.candidaturas >= CANDIDATURAS_META,
      progresso: `${Math.min(e.candidaturas, CANDIDATURAS_META)} de ${CANDIDATURAS_META}`,
      href: "/dashboard/profissional",
      cta: "Ver vagas",
    },
    {
      slug: "comecou-estudar",
      nome: "Começou a estudar",
      icon: "ph-fill ph-graduation-cap",
      comoConquistar: "Conclua o primeiro módulo de uma trilha",
      done: e.modulosFeitosTotal >= 1,
      href: "/dashboard/profissional/quiz",
      cta: "Ir pra trilha",
    },
    {
      slug: "trilha-concluida",
      nome: "Trilha concluída",
      icon: "ph-fill ph-seal-check",
      comoConquistar: "Conclua todos os módulos de uma trilha e ganhe seu certificado",
      done: e.trilhasConcluidas >= 1,
      progresso: `${e.trilhasConcluidas} de ${e.trilhasTotal}`,
      href: "/dashboard/profissional/quiz",
      cta: "Continuar trilha",
    },
  ];
}

/** Itens da força-do-perfil — mesma régua usada no anel de completude */
export function checksPerfil(p: {
  foto_perfil_url?: string | null;
  educacao_basica?: string | null;
  habilidades?: unknown[] | null;
  educacao?: unknown[] | null;
  experiencia_prof?: unknown[] | null;
  portfolio_urls?: unknown[] | null;
}) {
  return [
    { label: "Foto de perfil", done: !!p.foto_perfil_url },
    { label: "Apresentação", done: !!p.educacao_basica },
    { label: "Habilidades", done: (p.habilidades?.length ?? 0) > 0 },
    { label: "Formação e cursos", done: (p.educacao?.length ?? 0) > 0 },
    { label: "Experiência profissional", done: (p.experiencia_prof?.length ?? 0) > 0 },
    { label: "Portfólio", done: (p.portfolio_urls?.length ?? 0) > 0 },
  ];
}
