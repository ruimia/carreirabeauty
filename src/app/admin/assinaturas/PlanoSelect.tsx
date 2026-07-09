"use client";

import { useState } from "react";
import { atualizarPlanoEmpresa, atualizarPlanoProfissional } from "./actions";

interface Props {
  id: string;
  tipo: "empresa" | "profissional";
  planoAtual: string;
  opcoesPlano: string[];
}

export default function PlanoSelect({ id, tipo, planoAtual, opcoesPlano }: Props) {
  const [plano, setPlano] = useState(planoAtual);
  const [loading, setLoading] = useState(false);

  async function handleChange(novo: string) {
    setPlano(novo);
    setLoading(true);
    if (tipo === "empresa") await atualizarPlanoEmpresa(id, novo);
    else await atualizarPlanoProfissional(id, novo);
    setLoading(false);
  }

  return (
    <select
      value={plano}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      style={{
        fontSize: 12, fontWeight: 600, padding: "3px 8px",
        borderRadius: 6, border: "1px solid #e4e4e7",
        background: loading ? "#f4f4f5" : "#fff",
        cursor: loading ? "not-allowed" : "pointer",
        color: plano === "gratis" ? "#71717a" : "#dc00dc",
      }}
    >
      {opcoesPlano.map((op) => (
        <option key={op} value={op}>{op}</option>
      ))}
    </select>
  );
}
