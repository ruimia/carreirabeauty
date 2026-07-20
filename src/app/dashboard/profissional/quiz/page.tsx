export const dynamic = "force-dynamic";

export const metadata = { title: "Trilha de certificado" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TRILHA_AUTOESTIMA } from "@/lib/quizContent";
import ResgateCertificado from "./ResgateCertificado";
import VoltarLink from "@/components/VoltarLink";

export default async function QuizTrilhaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, plano, certificado_autoestima_desbloqueado_em")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const { data: progresso } = await supabase
    .from("quiz_progresso")
    .select("modulo_slug")
    .eq("professional_id", professional.id)
    .eq("trilha_slug", TRILHA_AUTOESTIMA.slug);

  const concluidos = new Set((progresso ?? []).map((p) => p.modulo_slug));
  const todosConcluidos = TRILHA_AUTOESTIMA.modulos.every((m) => concluidos.has(m.slug));

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/crescer" />
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{TRILHA_AUTOESTIMA.titulo}</p>
        </div>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
          Complete os 6 módulos no seu ritmo e resgate seu certificado ao final.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {TRILHA_AUTOESTIMA.modulos.map((m, i) => {
            const feito = concluidos.has(m.slug);
            return (
              <Link key={m.slug} href={`/dashboard/profissional/quiz/${m.slug}`} style={{ textDecoration: "none" }}>
                <div className="job-feed-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: feito ? "var(--color-success-bg)" : "var(--brand-magenta-50)",
                    color: feito ? "var(--color-success-fg)" : "var(--color-brand-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    <i className={feito ? "ph-fill ph-check-circle" : m.icone}></i>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ font: "500 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                      Módulo {i + 1}
                    </p>
                    <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                      {m.titulo}
                    </p>
                  </div>
                  <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
                </div>
              </Link>
            );
          })}
        </div>

        <ResgateCertificado
          professionalId={professional.id}
          trilhaSlug={TRILHA_AUTOESTIMA.slug}
          certificadoNome={TRILHA_AUTOESTIMA.certificadoNome}
          isPro={professional.plano === "pro"}
          jaDesbloqueado={!!professional.certificado_autoestima_desbloqueado_em}
          todosConcluidos={todosConcluidos}
        />
      </main>
    </div>
  );
}
