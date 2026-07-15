"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { fetchCep, maskCep, maskPhone } from "@/lib/cep";
import { buildSlug, randomSuffix } from "@/lib/slug";
import { compressImage } from "@/lib/compressImage";

const FAIXAS: Record<string, string> = {
  "1_5": "1 a 5 funcionários",
  "6_20": "6 a 20 funcionários",
  "20_mais": "Mais de 20 funcionários",
};

const OUTRA_CATEGORIA = "Outro";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerfilEmpresaForm({ company, email, categorias }: { company: any; email: string; categorias: string[] }) {
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
  const [cepLoading, setCepLoading] = useState(false);

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
  const [categoria, setCategoria] = useState(company.categoria_negocio ?? "");
  const [categoriaOutro, setCategoriaOutro] = useState(company.categoria_outro ?? "");
  const [faixa, setFaixa] = useState(company.faixa_funcionarios ?? "");
  const [instagram, setInstagram] = useState(company.instagram ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_url ?? null);

  async function handleSave() {
    setLoading(true); setError(""); setSuccess(false);
    try {
      let logoUrl = company.logo_url ?? null;
      if (fileRef.current?.files?.[0]) {
        const rawFile = fileRef.current.files[0];
        const file = await compressImage(rawFile);
        const ext = rawFile.name.split(".").pop();
        const path = `${company.user_id}/logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        logoUrl = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
      }
      let slug = company.slug as string | null;
      if (!slug || nome !== company.nome_estabelecimento || cidade !== company.cidade) {
        const base = buildSlug(nome, cidade);
        const { data: existing } = await supabase.from("companies").select("id").eq("slug", base).neq("id", company.id).maybeSingle();
        slug = existing ? `${base}-${randomSuffix()}` : base;
      }
      const { error: upErr } = await supabase.from("companies").update({
        nome_estabelecimento: nome, responsavel, telefone, endereco, cidade, estado, cep: cep.replace(/\D/g, ""), slug,
        categoria_negocio: categoria || null,
        categoria_outro: categoria === OUTRA_CATEGORIA ? categoriaOutro || null : null,
        faixa_funcionarios: faixa || null,
        instagram: instagram.replace(/^@/, ""), logo_url: logoUrl,
      }).eq("id", company.id);
      if (upErr) throw new Error(upErr.message);
      setSuccess(true); setEditing(false); router.refresh();
    } catch (e) {
      const isNetworkError = e instanceof TypeError && /fetch/i.test(e.message);
      setError(isNetworkError ? "Falha de conexão. Verifique sua internet e tente novamente." : e instanceof Error ? e.message : "Erro ao salvar.");
    }
    finally { setLoading(false); }
  }

  function handleCancel() {
    setNome(company.nome_estabelecimento ?? ""); setResponsavel(company.responsavel ?? "");
    setTelefone(company.telefone ?? ""); setEndereco(company.endereco ?? "");
    setCidade(company.cidade ?? ""); setEstado(company.estado ?? ""); setCep(company.cep ?? "");
    setCategoria(company.categoria_negocio ?? ""); setFaixa(company.faixa_funcionarios ?? "");
    setInstagram(company.instagram ?? ""); setLogoPreview(company.logo_url ?? null);
    setEditing(false); setError("");
  }

  const inp: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 14px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 15,
    color: "var(--text-primary)", outline: "none",
  };

  const sel: React.CSSProperties = { ...inp, height: 46, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      {/* Top bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/dashboard/empresa" style={{ fontSize: 22, color: "var(--text-tertiary)", textDecoration: "none", lineHeight: 1 }}>←</Link>
        <p style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
          Perfil da empresa
        </p>
        {!editing && (
          <button onClick={() => { setEditing(true); setSuccess(false); }} style={{
            height: 36, padding: "0 18px", borderRadius: "var(--radius-pill)",
            border: "none", background: "var(--color-brand-primary)",
            color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}>
            ✏️ Editar perfil
          </button>
        )}
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px var(--space-page-x) 48px" }}>

        {success && (
          <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", color: "var(--color-success-fg)",
            borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 14, marginBottom: 16 }}>
            Dados salvos com sucesso.
          </div>
        )}

        {/* Logo + nome */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 20, marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div onClick={() => editing && fileRef.current?.click()} style={{
              width: 72, height: 72, borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0,
              border: editing ? "2px dashed var(--color-brand-primary)" : "1px solid var(--border-default)",
              background: "var(--surface-sunken)", cursor: editing ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>
              {logoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <i className={editing ? "ph ph-camera" : "ph-fill ph-storefront"} style={{ color: "var(--color-brand-primary)" }}></i>
              }
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{nome || "—"}</p>
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>{cidade} · {estado}</p>
              {editing && (
                <button onClick={() => fileRef.current?.click()} style={{
                  marginTop: 6, fontSize: 13, color: "var(--color-brand-primary)", fontWeight: 600,
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                }}>
                  {logoPreview ? "Trocar foto" : "Adicionar foto"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
          </div>
        </div>

        {/* Campos */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 20, display: "flex", flexDirection: "column", gap: 18,
        }}>
          <F label="Nome do estabelecimento" editing={editing}>
            {editing ? <input value={nome} onChange={(e) => setNome(e.target.value)} style={inp} /> : <V>{nome || "—"}</V>}
          </F>
          <F label="Responsável" editing={editing}>
            {editing ? <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} style={inp} /> : <V>{responsavel || "—"}</V>}
          </F>
          <F label="WhatsApp *" editing={editing}>
            {editing ? <input type="tel" inputMode="numeric" placeholder="(11) 99999-9999" value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))} style={inp} /> : <V>{telefone || "—"}</V>}
          </F>
          <F label="Instagram" editing={editing}>
            {editing ? (
              <div style={{ display: "flex", alignItems: "center", height: 46, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <span style={{ padding: "0 12px", background: "var(--surface-sunken)", borderRight: "1px solid var(--border-default)", color: "var(--text-tertiary)", height: "100%", display: "flex", alignItems: "center", fontSize: 15, fontWeight: 600 }}>@</span>
                <input value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                  style={{ flex: 1, height: "100%", padding: "0 14px", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, background: "transparent", color: "var(--text-primary)" }} />
              </div>
            ) : <V>{instagram ? `@${instagram}` : "—"}</V>}
          </F>
          <F label="CEP *" editing={editing}>
            {editing ? (
              <div style={{ position: "relative" }}>
                <input type="text" inputMode="numeric" placeholder="00000-000" value={maskCep(cep)}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  onBlur={handleCepBlur} style={inp} />
                {cepLoading && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-tertiary)" }}>buscando…</span>}
              </div>
            ) : <V>{maskCep(cep) || "—"}</V>}
          </F>
          <F label="Endereço *" editing={editing}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Logradouro e número" style={inp} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8 }}>
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" style={inp} />
                  <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2} style={{ ...inp, textTransform: "uppercase", textAlign: "center" }} />
                </div>
              </div>
            ) : <V>{[endereco, cidade, estado].filter(Boolean).join(", ") || "—"}</V>}
          </F>
          <F label="Tipo de estabelecimento" editing={editing}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={sel}>
                  <option value="">Selecione</option>
                  {[...categorias, OUTRA_CATEGORIA].map((nome) => <option key={nome} value={nome}>{nome}</option>)}
                </select>
                {categoria === OUTRA_CATEGORIA && (
                  <input value={categoriaOutro} onChange={(e) => setCategoriaOutro(e.target.value)}
                    placeholder="Qual tipo de negócio?" style={inp} />
                )}
              </div>
            ) : <V>{categoria === OUTRA_CATEGORIA ? (categoriaOutro || "Outro") : (categoria || "—")}</V>}
          </F>
          <F label="Funcionários" editing={editing}>
            {editing ? (
              <select value={faixa} onChange={(e) => setFaixa(e.target.value)} style={sel}>
                <option value="">Selecione</option>
                {Object.entries(FAIXAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : <V>{FAIXAS[faixa] || "—"}</V>}
          </F>

          <div style={{ height: 1, background: "var(--border-default)" }} />

          <F label="CNPJ" editing={false}>
            <V>{company.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") || "—"}</V>
          </F>
          <F label="E-mail de acesso" editing={false}>
            <V>{email || "—"}</V>
          </F>

          {error && (
            <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
              {error}
            </p>
          )}

          {editing && (
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button onClick={handleCancel} disabled={loading} style={{
                flex: 1, height: 48, borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-default)", background: "transparent",
                color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, cursor: "pointer",
              }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={loading} style={{
                flex: 1, height: 48, borderRadius: "var(--radius-pill)", border: "none",
                background: "var(--color-brand-primary)", color: "#fff",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? "Salvando…" : "Salvar"}
              </button>
            </div>
          )}
        </div>

        {/* Suporte e sair — só no mobile, desktop já tem na sidebar */}
        {!editing && (
          <div className="mobile-only" style={{
            background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
            padding: "8px 20px", marginTop: 12,
          }}>
            <a
              href="https://wa.me/5511910028403?text=Ol%C3%A1%2C+preciso+de+suporte+no+CarreiraBeauty"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 4px",
                color: "#1ea952", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}
            >
              <i className="ph ph-whatsapp-logo" style={{ fontSize: 20 }}></i>
              Suporte
            </a>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 4px",
                color: "var(--text-tertiary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
                background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              }}
            >
              <i className="ph ph-sign-out" style={{ fontSize: 20 }}></i>
              Sair
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function F({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
        color: editing ? "var(--color-brand-primary)" : "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function V({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{children}</p>;
}
