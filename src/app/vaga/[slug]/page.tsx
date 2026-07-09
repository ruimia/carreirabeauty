import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import CandidaturaSection from "./CandidaturaSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: vaga } = await supabase
    .from("jobs").select("titulo, funcao, companies(nome_estabelecimento)").eq("slug", slug).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const empresa = (vaga?.companies as any)?.nome_estabelecimento ?? "";
  const titulo = vaga?.titulo || vaga?.funcao || "Vaga";
  return { title: empresa ? `${titulo} — ${empresa}` : titulo };
}

export default async function VagaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: vaga } = await supabase
    .from("jobs")
    .select("*, companies(nome_estabelecimento, logo_url, cidade, estado, instagram, slug, telefone)")
    .eq("slug", slug)
    .single();

  if (!vaga || vaga.status !== "ativa") notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Busca profissional logado e se já aplicou
  let professionalId: string | null = null;
  let nomeProfissional: string | null = null;
  let jaAplicou = false;

  if (user) {
    const { data: prof } = await supabase
      .from("professionals")
      .select("id, nome")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prof) {
      professionalId = prof.id;
      nomeProfissional = prof.nome;
      const { data: app } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", vaga.id)
        .eq("professional_id", prof.id)
        .maybeSingle();
      jaAplicou = !!app;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const company = vaga.companies as any;

  const VINCULOS: Record<string, string> = { clt: "CLT", pj: "PJ", freela: "Freela / autônomo" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
      }}>
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
                    📍 {[company.cidade, company.estado].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <span style={{ marginLeft: "auto", fontSize: 18, color: "var(--text-tertiary)" }}>›</span>
            </div>
          </Link>
        )}

        {/* Foto da vaga */}
        {vaga.foto_url && (
          <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 16, maxHeight: 220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vaga.foto_url} alt={vaga.titulo || vaga.funcao}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Vaga */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 24, marginBottom: 16,
        }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 4 }}>
            {vaga.titulo || (vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao)}
          </h1>
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
              📍 {[vaga.endereco, vaga.cidade, vaga.estado].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {/* CTA / Candidatura */}
        <CandidaturaSection
          jobId={vaga.id}
          professionalId={professionalId}
          jaAplicou={jaAplicou}
          nomeProfissional={nomeProfissional}
        />
      </main>
    </div>
  );
}
