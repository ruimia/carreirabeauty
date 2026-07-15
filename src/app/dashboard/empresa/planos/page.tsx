export const dynamic = "force-dynamic";

export const metadata = { title: "Planos — Empresa" };

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
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px var(--space-page-x) 60px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 6 }}>
          Planos
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
          Escolha o plano ideal para o tamanho da sua equipe. Cancele quando quiser.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="plans-grid-empresa">
          {PLANOS_ORDER.map((key) => {
            const plano = PLANOS_EMPRESA[key];
            const ativo = key === planoAtual;
            const destaque = DESTAQUES[key];

            return (
              <div key={key} style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-xl)",
                border: ativo
                  ? "2px solid var(--color-success-fg, #16a34a)"
                  : destaque
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid var(--border-default)",
                boxShadow: destaque ? "var(--shadow-md)" : "none",
                padding: "20px 24px 24px", position: "relative",
              }}>
                {(ativo || destaque) && (
                  <span style={{
                    position: "absolute", top: -12, left: 20,
                    background: ativo ? "var(--color-success-fg, #16a34a)" : "var(--color-brand-primary)",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    padding: "5px 12px", borderRadius: "var(--radius-pill)",
                  }}>
                    {ativo ? "Plano atual" : "Mais popular"}
                  </span>
                )}

                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginTop: 4 }}>
                  {plano.nome}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: plano.preco === 0 ? "var(--text-primary)" : "var(--color-brand-primary)", margin: "4px 0 16px" }}>
                  {plano.preco === 0 ? "Grátis" : (
                    <>R$ {plano.preco}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-tertiary)" }}>/mês</span></>
                  )}
                </p>

                <Feature text={`${plano.vagas} vaga${plano.vagas > 1 ? "s" : ""} ativa${plano.vagas > 1 ? "s" : ""}`} />
                <Feature text={plano.candidatos === null ? "Candidatos ilimitados" : `Ver até ${plano.candidatos} candidatos por vaga`} />
                {key !== "gratis" && <Feature text="Badge de empresa verificada" />}
                {key === "premium" && <Feature text="Destaque na listagem de vagas" />}

                {ativo ? (
                  <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--neutral-100)", color: "var(--text-tertiary)", fontSize: 14, fontWeight: 600, marginTop: 8 }}>
                    Plano atual
                  </div>
                ) : plano.preco === 0 ? (
                  <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", color: "var(--text-tertiary)", fontSize: 14, marginTop: 8 }}>
                    Fazer downgrade
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <AssinarButton
                      planoKey={`empresa_${key}`}
                      label={`Assinar ${plano.nome}`}
                      destaque={destaque}
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

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <a
            href="https://wa.me/5511910028403?text=Ol%C3%A1%2C+tenho+d%C3%BAvidas+sobre+os+planos+do+CarreiraBeauty"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "#1ea952", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}
          >
            <i className="ph ph-whatsapp-logo" style={{ fontSize: 18 }}></i>
            Dúvidas? Chame no WhatsApp
          </a>
        </div>

        <style>{`@media (min-width: 860px) { .plans-grid-empresa { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
      <i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: "var(--color-success-fg)", flexShrink: 0, marginTop: 1 }}></i>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.4 }}>{text}</p>
    </div>
  );
}
