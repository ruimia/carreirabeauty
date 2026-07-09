"use client";

export default function ErrorNovaVaga({ error }: { error: Error & { digest?: string } }) {
  return (
    <div style={{ padding: 32, maxWidth: 480, margin: "0 auto" }}>
      <p style={{ fontWeight: 700, color: "var(--color-danger-fg)", marginBottom: 8 }}>
        Erro ao abrir Nova vaga
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 13, background: "#fee", padding: 12, borderRadius: 8, wordBreak: "break-all" }}>
        {error.message || "Sem mensagem"}
      </p>
      {error.digest && (
        <p style={{ fontSize: 12, color: "gray", marginTop: 8 }}>digest: {error.digest}</p>
      )}
    </div>
  );
}
