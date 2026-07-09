"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  jobId: string;
  professionalId: string;
  alreadyApplied: boolean;
}

export default function CandidatarButton({ jobId, professionalId, alreadyApplied }: Props) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (applied || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .insert({ job_id: jobId, professional_id: professionalId });
    if (!error) setApplied(true);
    setLoading(false);
  }

  if (applied) {
    return (
      <span style={{
        fontSize: 13, fontWeight: 600, color: "var(--color-success-fg)",
        background: "var(--color-success-bg)", borderRadius: "var(--radius-pill)",
        padding: "0 14px", height: 36, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
      }}>
        ✓ Candidatura enviada
      </span>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      style={{
        height: 36, padding: "0 18px", borderRadius: "var(--radius-pill)",
        border: "none", background: loading ? "var(--brand-magenta-400)" : "var(--color-brand-primary)",
        color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
        transition: "background var(--duration-fast) var(--ease-standard)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Enviando…" : "Candidatar"}
    </button>
  );
}
