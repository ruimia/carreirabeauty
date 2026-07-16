"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { QuizModulo } from "@/lib/quizContent";

interface Props {
  professionalId: string;
  trilhaSlug: string;
  modulo: QuizModulo;
  progressoExistente: { acertos: number; total: number } | null;
}

export default function QuizModuloForm({ professionalId, trilhaSlug, modulo, progressoExistente }: Props) {
  const supabase = createClient();
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(
    progressoExistente ? progressoExistente : null
  );

  const pergunta = modulo.perguntas[indice];
  const ultima = indice === modulo.perguntas.length - 1;

  async function handleAvancar() {
    if (selecionada === null) return;
    const novasRespostas = [...respostas, selecionada];

    if (!ultima) {
      setRespostas(novasRespostas);
      setSelecionada(null);
      setIndice((i) => i + 1);
      return;
    }

    const acertos = novasRespostas.filter((r, i) => r === modulo.perguntas[i].correta).length;
    const total = modulo.perguntas.length;
    setSalvando(true);
    try {
      await supabase.from("quiz_progresso").upsert({
        professional_id: professionalId,
        trilha_slug: trilhaSlug,
        modulo_slug: modulo.slug,
        acertos,
        total,
        concluido_em: new Date().toISOString(),
      }, { onConflict: "professional_id,trilha_slug,modulo_slug" });
      setResultado({ acertos, total });
    } finally {
      setSalvando(false);
    }
  }

  if (resultado) {
    return (
      <div className="card card-xl" style={{ padding: "28px 24px", textAlign: "center" }}>
        <i className="ph-fill ph-check-circle" style={{ fontSize: 32, color: "var(--color-success-fg)" }}></i>
        <p style={{ font: "700 17px/1.3 var(--font-display)", color: "var(--text-primary)", marginTop: 10 }}>
          Módulo concluído!
        </p>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 6, marginBottom: 20 }}>
          Você acertou {resultado.acertos} de {resultado.total} perguntas.
        </p>
        <Link href="/dashboard/profissional/quiz" style={{
          display: "block", height: 48, borderRadius: "var(--radius-pill)",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
          textDecoration: "none", lineHeight: "48px",
        }}>
          Voltar pra trilha
        </Link>
      </div>
    );
  }

  return (
    <div className="card card-xl" style={{ padding: "24px" }}>
      <p style={{ font: "500 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
        Pergunta {indice + 1} de {modulo.perguntas.length}
      </p>
      <p style={{ font: "600 17px/1.4 var(--font-display)", color: "var(--text-primary)", marginBottom: 18 }}>
        {pergunta.pergunta}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {pergunta.opcoes.map((opcao, i) => {
          const ativa = selecionada === i;
          return (
            <button
              key={i}
              onClick={() => setSelecionada(i)}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: "var(--radius-md)",
                border: ativa ? "2px solid var(--color-brand-primary)" : "1px solid var(--border-default)",
                background: ativa ? "var(--brand-magenta-50)" : "var(--surface-card)",
                color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 14,
                fontWeight: ativa ? 600 : 500, cursor: "pointer",
              }}
            >
              {opcao}
            </button>
          );
        })}
      </div>
      <button onClick={handleAvancar} disabled={selecionada === null || salvando} style={{
        width: "100%", height: 48, borderRadius: "var(--radius-pill)", border: "none",
        background: "var(--color-brand-primary)", color: "#fff",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
        cursor: "pointer", opacity: selecionada === null || salvando ? 0.5 : 1,
      }}>
        {salvando ? "Salvando…" : ultima ? "Concluir módulo" : "Próxima"}
      </button>
    </div>
  );
}
