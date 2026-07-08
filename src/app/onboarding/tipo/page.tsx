"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EscolhaTipoPage() {
  const [loading, setLoading] = useState<"empresa" | "profissional" | null>(
    null
  );
  const router = useRouter();
  const supabase = createClient();

  async function escolher(tipo: "empresa" | "profissional") {
    setLoading(tipo);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({ tipo }).eq("id", user.id);

    if (tipo === "empresa") {
      router.push("/onboarding/empresa");
    } else {
      // Profissional — Fase 2
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-rose-600 mb-1">
          CarreiraBeauty
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Como você vai usar a plataforma?
        </p>

        <div className="space-y-3">
          <button
            onClick={() => escolher("empresa")}
            disabled={!!loading}
            className="w-full text-left border-2 border-gray-100 hover:border-rose-300 rounded-xl p-4 transition disabled:opacity-50"
          >
            <p className="font-semibold text-gray-800">
              Sou um estabelecimento
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              Salão, esmalteria, clínica — quero publicar vagas
            </p>
            {loading === "empresa" && (
              <p className="text-rose-500 text-sm mt-1">Carregando...</p>
            )}
          </button>

          <button
            onClick={() => escolher("profissional")}
            disabled={!!loading}
            className="w-full text-left border-2 border-gray-100 hover:border-rose-300 rounded-xl p-4 transition disabled:opacity-50"
          >
            <p className="font-semibold text-gray-800">Sou profissional</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Cabeleireiro, manicure, esteticista — quero encontrar vagas
            </p>
            {loading === "profissional" && (
              <p className="text-rose-500 text-sm mt-1">Carregando...</p>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
