"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CertificadoVisual from "@/components/CertificadoVisual";
import { CERTIFICADO_AVULSO_PRECO, formatPreco, PLANOS_PROFISSIONAL } from "@/lib/planos";

interface Props {
  professionalId: string;
  nome?: string | null;
  trilhaSlug: string;
  certificadoNome: string;
  isPro: boolean;
  jaDesbloqueado: boolean;
  todosConcluidos: boolean;
}

export default function ResgateCertificado({
  professionalId, nome, trilhaSlug, certificadoNome, isPro, jaDesbloqueado, todosConcluidos,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [desbloqueado, setDesbloqueado] = useState(jaDesbloqueado);
  const [loading, setLoading] = useState<"pro" | "avulso" | null>(null);
  const [erro, setErro] = useState("");

  if (!todosConcluidos) {
    return (
      <div className="card card-xl" style={{ padding: "20px 24px", textAlign: "center", opacity: 0.7 }}>
        <i className="ph ph-lock-simple" style={{ fontSize: 24, color: "var(--text-tertiary)" }}></i>
        <p style={{ font: "600 14px/1.4 var(--font-body)", color: "var(--text-secondary)", marginTop: 8 }}>
          Complete todos os módulos para resgatar seu certificado.
        </p>
      </div>
    );
  }

  // Este é o momento de maior intenção do produto inteiro: toda pessoa que
  // termina a trilha chega até aqui querendo o certificado. Por isso mostra o
  // certificado de verdade (não só um ícone) antes do CTA — preview quando
  // ainda falta desbloquear, conquistado quando já é PRO/comprou avulso.
  if (desbloqueado) {
    return (
      <div>
        <CertificadoVisual trilhaNome={certificadoNome} nome={nome} estado="conquistado" />
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", textAlign: "center", marginTop: 12 }}>
          Certificado desbloqueado! Em breve você poderá exibi-lo no seu perfil público.
        </p>
      </div>
    );
  }

  async function handleResgatarPro() {
    setLoading("pro");
    setErro("");
    try {
      await supabase.from("quiz_eventos").insert({
        professional_id: professionalId, trilha_slug: trilhaSlug, evento: "certificado_desbloqueado",
      });
      await supabase.from("certificados").insert({
        professional_id: professionalId, trilha_slug: trilhaSlug, origem: "pro",
      });
      setDesbloqueado(true);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleComprarAvulso() {
    setLoading("avulso");
    setErro("");
    try {
      await supabase.from("quiz_eventos").insert({
        professional_id: professionalId, trilha_slug: trilhaSlug, evento: "certificado_tentativa",
      });
      const res = await fetch("/api/mp/certificado-avulso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trilhaSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) throw new Error(data.error || "Erro ao iniciar pagamento");
      window.location.href = data.init_point;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra iniciar o pagamento agora. Tenta de novo.");
      setLoading(null);
    }
  }

  return (
    <div>
      <CertificadoVisual trilhaNome={certificadoNome} nome={nome} estado="preview" />

      <div style={{
        background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
        padding: 24, textAlign: "center", marginTop: 14,
      }}>
        <p style={{ font: "700 16px/1.3 var(--font-display)", color: "var(--text-primary)", marginBottom: 6 }}>
          Você completou a trilha! 🎉
        </p>

        {isPro ? (
          <>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 16 }}>
              Resgate agora o seu certificado.
            </p>
            <button onClick={handleResgatarPro} disabled={loading !== null} style={{
              height: 48, padding: "0 24px", borderRadius: "var(--radius-pill)", border: "none",
              background: "var(--color-brand-primary)", color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
              cursor: "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading === "pro" ? "Aguarde…" : "Resgatar certificado"}
            </button>
          </>
        ) : (
          <>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 18 }}>
              O certificado é um benefício do PRO — mostre no seu perfil que você tem o selo {certificadoNome}.
            </p>

            {/* PRO é o CTA principal: a partir do preço do pacote de 30 dias,
                além do certificado vem WhatsApp visível, candidaturas
                ilimitadas e layouts PRO — o avulso custa mais e dá só o
                certificado. Preço pré-pago (não recorrente), por isso "a
                partir de" em vez de "/mês" — a escolha do pacote é na
                própria tela de planos. */}
            <Link href="/dashboard/profissional/planos" style={{
              display: "block", height: 48, borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-primary)", color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
              textDecoration: "none", lineHeight: "48px", marginBottom: 10,
            }}>
              Virar PRO — a partir de R$ {formatPreco(PLANOS_PROFISSIONAL.pro.preco)}
            </Link>
            <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginBottom: 10 }}>
              certificado + WhatsApp visível + candidaturas ilimitadas + layouts PRO
              <br />
              <i className="ph ph-credit-card" style={{ marginRight: 3 }}></i>sem renovação automática — pagamento único
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
              <span style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
              <span style={{ font: "var(--text-caption)", color: "var(--text-tertiary)" }}>ou</span>
              <span style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
            </div>

            <button onClick={handleComprarAvulso} disabled={loading !== null} style={{
              height: 44, padding: "0 20px", borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-default)", background: "transparent",
              color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
              cursor: "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading === "avulso" ? "Aguarde…" : `Comprar só o certificado — R$ ${formatPreco(CERTIFICADO_AVULSO_PRECO)}`}
            </button>
            <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 8 }}>
              <i className="ph ph-qr-code" style={{ marginRight: 3 }}></i>Pix ou cartão
            </p>

            {erro && <p style={{ font: "var(--text-caption)", color: "var(--color-danger-fg)", marginTop: 10 }}>{erro}</p>}
          </>
        )}

        {!isPro && (
          <a
            href="https://wa.me/5511910028403?text=Ol%C3%A1%2C+tenho+d%C3%BAvidas+sobre+o+certificado+no+CarreiraBeauty"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-default)",
              font: "600 13px/1 var(--font-body)", color: "#1ea952", textDecoration: "none",
            }}
          >
            <i className="ph ph-whatsapp-logo" style={{ fontSize: 16 }}></i>
            Ficou com dúvida? Fala com a gente
          </a>
        )}
      </div>
    </div>
  );
}
