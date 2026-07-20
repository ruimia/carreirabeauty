export const dynamic = "force-dynamic";

export const metadata = { title: "Suas conquistas" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TRILHA_AUTOESTIMA } from "@/lib/quizContent";
import { calcularConquistas, checksPerfil } from "@/lib/conquistas";
import VoltarLink from "@/components/VoltarLink";

export default async function ConquistasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, foto_perfil_url, educacao_basica, habilidades, educacao, experiencia_prof, portfolio_urls")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const [{ count: candidaturas }, { data: quizProgresso }] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("professional_id", professional.id),
    supabase.from("quiz_progresso").select("modulo_slug")
      .eq("professional_id", professional.id)
      .eq("trilha_slug", TRILHA_AUTOESTIMA.slug),
  ]);

  const checks = checksPerfil(professional);
  const conquistas = calcularConquistas({
    temFoto: !!professional.foto_perfil_url,
    itensPerfilFeitos: checks.filter((c) => c.done).length,
    itensPerfilTotal: checks.length,
    portfolioCount: professional.portfolio_urls?.length ?? 0,
    candidaturas: candidaturas ?? 0,
    modulosFeitos: new Set((quizProgresso ?? []).map((p) => p.modulo_slug)).size,
    modulosTotal: TRILHA_AUTOESTIMA.modulos.length,
  });

  const feitas = conquistas.filter((c) => c.done).length;
  const pct = Math.round((feitas / conquistas.length) * 100);

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/crescer" />
          <p style={{ font: "800 20px/1.2 var(--font-display)", color: "var(--text-primary)" }}>Suas conquistas</p>
        </div>

        {/* Progresso geral */}
        <div style={{
          background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
          border: "1px solid var(--brand-magenta-100)", borderRadius: "var(--radius-xl)",
          padding: 18, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <span style={{ font: "800 26px/1 var(--font-display)", color: "var(--color-brand-primary)" }}>{feitas}</span>
            <span style={{ font: "600 14px/1 var(--font-body)", color: "var(--text-secondary)" }}>de {conquistas.length} conquistas</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--surface-card)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "var(--color-brand-primary)" }} />
          </div>
          <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.45 }}>
            Cada conquista é um passo pra seu perfil chamar mais atenção de quem contrata. 💪
          </p>
        </div>

        {/* Lista detalhada — não conquistada + com destino vira link direto
            pro próximo passo, não só descrição */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conquistas.map((c) => {
            const acionavel = !c.done && c.href;
            const conteudo = (
              <div className="job-feed-card" style={{
                display: "flex", alignItems: "center", gap: 14,
                borderLeft: c.done ? "3px solid var(--color-success-fg)" : "3px solid var(--border-default)",
              }}>
                <span style={{
                  width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                  background: c.done ? "var(--brand-magenta-50)" : "var(--surface-sunken)",
                  color: c.done ? "var(--color-brand-primary)" : "var(--text-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
                  border: c.done ? "1.5px solid var(--brand-magenta-100)" : "1.5px dashed var(--border-default)",
                }}>
                  <i className={c.done ? c.icon : "ph ph-lock-simple"}></i>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{c.nome}</p>
                    {c.done && (
                      <span className="status-pill" style={{ background: "var(--color-success-bg)", color: "var(--color-success-fg)" }}>
                        <i className="ph-fill ph-check-circle"></i> Conquistada
                      </span>
                    )}
                  </div>
                  <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.45 }}>
                    {c.comoConquistar}
                  </p>
                  {!c.done && c.progresso && (
                    <p style={{ font: "700 12px/1 var(--font-body)", color: "var(--color-brand-primary)", marginTop: 6 }}>
                      {c.progresso}
                    </p>
                  )}
                  {acionavel && (
                    <p style={{ font: "700 13px/1 var(--font-body)", color: "var(--color-brand-primary)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                      {c.cta} <i className="ph-bold ph-arrow-right" style={{ fontSize: 12 }}></i>
                    </p>
                  )}
                </div>
                {acionavel && <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>}
              </div>
            );

            return acionavel
              ? <Link key={c.slug} href={c.href!} style={{ textDecoration: "none" }}>{conteudo}</Link>
              : <div key={c.slug}>{conteudo}</div>;
          })}
        </div>
      </main>
    </div>
  );
}
