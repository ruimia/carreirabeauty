"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { buildSlug, randomSuffix } from "@/lib/slug";
import { fetchCep, maskCep, maskPhone } from "@/lib/cep";

const VINCULOS: Record<string, string> = { clt: "CLT", pj: "PJ", freela: "Freela / autônomo" };
const OUTRA = "Outro";
const EXPERIENCIAS = ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "Mais de 5 anos"];
const DISPONIBILIDADES = ["Integral", "Meio período", "Freela / por demanda", "Finais de semana"];

interface EduItem { curso: string; instituicao: string; ano: string; }
interface ExpItem { empresa: string; cargo: string; periodo: string; }

interface HabilidadeItem { nome: string; profissao: string | null; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerfilProfissionalForm({ professional: p, email, profissoes, habilidades }: { professional: any; email: string; profissoes: string[]; habilidades: HabilidadeItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Basic fields
  const [nome, setNome] = useState(p.nome ?? "");
  const [telefone, setTelefone] = useState(p.telefone ?? "");
  const [funcoes, setFuncoes] = useState<string[]>(p.funcoes?.length ? p.funcoes : []);
  const [funcaoOutro, setFuncaoOutro] = useState(p.funcao_outro ?? "");
  function toggleFuncao(nome: string) {
    setFuncoes((prev) => prev.includes(nome) ? prev.filter((x) => x !== nome) : [...prev, nome]);
  }
  const [cep, setCep] = useState(p.cep ?? "");
  const [endereco, setEndereco] = useState(p.endereco ?? "");
  const [cidade, setCidade] = useState(p.cidade ?? "");
  const [estado, setEstado] = useState(p.estado ?? "");
  const [cepLoading, setCepLoading] = useState(false);
  const [dataNascimento, setDataNascimento] = useState(p.data_nascimento ?? "");
  const [genero, setGenero] = useState(p.genero ?? "");
  const [instagram, setInstagram] = useState(p.instagram ?? "");
  const [apresentacao, setApresentacao] = useState(p.educacao_basica ?? "");
  const [experiencia, setExperiencia] = useState(p.experiencia ?? "");
  const [disponibilidade, setDisponibilidade] = useState(p.disponibilidade ?? "");
  const [tipoVinculo, setTipoVinculo] = useState(p.tipo_vinculo ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(p.foto_perfil_url ?? null);

  // Rich profile fields
  const [educacao, setEducacao] = useState<EduItem[]>(p.educacao ?? []);
  const [newEdu, setNewEdu] = useState<EduItem | null>(null);
  const [experiencias, setExperiencias] = useState<ExpItem[]>(p.experiencia_prof ?? []);
  const [newExp, setNewExp] = useState<ExpItem | null>(null);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(p.portfolio_urls ?? []);
  const [portfolioNewFiles, setPortfolioNewFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [selectedHabilidades, setSelectedHabilidades] = useState<string[]>(p.habilidades ?? []);

  const funcaoLabel = funcoes.map((f) => f === OUTRA ? (funcaoOutro || OUTRA) : f).join(", ");

  // Habilidades filtradas pelas profissões selecionadas, agrupadas por profissão
  const habilidadesFiltradas = habilidades.filter(
    (h) => !h.profissao || funcoes.includes(h.profissao)
  );
  const habilidadesPorProfissao = habilidadesFiltradas.reduce<Record<string, string[]>>((acc, h) => {
    const key = h.profissao ?? "Geral";
    if (!acc[key]) acc[key] = [];
    acc[key].push(h.nome);
    return acc;
  }, {});
  const initials = nome?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "?";

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

  function handlePortfolioFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setPortfolioNewFiles((prev) => [...prev, ...arr]);
    setPortfolioPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removePortfolioExisting(url: string) {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  }

  function removePortfolioNew(idx: number) {
    setPortfolioNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPortfolioPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setLoading(true); setError(""); setSuccess(false);
    try {
      // Avatar upload
      let fotoUrl = p.foto_perfil_url ?? null;
      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${p.user_id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        fotoUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      // Portfolio uploads
      const newUrls: string[] = [];
      for (const file of portfolioNewFiles) {
        const ext = file.name.split(".").pop();
        const path = `${p.user_id}/portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (!upErr) {
          newUrls.push(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
        }
      }
      const allPortfolioUrls = [...portfolioUrls, ...newUrls];

      // Slug
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
        nome, telefone, funcoes, funcao_outro: funcoes.includes(OUTRA) ? funcaoOutro : null,
        cep: cep.replace(/\D/g, ""), endereco,
        cidade, estado, localizacao: `${cidade} - ${estado}`,
        educacao_basica: apresentacao || null,
        experiencia, disponibilidade,
        tipo_vinculo: tipoVinculo || null,
        data_nascimento: dataNascimento || null, genero: genero || null,
        instagram: instagram.replace(/^@/, "") || null,
        foto_perfil_url: fotoUrl, slug,
        educacao, experiencia_prof: experiencias,
        portfolio_urls: allPortfolioUrls,
        habilidades: selectedHabilidades,
      }).eq("id", p.id);
      if (upErr) throw new Error(upErr.message);

      setPortfolioUrls(allPortfolioUrls);
      setPortfolioNewFiles([]); setPortfolioPreviews([]);
      setSuccess(true); setEditing(false); router.refresh();
    } catch (e) {
      const isNetworkError = e instanceof TypeError && /fetch/i.test(e.message);
      setError(isNetworkError ? "Falha de conexão. Verifique sua internet e tente novamente." : e instanceof Error ? e.message : "Erro ao salvar.");
    }
    finally { setLoading(false); }
  }

  function handleCancel() {
    setNome(p.nome ?? ""); setTelefone(p.telefone ?? "");
    setFuncoes(p.funcoes?.length ? p.funcoes : []); setFuncaoOutro(p.funcao_outro ?? "");
    setCep(p.cep ?? ""); setEndereco(p.endereco ?? ""); setCidade(p.cidade ?? ""); setEstado(p.estado ?? "");
    setApresentacao(p.educacao_basica ?? "");
    setExperiencia(p.experiencia ?? ""); setDisponibilidade(p.disponibilidade ?? "");
    setTipoVinculo(p.tipo_vinculo ?? "");
    setDataNascimento(p.data_nascimento ?? ""); setGenero(p.genero ?? ""); setInstagram(p.instagram ?? "");
    setAvatarPreview(p.foto_perfil_url ?? null);
    setEducacao(p.educacao ?? []); setExperiencias(p.experiencia_prof ?? []);
    setPortfolioUrls(p.portfolio_urls ?? []); setPortfolioNewFiles([]); setPortfolioPreviews([]);
    setSelectedHabilidades(p.habilidades ?? []);
    setNewEdu(null); setNewExp(null);
    setEditing(false); setError("");
  }

  const inp: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 14px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 15,
    color: "var(--text-primary)", outline: "none",
  };
  const sel: React.CSSProperties = { ...inp, cursor: "pointer" };
  const card: React.CSSProperties = {
    background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
    border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
    padding: 20, display: "flex", flexDirection: "column", gap: 18, marginBottom: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
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
            Perfil atualizado com sucesso.
          </div>
        )}

        {/* Avatar + nome */}
        <div style={{ ...card, flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12 }}>
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

        {/* Dados básicos */}
        <div style={card}>
          <SectionTitle>Dados pessoais</SectionTitle>
          <F label="Nome completo" editing={editing}>
            {editing ? <input value={nome} onChange={(e) => setNome(e.target.value)} style={inp} /> : <V>{nome || "—"}</V>}
          </F>
          <F label="Apresentação" editing={editing}>
            {editing ? (
              <textarea rows={3} maxLength={280} value={apresentacao}
                onChange={(e) => setApresentacao(e.target.value)}
                placeholder="Quem sou eu? Em poucas palavras, conte sobre você e sua trajetória…"
                style={{ ...inp, height: "auto", padding: "10px 14px", resize: "none", lineHeight: 1.6 }} />
            ) : <V><span style={{ whiteSpace: "pre-wrap" }}>{apresentacao || "—"}</span></V>}
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
          <F label="Data de nascimento" editing={editing}>
            {editing ? <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} style={inp} /> : <V>{dataNascimento || "—"}</V>}
          </F>
          <F label="Gênero" editing={editing}>
            {editing ? (
              <select value={genero} onChange={(e) => setGenero(e.target.value)} style={sel}>
                <option value="">Prefiro não informar</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="nao_binario">Não binário</option>
                <option value="outro">Outro</option>
              </select>
            ) : <V>{genero || "—"}</V>}
          </F>
        </div>

        {/* Especialidades */}
        <div style={card}>
          <SectionTitle>Especialidades</SectionTitle>
          <F label="Funções" editing={editing}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[...profissoes, OUTRA].map((nome) => {
                    const active = funcoes.includes(nome);
                    return (
                      <button key={nome} onClick={() => toggleFuncao(nome)} style={{
                        padding: "7px 14px", borderRadius: "var(--radius-pill)", cursor: "pointer",
                        border: `2px solid ${active ? "var(--color-brand-primary)" : "var(--border-default)"}`,
                        background: active ? "var(--brand-magenta-50)" : "var(--surface-card)",
                        color: active ? "var(--brand-magenta-700)" : "var(--text-primary)",
                        fontFamily: "var(--font-body)", fontWeight: active ? 700 : 400, fontSize: 13,
                      }}>
                        {active ? "✓ " : ""}{nome}
                      </button>
                    );
                  })}
                </div>
                {funcoes.includes(OUTRA) && (
                  <input value={funcaoOutro} onChange={(e) => setFuncaoOutro(e.target.value)}
                    placeholder="Qual especialidade?" style={inp} />
                )}
              </div>
            ) : <V>{funcaoLabel || "—"}</V>}
          </F>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
              color: editing ? "var(--color-brand-primary)" : "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>
              Habilidades
            </p>
            {editing && funcoes.filter(f => f !== OUTRA).length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Selecione suas funções acima para ver as habilidades disponíveis.</p>
            )}
            {editing && habilidadesFiltradas.length === 0 && funcoes.filter(f => f !== OUTRA).length > 0 && (
              <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Nenhuma habilidade cadastrada para estas funções. Peça ao admin para adicionar.</p>
            )}
            {Object.entries(habilidadesPorProfissao).map(([prof, nomes]) => (
              <div key={prof} style={{ marginBottom: 12 }}>
                {Object.keys(habilidadesPorProfissao).length > 1 && (
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
                    {prof}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {nomes.map((h) => {
                    const active = selectedHabilidades.includes(h);
                    return (
                      <button key={h}
                        onClick={() => editing ? setSelectedHabilidades((prev) =>
                          prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]) : undefined}
                        style={{
                          padding: "5px 12px", borderRadius: "var(--radius-pill)", fontSize: 13,
                          border: `1.5px solid ${active ? "var(--brand-cyan-400)" : "var(--border-default)"}`,
                          background: active ? "var(--brand-cyan-50)" : "var(--surface-sunken)",
                          color: active ? "var(--brand-cyan-700)" : "var(--text-tertiary)",
                          fontFamily: "var(--font-body)", fontWeight: active ? 700 : 400,
                          cursor: editing ? "pointer" : "default",
                        }}>
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!editing && selectedHabilidades.length === 0 && <V>—</V>}
          </div>
        </div>

        {/* Localização e disponibilidade */}
        <div style={card}>
          <SectionTitle>Localização e disponibilidade</SectionTitle>
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
                  <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2}
                    style={{ ...inp, textTransform: "uppercase", textAlign: "center" }} />
                </div>
              </div>
            ) : <V>{[endereco, cidade, estado].filter(Boolean).join(", ") || "—"}</V>}
          </F>
          <F label="Disponibilidade" editing={editing}>
            {editing ? (
              <select value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)} style={sel}>
                <option value="">Selecione</option>
                {DISPONIBILIDADES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <V>{disponibilidade || "—"}</V>}
          </F>
          <F label="Tipo de vínculo" editing={editing}>
            {editing ? (
              <select value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)} style={sel}>
                <option value="">Não especificado</option>
                {Object.entries(VINCULOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : <V>{VINCULOS[tipoVinculo] || "—"}</V>}
          </F>
          <F label="Experiência" editing={editing}>
            {editing ? (
              <select value={experiencia} onChange={(e) => setExperiencia(e.target.value)} style={sel}>
                <option value="">Selecione</option>
                {EXPERIENCIAS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : <V>{experiencia || "—"}</V>}
          </F>

        </div>

        {/* Educação */}
        <div style={card}>
          <SectionTitle>Formação e cursos</SectionTitle>
          {educacao.length === 0 && !newEdu && <V>Nenhuma formação adicionada.</V>}
          {educacao.map((edu, i) => (
            <div key={i} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "12px 14px", position: "relative" }}>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{edu.curso}</p>
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>{[edu.instituicao, edu.ano].filter(Boolean).join(" · ")}</p>
              {editing && (
                <button onClick={() => setEducacao((prev) => prev.filter((_, j) => j !== i))} style={{
                  position: "absolute", top: 10, right: 10, background: "none", border: "none",
                  color: "var(--color-danger-fg)", cursor: "pointer", fontSize: 16, lineHeight: 1,
                }}>✕</button>
              )}
            </div>
          ))}
          {editing && newEdu && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: 14 }}>
              <input placeholder="Curso / formação" value={newEdu.curso} onChange={(e) => setNewEdu({ ...newEdu, curso: e.target.value })} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8 }}>
                <input placeholder="Instituição" value={newEdu.instituicao} onChange={(e) => setNewEdu({ ...newEdu, instituicao: e.target.value })} style={inp} />
                <input placeholder="Ano" value={newEdu.ano} onChange={(e) => setNewEdu({ ...newEdu, ano: e.target.value })} style={inp} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setNewEdu(null)} style={{ flex: 1, height: 38, borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => { if (newEdu.curso.trim()) { setEducacao((prev) => [...prev, newEdu]); setNewEdu(null); } }} style={{ flex: 1, height: 38, borderRadius: "var(--radius-pill)", border: "none", background: "var(--color-brand-primary)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Salvar</button>
              </div>
            </div>
          )}
          {editing && !newEdu && (
            <button onClick={() => setNewEdu({ curso: "", instituicao: "", ano: "" })} style={{
              height: 40, borderRadius: "var(--radius-pill)", border: "1.5px dashed var(--border-default)",
              background: "transparent", color: "var(--color-brand-primary)", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
            }}>
              + Adicionar formação
            </button>
          )}
        </div>

        {/* Experiência profissional */}
        <div style={card}>
          <SectionTitle>Experiência profissional</SectionTitle>
          {experiencias.length === 0 && !newExp && <V>Nenhuma experiência adicionada.</V>}
          {experiencias.map((exp, i) => (
            <div key={i} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "12px 14px", position: "relative" }}>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{exp.cargo}</p>
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>{[exp.empresa, exp.periodo].filter(Boolean).join(" · ")}</p>
              {editing && (
                <button onClick={() => setExperiencias((prev) => prev.filter((_, j) => j !== i))} style={{
                  position: "absolute", top: 10, right: 10, background: "none", border: "none",
                  color: "var(--color-danger-fg)", cursor: "pointer", fontSize: 16, lineHeight: 1,
                }}>✕</button>
              )}
            </div>
          ))}
          {editing && newExp && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: 14 }}>
              <input placeholder="Cargo / função" value={newExp.cargo} onChange={(e) => setNewExp({ ...newExp, cargo: e.target.value })} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input placeholder="Empresa / salão" value={newExp.empresa} onChange={(e) => setNewExp({ ...newExp, empresa: e.target.value })} style={inp} />
                <input placeholder="Ex: 2022 – 2024" value={newExp.periodo} onChange={(e) => setNewExp({ ...newExp, periodo: e.target.value })} style={inp} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setNewExp(null)} style={{ flex: 1, height: 38, borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => { if (newExp.cargo.trim()) { setExperiencias((prev) => [...prev, newExp]); setNewExp(null); } }} style={{ flex: 1, height: 38, borderRadius: "var(--radius-pill)", border: "none", background: "var(--color-brand-primary)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Salvar</button>
              </div>
            </div>
          )}
          {editing && !newExp && (
            <button onClick={() => setNewExp({ cargo: "", empresa: "", periodo: "" })} style={{
              height: 40, borderRadius: "var(--radius-pill)", border: "1.5px dashed var(--border-default)",
              background: "transparent", color: "var(--color-brand-primary)", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
            }}>
              + Adicionar experiência
            </button>
          )}
        </div>

        {/* Portfolio */}
        <div style={card}>
          <SectionTitle>Portfólio</SectionTitle>
          {portfolioUrls.length === 0 && portfolioPreviews.length === 0 && <V>Nenhuma foto adicionada.</V>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {portfolioUrls.map((url) => (
              <div key={url} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {editing && (
                  <button onClick={() => removePortfolioExisting(url)} style={{
                    position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, lineHeight: 1,
                  }}>✕</button>
                )}
              </div>
            ))}
            {portfolioPreviews.map((url, i) => (
              <div key={`new-${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--color-brand-primary)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => removePortfolioNew(i)} style={{
                  position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, lineHeight: 1,
                }}>✕</button>
              </div>
            ))}
          </div>
          {editing && (
            <>
              <button onClick={() => portfolioInputRef.current?.click()} style={{
                height: 40, borderRadius: "var(--radius-pill)", border: "1.5px dashed var(--border-default)",
                background: "transparent", color: "var(--color-brand-primary)", fontFamily: "var(--font-body)",
                fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
              }}>
                + Adicionar fotos
              </button>
              <input ref={portfolioInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={(e) => handlePortfolioFiles(e.target.files)} />
            </>
          )}
        </div>

        {/* Conta */}
        <div style={card}>
          <SectionTitle>Conta</SectionTitle>
          <F label="E-mail de acesso" editing={false}><V>{email || "—"}</V></F>
          {p.slug && (
            <F label="Link do perfil público" editing={false}>
              <Link href={`/perfil/${p.slug}`} style={{ fontSize: 14, color: "var(--text-link)", wordBreak: "break-all" }}>
                /perfil/{p.slug}
              </Link>
            </F>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 12 }}>
            {error}
          </p>
        )}

        {editing && (
          <div style={{ display: "flex", gap: 10 }}>
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
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: -4 }}>
      {children}
    </p>
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
