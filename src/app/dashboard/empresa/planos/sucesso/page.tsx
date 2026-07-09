"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SucessoEmpresaPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/dashboard/empresa"), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px var(--space-page-x)" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 10 }}>
          Assinatura confirmada!
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>
          Seu plano já está ativo. Redirecionando para o dashboard…
        </p>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          (aguarde 3 segundos)
        </p>
      </div>
    </div>
  );
}
