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
      <span className="text-sm text-green-600 font-medium whitespace-nowrap">
        ✓ Candidatura enviada
      </span>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl px-4 py-2 transition disabled:opacity-40 whitespace-nowrap"
    >
      {loading ? "Enviando..." : "Candidatar"}
    </button>
  );
}
