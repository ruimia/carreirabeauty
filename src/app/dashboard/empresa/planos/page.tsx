export const dynamic = "force-dynamic";

export const metadata = { title: "Planos — Empresa" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLANOS_EMPRESA, PlanoEmpresa, formatPreco } from "@/lib/planos";
import AssinarButton from "./AssinarButton";

const PLANOS_ORDER: PlanoEmpresa[] = ["gratis", "premium"];

export default async function PlanosEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies").select("plano, plano_status").eq("user_id", user.id).maybeSingle();
  if (!company) redirect("/onboarding/tipo");

  const planoAtual = (company.plano ?? "gratis") as PlanoEmpresa;

  // Mesmas linhas nos dois cards — comparação direta, linha a linha
  const BENEFICIOS = [
    { label: "3 vagas ativas", labelPremium: "5 vagas ativas", gratis: true },
    { label: "Até 20 candidatos/vaga", labelPremium: "Até 50 candidatos/vaga", gratis: true },
    { label: "Badge de empresa verificada", labelPremium: "Badge de empresa verificada", gratis: false },
    { label: "Destaque na listagem de vagas", labelPremium: "Destaque na listagem de vagas", gratis: false },
  ];

  return (
    <div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px var(--space-page-x) 40px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.25 }}>
          Planos
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 18 }}>
          Escolha o plano ideal para o tamanho da sua equipe.
        </p>

        {/* 2 colunas mesmo no mobile — comparação sem precisar rolar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" }}>
          {PLANOS_ORDER.map((key) => {
            const plano = PLANOS_EMPRESA[key];
            const ativo = key === planoAtual;
            const destaque = key === "premium";

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
                    {ativo ? "SEU PLANO" : "MAIS POPULAR"}
                  </span>
                )}

                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: destaque ? "var(--color-brand-primary)" : "var(--text-tertiary)", marginBottom: 4, textAlign: "center" }}>
                  {plano.nome}
                </p>

                <div style={{ height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", lineHeight: 1.2 }}>
                    {plano.preco === 0 ? "Grátis" : (
                      <>R$ {formatPreco(plano.preco)}<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>/mês</span></>
                    )}
                  </p>
                </div>

                <div style={{ marginBottom: 12 }}>
                  {BENEFICIOS.map((b) => (
                    <Feature
                      key={b.label}
                      text={destaque ? b.labelPremium : b.label}
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
                  <AssinarButton planoKey="empresa_premium" label="Assinar Premium" destaque />
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Pagamento seguro via Mercado Pago. O cancelamento é feito pela sua conta do Mercado Pago.
        </p>

        {/* CTA de vendas assistidas pra quem precisa de mais capacidade do
            que o Premium oferece — em vez de travar num limite fixo */}
        <a
          href="https://wa.me/5511910028403?text=Ol%C3%A1%2C+preciso+de+mais+vagas+no+CarreiraBeauty"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            height: 48, borderRadius: "var(--radius-pill)", marginTop: 16,
            background: "#1ea952", color: "#fff",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}
        >
          <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 18 }}></i>
          Precisa de mais vagas? Fale com a gente!
        </a>
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
