import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

function funcoesLabel(funcoes: string[] | null, funcaoOutro: string | null): string {
  if (!funcoes?.length) return "Profissional de beleza";
  return funcoes.map((f) => (f === "Outro" ? (funcaoOutro || "Outro") : f)).join(", ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("professionals")
    .select("nome, funcoes, funcao_outro, cidade, estado, foto_perfil_url")
    .eq("slug", slug).single();

  if (!p) return { title: "Perfil não encontrado — CarreiraBeauty" };

  const funcao = funcoesLabel(p.funcoes, p.funcao_outro);
  return {
    title: `${p.nome} — ${funcao} em ${p.cidade} | CarreiraBeauty`,
    description: `Perfil profissional de ${p.nome}, ${funcao} em ${p.cidade} - ${p.estado}. Encontre profissionais de beleza no CarreiraBeauty.`,
    openGraph: { images: p.foto_perfil_url ? [p.foto_perfil_url] : [] },
  };
}

export default async function PerfilPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

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
  const initials = p.nome?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "?";

  const tags = [
    p.disponibilidade,
    p.regime_trabalho,
    p.anos_experiencia ? `${p.anos_experiencia} anos de experiência` : null,
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>

      {/* Header bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-square.jpg" alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CarreiraBeauty" style={{ height: 20, objectFit: "contain" }} />
        </Link>
        <Link href="/login" style={{
          height: 36, padding: "0 16px", borderRadius: "var(--radius-pill)",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
          display: "flex", alignItems: "center", textDecoration: "none",
        }}>
          Entrar
        </Link>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px var(--space-page-x) 48px" }}>

        {/* Hero card */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)", overflow: "hidden", marginBottom: 16,
        }}>
          {/* Topo colorido */}
          <div style={{ height: 80, background: "var(--brand-magenta-500)", position: "relative" }} />

          {/* Avatar */}
          <div style={{ padding: "0 24px 24px", marginTop: -24 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
              {p.foto_perfil_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.foto_perfil_url} alt={p.nome}
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                      border: "4px solid var(--surface-card)", flexShrink: 0 }} />
                : (
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "var(--brand-blush-100)", color: "var(--brand-magenta-500)",
                    border: "4px solid var(--surface-card)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                )
              }
              {p.instagram && (
                <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer"
                  style={{
                    height: 36, padding: "0 14px", borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-default)", background: "var(--surface-card)",
                    color: "var(--text-secondary)", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                  }}>
                  <span style={{ fontSize: 15 }}>📷</span> @{p.instagram}
                </a>
              )}
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 2 }}>
              {p.nome}
            </h1>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-brand-primary)", marginBottom: 6 }}>
              {funcao}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
              📍 {p.cidade} · {p.estado}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{
                    background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                    fontSize: 12, fontWeight: 600, padding: "4px 12px",
                    borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Apresentação */}
        {p.educacao_basica && (
          <Section title="Quem sou eu">
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{p.educacao_basica}</p>
          </Section>
        )}

        {/* Detalhes */}
        <Section title="Informações profissionais">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Experiência", value: p.experiencia },
              { label: "Disponibilidade", value: p.disponibilidade },
              { label: "Tipo de vínculo", value: p.tipo_vinculo },
            ].filter((r) => r.value).map((r) => (
              <div key={r.label}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {r.label}
                </p>
                <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{r.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Habilidades */}
        {!!p.habilidades?.length && (
          <Section title="Habilidades">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.habilidades.map((h: string) => (
                <span key={h} style={{
                  background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)",
                  fontSize: 12, fontWeight: 600, padding: "4px 12px",
                  borderRadius: "var(--radius-pill)", border: "1px solid var(--brand-cyan-100)",
                }}>
                  {h}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Formação */}
        {!!p.educacao?.length && (
          <Section title="Formação e cursos">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {p.educacao.map((edu: any, i: number) => (
                <div key={i}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{edu.curso}</p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                    {[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Experiência profissional */}
        {!!p.experiencia_prof?.length && (
          <Section title="Experiência profissional">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {p.experiencia_prof.map((exp: any, i: number) => (
                <div key={i}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{exp.cargo}</p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                    {[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Portfólio */}
        {!!p.portfolio_urls?.length && (
          <Section title="Portfólio">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {p.portfolio_urls.map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{
                  width: "100%", aspectRatio: "1", objectFit: "cover",
                  borderRadius: "var(--radius-md)",
                }} />
              ))}
            </div>
          </Section>
        )}

        {/* CTA */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 24, textAlign: "center", marginTop: 16,
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", marginBottom: 8 }}>
            Quer contratar {p.nome.split(" ")[0]}?
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Cadastre seu estabelecimento no CarreiraBeauty e publique vagas gratuitamente por 7 dias.
          </p>
          <Link href="/login" style={{
            display: "block", height: 48, borderRadius: "var(--radius-pill)",
            background: "var(--color-brand-primary)", color: "#fff",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
            textDecoration: "none", lineHeight: "48px",
          }}>
            Cadastrar meu estabelecimento
          </Link>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--neutral-400)", marginTop: 32 }}>
          Perfil no{" "}
          <Link href="/" style={{ color: "var(--text-link)" }}>CarreiraBeauty</Link>
          {" "}— marketplace de empregos do setor de beleza
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
      padding: 20, marginBottom: 12,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        {title}
      </p>
      {children}
    </div>
  );
}
