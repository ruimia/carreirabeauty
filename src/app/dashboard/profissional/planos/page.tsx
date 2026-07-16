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
    { label: "Topo da lista do salão", labelPro: "Topo da lista do salão", gratis: false },
    { label: "Conteúdos exclusivos", labelPro: "Conteúdos exclusivos", gratis: false },
    { label: "Visuais de perfil PRO", labelPro: "Visuais de perfil PRO", gratis: false },
  ];

  return (
    <div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px var(--space-page-x) 40px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.25 }}>
          Mais chances de conseguir a vaga certa
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 18 }}>
          Com o PRO, o salão vê seu perfil <strong style={{ color: "var(--text-primary)" }}>antes de todo mundo</strong> — e você se candidata a quantas vagas quiser.
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
                  <AssinarButton planoKey="profissional_pro" label="Quero ser PRO" destaque />
                )}
              </div>
            );
          })}
        </div>

        {/* Quebra a objeção do "vou ficar preso" logo depois do preço — é a
            dúvida nº1 de assinatura, e some se ficar só no rodapé cinza */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)",
          borderRadius: "var(--radius-md)", padding: "10px 12px", marginTop: 12,
        }}>
          <i className="ph-fill ph-lock-simple-open" style={{ fontSize: 16, color: "var(--color-success-fg)", flexShrink: 0 }}></i>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-success-fg)", textAlign: "center", lineHeight: 1.35 }}>
            Sem fidelidade. Cancele quando quiser, sem multa.
          </p>
        </div>

        {/* Mecanismo: explica POR QUE o PRO aumenta a chance de conseguir vaga */}
        <div style={{
          background: "var(--brand-magenta-50)", border: "1px solid var(--brand-magenta-100)",
          borderRadius: "var(--radius-lg)", padding: "14px 14px 10px", marginTop: 14,
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--color-brand-primary)", marginBottom: 10 }}>
            Por que o PRO ajuda a conseguir vaga?
          </p>
          <Motivo icon="🔝" text="Seu perfil aparece no topo da lista de candidatos que o salão vê — antes de todo mundo." />
          <Motivo icon="♾️" text="Sem limite de candidaturas. Quanto mais vagas você tenta, mais chances você tem." />
          <Motivo icon="✨" text="Perfil com visual profissional e conteúdos que ensinam a se destacar." />
        </div>

        <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Pagamento seguro via Mercado Pago. O cancelamento é feito pela sua conta do Mercado Pago.
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

function Motivo({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{text}</p>
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
