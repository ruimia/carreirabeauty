import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("nome_estabelecimento").eq("slug", slug).single();
  return { title: data?.nome_estabelecimento ?? "Empresa" };
}

export default async function EmpresaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*, jobs(*)")
    .eq("slug", slug)
    .single();

  if (!company) notFound();

  const vagas = (company.jobs as any[]).filter((j: any) => j.status === "ativa");

  const inp: React.CSSProperties = { display: "none" };
  void inp;

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
        {/* Hero empresa */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 24, marginBottom: 20, display: "flex", gap: 20, alignItems: "flex-start",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "var(--radius-md)", flexShrink: 0,
            background: "var(--brand-magenta-50)", border: "1px solid var(--border-default)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, overflow: "hidden",
          }}>
            {company.logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={company.logo_url} alt={company.nome_estabelecimento} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <i className="ph-fill ph-storefront" style={{ color: "var(--color-brand-primary)" }}></i>
            }
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 4 }}>
              {company.nome_estabelecimento}
            </h1>
            {(company.cidade || company.estado) && (
              <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <i className="ph ph-map-pin"></i> {[company.endereco, company.cidade, company.estado].filter(Boolean).join(", ")}
              </p>
            )}
            {company.instagram && (
              <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "var(--color-brand-primary)", fontWeight: 600, textDecoration: "none" }}>
                @{company.instagram}
              </a>
            )}
          </div>
        </div>

        {/* Vagas ativas */}
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 12 }}>
          Vagas abertas ({vagas.length})
        </h2>

        {vagas.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--text-tertiary)" }}>Nenhuma vaga aberta no momento.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {vagas.map((vaga: any) => (
              <Link key={vaga.id} href={vaga.slug ? `/vaga/${vaga.slug}` : "#"} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
                  padding: "18px 20px", transition: "box-shadow var(--duration-fast)",
                  display: "flex", gap: 14,
                }}>
                  {vaga.foto_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vaga.foto_url} alt="" style={{
                      width: 56, height: 56, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0,
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                      {vaga.titulo || (vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao)}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {vaga.faixa_salarial && (
                        <span style={{ fontSize: 13, color: "var(--brand-magenta-600)", fontWeight: 600 }}>
                          {vaga.faixa_salarial}
                        </span>
                      )}
                      {vaga.tipo_vinculo && (
                        <span style={{
                          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                          textTransform: "uppercase", padding: "3px 10px", borderRadius: "var(--radius-pill)",
                          background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                        }}>
                          {vaga.tipo_vinculo}
                        </span>
                      )}
                    </div>
                    {vaga.descricao && (
                      <p style={{
                        fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: 6,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {vaga.descricao}
                      </p>
                    )}
                    {vaga.criado_em && (
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {formatRelativeTime(vaga.criado_em)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
