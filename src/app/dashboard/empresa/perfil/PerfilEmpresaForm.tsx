"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const CATEGORIAS: Record<string, string> = {
  salao_beleza: "Salão de beleza / cabeleireiro",
  esmalteria: "Esmalteria / nail designer",
  clinica_estetica: "Clínica de estética",
  barbearia: "Barbearia",
  spa_massoterapia: "Spa / massoterapia",
  estudio_sobrancelha_cilios: "Estúdio de sobrancelha/cílios",
  outro: "Outro",
};

const FAIXAS: Record<string, string> = {
  "1_5": "1 a 5 funcionários",
  "6_20": "6 a 20 funcionários",
  "20_mais": "Mais de 20 funcionários",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerfilEmpresaForm({ company }: { company: any }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [nome, setNome] = useState(company.nome_estabelecimento ?? "");
  const [responsavel, setResponsavel] = useState(company.responsavel ?? "");
  const [telefone, setTelefone] = useState(company.telefone ?? "");
  const [endereco, setEndereco] = useState(company.endereco ?? "");
  const [cidade, setCidade] = useState(company.cidade ?? "");
  const [estado, setEstado] = useState(company.estado ?? "");
  const [cep, setCep] = useState(company.cep ?? "");
  const [categoria, setCategoria] = useState(company.categoria_negocio ?? "");
  const [faixa, setFaixa] = useState(company.faixa_funcionarios ?? "");
  const [instagram, setInstagram] = useState(company.instagram ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_url ?? null);

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let logoUrl = company.logo_url ?? null;

      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${company.user_id}/logo.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      const { error: upErr } = await supabase
        .from("companies")
        .update({
          nome_estabelecimento: nome,
          responsavel,
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          categoria_negocio: categoria || null,
          faixa_funcionarios: faixa || null,
          instagram: instagram.replace(/^@/, ""),
          logo_url: logoUrl,
        })
        .eq("id", company.id);

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
    setNome(company.nome_estabelecimento ?? "");
    setResponsavel(company.responsavel ?? "");
    setTelefone(company.telefone ?? "");
    setEndereco(company.endereco ?? "");
    setCidade(company.cidade ?? "");
    setEstado(company.estado ?? "");
    setCep(company.cep ?? "");
    setCategoria(company.categoria_negocio ?? "");
    setFaixa(company.faixa_funcionarios ?? "");
    setInstagram(company.instagram ?? "");
    setLogoPreview(company.logo_url ?? null);
    setEditing(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/empresa" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">←</Link>
          <h1 className="text-xl font-bold text-gray-800 flex-1">Perfil da empresa</h1>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setSuccess(false); }}
              className="text-rose-500 font-medium text-sm"
            >
              Editar
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
            Dados salvos com sucesso.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => editing && fileRef.current?.click()}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex items-center justify-center bg-gray-50 ${editing ? "cursor-pointer border-dashed border-rose-300 hover:border-rose-400" : "border-gray-100"}`}
            >
              {logoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                : <span className="text-2xl">{editing ? "📷" : "🏪"}</span>
              }
            </div>
            <div>
              <p className="font-semibold text-gray-800">{nome || "—"}</p>
              {editing && (
                <button onClick={() => fileRef.current?.click()} className="text-rose-500 text-sm mt-1">
                  {logoPreview ? "Trocar foto" : "Adicionar foto"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPreview(URL.createObjectURL(f));
              }}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Campos */}
          <Field label="Nome do estabelecimento" editing={editing}>
            {editing
              ? <Input value={nome} onChange={setNome} />
              : <Value>{nome || "—"}</Value>}
          </Field>

          <Field label="Responsável" editing={editing}>
            {editing
              ? <Input value={responsavel} onChange={setResponsavel} />
              : <Value>{responsavel || "—"}</Value>}
          </Field>

          <Field label="WhatsApp" editing={editing}>
            {editing
              ? <Input value={telefone} onChange={setTelefone} type="tel" />
              : <Value>{telefone || "—"}</Value>}
          </Field>

          <Field label="Instagram" editing={editing}>
            {editing
              ? (
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-300">
                  <span className="px-3 text-gray-400 bg-gray-50 py-2.5 border-r border-gray-200">@</span>
                  <input value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                    className="flex-1 py-2.5 px-3 focus:outline-none text-sm" />
                </div>
              )
              : <Value>{instagram ? `@${instagram}` : "—"}</Value>}
          </Field>

          <Field label="Endereço" editing={editing}>
            {editing
              ? (
                <div className="space-y-2">
                  <Input value={endereco} onChange={setEndereco} placeholder="Logradouro e número" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={cidade} onChange={setCidade} placeholder="Cidade" />
                    <Input value={estado} onChange={setEstado} placeholder="UF" maxLength={2} />
                  </div>
                  <Input value={cep} onChange={setCep} placeholder="CEP" />
                </div>
              )
              : <Value>{[endereco, cidade, estado].filter(Boolean).join(", ") || "—"}</Value>}
          </Field>

          <Field label="Tipo de estabelecimento" editing={editing}>
            {editing
              ? (
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                  <option value="">Selecione</option>
                  {Object.entries(CATEGORIAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )
              : <Value>{CATEGORIAS[categoria] || "—"}</Value>}
          </Field>

          <Field label="Funcionários" editing={editing}>
            {editing
              ? (
                <select value={faixa} onChange={(e) => setFaixa(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                  <option value="">Selecione</option>
                  {Object.entries(FAIXAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )
              : <Value>{FAIXAS[faixa] || "—"}</Value>}
          </Field>

          <Field label="CNPJ" editing={false}>
            <Value>{company.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") || "—"}</Value>
          </Field>

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
