export const dynamic = "force-dynamic";

export const metadata = { title: "Planos — Pro" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PACOTES_PRO_PROFISSIONAL, PacoteProKey, formatPreco, isProAtivo } from "@/lib/planos";
import ComprarPacoteButton from "./ComprarPacoteButton";
import VoltarButton from "@/components/VoltarButton";

const PACOTES_ORDER: PacoteProKey[] = ["dias30", "dias90", "dias365"];

export default async function PlanosProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals").select("id, plano, plano_validade").eq("user_id", user.id).maybeSingle();
  if (!professional) redirect("/onboarding/tipo");

  const isPro = isProAtivo(professional.plano, professional.plano_validade);

  // Tracking interno — permite cruzar quem viu conteúdo PRO com quem chegou aqui
  await supabase.from("plano_views").insert({ professional_id: professional.id });

  const BENEFICIOS = [
    "Candidaturas ilimitadas",
    "Topo da lista do salão",
    "Conteúdos exclusivos",
    "Visuais de perfil PRO",
    "Certificado e contato direto no WhatsApp no perfil",
  ];

  return (
    <div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px var(--space-page-x) 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <VoltarButton fallbackHref="/dashboard/profissional" />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.25 }}>
          Mais chances de conseguir a vaga certa
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 18 }}>
          Com o PRO, o salão vê seu perfil <strong style={{ color: "var(--text-primary)" }}>antes de todo mundo</strong> — e você se candidata a quantas vagas quiser.
        </p>

        {isPro && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--brand-magenta-50)", border: "1px solid var(--brand-magenta-100)",
            borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 16,
          }}>
            <i className="ph-fill ph-star" style={{ fontSize: 18, color: "var(--color-brand-primary)" }}></i>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-primary)" }}>
              Você já é PRO — vale até {new Date(professional.plano_validade!).toLocaleDateString("pt-BR")}. Comprar um pacote agora soma tempo ao que já vale.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          {BENEFICIOS.map((b) => (
            <div key={b} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 7 }}>
              <i className="ph-fill ph-check-circle" style={{ fontSize: 14, color: "var(--color-success-fg)", flexShrink: 0, marginTop: 1 }}></i>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{b}</p>
            </div>
          ))}
        </div>

        {/* 30 dias é a opção principal — as outras aparecem como alternativa
            de quem já sabe que vai usar por mais tempo, não como 3 escolhas
            de peso igual (decisão registrada na seção 4.5 do doc do projeto) */}
        {PACOTES_ORDER.map((key, i) => {
          const pacote = PACOTES_PRO_PROFISSIONAL[key];
          const principal = i === 0;
          const precoPorMes = pacote.dias >= 30 ? (pacote.preco / (pacote.dias / 30)) : pacote.preco;

          return (
            <div key={key} style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-lg)",
              border: principal ? "2px solid var(--color-brand-primary)" : "1.5px solid var(--border-default)",
              boxShadow: principal ? "var(--shadow-md)" : "none",
              padding: principal ? "16px 16px 12px" : "12px 16px",
              marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: principal ? 15 : 13, fontWeight: 800, color: "var(--text-primary)" }}>
                    {pacote.nome}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, whiteSpace: "nowrap" }}>
                    R$ {formatPreco(precoPorMes)}/mês {pacote.dias > 30 ? "— economiza" : ""}
                  </p>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: principal ? 22 : 17, color: "var(--text-primary)", flexShrink: 0, whiteSpace: "nowrap" }}>
                  R$ {formatPreco(pacote.preco)}
                </p>
              </div>
              <ComprarPacoteButton
                pacote={key}
                label={isPro ? "Somar tempo" : "Quero ser PRO"}
                destaque={principal}
              />
            </div>
          );
        })}

        {/* Quebra a objeção do "vou esquecer de cancelar e ser cobrado de
            novo" — não existe recorrência, então não existe esse risco */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)",
          borderRadius: "var(--radius-md)", padding: "10px 12px", marginTop: 6,
        }}>
          <i className="ph-fill ph-lock-simple-open" style={{ fontSize: 16, color: "var(--color-success-fg)", flexShrink: 0 }}></i>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-success-fg)", textAlign: "center", lineHeight: 1.35 }}>
            Sem renovação automática. Pagou uma vez, vale até a data — sem risco de cobrança surpresa.
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
          Pagamento seguro via Mercado Pago. Pagamento único — sem cadastro de cartão recorrente.
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
