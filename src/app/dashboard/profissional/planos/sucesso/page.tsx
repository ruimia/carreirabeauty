import Link from "next/link";

export default function SucessoProfissionalPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px var(--space-page-x)" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", marginBottom: 10 }}>
          Bem-vindo ao Pro!
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          Seu plano Pro está ativo. Candidate-se a vagas sem limite e apareça em destaque para as empresas.
        </p>
        <Link href="/dashboard/profissional" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          height: 48, padding: "0 32px", borderRadius: "var(--radius-pill)",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
          textDecoration: "none",
        }}>
          Ver vagas disponíveis →
        </Link>
      </div>
    </div>
  );
}
