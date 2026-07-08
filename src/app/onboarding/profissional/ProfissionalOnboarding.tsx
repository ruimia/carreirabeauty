"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StepShell from "@/components/ui/StepShell";
import { buildSlug, randomSuffix } from "@/lib/slug";

const TOTAL_STEPS = 9;

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
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freela", label: "Freela / autônomo" },
] as const;

interface Props {
  professionalId: string | null;
  initialStep: number;
  initialData: Record<string, string>;
  userId: string;
}

export default function ProfissionalOnboarding({
  professionalId: initialId,
  initialStep,
  initialData,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(initialStep);
  const [professionalId, setProfessionalId] = useState<string | null>(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nome, setNome] = useState(initialData.nome ?? "");
  const [telefone, setTelefone] = useState(initialData.telefone ?? "");
  const [funcao, setFuncao] = useState(initialData.funcao ?? "");
  const [funcaoOutro, setFuncaoOutro] = useState(initialData.funcao_outro ?? "");
  const [cidade, setCidade] = useState(initialData.cidade ?? "");
  const [estado, setEstado] = useState(initialData.estado ?? "");
  const [experiencia, setExperiencia] = useState(initialData.experiencia ?? "");
  const [disponibilidade, setDisponibilidade] = useState(initialData.disponibilidade ?? "");
  const [pretensao, setPretensao] = useState(initialData.pretensao_salarial ?? "");
  const [educacao, setEducacao] = useState(initialData.educacao_basica ?? "");
  const [tipoVinculo, setTipoVinculo] = useState<string[]>(
    initialData.tipo_vinculo ? [initialData.tipo_vinculo] : []
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.foto_perfil_url ?? null
  );

  async function upsert(fields: Record<string, unknown>) {
    if (professionalId) {
      const { error } = await supabase
        .from("professionals")
        .update(fields)
        .eq("id", professionalId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase
        .from("professionals")
        .insert({ user_id: userId, ...fields })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      setProfessionalId(data.id);
    }
  }

  async function go(fields: Record<string, unknown>, nextStep: number) {
    setLoading(true);
    setError("");
    try {
      await upsert(fields);
      setStep(nextStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  async function finish(extraFields: Record<string, unknown> = {}) {
    setLoading(true);
    setError("");
    try {
      // Gera slug único
      const base = buildSlug(nome, cidade);
      let slug = base;
      const { data: existing } = await supabase
        .from("professionals")
        .select("id")
        .eq("slug", slug)
        .neq("id", professionalId ?? "")
        .maybeSingle();
      if (existing) slug = `${base}-${randomSuffix()}`;

      await upsert({ ...extraFields, slug });
      router.push("/dashboard/profissional");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar.");
    } finally {
      setLoading(false);
    }
  }

  const btn = (disabled?: boolean) => (
    <button
      onClick={() => {}}
      disabled={loading || disabled}
      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
    >
      {loading ? "Salvando..." : "Continuar"}
    </button>
  );

  // ── STEP 1: Nome + telefone ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <StepShell step={1} total={TOTAL_STEPS} title="Como você se chama?">
        <div className="space-y-3">
          <input placeholder="Seu nome completo" value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <input type="tel" placeholder="WhatsApp (só para contato)" value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ nome, telefone }, 2)}
            disabled={loading || !nome.trim() || !telefone.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 2: Função ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <StepShell step={2} total={TOTAL_STEPS} title="Qual é a sua especialidade?">
        <div className="space-y-2">
          {FUNCOES.map((f) => (
            <button key={f.value} onClick={() => setFuncao(f.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                funcao === f.value
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              {f.label}
            </button>
          ))}
          {funcao === "outro" && (
            <input placeholder="Qual especialidade?" value={funcaoOutro}
              onChange={(e) => setFuncaoOutro(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ funcao, funcao_outro: funcaoOutro || null }, 3)}
            disabled={loading || !funcao || (funcao === "outro" && !funcaoOutro.trim())}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 3: Localização ───────────────────────────────────────────────────
  if (step === 3) {
    return (
      <StepShell step={3} total={TOTAL_STEPS} title="Onde você trabalha?">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Usamos para mostrar vagas perto de você.</p>
          <input placeholder="Cidade" value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <input placeholder="Estado (UF)" value={estado} maxLength={2}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 uppercase focus:outline-none focus:ring-2 focus:ring-rose-300" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ localizacao: `${cidade} - ${estado}`, cidade, estado }, 4)}
            disabled={loading || !cidade.trim() || !estado.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 4: Experiência ───────────────────────────────────────────────────
  if (step === 4) {
    const opcoes = ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "Mais de 5 anos"];
    return (
      <StepShell step={4} total={TOTAL_STEPS} title="Há quanto tempo você atua na área?">
        <div className="space-y-2">
          {opcoes.map((o) => (
            <button key={o} onClick={() => setExperiencia(o)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                experiencia === o
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              {o}
            </button>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ experiencia }, 5)}
            disabled={loading || !experiencia}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 5: Disponibilidade ───────────────────────────────────────────────
  if (step === 5) {
    const opcoes = ["Integral", "Meio período", "Freela / por demanda", "Finais de semana"];
    return (
      <StepShell step={5} total={TOTAL_STEPS} title="Qual a sua disponibilidade?">
        <div className="space-y-2">
          {opcoes.map((o) => (
            <button key={o} onClick={() => setDisponibilidade(o)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                disponibilidade === o
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              {o}
            </button>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ disponibilidade }, 6)}
            disabled={loading || !disponibilidade}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 6: Pretensão salarial ────────────────────────────────────────────
  if (step === 6) {
    return (
      <StepShell step={6} total={TOTAL_STEPS} title="Qual é sua pretensão salarial?">
        <div className="space-y-3">
          <input placeholder="Ex: R$ 2.000 – R$ 3.000 / mês" value={pretensao}
            onChange={(e) => setPretensao(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ pretensao_salarial: pretensao }, 7)}
            disabled={loading || !pretensao.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 7: Educação básica ───────────────────────────────────────────────
  if (step === 7) {
    return (
      <StepShell step={7} total={TOTAL_STEPS} title="Qual é sua formação?">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Aparece no seu perfil público. Ex: Técnico em estética, Curso de cabeleireiro no SENAC.
          </p>
          <textarea rows={3} placeholder="Descreva sua formação principal" value={educacao}
            onChange={(e) => setEducacao(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={() => go({ educacao_basica: educacao }, 8)}
            disabled={loading || !educacao.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  // ── STEP 8: Tipo de vínculo (opcional) ────────────────────────────────────
  if (step === 8) {
    return (
      <StepShell step={8} total={TOTAL_STEPS} title="Que tipo de trabalho você busca?">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Opcional — pode pular.</p>
          {VINCULOS.map((v) => (
            <button key={v.value}
              onClick={() => setTipoVinculo(
                tipoVinculo.includes(v.value)
                  ? tipoVinculo.filter((x) => x !== v.value)
                  : [...tipoVinculo, v.value]
              )}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                tipoVinculo.includes(v.value)
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              {v.label}
            </button>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button onClick={() => go({}, 9)}
              className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 hover:bg-gray-50 transition">
              Pular
            </button>
            <button onClick={() => go({ tipo_vinculo: tipoVinculo[0] ?? null }, 9)}
              disabled={loading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
              {loading ? "Salvando..." : "Continuar"}
            </button>
          </div>
        </div>
      </StepShell>
    );
  }

  // ── STEP 9: Foto de perfil (opcional) ─────────────────────────────────────
  if (step === 9) {
    async function handleFinish(withPhoto: boolean) {
      setLoading(true);
      setError("");
      try {
        let fotoUrl = initialData.foto_perfil_url ?? null;

        if (withPhoto && fileRef.current?.files?.[0]) {
          const file = fileRef.current.files[0];
          const ext = file.name.split(".").pop();
          const path = `${userId}/avatar.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("avatars")
            .upload(path, file, { upsert: true });
          if (upErr) throw new Error(upErr.message);
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          fotoUrl = urlData.publicUrl;
        }

        await finish({ foto_perfil_url: fotoUrl });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao finalizar.");
        setLoading(false);
      }
    }

    return (
      <StepShell step={9} total={TOTAL_STEPS} title="Adicione uma foto de perfil">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Opcional — aparece no seu perfil público.</p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-rose-300 transition">
            {avatarPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarPreview} alt="Avatar" className="w-24 h-24 object-cover rounded-full" />
              : <>
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm text-gray-400">Toque para selecionar</p>
                </>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setAvatarPreview(URL.createObjectURL(f));
            }} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => handleFinish(false)} disabled={loading}
              className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 hover:bg-gray-50 transition disabled:opacity-40">
              Pular
            </button>
            <button onClick={() => handleFinish(true)} disabled={loading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
              {loading ? "Finalizando..." : "Concluir"}
            </button>
          </div>
        </div>
      </StepShell>
    );
  }

  return null;
}
