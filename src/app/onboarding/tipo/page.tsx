"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EscolhaTipoPage() {
  const [loading, setLoading] = useState<"empresa" | "profissional" | null>(
    null
  );
  const router = useRouter();
  const supabase = createClient();

  async function escolher(tipo: "empresa" | "profissional") {
    setLoading(tipo);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({ tipo }).eq("id", user.id);

    if (tipo === "empresa") {
      router.push("/onboarding/empresa");
    } else {
      router.push("/onboarding/profissional");
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--surface-accent)", padding: "24px var(--space-page-x)",
    }}>
      <div style={{
        background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)", padding: "36px 30px", width: "100%", maxWidth: 420,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-square.jpg" alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", marginBottom: 14 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", marginBottom: 4 }}>
          Como você vai usar o CarreiraBeauty?
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)", lineHeight: 1.4, marginBottom: 24 }}>
          Você pode mudar isso depois, se precisar.
        </p>

        {/* Título pela ação (contratar/trabalhar), não pela identidade
            ("Sou um estabelecimento" confundia quem trabalha num salão mas
            não é dono) — mais difícil de ler errado passando o olho rápido.
            Profissional vem primeiro por ser a maioria dos cadastros. */}
        <Opcao
          icon="ph-fill ph-user-circle"
          iconColor="var(--brand-cyan-500)"
          title="Quero trabalhar"
          desc="Sou cabeleireiro(a), manicure, esteticista... e quero encontrar vagas"
          loading={loading === "profissional"}
          disabled={!!loading}
          onClick={() => escolher("profissional")}
        />

        <Opcao
          icon="ph-fill ph-storefront"
          iconColor="var(--color-brand-primary)"
          title="Quero contratar"
          desc="Sou dono(a)/gerente de salão, esmalteria, clínica... e quero publicar vagas"
          loading={loading === "empresa"}
          disabled={!!loading}
          onClick={() => escolher("empresa")}
        />
      </div>
    </main>
  );
}

function Opcao({ icon, iconColor, title, desc, loading, disabled, onClick }: {
  icon: string; iconColor: string; title: string; desc: string;
  loading: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", textAlign: "left", padding: 20, borderRadius: "var(--radius-lg)",
        border: "2px solid var(--border-default)", background: "var(--surface-card)",
        cursor: disabled ? "default" : "pointer", display: "flex", gap: 14, alignItems: "flex-start",
        marginBottom: 12, opacity: disabled && !loading ? 0.5 : 1,
        transition: "border-color var(--duration-fast) var(--ease-standard)",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = "var(--color-brand-primary)"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.borderColor = "var(--border-default)"; }}
    >
      <i className={icon} style={{ fontSize: 24, flexShrink: 0, color: iconColor }}></i>
      <div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.4, marginTop: 2 }}>
          {desc}
        </p>
        {loading && (
          <p style={{ fontSize: 13, color: "var(--color-brand-primary)", marginTop: 6 }}>Carregando…</p>
        )}
      </div>
    </button>
  );
}
