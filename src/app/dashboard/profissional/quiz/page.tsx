export const dynamic = "force-dynamic";

export const metadata = { title: "Trilhas e certificados" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TRILHAS, calcularProgressoGeral } from "@/lib/quizContent";
import VoltarLink from "@/components/VoltarLink";

export default async function QuizIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const [{ data: progresso }, { data: certificados }] = await Promise.all([
    supabase.from("quiz_progresso").select("trilha_slug, modulo_slug").eq("professional_id", professional.id),
    supabase.from("certificados").select("trilha_slug").eq("professional_id", professional.id),
  ]);

  const { porTrilha } = calcularProgressoGeral(progresso ?? []);
  const conquistadas = new Set((certificados ?? []).map((c) => c.trilha_slug));

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/crescer" />
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>Trilhas e certificados</p>
        </div>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
          Cada trilha é rápida e vale um certificado pro seu perfil.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TRILHAS.map((t) => {
            const p = porTrilha.find((x) => x.slug === t.slug)!;
            const conquistada = conquistadas.has(t.slug);
            return (
              <Link key={t.slug} href={`/dashboard/profissional/quiz/${t.slug}`} style={{ textDecoration: "none" }}>
                <div className="job-feed-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{
                    width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: conquistada
                      ? "linear-gradient(135deg, #DC00DC, #ffb020)"
                      : "var(--brand-magenta-50)",
                    color: conquistada ? "#fff" : "var(--color-brand-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>
                    <i className={conquistada ? "ph-fill ph-medal" : t.icone}></i>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                      {t.titulo}
                    </p>
                    <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2 }}>
                      {conquistada
                        ? "Certificado conquistado ✓"
                        : p.total > 0 && p.feitos >= p.total
                          ? "Trilha completa! Resgate seu certificado"
                          : p.feitos > 0
                            ? `${p.feitos} de ${p.total} módulos`
                            : t.descricao}
                    </p>
                  </div>
                  {conquistada && (
                    <span className="status-pill" style={{ background: "var(--color-success-bg)", color: "var(--color-success-fg)", flexShrink: 0 }}>
                      <i className="ph-fill ph-check-circle"></i>
                    </span>
                  )}
                  <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
