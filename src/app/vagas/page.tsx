export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

const VINCULO_LABEL: Record<string, string> = {
  clt: "CLT", pj: "PJ", freela: "Freela", estagio: "Estágio", menor_aprendiz: "Menor aprendiz",
};

const MODELO_LABEL: Record<string, string> = {
  fixo: "Salário fixo", comissao: "Comissão", fixo_comissao: "Fixo + Comissão", a_combinar: "A combinar",
};

interface Props {
  searchParams: Promise<{ funcao?: string }>;
}

export default async function VagasPage({ searchParams }: Props) {
  const { funcao } = await searchParams;
  const supabase = await createClient();

  const [{ data: vagas }, { data: profissoes }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, titulo, funcao, funcao_outro, faixa_salarial, comissao, modelo_remuneracao, tipo_vinculo, cidade, estado, slug, foto_url, criado_em, companies(nome_estabelecimento, logo_url, slug)")
      .eq("status", "ativa")
      .order("criado_em", { ascending: false }),
    supabase.from("profissoes").select("nome").eq("ativo", true).order("ordem"),
  ]);

  const vagasFiltradas = funcao
    ? (vagas ?? []).filter((v) => v.funcao === funcao || v.funcao_outro === funcao)
    : (vagas ?? []);

  const total = vagas?.length ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo-square.jpg" alt="CarreiraBeauty" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>CarreiraBeauty</span>
          </Link>
          <Link href="/login" style={{
            height: 36, padding: "0 16px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", color: "var(--text-primary)",
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
          }}>
            Entrar
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Título */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Vagas em beleza
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: 0 }}>
            {total} vaga{total !== 1 ? "s" : ""} ativa{total !== 1 ? "s" : ""}
            {funcao ? ` · ${funcao}` : ""}
          </p>
        </div>

        {/* Filtro por profissão */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <Link href="/vagas" style={chipStyle(!funcao)}>
            Todas
          </Link>
          {(profissoes ?? []).map((p) => (
            <Link key={p.nome} href={`/vagas?funcao=${encodeURIComponent(p.nome)}`} style={chipStyle(funcao === p.nome)}>
              {p.nome}
            </Link>
          ))}
        </div>

        {/* Lista */}
        {vagasFiltradas.length === 0 ? (
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", padding: "48px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
              Nenhuma vaga encontrada
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {funcao ? "Tente outra profissão ou veja todas as vagas." : "Novas vagas em breve."}
            </p>
            {funcao && (
              <Link href="/vagas" style={{ display: "inline-block", marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--color-brand-primary)", textDecoration: "none" }}>
                Ver todas as vagas →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {vagasFiltradas.map((vaga) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const empresa = vaga.companies as any;
              const funcaoLabel = vaga.funcao === "outro" ? (vaga.funcao_outro ?? "Outro") : vaga.funcao;

              const remuneracao = (() => {
                if (vaga.modelo_remuneracao === "fixo" && vaga.faixa_salarial) return vaga.faixa_salarial;
                if (vaga.modelo_remuneracao === "comissao" && vaga.comissao) return `Comissão ${vaga.comissao}`;
                if (vaga.modelo_remuneracao === "fixo_comissao") {
                  const partes = [vaga.faixa_salarial, vaga.comissao ? `+ ${vaga.comissao} comissão` : ""].filter(Boolean);
                  return partes.join(" ");
                }
                return MODELO_LABEL[vaga.modelo_remuneracao ?? ""] ?? null;
              })();

              return (
                <Link key={vaga.id} href={`/vaga/${vaga.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
                    padding: 18, display: "flex", gap: 14, alignItems: "flex-start",
                    transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
                  >
                    {/* Logo empresa */}
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

                    {/* Conteúdo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
                        {vaga.titulo || funcaoLabel}
                      </p>
                      {empresa && (
                        <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 8px" }}>
                          {empresa.nome_estabelecimento}
                          {(vaga.cidade || vaga.estado) && ` · ${[vaga.cidade, vaga.estado].filter(Boolean).join(", ")}`}
                        </p>
                      )}

                      {/* Tags */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={tagStyle("funcao")}>{funcaoLabel}</span>
                        {vaga.tipo_vinculo && (
                          <span style={tagStyle("vinculo")}>{VINCULO_LABEL[vaga.tipo_vinculo] ?? vaga.tipo_vinculo}</span>
                        )}
                        {remuneracao && (
                          <span style={tagStyle("salario")}>{remuneracao}</span>
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

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center",
    padding: "6px 14px", borderRadius: "var(--radius-pill)",
    fontSize: 13, fontWeight: active ? 700 : 500,
    border: `1.5px solid ${active ? "var(--color-brand-primary)" : "var(--border-default)"}`,
    background: active ? "var(--brand-magenta-50)" : "var(--surface-card)",
    color: active ? "var(--color-brand-primary)" : "var(--text-secondary)",
    textDecoration: "none", whiteSpace: "nowrap",
    transition: "all 0.1s",
  };
}

function tagStyle(type: "funcao" | "vinculo" | "salario"): React.CSSProperties {
  const styles = {
    funcao:  { bg: "var(--brand-cyan-50)",     color: "var(--brand-cyan-700)",    border: "var(--brand-cyan-100)" },
    vinculo: { bg: "var(--neutral-100)",        color: "var(--text-secondary)",    border: "transparent" },
    salario: { bg: "var(--brand-magenta-50)",   color: "var(--brand-magenta-700)", border: "transparent" },
  }[type];
  return {
    fontSize: 12, fontWeight: 600, padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
    background: styles.bg, color: styles.color,
    border: `1px solid ${styles.border}`,
  };
}
