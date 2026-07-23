import { createPublicClient } from "@/lib/supabase/public";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Página pública, sem estado de sessão — ISR em vez de renderizar do zero a
// cada visita. Usa client anônimo sem cookies (createPublicClient) pra não
// forçar renderização dinâmica; revalida a cada 5 min.
export const revalidate = 300;
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import TemplateClassico from "@/components/perfilTemplates/TemplateClassico";
import TemplateVitrine from "@/components/perfilTemplates/TemplateVitrine";
import TemplateElegante from "@/components/perfilTemplates/TemplateElegante";
import TemplateAurora from "@/components/perfilTemplates/TemplateAurora";
import TemplateEstudio from "@/components/perfilTemplates/TemplateEstudio";
import { PerfilTemplateData } from "@/components/perfilTemplates/types";
import { APP_URL, buildPersonLd } from "@/lib/seo";
import { isProAtivo } from "@/lib/planos";

function funcoesLabel(funcoes: string[] | null, funcaoOutro: string | null): string {
  if (!funcoes?.length) return "Profissional de beleza";
  return funcoes.map((f) => (f === "Outro" ? (funcaoOutro || "Outro") : f)).join(", ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: p } = await supabase
    .from("professionals")
    .select("nome, funcoes, funcao_outro, cidade, estado, foto_perfil_url")
    .eq("slug", slug).single();

  if (!p) return { title: "Perfil não encontrado" };

  const funcao = funcoesLabel(p.funcoes, p.funcao_outro);
  const title = `${p.nome} — ${funcao} em ${p.cidade}`;
  const description = `Perfil profissional de ${p.nome}, ${funcao} em ${p.cidade} - ${p.estado}. Encontre profissionais de beleza no CarreiraBeauty.`;
  const url = `${APP_URL}/perfil/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "profile",
      images: p.foto_perfil_url ? [p.foto_perfil_url] : [],
    },
    twitter: { card: "summary", title, description, images: p.foto_perfil_url ? [p.foto_perfil_url] : [] },
  };
}

export default async function PerfilPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  let { data: p } = await supabase.from("professionals").select("*").eq("slug", slug).single();

  if (!p) {
    const { data: history } = await supabase
      .from("professional_slug_history")
      .select("professional_id, professionals(slug)")
      .eq("slug", slug).maybeSingle();

    if (!history) notFound();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentSlug = (history.professionals as any)?.slug;
    if (currentSlug) redirect(`/perfil/${currentSlug}`);
    notFound();
  }

  const funcao = funcoesLabel(p.funcoes, p.funcao_outro);
  const isPro = isProAtivo(p.plano, p.plano_validade);

  // Templates PRO mostram contatos (WhatsApp/email) — o email vive em profiles,
  // que o RLS não expõe pra visitante anônimo; service role só pra esse lookup
  let email: string | null = null;
  if (isPro && p.user_id) {
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: perfil } = await supabaseService.from("profiles").select("email").eq("id", p.user_id).maybeSingle();
    email = perfil?.email ?? null;
  }

  const { data: depoimentosRows } = await supabase
    .from("depoimentos")
    .select("nome_cliente, estrelas, texto")
    .eq("professional_id", p.id)
    .eq("status", "aprovado")
    .order("criado_em", { ascending: false });

  const tags = [
    p.experiencia ? `${p.experiencia} de experiência` : null,
  ].filter((t): t is string => !!t);

  const templateData: PerfilTemplateData = {
    nome: p.nome,
    funcao,
    bairro: p.bairro,
    cidade: p.cidade,
    estado: p.estado,
    fotoUrl: p.foto_perfil_url,
    instagram: p.instagram,
    whatsapp: isPro ? (p.telefone || null) : null,
    email,
    tags,
    apresentacao: p.educacao_basica || null,
    experiencia: p.experiencia || null,
    disponibilidade: p.disponibilidade || null,
    tipoVinculo: p.tipo_vinculo || null,
    habilidades: p.habilidades ?? [],
    educacao: p.educacao ?? [],
    experienciaProf: p.experiencia_prof ?? [],
    portfolioUrls: p.portfolio_urls ?? [],
    depoimentos: (depoimentosRows ?? []).map((d) => ({ nomeCliente: d.nome_cliente, estrelas: d.estrelas, texto: d.texto })),
  };

  // Templates PRO só renderizam pra quem ainda é PRO — se desceu de plano,
  // volta pro Clássico automaticamente em vez de manter o visual travado
  const templateId = isPro ? (p.template_id ?? "classico") : "classico";

  const personLd = buildPersonLd({
    nome: p.nome,
    funcao,
    cidade: p.cidade,
    estado: p.estado,
    fotoUrl: p.foto_perfil_url,
    slug: p.slug,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      {/* Header bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 52,
        display: "flex", alignItems: "center",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CarreiraBeauty" style={{ height: 20, objectFit: "contain" }} />
        </Link>
      </header>

      {templateId === "vitrine" && <TemplateVitrine p={templateData} />}
      {templateId === "elegante" && <TemplateElegante p={templateData} />}
      {templateId === "aurora" && <TemplateAurora p={templateData} />}
      {templateId === "estudio" && <TemplateEstudio p={templateData} />}
      {templateId === "classico" && <TemplateClassico p={templateData} />}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 var(--space-page-x) 48px" }}>
        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CarreiraBeauty" style={{ height: 16, objectFit: "contain" }} />
          </Link>
          <p style={{ fontSize: 12, color: "var(--neutral-400)" }}>
            <Link href="/termos" style={{ color: "var(--neutral-400)" }}>Termos</Link>
            {" "}·{" "}
            <Link href="/privacidade" style={{ color: "var(--neutral-400)" }}>Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
