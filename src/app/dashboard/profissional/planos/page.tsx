export const dynamic = "force-dynamic";

export const metadata = { title: "Planos — Pro" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLANOS_PROFISSIONAL, PlanoProfissional, formatPreco } from "@/lib/planos";
import AssinarButton from "../../empresa/planos/AssinarButton";

const PLANOS_ORDER: PlanoProfissional[] = ["gratis", "pro"];

export default async function PlanosProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals").select("id, plano").eq("user_id", user.id).maybeSingle();
  if (!professional) redirect("/onboarding/tipo");

  const planoAtual = (professional.plano ?? "gratis") as PlanoProfissional;

  // Tracking interno — permite cruzar quem viu conteúdo PRO com quem chegou aqui
  await supabase.from("plano_views").insert({ professional_id: professional.id });

  // Mesmas 5 linhas nos dois cards — comparação direta, linha a linha
  const BENEFICIOS = [
    { label: "10 candidaturas/mês", labelPro: "Candidaturas ilimitadas", gratis: true },
    { label: "Página pública no Google", labelPro: "Página pública no Google", gratis: true },
    { label: "Destaque nas buscas", labelPro: "Destaque nas buscas", gratis: false },
    { label: "Conteúdos exclusivos", labelPro: "Conteúdos exclusivos", gratis: false },
    { label: "Visuais de perfil PRO", labelPro: "Visuais de perfil PRO", gratis: false },
  ];

  return (
    <div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px var(--space-page-x) 40px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: "var(--text-primary)", marginBottom: 3 }}>
          Destaque seu perfil
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.4, marginBottom: 18 }}>
          Apareça primeiro nas buscas de empresas da sua região.
        </p>

        {/* 2 colunas mesmo no mobile — a pessoa compara os planos sem precisar rolar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
          {PLANOS_ORDER.map((key) => {
            const plano = PLANOS_PROFISSIONAL[key];
            const ativo = key === planoAtual;
            const destaque = key === "pro";

            return (
              <div key={key} style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-lg)",
                border: destaque ? "2px solid var(--color-brand-primary)" : "1.5px solid var(--border-default)",
                boxShadow: destaque ? "var(--shadow-md)" : "none",
                padding: "16px 12px 12px", position: "relative",
              }}>
                {destaque && (
                  <span style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: "var(--color-brand-primary)", color: "#fff", whiteSpace: "nowrap",
                    fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: "var(--radius-pill)",
                    letterSpacing: "0.04em",
                  }}>
                    {ativo ? "SEU PLANO" : "🔥 PROMO"}
                  </span>
                )}

                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: destaque ? "var(--color-brand-primary)" : "var(--text-tertiary)", marginBottom: 4, textAlign: "center" }}>
                  {plano.nome}
                </p>

                {/* altura fixa mantém os dois preços alinhados, com ou sem o "de R$ 29" */}
                <div style={{ height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  {plano.precoOriginal && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                      de R$ {formatPreco(plano.precoOriginal)}
                    </span>
                  )}
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", lineHeight: 1.2 }}>
                    R$ {formatPreco(plano.preco)}
                    {plano.preco > 0 && <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>/mês</span>}
                  </p>
                </div>

                <div style={{ marginBottom: 12 }}>
                  {BENEFICIOS.map((b) => (
                    <Feature
                      key={b.label}
                      text={destaque ? b.labelPro : b.label}
                      ok={destaque ? true : b.gratis}
                    />
                  ))}
                </div>

                {ativo ? (
                  <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--neutral-100)", color: "var(--text-tertiary)", fontSize: 12, fontWeight: 700 }}>
                    Plano atual
                  </div>
                ) : plano.preco === 0 ? (
                  <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", color: "var(--text-tertiary)", fontSize: 12 }}>
                    Fazer downgrade
                  </div>
                ) : (
                  <AssinarButton planoKey="profissional_pro" label="Assinar" destaque />
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Pagamentos via Mercado Pago. Cancele a qualquer momento.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <a
            href="https://wa.me/5511910028403?text=Ol%C3%A1%2C+tenho+d%C3%BAvidas+sobre+os+planos+do+CarreiraBeauty"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#1ea952", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}
          >
            <i className="ph ph-whatsapp-logo" style={{ fontSize: 16 }}></i>
            Dúvidas? Chame no WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}

function Feature({ text, ok }: { text: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 7 }}>
      <i className={ok ? "ph-fill ph-check-circle" : "ph ph-x"} style={{ fontSize: 14, color: ok ? "var(--color-success-fg)" : "var(--neutral-300)", flexShrink: 0, marginTop: 1 }}></i>
      <p style={{ fontSize: 12, color: ok ? "var(--text-secondary)" : "var(--text-tertiary)", lineHeight: 1.35 }}>{text}</p>
    </div>
  );
}
