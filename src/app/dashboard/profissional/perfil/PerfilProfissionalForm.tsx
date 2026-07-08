"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { buildSlug, randomSuffix } from "@/lib/slug";

const FUNCOES: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)",
  manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista",
  maquiador: "Maquiador(a)",
  barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta",
  designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)",
  podologo: "Podólogo(a)",
  recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente",
  outro: "Outro",
};

const VINCULOS: Record<string, string> = { clt: "CLT", pj: "PJ", freela: "Freela / autônomo" };
const EXPERIENCIAS = ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "Mais de 5 anos"];
const DISPONIBILIDADES = ["Integral", "Meio período", "Freela / por demanda", "Finais de semana"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerfilProfissionalForm({ professional: p }: { professional: any }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [nome, setNome] = useState(p.nome ?? "");
  const [telefone, setTelefone] = useState(p.telefone ?? "");
  const [funcao, setFuncao] = useState(p.funcao ?? "");
  const [funcaoOutro, setFuncaoOutro] = useState(p.funcao_outro ?? "");
  const [cidade, setCidade] = useState(p.cidade ?? "");
  const [estado, setEstado] = useState(p.estado ?? "");
  const [experiencia, setExperiencia] = useState(p.experiencia ?? "");
  const [disponibilidade, setDisponibilidade] = useState(p.disponibilidade ?? "");
  const [pretensao, setPretensao] = useState(p.pretensao_salarial ?? "");
  const [educacao, setEducacao] = useState(p.educacao_basica ?? "");
  const [tipoVinculo, setTipoVinculo] = useState(p.tipo_vinculo ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(p.foto_perfil_url ?? null);

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      let fotoUrl = p.foto_perfil_url ?? null;

      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${p.user_id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        fotoUrl = urlData.publicUrl;
      }

      // Regenera slug se nome ou cidade mudaram
      let slug = p.slug;
      if (nome !== p.nome || cidade !== p.cidade) {
        const base = buildSlug(nome, cidade);
        slug = base;
        const { data: existing } = await supabase
          .from("professionals")
          .select("id")
          .eq("slug", base)
          .neq("id", p.id)
          .maybeSingle();
        if (existing) slug = `${base}-${randomSuffix()}`;

        // Salva slug antigo no histórico para manter URLs antigas funcionando
        if (p.slug && p.slug !== slug) {
          await supabase
            .from("professional_slug_history")
            .insert({ slug: p.slug, professional_id: p.id })
            .throwOnError();
        }
      }

      const { error: upErr } = await supabase
        .from("professionals")
        .update({
          nome,
          telefone,
          funcao,
          funcao_outro: funcao === "outro" ? funcaoOutro : null,
          cidade,
          estado,
          localizacao: `${cidade} - ${estado}`,
          experiencia,
          disponibilidade,
          pretensao_salarial: pretensao,
          educacao_basica: educacao,
          tipo_vinculo: tipoVinculo || null,
          foto_perfil_url: fotoUrl,
          slug,
        })
        .eq("id", p.id);

      if (upErr) throw new Error(upErr.message);
      setSuccess(true);
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setNome(p.nome ?? ""); setTelefone(p.telefone ?? "");
    setFuncao(p.funcao ?? ""); setFuncaoOutro(p.funcao_outro ?? "");
    setCidade(p.cidade ?? ""); setEstado(p.estado ?? "");
    setExperiencia(p.experiencia ?? ""); setDisponibilidade(p.disponibilidade ?? "");
    setPretensao(p.pretensao_salarial ?? ""); setEducacao(p.educacao_basica ?? "");
    setTipoVinculo(p.tipo_vinculo ?? "");
    setAvatarPreview(p.foto_perfil_url ?? null);
    setEditing(false); setError("");
  }

  const funcaoLabel = funcao === "outro" ? (funcaoOutro || "Outro") : (FUNCOES[funcao] ?? funcao);

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">

        <div className="flex items-center gap-3">
          <Link href="/dashboard/profissional" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">←</Link>
          <h1 className="text-xl font-bold text-gray-800 flex-1">Meu perfil</h1>
          {!editing && (
            <button onClick={() => { setEditing(true); setSuccess(false); }}
              className="text-rose-500 font-medium text-sm">
              Editar
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
            Perfil atualizado com sucesso.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div onClick={() => editing && fileRef.current?.click()}
              className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-rose-100 text-3xl font-bold text-rose-400 flex-shrink-0 ${editing ? "cursor-pointer ring-2 ring-dashed ring-rose-300" : ""}`}>
              {avatarPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarPreview} alt={nome} className="w-full h-full object-cover" />
                : nome?.[0]?.toUpperCase() ?? "?"
              }
            </div>
            <div>
              <p className="font-semibold text-gray-800">{nome || "—"}</p>
              <p className="text-sm text-rose-500">{funcaoLabel || "—"}</p>
              {editing && (
                <button onClick={() => fileRef.current?.click()} className="text-rose-500 text-sm mt-1">
                  {avatarPreview ? "Trocar foto" : "Adicionar foto"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
          </div>

          <hr className="border-gray-100" />

          <Field label="Nome completo" editing={editing}>
            {editing ? <Input value={nome} onChange={setNome} /> : <Value>{nome || "—"}</Value>}
          </Field>

          <Field label="WhatsApp" editing={editing}>
            {editing ? <Input value={telefone} onChange={setTelefone} type="tel" /> : <Value>{telefone || "—"}</Value>}
          </Field>

          <Field label="Especialidade" editing={editing}>
            {editing ? (
              <div className="space-y-2">
                <select value={funcao} onChange={(e) => setFuncao(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                  <option value="">Selecione</option>
                  {Object.entries(FUNCOES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {funcao === "outro" && (
                  <Input value={funcaoOutro} onChange={setFuncaoOutro} placeholder="Qual especialidade?" />
                )}
              </div>
            ) : <Value>{funcaoLabel || "—"}</Value>}
          </Field>

          <Field label="Localização" editing={editing}>
            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                <Input value={cidade} onChange={setCidade} placeholder="Cidade" />
                <Input value={estado} onChange={setEstado} placeholder="UF" maxLength={2} />
              </div>
            ) : <Value>{[cidade, estado].filter(Boolean).join(" · ") || "—"}</Value>}
          </Field>

          <Field label="Experiência" editing={editing}>
            {editing ? (
              <select value={experiencia} onChange={(e) => setExperiencia(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Selecione</option>
                {EXPERIENCIAS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <Value>{experiencia || "—"}</Value>}
          </Field>

          <Field label="Disponibilidade" editing={editing}>
            {editing ? (
              <select value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Selecione</option>
                {DISPONIBILIDADES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <Value>{disponibilidade || "—"}</Value>}
          </Field>

          <Field label="Pretensão salarial" editing={editing}>
            {editing ? <Input value={pretensao} onChange={setPretensao} placeholder="Ex: R$ 2.000 – R$ 3.000" /> : <Value>{pretensao || "—"}</Value>}
          </Field>

          <Field label="Formação" editing={editing}>
            {editing ? (
              <textarea rows={3} value={educacao} onChange={(e) => setEducacao(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
            ) : <Value>{educacao || "—"}</Value>}
          </Field>

          <Field label="Tipo de vínculo" editing={editing}>
            {editing ? (
              <select value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Não especificado</option>
                {Object.entries(VINCULOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : <Value>{VINCULOS[tipoVinculo] || "—"}</Value>}
          </Field>

          {p.slug && (
            <Field label="Link do perfil público" editing={false}>
              <Link href={`/perfil/${p.slug}`} className="text-rose-500 text-sm underline break-all">
                /perfil/{p.slug}
              </Link>
            </Field>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {editing && (
            <div className="flex gap-3 pt-2">
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-3 hover:bg-gray-50 transition disabled:opacity-40">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className={`text-xs font-medium mb-1 ${editing ? "text-rose-500" : "text-gray-400"}`}>{label}</p>
      {children}
    </div>
  );
}
function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-800 text-sm">{children}</p>;
}
function Input({ value, onChange, type = "text", placeholder, maxLength }:
  { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; maxLength?: number }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
  );
}
