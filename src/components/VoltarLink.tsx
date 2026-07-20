"use client";

import { useRouter } from "next/navigation";

// Seta de voltar que respeita de onde a pessoa veio. Telas como Conquistas,
// Quiz e Conteúdo são alcançáveis por mais de um caminho (home e Crescer) —
// um href fixo levava sempre pro mesmo lugar, quebrando a expectativa de voltar.
// Sem histórico (link direto/aba nova), cai no destino padrão.
export default function VoltarLink({ fallbackHref, title = "Voltar" }: {
  fallbackHref: string;
  title?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      style={{
        fontSize: 22, color: "var(--text-tertiary)", background: "none",
        border: "none", cursor: "pointer", lineHeight: 1, padding: 0,
      }}
    >
      ←
    </button>
  );
}
