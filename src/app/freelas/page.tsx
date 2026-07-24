// Página pública, sem estado de sessão — ISR em vez de force-dynamic.
export const revalidate = 300;

import { createPublicClient } from "@/lib/supabase/public";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/seo";

const TITLE = "Freelas em beleza, estética e bem-estar";
const DESCRIPTION = "Trabalhos freela e por diária pra cabeleireiro(a), manicure, esteticista, maquiador(a) e outros profissionais de beleza. Encontre freelas perto de você, grátis, no CarreiraBeauty.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}/freelas` },
  openGraph: { title: `${TITLE} — CarreiraBeauty`, description: DESCRIPTION, url: `${APP_URL}/freelas`, type: "website" },
};

export default async function FreelasPage() {
  const supabase = createPublicClient();

  const { data: vagas } = await supabase
    .from("jobs")
    .select("id, titulo, funcao, funcao_outro, faixa_salarial, comissao, modelo_remuneracao, bairro, cidade, estado, slug, foto_url, criado_em, companies(nome_estabelecimento, logo_url)")
    .eq("status", "ativa")
    .eq("tipo_vinculo", "freela")
    .order("criado_em", { ascending: false });

  const total = vagas?.length ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", fontFamily: "var(--font-body)" }}>
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo-square.jpg" alt="CarreiraBeauty" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>CarreiraBeauty</span>
          </Link>
          <Link href="/login" prefetch={false} style={{
            height: 36, padding: "0 16px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", color: "var(--text-primary)",
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
          }}>
            Entrar
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Freelas em beleza, estética e bem-estar
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 4px" }}>
            Trabalhos por diária ou freelance pra cabeleireiro(a), manicure/pedicure, esteticista, maquiador(a), barbeiro e outras profissões de beleza. Sem vínculo fixo, direto com o estabelecimento.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: 0 }}>
            {total} freela{total !== 1 ? "s" : ""} disponíve{total !== 1 ? "is" : "l"}
          </p>
        </div>

        {!vagas || vagas.length === 0 ? (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", padding: "48px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💅</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
              Nenhum freela disponível agora
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
              Veja todas as vagas (CLT, PJ e freela) ou cadastre seu perfil pra ser avisado.
            </p>
            <Link href="/vagas" style={{ display: "inline-block", fontSize: 14, fontWeight: 600, color: "var(--color-brand-primary)", textDecoration: "none" }}>
              Ver todas as vagas →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {vagas.map((vaga) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const empresa = vaga.companies as any;
              const funcaoLabel = vaga.funcao === "outro" ? (vaga.funcao_outro ?? "Outro") : vaga.funcao;

              return (
                <Link key={vaga.id} href={`/vaga/${vaga.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
                    padding: 18, display: "flex", gap: 14, alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
                      background: "var(--brand-magenta-50)", border: "1px solid var(--border-default)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, overflow: "hidden",
                    }}>
                      {empresa?.logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={empresa.logo_url} alt={empresa.nome_estabelecimento} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : "🏪"
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
                        {vaga.titulo || funcaoLabel}
                      </p>
                      {empresa && (
                        <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 8px" }}>
                          {empresa.nome_estabelecimento}
                          {(vaga.cidade || vaga.estado) && ` · ${[vaga.bairro, vaga.cidade].filter(Boolean).join(", ")}${vaga.estado ? ` - ${vaga.estado}` : ""}`}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", border: "1px solid var(--brand-cyan-100)" }}>
                          {funcaoLabel}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--neutral-100)", color: "var(--text-secondary)" }}>
                          Freela
                        </span>
                        {vaga.faixa_salarial && (
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)" }}>
                            {vaga.faixa_salarial}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 20, color: "var(--text-tertiary)", flexShrink: 0, alignSelf: "center" }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
