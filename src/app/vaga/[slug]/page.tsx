import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import CandidaturaSection from "./CandidaturaSection";
import CandidatarFloatingButton from "./CandidatarFloatingButton";
import VoltarLink from "@/components/VoltarLink";
import type { Metadata } from "next";
import { APP_URL, buildJobPostingLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: vaga } = await supabase
    .from("jobs").select("titulo, funcao, descricao, cidade, estado, companies(nome_estabelecimento, logo_url)").eq("slug", slug).single();
  if (!vaga) return { title: "Vaga não encontrada" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const company = vaga.companies as any;
  const empresa = company?.nome_estabelecimento ?? "";
  const titulo = vaga.titulo || vaga.funcao || "Vaga";
  const local = [vaga.cidade, vaga.estado].filter(Boolean).join(" - ");
  const title = empresa ? `${titulo} — ${empresa}${local ? ` (${local})` : ""}` : titulo;
  const description = vaga.descricao
    ? vaga.descricao.slice(0, 155)
    : `Vaga de ${titulo} em ${empresa}${local ? `, ${local}` : ""}. Candidate-se grátis no CarreiraBeauty.`;
  const url = `${APP_URL}/vaga/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "website",
      images: company?.logo_url ? [company.logo_url] : [],
    },
    twitter: { card: "summary", title, description, images: company?.logo_url ? [company.logo_url] : [] },
  };
}

export default async function VagaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: vaga } = await supabase
    .from("jobs")
    .select("*, companies(nome_estabelecimento, logo_url, bairro, cidade, estado, instagram, slug, telefone)")
    .eq("slug", slug)
    .single();

  if (!vaga || vaga.status !== "ativa") notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Busca profissional logado e se já aplicou
  let professionalId: string | null = null;
  let nomeProfissional: string | null = null;
  let jaAplicou = false;
  let isProInicial = false;

  if (user) {
    const { data: prof } = await supabase
      .from("professionals")
      .select("id, nome, plano")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prof) {
      professionalId = prof.id;
      nomeProfissional = prof.nome;
      isProInicial = prof.plano === "pro";
      const { data: app } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", vaga.id)
        .eq("professional_id", prof.id)
        .maybeSingle();
      jaAplicou = !!app;
    }
  }

  // Total de candidatos da vaga — só busca se já aplicou (é o que alimenta o
  // "veja como se destacar" na tela de confirmação); pra quem ainda não
  // aplicou não faz sentido gastar a query. Client admin: RLS de applications
  // só deixa o profissional ver as próprias candidaturas, então contar pelo
  // client de sessão sempre daria 1, mesmo com outros candidatos na vaga.
  let totalCandidatosInicial = 0;
  if (jaAplicou) {
    const admin = createAdminClient();
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", vaga.id);
    totalCandidatosInicial = count ?? 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const company = vaga.companies as any;

  const VINCULOS: Record<string, string> = { clt: "CLT", pj: "PJ", freela: "Freela / autônomo" };

  const jobPostingLd = buildJobPostingLd({
    id: vaga.id,
    titulo: vaga.titulo || (vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao),
    descricao: vaga.descricao ?? "",
    criadoEm: vaga.criado_em,
    slug: vaga.slug,
    tipoVinculo: vaga.tipo_vinculo,
    faixaSalarial: vaga.faixa_salarial,
    endereco: vaga.endereco,
    bairro: vaga.bairro,
    cidade: vaga.cidade,
    estado: vaga.estado,
    empresaNome: company?.nome_estabelecimento ?? "",
    empresaLogoUrl: company?.logo_url ?? null,
    empresaSlug: company?.slug ?? null,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }} />
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Seta só pra quem está logada — é ela quem tem pra onde voltar
            (o próprio feed). Visitante anônimo (link do Google/redes) não
            tem dashboard, então só a marca faz sentido aqui. */}
        {professionalId && (
          <VoltarLink fallbackHref="/dashboard/profissional" />
        )}
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--color-brand-primary)", textDecoration: "none" }}>
          CarreiraBeauty
        </Link>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "24px var(--space-page-x) 60px" }}>
        {/* Empresa */}
        {company && (
          <Link href={company.slug ? `/empresa/${company.slug}` : "#"} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
              padding: "14px 18px", marginBottom: 16,
              display: "flex", gap: 14, alignItems: "center",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
                background: "var(--brand-magenta-50)", border: "1px solid var(--border-default)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, overflow: "hidden",
              }}>
                {company.logo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={company.logo_url} alt={company.nome_estabelecimento} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🏪"
                }
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                  {company.nome_estabelecimento}
                </p>
                {(company.cidade || company.estado) && (
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                    📍 {[company.bairro, company.cidade].filter(Boolean).join(", ")}{company.estado ? ` - ${company.estado}` : ""}
                  </p>
                )}
              </div>
              <span style={{ marginLeft: "auto", fontSize: 18, color: "var(--text-tertiary)" }}>›</span>
            </div>
          </Link>
        )}

        {/* Vaga */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 24, marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 4 }}>
            {vaga.foto_url && (
              <div style={{
                width: 64, height: 64, borderRadius: "var(--radius-md)", flexShrink: 0,
                overflow: "hidden", border: "1px solid var(--border-default)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vaga.foto_url} alt={vaga.titulo || vaga.funcao}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", flex: 1 }}>
              {vaga.titulo || (vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao)}
            </h1>
          </div>
          {vaga.titulo && (
            <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 8 }}>
              {vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {vaga.faixa_salarial && (
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: "var(--radius-pill)",
                background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)",
              }}>
                {vaga.faixa_salarial}
              </span>
            )}
            {vaga.tipo_vinculo && (
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: "var(--radius-pill)",
                background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
              }}>
                {VINCULOS[vaga.tipo_vinculo] ?? vaga.tipo_vinculo}
              </span>
            )}
          </div>

          {vaga.descricao && (
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {vaga.descricao}
            </p>
          )}
        </div>

        {/* Localização */}
        {(vaga.endereco || vaga.cidade) && (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
            padding: "16px 20px", marginBottom: 20,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 6 }}>
              Localização
            </p>
            <p style={{ fontSize: 15, color: "var(--text-primary)" }}>
              📍 {[vaga.endereco, vaga.bairro, vaga.cidade, vaga.estado].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {/* CTA / Candidatura */}
        <div id="candidatura-section">
          <CandidaturaSection
            jobId={vaga.id}
            professionalId={professionalId}
            jaAplicou={jaAplicou}
            nomeProfissional={nomeProfissional}
            empresaNome={company.nome_estabelecimento ?? null}
            empresaWhatsapp={company.telefone ?? null}
            totalCandidatosInicial={totalCandidatosInicial}
            isProInicial={isProInicial}
          />
        </div>
      </main>

      <CandidatarFloatingButton jaAplicou={jaAplicou} />
    </div>
  );
}
