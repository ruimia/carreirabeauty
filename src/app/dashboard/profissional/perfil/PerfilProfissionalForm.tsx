"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { buildSlug, randomSuffix } from "@/lib/slug";

const FUNCOES: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

const VINCULOS: Record<string, string> = { clt: "CLT", pj: "PJ", freela: "Freela / autônomo" };
const EXPERIENCIAS = ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "Mais de 5 anos"];
const DISPONIBILIDADES = ["Integral", "Meio período", "Freela / por demanda", "Finais de semana"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerfilProfissionalForm({ professional: p, email }: { professional: any; email: string }) {
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

  const funcaoLabel = funcao === "outro" ? (funcaoOutro || "Outro") : (FUNCOES[funcao] ?? funcao);
  const initials = nome?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "?";

  async function handleSave() {
    setLoading(true); setError(""); setSuccess(false);
    try {
      let fotoUrl = p.foto_perfil_url ?? null;
      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${p.user_id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        fotoUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      let slug = p.slug;
      if (nome !== p.nome || cidade !== p.cidade) {
        const base = buildSlug(nome, cidade);
        slug = base;
        const { data: existing } = await supabase.from("professionals").select("id").eq("slug", base).neq("id", p.id).maybeSingle();
        if (existing) slug = `${base}-${randomSuffix()}`;
        if (p.slug && p.slug !== slug) {
          await supabase.from("professional_slug_history").insert({ slug: p.slug, professional_id: p.id }).throwOnError();
        }
      }
      const { error: upErr } = await supabase.from("professionals").update({
        nome, telefone, funcao, funcao_outro: funcao === "outro" ? funcaoOutro : null,
        cidade, estado, localizacao: `${cidade} - ${estado}`,
        experiencia, disponibilidade, pretensao_salarial: pretensao,
        educacao_basica: educacao, tipo_vinculo: tipoVinculo || null,
        foto_perfil_url: fotoUrl, slug,
      }).eq("id", p.id);
      if (upErr) throw new Error(upErr.message);
      setSuccess(true); setEditing(false); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar."); }
    finally { setLoading(false); }
  }

  function handleCancel() {
    setNome(p.nome ?? ""); setTelefone(p.telefone ?? ""); setFuncao(p.funcao ?? "");
    setFuncaoOutro(p.funcao_outro ?? ""); setCidade(p.cidade ?? ""); setEstado(p.estado ?? "");
    setExperiencia(p.experiencia ?? ""); setDisponibilidade(p.disponibilidade ?? "");
    setPretensao(p.pretensao_salarial ?? ""); setEducacao(p.educacao_basica ?? "");
    setTipoVinculo(p.tipo_vinculo ?? ""); setAvatarPreview(p.foto_perfil_url ?? null);
    setEditing(false); setError("");
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
      {/* Top bar */}
      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        padding: "0 var(--space-page-x)", height: 56,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/dashboard/profissional" style={{ fontSize: 22, color: "var(--text-tertiary)", textDecoration: "none", lineHeight: 1 }}>←</Link>
        <p style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
          Meu perfil
        </p>
        {!editing && (
          <button onClick={() => { setEditing(true); setSuccess(false); }} style={{
            height: 34, padding: "0 16px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-brand-primary)", background: "transparent",
            color: "var(--color-brand-primary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Editar
          </button>
        )}
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px var(--space-page-x) 48px" }}>

        {success && (
          <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", color: "var(--color-success-fg)",
            borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 14, marginBottom: 16 }}>
            Perfil atualizado com sucesso.
          </div>
        )}

        {/* Avatar + nome */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 16,
        }}>
          <div onClick={() => editing && fileRef.current?.click()} style={{
            width: 72, height: 72, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
            border: editing ? "2px dashed var(--color-brand-primary)" : "2px solid var(--border-default)",
            background: "var(--brand-blush-100)", color: "var(--brand-magenta-500)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24,
            cursor: editing ? "pointer" : "default",
          }}>
            {avatarPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarPreview} alt={nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{nome || "—"}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-primary)", marginTop: 2 }}>{funcaoLabel || "—"}</p>
            {editing && (
              <button onClick={() => fileRef.current?.click()} style={{
                marginTop: 6, fontSize: 13, color: "var(--color-brand-primary)", fontWeight: 600,
                background: "none", border: "none", padding: 0, cursor: "pointer",
              }}>
                {avatarPreview ? "Trocar foto" : "Adicionar foto"}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
        </div>

        {/* Campos */}
        <div style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
          padding: 20, display: "flex", flexDirection: "column", gap: 18,
        }}>
          <F label="Nome completo" editing={editing}>
            {editing ? <input value={nome} onChange={(e) => setNome(e.target.value)} style={inp} /> : <V>{nome || "—"}</V>}
          </F>
          <F label="WhatsApp" editing={editing}>
            {editing ? <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inp} /> : <V>{telefone || "—"}</V>}
          </F>
          <F label="Especialidade" editing={editing}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={funcao} onChange={(e) => setFuncao(e.target.value)} style={sel}>
                  <option value="">Selecione</option>
                  {Object.entries(FUNCOES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {funcao === "outro" && (
                  <input value={funcaoOutro} onChange={(e) => setFuncaoOutro(e.target.value)} placeholder="Qual especialidade?" style={inp} />
                )}
              </div>
            ) : <V>{funcaoLabel || "—"}</V>}
          </F>
          <F label="Localização" editing={editing}>
            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8 }}>
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" style={inp} />
                <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2}
                  style={{ ...inp, textTransform: "uppercase", textAlign: "center" }} />
              </div>
            ) : <V>{[cidade, estado].filter(Boolean).join(" · ") || "—"}</V>}
          </F>
          <F label="Experiência" editing={editing}>
            {editing ? (
              <select value={experiencia} onChange={(e) => setExperiencia(e.target.value)} style={sel}>
                <option value="">Selecione</option>
                {EXPERIENCIAS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <V>{experiencia || "—"}</V>}
          </F>
          <F label="Disponibilidade" editing={editing}>
            {editing ? (
              <select value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)} style={sel}>
                <option value="">Selecione</option>
                {DISPONIBILIDADES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <V>{disponibilidade || "—"}</V>}
          </F>
          <F label="Pretensão salarial" editing={editing}>
            {editing ? <input value={pretensao} onChange={(e) => setPretensao(e.target.value)} placeholder="Ex: R$ 2.000 – R$ 3.000" style={inp} /> : <V>{pretensao || "—"}</V>}
          </F>
          <F label="Formação" editing={editing}>
            {editing ? (
              <textarea rows={3} value={educacao} onChange={(e) => setEducacao(e.target.value)}
                style={{ ...inp, height: "auto", padding: "12px 14px", resize: "none", lineHeight: 1.5 }} />
            ) : <V>{educacao || "—"}</V>}
          </F>
          <F label="Tipo de vínculo" editing={editing}>
            {editing ? (
              <select value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)} style={sel}>
                <option value="">Não especificado</option>
                {Object.entries(VINCULOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : <V>{VINCULOS[tipoVinculo] || "—"}</V>}
          </F>

          <div style={{ height: 1, background: "var(--border-default)" }} />

          <F label="E-mail de acesso" editing={false}>
            <V>{email || "—"}</V>
          </F>
          {p.slug && (
            <F label="Link do perfil público" editing={false}>
              <Link href={`/perfil/${p.slug}`} style={{ fontSize: 14, color: "var(--text-link)", wordBreak: "break-all" }}>
                /perfil/{p.slug}
              </Link>
            </F>
          )}

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
