export const dynamic = "force-dynamic";

export const metadata = { title: "Planos — Pro" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLANOS_PROFISSIONAL, PlanoProfissional } from "@/lib/planos";
import AssinarButton from "../../empresa/planos/AssinarButton";

const PLANOS_ORDER: PlanoProfissional[] = ["gratis", "pro"];

export default async function PlanosProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals").select("plano").eq("user_id", user.id).maybeSingle();
  if (!professional) redirect("/onboarding/tipo");

  const planoAtual = (professional.plano ?? "gratis") as PlanoProfissional;

  return (
    <div>
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "28px var(--space-page-x) 60px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)", marginBottom: 4 }}>
          Destaque seu perfil
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)", lineHeight: 1.5, marginBottom: 24 }}>
          Apareça primeiro nas buscas de empresas da sua região.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr", gap: 16,
        }} className="plans-grid-profissional">
          {PLANOS_ORDER.map((key) => {
            const plano = PLANOS_PROFISSIONAL[key];
            const ativo = key === planoAtual;
            const destaque = key === "pro";

            return (
              <div key={key} style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-xl)",
                border: destaque ? "2px solid var(--color-brand-primary)" : "2px solid var(--border-default)",
                boxShadow: destaque ? "var(--shadow-md)" : "none",
                padding: 22, position: "relative",
              }}>
                {destaque && (
                  <span style={{
                    position: "absolute", top: -12, left: 20,
                    background: "var(--color-brand-primary)", color: "#fff",
                    fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: "var(--radius-pill)",
                  }}>
                    {ativo ? "Seu plano" : "Recomendado"}
                  </span>
                )}

                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: destaque ? "var(--color-brand-primary)" : "var(--text-tertiary)", marginBottom: 8 }}>
                  {plano.nome}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--text-primary)", marginBottom: 16 }}>
                  {plano.preco === 0 ? "R$ 0" : (
                    <>R$ {plano.preco}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-tertiary)" }}>/mês</span></>
                  )}
                </p>

                {key === "gratis" ? (
                  <>
                    <Feature text="10 candidaturas por mês" ok />
                    <Feature text="Página pública indexada no Google" ok />
                    <Feature text="Destaque nas buscas" ok={false} />
                  </>
                ) : (
                  <>
                    <Feature text="Tudo do plano grátis" ok />
                    <Feature text="Candidaturas ilimitadas" ok />
                    <Feature text="Perfil em destaque nas buscas" ok />
                    <Feature text="Selo Pro no perfil" ok />
                  </>
                )}

                {ativo ? (
                  <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--neutral-100)", color: "var(--text-tertiary)", fontSize: 14, fontWeight: 600, marginTop: 12 }}>
                    Plano atual
                  </div>
                ) : plano.preco === 0 ? (
                  <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", color: "var(--text-tertiary)", fontSize: 14, marginTop: 12 }}>
                    Fazer downgrade
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <AssinarButton
                      planoKey="profissional_pro"
                      label="Assinar destaque"
                      destaque
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Pagamentos processados via Mercado Pago. Cancele a qualquer momento.
        </p>

        <style>{`@media (min-width: 860px) { .plans-grid-profissional { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      </main>
    </div>
  );
}

function Feature({ text, ok }: { text: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
      <i className={ok ? "ph-fill ph-check-circle" : "ph ph-x"} style={{ fontSize: 16, color: ok ? "var(--color-success-fg)" : "var(--text-tertiary)", flexShrink: 0, marginTop: 1 }}></i>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.4 }}>{text}</p>
    </div>
  );
}
