export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTrilha } from "@/lib/quizContent";
import ResgateCertificado from "../ResgateCertificado";
import VoltarLink from "@/components/VoltarLink";
import CertificadoVisual from "@/components/CertificadoVisual";
import { isProAtivo } from "@/lib/planos";

interface Props {
  params: Promise<{ trilha: string }>;
}

export default async function QuizTrilhaPage({ params }: Props) {
  const { trilha: trilhaSlug } = await params;
  const trilha = getTrilha(trilhaSlug);
  if (!trilha) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, nome, plano, plano_validade")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");
  const isPro = isProAtivo(professional.plano, professional.plano_validade);

  const [{ data: progresso }, { data: certificado }] = await Promise.all([
    supabase
      .from("quiz_progresso")
      .select("modulo_slug")
      .eq("professional_id", professional.id)
      .eq("trilha_slug", trilha.slug),
    supabase
      .from("certificados")
      .select("id")
      .eq("professional_id", professional.id)
      .eq("trilha_slug", trilha.slug)
      .maybeSingle(),
  ]);

  const concluidos = new Set((progresso ?? []).map((p) => p.modulo_slug));
  const todosConcluidos = trilha.modulos.every((m) => concluidos.has(m.slug));

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/quiz" />
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{trilha.titulo}</p>
        </div>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
          Complete os {trilha.modulos.length} módulos no seu ritmo e resgate seu certificado ao final.
        </p>

        {/* Mostra o certificado logo de cara — gera o desejo antes de começar */}
        {!todosConcluidos && (
          <div style={{ marginBottom: 24 }}>
            <CertificadoVisual trilhaNome={trilha.certificadoNome} nome={professional.nome} estado="preview" />
            <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", textAlign: "center", marginTop: 8 }}>
              É isso que você ganha ao completar a trilha 👇
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {trilha.modulos.map((m, i) => {
            const feito = concluidos.has(m.slug);
            return (
              <Link key={m.slug} href={`/dashboard/profissional/quiz/${trilha.slug}/${m.slug}`} style={{ textDecoration: "none" }}>
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
          nome={professional.nome}
          trilhaSlug={trilha.slug}
          certificadoNome={trilha.certificadoNome}
          isPro={isPro}
          jaDesbloqueado={!!certificado}
          todosConcluidos={todosConcluidos}
        />
      </main>
    </div>
  );
}
