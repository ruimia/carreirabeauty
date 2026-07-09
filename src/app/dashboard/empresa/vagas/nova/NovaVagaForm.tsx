"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { fetchCep, maskCep } from "@/lib/cep";
import { buildSlug, randomSuffix } from "@/lib/slug";

const VINCULOS = [
  { value: "", label: "Não especificado" },
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freela", label: "Freela / autônomo" },
  { value: "estagio", label: "Estágio" },
  { value: "menor_aprendiz", label: "Menor Aprendiz" },
];

const FAIXAS_SALARIAIS = [
  "A combinar",
  "Até R$ 1.500",
  "R$ 1.500 – R$ 2.000",
  "R$ 2.000 – R$ 3.000",
  "R$ 3.000 – R$ 4.000",
  "R$ 4.000 – R$ 6.000",
  "Acima de R$ 6.000",
  "Outro",
];

interface Props {
  company: { id: string; endereco: string; cidade: string; estado: string; cep: string; logo_url: string | null };
  profissoes: string[];
}

export default function NovaVagaForm({ company, profissoes }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [funcao, setFuncao] = useState("");
  const [funcaoOutro, setFuncaoOutro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("");
  const [faixaSalarial, setFaixaSalarial] = useState("");
  const [faixaOutro, setFaixaOutro] = useState("");
  const [cep, setCep] = useState(company.cep ?? "");
  const [endereco, setEndereco] = useState(company.endereco ?? "");
  const [cidade, setCidade] = useState(company.cidade ?? "");
  const [estado, setEstado] = useState(company.estado ?? "");
  const [fotoPreview, setFotoPreview] = useState<string | null>(company.logo_url ?? null);
  const [cepLoading, setCepLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCepBlur() {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return;
    setCepLoading(true);
    const data = await fetchCep(raw);
    if (data) {
      setEndereco([data.street, data.neighborhood].filter(Boolean).join(", "));
      setCidade(data.city ?? "");
      setEstado(data.state ?? "");
    }
    setCepLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      let fotoUrl = company.logo_url ?? null;
      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${company.id}/vaga-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        fotoUrl = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
      }

      const funcaoLabel = funcao === "Outro" ? funcaoOutro : funcao;
      const slugBase = buildSlug(titulo || funcaoLabel, cidade);
      const { data: existing } = await supabase.from("jobs").select("id").eq("slug", slugBase).maybeSingle();
      const slug = existing ? `${slugBase}-${randomSuffix()}` : slugBase;

      const { error: jErr } = await supabase.from("jobs").insert({
        company_id: company.id,
        titulo,
        funcao: funcao === "Outro" ? "outro" : funcao,
        funcao_outro: funcao === "Outro" ? funcaoOutro : null,
        descricao,
        tipo_vinculo: tipoVinculo || null,
        faixa_salarial: faixaSalarial === "Outro" ? faixaOutro : faixaSalarial,
        cep: cep.replace(/\D/g, ""),
        endereco,
        cidade,
        estado,
        foto_url: fotoUrl,
        slug,
        status: "ativa",
      });

      if (jErr) throw new Error("Erro ao publicar vaga. Tente novamente.");
      router.push("/dashboard/empresa");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao publicar.");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 14px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 15,
    color: "var(--text-primary)", outline: "none",
  };
  const sel: React.CSSProperties = { ...inp, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/dashboard/empresa" style={{ fontSize: 22, color: "var(--text-tertiary)", textDecoration: "none", lineHeight: 1 }}>←</Link>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
          Nova vaga
        </p>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px var(--space-page-x) 48px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
            padding: 20, display: "flex", flexDirection: "column", gap: 18,
          }}>

            {/* Foto da vaga */}
            <F label="Foto da vaga">
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  height: 140, borderRadius: "var(--radius-lg)", overflow: "hidden",
                  border: `2px dashed ${fotoPreview ? "var(--color-brand-primary)" : "var(--border-default)"}`,
                  background: fotoPreview ? "var(--brand-magenta-50)" : "var(--surface-sunken)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", position: "relative", transition: "all var(--duration-fast)",
                }}
              >
                {fotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoPreview} alt="Foto da vaga"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                    <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Toque para adicionar foto</p>
                  </div>
                )}
                {fotoPreview && (
                  <div style={{
                    position: "absolute", bottom: 8, right: 8,
                    background: "rgba(0,0,0,0.55)", borderRadius: "var(--radius-pill)",
                    padding: "4px 10px", fontSize: 12, color: "#fff", fontWeight: 600,
                  }}>
                    Trocar
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFotoPreview(URL.createObjectURL(f)); }} />
            </F>

            <F label="Título da vaga">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Cabeleireiro(a) para salão no centro" style={inp} />
            </F>

            <F label="Função *">
              <select required value={funcao} onChange={(e) => setFuncao(e.target.value)} style={sel}>
                <option value="">Selecione uma função</option>
                {[...profissoes, "Outro"].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </F>

            {funcao === "Outro" && (
              <F label="Qual função? *">
                <input required value={funcaoOutro} onChange={(e) => setFuncaoOutro(e.target.value)}
                  placeholder="Ex: Podólogo especializado" style={inp} />
              </F>
            )}

            <F label="Descrição da vaga *">
              <textarea required rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o que o profissional vai fazer, requisitos, diferenciais…"
                style={{ ...inp, height: "auto", padding: "12px 14px", resize: "none", lineHeight: 1.6 }} />
            </F>

            <F label="Tipo de vínculo">
              <select value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)} style={sel}>
                {VINCULOS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </F>

            <F label="Faixa salarial *">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select required value={faixaSalarial} onChange={(e) => setFaixaSalarial(e.target.value)} style={sel}>
                  <option value="">Selecione</option>
                  {FAIXAS_SALARIAIS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {faixaSalarial === "Outro" && (
                  <input required value={faixaOutro} onChange={(e) => setFaixaOutro(e.target.value)}
                    placeholder="Ex: R$ 1.800 + comissão" style={inp} autoFocus />
                )}
              </div>
            </F>

            <div style={{ height: 1, background: "var(--border-default)" }} />

            <F label="CEP *">
              <div style={{ position: "relative" }}>
                <input type="text" inputMode="numeric" required placeholder="00000-000" value={maskCep(cep)}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  onBlur={handleCepBlur} style={inp} />
                {cepLoading && (
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-tertiary)" }}>
                    buscando…
                  </span>
                )}
              </div>
            </F>

            <F label="Endereço *">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input required value={endereco} onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Logradouro e número" style={inp} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8 }}>
                  <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" style={inp} />
                  <input required value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2}
                    style={{ ...inp, textTransform: "uppercase", textAlign: "center" }} />
                </div>
              </div>
            </F>

            {error && (
              <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", height: 48, borderRadius: "var(--radius-pill)", border: "none",
              background: loading ? "var(--neutral-200)" : "var(--color-brand-primary)",
              color: loading ? "var(--text-tertiary)" : "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
            }}>
              {loading ? "Publicando…" : "Publicar vaga"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
        color: "var(--text-tertiary)", fontFamily: "var(--font-body)",
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}
