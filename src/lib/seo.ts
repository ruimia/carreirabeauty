export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://carreirabeauty.com").replace(/\/$/, "");

const EMPLOYMENT_TYPE_SCHEMA: Record<string, string> = {
  clt: "FULL_TIME",
  pj: "CONTRACTOR",
  freela: "CONTRACTOR",
  estagio: "INTERN",
  menor_aprendiz: "INTERN",
};

export function employmentTypeSchema(tipoVinculo: string | null): string {
  if (!tipoVinculo) return "OTHER";
  return EMPLOYMENT_TYPE_SCHEMA[tipoVinculo] ?? "OTHER";
}

// Extrai valores numéricos de textos como "R$ 1.500 – R$ 2.000", "Até R$ 1.500",
// "Acima de R$ 6.000" — cobre o vocabulário fechado usado no formulário de vaga,
// com fallback genérico pra texto livre (ex: campo "Outro")
export function parseFaixaSalarial(faixa: string | null): { min: number; max?: number } | null {
  if (!faixa) return null;
  const nums = faixa.match(/[\d.]+(?:,\d+)?/g)?.map((n) => parseFloat(n.replace(/\./g, "").replace(",", ".")));
  if (!nums || nums.length === 0) return null;
  if (/acima de/i.test(faixa)) return { min: nums[0] };
  if (/at[eé]/i.test(faixa)) return { min: 0, max: nums[0] };
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  return { min: nums[0] };
}

interface JobPostingInput {
  id: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  slug: string;
  tipoVinculo: string | null;
  faixaSalarial: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  empresaNome: string;
  empresaLogoUrl: string | null;
  empresaSlug: string | null;
}

// JobPosting schema.org — padrão exigido pelo Google Jobs Search
// https://developers.google.com/search/docs/appearance/structured-data/job-posting
export function buildJobPostingLd(vaga: JobPostingInput) {
  const datePosted = new Date(vaga.criadoEm);
  const validThrough = new Date(datePosted);
  validThrough.setDate(validThrough.getDate() + 90);

  const salario = parseFaixaSalarial(vaga.faixaSalarial);

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: vaga.titulo,
    description: vaga.descricao || vaga.titulo,
    identifier: {
      "@type": "PropertyValue",
      name: "CarreiraBeauty",
      value: vaga.id,
    },
    datePosted: datePosted.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: employmentTypeSchema(vaga.tipoVinculo),
    hiringOrganization: {
      "@type": "Organization",
      name: vaga.empresaNome,
      ...(vaga.empresaLogoUrl ? { logo: vaga.empresaLogoUrl } : {}),
      ...(vaga.empresaSlug ? { sameAs: `${APP_URL}/empresa/${vaga.empresaSlug}` } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(vaga.endereco ? { streetAddress: vaga.endereco } : {}),
        ...(vaga.bairro ? { addressLocality: vaga.bairro } : {}),
        addressRegion: vaga.estado ?? "",
        addressCountry: "BR",
      },
    },
    ...(salario
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "BRL",
            value: {
              "@type": "QuantitativeValue",
              minValue: salario.min,
              maxValue: salario.max ?? salario.min,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };
}

interface PersonInput {
  nome: string;
  funcao: string;
  cidade: string | null;
  estado: string | null;
  fotoUrl: string | null;
  slug: string;
}

export function buildPersonLd(p: PersonInput) {
  return {
    "@context": "https://schema.org/",
    "@type": "Person",
    name: p.nome,
    jobTitle: p.funcao,
    ...(p.fotoUrl ? { image: p.fotoUrl } : {}),
    url: `${APP_URL}/perfil/${p.slug}`,
    ...(p.cidade
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: p.cidade,
            addressRegion: p.estado ?? "",
            addressCountry: "BR",
          },
        }
      : {}),
  };
}

interface OrganizationInput {
  nome: string;
  logoUrl: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  slug: string;
}

export function buildOrganizationLd(c: OrganizationInput) {
  return {
    "@context": "https://schema.org/",
    "@type": "Organization",
    name: c.nome,
    ...(c.logoUrl ? { logo: c.logoUrl } : {}),
    url: `${APP_URL}/empresa/${c.slug}`,
    ...(c.cidade
      ? {
          address: {
            "@type": "PostalAddress",
            ...(c.endereco ? { streetAddress: c.endereco } : {}),
            ...(c.bairro ? { addressLocality: c.bairro } : {}),
            addressRegion: c.estado ?? "",
            addressCountry: "BR",
          },
        }
      : {}),
  };
}
