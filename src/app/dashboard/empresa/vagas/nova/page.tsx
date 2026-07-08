"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const FUNCOES = [
  { value: "cabeleireiro", label: "Cabeleireiro(a)" },
  { value: "manicure_pedicure", label: "Manicure/pedicure" },
  { value: "esteticista", label: "Esteticista" },
  { value: "maquiador", label: "Maquiador(a)" },
  { value: "barbeiro", label: "Barbeiro" },
  { value: "massoterapeuta", label: "Massoterapeuta" },
  { value: "designer_sobrancelha_cilios", label: "Designer de sobrancelha/cílios" },
  { value: "depilador", label: "Depilador(a)" },
  { value: "podologo", label: "Podólogo(a)" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "auxiliar_assistente", label: "Auxiliar/assistente" },
  { value: "outro", label: "Outro" },
] as const;

const VINCULOS = [
  { value: "", label: "Não especificado" },
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freela", label: "Freela / autônomo" },
] as const;

export default function NovaVagaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [funcao, setFuncao] = useState("");
  const [funcaoOutro, setFuncaoOutro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("");
  const [faixaSalarial, setFaixaSalarial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: company, error: cErr } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cErr || !company) {
      setError("Empresa não encontrada.");
      setLoading(false);
      return;
    }

    const { error: jErr } = await supabase.from("jobs").insert({
      company_id: company.id,
      funcao,
      funcao_outro: funcao === "outro" ? funcaoOutro : null,
      descricao,
      tipo_vinculo: tipoVinculo || null,
      faixa_salarial: faixaSalarial,
      status: "ativa",
    });

    if (jErr) {
      setError("Erro ao publicar vaga. Tente novamente.");
    } else {
      router.push("/dashboard/empresa");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard/empresa"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Nova vaga</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Função */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Função *
            </label>
            <select
              required
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            >
              <option value="">Selecione uma função</option>
              {FUNCOES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {funcao === "outro" && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Qual função? *
              </label>
              <input
                required
                value={funcaoOutro}
                onChange={(e) => setFuncaoOutro(e.target.value)}
                placeholder="Ex: Podólogo especializado"
                className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Descrição da vaga *
            </label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que o profissional vai fazer, requisitos, diferenciais..."
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>

          {/* Tipo de vínculo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipo de vínculo
            </label>
            <select
              value={tipoVinculo}
              onChange={(e) => setTipoVinculo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            >
              {VINCULOS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Faixa salarial */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Faixa salarial *
            </label>
            <input
              required
              value={faixaSalarial}
              onChange={(e) => setFaixaSalarial(e.target.value)}
              placeholder="Ex: R$ 2.000 – R$ 3.000 / mês ou a combinar"
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Publicando..." : "Publicar vaga"}
          </button>
        </form>
      </div>
    </main>
  );
}
