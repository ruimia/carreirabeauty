export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLANOS_EMPRESA, PlanoEmpresa } from "@/lib/planos";
import AssinarButton from "./AssinarButton";

const PLANOS_ORDER: PlanoEmpresa[] = ["gratis", "basic", "plus", "premium"];

const DESTAQUES: Partial<Record<PlanoEmpresa, boolean>> = { plus: true };

export default async function PlanosEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies").select("plano, plano_status").eq("user_id", user.id).maybeSingle();
  if (!company) redirect("/onboarding/tipo");

  const planoAtual = (company.plano ?? "gratis") as PlanoEmpresa;

  return (
    <div>
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "28px var(--space-page-x) 60px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>
          Planos
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          Escolha o plano ideal para o tamanho da sua equipe. Cancele quando quiser.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PLANOS_ORDER.map((key) => {
            const plano = PLANOS_EMPRESA[key];
            const ativo = key === planoAtual;
            const destaque = DESTAQUES[key];

            return (
              <div key={key} style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-xl)",
                border: destaque
                  ? "2px solid var(--color-brand-primary)"
                  : ativo
                    ? "2px solid var(--color-success-fg, #16a34a)"
                    : "1px solid var(--border-default)",
                boxShadow: destaque ? "var(--shadow-md)" : "var(--shadow-xs)",
                overflow: "hidden",
              }}>
                {destaque && (
                  <div style={{ background: "var(--color-brand-primary)", padding: "6px 20px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Mais popular
                    </p>
                  </div>
                )}
                {ativo && !destaque && (
                  <div style={{ background: "var(--color-success-fg, #16a34a)", padding: "6px 20px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Plano atual
                    </p>
                  </div>
                )}

                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>
                        {plano.nome}
                      </p>
                      {plano.preco === 0 ? (
                        <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                          Grátis
                        </p>
                      ) : (
                        <p style={{ fontSize: 22, fontWeight: 800, color: "var(--color-brand-primary)", marginTop: 4 }}>
                          R$ {plano.preco}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-tertiary)" }}>/mês</span>
                        </p>
                      )}
                    </div>
                    {ativo && destaque && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-pill)", background: "var(--color-success-bg)", color: "var(--color-success-fg)" }}>
                        Ativo
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    <Feature text={`${plano.vagas} vaga${plano.vagas > 1 ? "s" : ""} ativa${plano.vagas > 1 ? "s" : ""}`} />
                    <Feature text={plano.candidatos === null ? "Candidatos ilimitados" : `Ver até ${plano.candidatos} candidatos por vaga`} />
                    {key !== "gratis" && <Feature text="Badge de empresa verificada" />}
                    {key === "premium" && <Feature text="Destaque na listagem de vagas" />}
                  </div>

                  {ativo ? (
                    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--neutral-100)", color: "var(--text-tertiary)", fontSize: 14, fontWeight: 600 }}>
                      Plano atual
                    </div>
                  ) : plano.preco === 0 ? (
                    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", color: "var(--text-tertiary)", fontSize: 14 }}>
                      Fazer downgrade
                    </div>
                  ) : (
                    <AssinarButton
                      planoKey={`empresa_${key}`}
                      label={`Assinar ${plano.nome}`}
                      destaque={destaque}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Pagamentos processados via Mercado Pago. Cancele a qualquer momento.
        </p>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontSize: 15, color: "var(--color-success-fg, #16a34a)", flexShrink: 0 }}>✓</span>
      <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{text}</p>
    </div>
  );
}
