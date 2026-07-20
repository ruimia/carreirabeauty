"use client";

import { useState } from "react";

export default function MensagensSugeridas({ slug }: { slug: string }) {
  const [copiada, setCopiada] = useState<number | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/perfil/${slug}/depoimento` : "";

  const mensagens = [
    `Oi! Fico muito feliz que você confiou no meu trabalho 💛 Você poderia deixar um depoimento rápido pra mim? É bem rapidinho, sem precisar criar conta: ${url}`,
    `Oi, tudo bem? Passando pra pedir um favorzinho: você poderia avaliar o atendimento que fiz pra você? Ajuda muito outras pessoas a conhecerem meu trabalho. Link: ${url}`,
    `Oi! Se puder, deixa um depoimento sobre como foi seu atendimento comigo — leva 1 minutinho e me ajuda demais a conseguir mais clientes 🙏 ${url}`,
  ];

  async function handleCopiar(i: number) {
    await navigator.clipboard.writeText(mensagens[i]);
    setCopiada(i);
    setTimeout(() => setCopiada(null), 2000);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <p className="section-label">Mensagens prontas pra mandar</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mensagens.map((msg, i) => (
          <div key={i} className="job-feed-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {msg}
            </p>
            <button onClick={() => handleCopiar(i)} style={{
              alignSelf: "flex-start", height: 38, padding: "0 16px", borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-brand-primary)", background: "transparent",
              color: "var(--color-brand-primary)", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className={copiada === i ? "ph-fill ph-check" : "ph ph-copy"}></i>
              {copiada === i ? "Copiado!" : "Copiar mensagem"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
