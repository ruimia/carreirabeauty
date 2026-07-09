import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

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
              : "🏪"
            }
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 4 }}>
              {company.nome_estabelecimento}
            </h1>
            {(company.cidade || company.estado) && (
              <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 6 }}>
                📍 {[company.endereco, company.cidade, company.estado].filter(Boolean).join(", ")}
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
                }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                    {vaga.funcao === "outro" ? (vaga.funcao_outro || "Outro") : vaga.funcao}
                  </p>
                  {vaga.faixa_salarial && (
                    <p style={{ fontSize: 13, color: "var(--brand-magenta-600)", fontWeight: 600, marginBottom: 4 }}>
                      {vaga.faixa_salarial}
                    </p>
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
