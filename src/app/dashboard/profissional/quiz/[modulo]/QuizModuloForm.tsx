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
  // null = ainda não respondeu esta pergunta; depois de escolher, trava e
  // não deixa mais mudar de ideia — é o que dá o efeito Duolingo
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(
    progressoExistente ? progressoExistente : null
  );

  const pergunta = modulo.perguntas[indice];
  const ultima = indice === modulo.perguntas.length - 1;
  const respondida = selecionada !== null;
  const acertou = respondida && selecionada === pergunta.correta;

  function handleSelecionar(i: number) {
    if (respondida) return; // já escolheu — não muda mais de ideia
    setSelecionada(i);
  }

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
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: respondida ? 16 : 20 }}>
        {pergunta.opcoes.map((opcao, i) => {
          const estaCorreta = i === pergunta.correta;
          const foiEscolhida = selecionada === i;

          // Sem resposta ainda: só destaca ao tocar. Depois de responder:
          // a opção certa fica verde sempre (pra ela ver qual era), e a
          // errada que ela escolheu fica vermelha — o resto neutro/apagado.
          let borda = "1px solid var(--border-default)";
          let fundo = "var(--surface-card)";
          let corTexto = "var(--text-primary)";
          let opacidade = 1;

          if (!respondida && foiEscolhida) {
            borda = "2px solid var(--color-brand-primary)";
            fundo = "var(--brand-magenta-50)";
          } else if (respondida && estaCorreta) {
            borda = "2px solid var(--color-success-fg)";
            fundo = "var(--color-success-bg)";
            corTexto = "var(--color-success-fg)";
          } else if (respondida && foiEscolhida && !estaCorreta) {
            borda = "2px solid var(--color-danger-fg)";
            fundo = "var(--color-danger-bg)";
            corTexto = "var(--color-danger-fg)";
          } else if (respondida) {
            opacidade = 0.55;
          }

          return (
            <button
              key={i}
              onClick={() => handleSelecionar(i)}
              disabled={respondida}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                textAlign: "left", padding: "14px 16px", borderRadius: "var(--radius-md)",
                border: borda, background: fundo, opacity: opacidade,
                color: corTexto, fontFamily: "var(--font-body)", fontSize: 14,
                fontWeight: (foiEscolhida || (respondida && estaCorreta)) ? 600 : 500,
                cursor: respondida ? "default" : "pointer",
              }}
            >
              <span>{opcao}</span>
              {respondida && estaCorreta && (
                <i className="ph-fill ph-check-circle" style={{ fontSize: 18, color: "var(--color-success-fg)", flexShrink: 0 }}></i>
              )}
              {respondida && foiEscolhida && !estaCorreta && (
                <i className="ph-fill ph-x-circle" style={{ fontSize: 18, color: "var(--color-danger-fg)", flexShrink: 0 }}></i>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback imediato — o coração do efeito Duolingo: reforço na hora,
          não só uma nota no final */}
      {respondida && (
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px",
          borderRadius: "var(--radius-md)", marginBottom: 20,
          background: acertou ? "var(--color-success-bg)" : "var(--color-danger-bg)",
          border: `1px solid ${acertou ? "var(--color-success-fg)" : "var(--color-danger-fg)"}`,
        }}>
          <i className={acertou ? "ph-fill ph-check-circle" : "ph-fill ph-x-circle"} style={{
            fontSize: 20, marginTop: 1, flexShrink: 0,
            color: acertou ? "var(--color-success-fg)" : "var(--color-danger-fg)",
          }}></i>
          <div>
            <p style={{
              font: "700 14px/1.3 var(--font-display)", marginBottom: 3,
              color: acertou ? "var(--color-success-fg)" : "var(--color-danger-fg)",
            }}>
              {acertou ? "Isso aí! 🎉" : "Não foi dessa vez"}
            </p>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {acertou ? pergunta.feedbackSucesso : pergunta.feedbackErro}
            </p>
          </div>
        </div>
      )}

      <button onClick={handleAvancar} disabled={selecionada === null || salvando} style={{
        width: "100%", height: 48, borderRadius: "var(--radius-pill)", border: "none",
        background: "var(--color-brand-primary)", color: "#fff",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
        cursor: "pointer", opacity: selecionada === null || salvando ? 0.5 : 1,
      }}>
        {salvando ? "Salvando…" : ultima ? "Concluir módulo" : "Avançar"}
      </button>
    </div>
  );
}
