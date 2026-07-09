interface Props {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function StepShell({ step, total, title, subtitle, children }: Props) {
  const pct = Math.round((step / total) * 100);

  return (
    <main style={{
      minHeight: "100vh", background: "var(--surface-page)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 var(--space-page-x) 48px",
    }}>
      {/* Top bar com logo + progresso */}
      <div style={{
        width: "100%", maxWidth: 480,
        paddingTop: 20, paddingBottom: 8,
        position: "sticky", top: 0,
        background: "var(--surface-page)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-square.jpg" alt="CarreiraBeauty" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)" }}>
            {step} de {total}
          </span>
        </div>

        {/* Barra de progresso segmentada */}
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i < step ? "var(--color-brand-primary)" : "var(--neutral-200)",
              transition: "background 200ms",
            }} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 480, marginTop: 24,
        background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-default)",
        padding: "28px 24px",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
          color: "var(--text-primary)", marginBottom: subtitle ? 6 : 24, lineHeight: 1.25,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </main>
  );
}
