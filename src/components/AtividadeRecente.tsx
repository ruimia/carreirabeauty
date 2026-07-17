import { EventoAtividade } from "@/lib/atividadeRecente";

function tempoRelativo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  return `há ${horas}h`;
}

export default function AtividadeRecente({ eventos }: { eventos: EventoAtividade[] }) {
  if (eventos.length === 0) return null;

  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
      padding: "14px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success-fg)", flexShrink: 0 }} />
        <p style={{ font: "700 12px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Acontecendo agora no CarreiraBeauty
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {eventos.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <i className={ev.tipo === "profissional" ? "ph-fill ph-user-circle" : "ph-fill ph-storefront"} style={{
              fontSize: 15, color: "var(--color-brand-primary)", marginTop: 2, flexShrink: 0,
            }}></i>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>
              {ev.texto}
              <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}> · {tempoRelativo(ev.criadoEm)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
