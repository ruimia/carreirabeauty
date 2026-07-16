"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  professionalId: string;
  trilhaSlug: string;
  certificadoNome: string;
  isPro: boolean;
  jaDesbloqueado: boolean;
  todosConcluidos: boolean;
}

export default function ResgateCertificado({
  professionalId, trilhaSlug, certificadoNome, isPro, jaDesbloqueado, todosConcluidos,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [desbloqueado, setDesbloqueado] = useState(jaDesbloqueado);
  const [tentativaRegistrada, setTentativaRegistrada] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (desbloqueado) {
    return (
      <div style={{
        background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
        borderRadius: "var(--radius-xl)", border: "1px solid var(--brand-magenta-100)",
        boxShadow: "var(--shadow-sm)", padding: 24, textAlign: "center",
      }}>
        <i className="ph-fill ph-seal-check" style={{ fontSize: 32, color: "var(--color-brand-primary)" }}></i>
        <p style={{ font: "700 17px/1.3 var(--font-display)", color: "var(--text-primary)", marginTop: 10 }}>
          {certificadoNome}
        </p>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 6 }}>
          Certificado desbloqueado! Em breve você poderá exibi-lo no seu perfil público.
        </p>
      </div>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      if (isPro) {
        await supabase.from("quiz_eventos").insert({
          professional_id: professionalId, trilha_slug: trilhaSlug, evento: "certificado_desbloqueado",
        });
        await supabase.from("professionals").update({
          certificado_autoestima_desbloqueado_em: new Date().toISOString(),
        }).eq("id", professionalId);
        setDesbloqueado(true);
        router.refresh();
      } else {
        await supabase.from("quiz_eventos").insert({
          professional_id: professionalId, trilha_slug: trilhaSlug, evento: "certificado_tentativa",
        });
        setTentativaRegistrada(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
      padding: 24, textAlign: "center",
    }}>
      <i className="ph-fill ph-seal-check" style={{ fontSize: 28, color: "var(--color-brand-primary)" }}></i>
      <p style={{ font: "700 16px/1.3 var(--font-display)", color: "var(--text-primary)", marginTop: 8, marginBottom: 6 }}>
        Você completou a trilha!
      </p>
      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 16 }}>
        {isPro
          ? "Resgate agora o seu certificado."
          : "O certificado é um benefício do PRO — desbloqueie e mostre no seu perfil que você investiu em atendimento e postura."}
      </p>

      {!isPro && tentativaRegistrada ? (
        <Link href="/dashboard/profissional/planos" style={{
          display: "block", height: 48, borderRadius: "var(--radius-pill)",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
          textDecoration: "none", lineHeight: "48px",
        }}>
          Ver plano PRO
        </Link>
      ) : (
        <button onClick={handleClick} disabled={loading} style={{
          height: 48, padding: "0 24px", borderRadius: "var(--radius-pill)", border: "none",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
          cursor: "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Aguarde…" : isPro ? "Resgatar certificado" : "Desbloquear certificado"}
        </button>
      )}
    </div>
  );
}
