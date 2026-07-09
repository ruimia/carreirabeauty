"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StepShell from "@/components/ui/StepShell";

const TOTAL_STEPS = 7;

const FAIXAS = [
  { value: "1_5", label: "1 a 5 funcionários" },
  { value: "6_20", label: "6 a 20 funcionários" },
  { value: "20_mais", label: "Mais de 20 funcionários" },
] as const;

interface Props {
  companyId: string | null;
  initialStep: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: Record<string, any>;
  userId: string;
  categorias: string[];
}

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function EmpresaOnboarding({ companyId: initialCompanyId, initialStep, initialData, userId, categorias }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(initialStep);
  const [companyId, setCompanyId] = useState<string | null>(initialCompanyId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cnpj, setCnpj] = useState(initialData.cnpj ?? "");
  const [cnpjData, setCnpjData] = useState<Record<string, string> | null>(null);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState(initialData.nome_estabelecimento ?? "");
  const [endereco, setEndereco] = useState(initialData.endereco ?? "");
  const [cidade, setCidade] = useState(initialData.cidade ?? "");
  const [estado, setEstado] = useState(initialData.estado ?? "");
  const [cep, setCep] = useState(initialData.cep ?? "");
  const [responsavel, setResponsavel] = useState(initialData.responsavel ?? "");
  const [telefone, setTelefone] = useState(initialData.telefone ?? "");
  const [categoria, setCategoria] = useState(initialData.categoria_negocio ?? "");
  const [categoriaOutro, setCategoriaOutro] = useState(initialData.categoria_outro ?? "");
  const outraCategoria = "Outro";
  const [faixaFuncionarios, setFaixaFuncionarios] = useState(initialData.faixa_funcionarios ?? "");
  const [instagram, setInstagram] = useState(initialData.instagram ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upsertCompany(fields: Record<string, unknown>) {
    if (companyId) {
      const { error } = await supabase.from("companies").update(fields).eq("id", companyId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase.from("companies").insert({ user_id: userId, ...fields }).select("id").single();
      if (error) throw new Error(error.message);
      setCompanyId(data.id);
    }
  }

  async function handleCnpj() {
    setLoading(true); setError("");
    const raw = cnpj.replace(/\D/g, "");
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) { setError("CNPJ não encontrado. Verifique e tente novamente."); return; }
      const data = await res.json();
      setCnpjData(data);
      const nome = data.nome_fantasia || data.razao_social || "";
      const end = [data.logradouro, data.numero, data.complemento].filter(Boolean).join(", ");
      setNomeEstabelecimento(nome); setEndereco(end);
      setCidade(data.municipio || ""); setEstado(data.uf || "");
      setCep((data.cep || "").replace(/\D/g, ""));
      await upsertCompany({ cnpj: raw, nome_estabelecimento: nome });
      setStep(2);
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      setError(msg.includes("not-null") || msg.includes("violates") ? `Erro ao salvar: ${msg}` : "Erro ao consultar CNPJ. Verifique sua conexão.");
    } finally { setLoading(false); }
  }

  async function save(fields: Record<string, unknown>, next: number) {
    setLoading(true); setError("");
    try { await upsertCompany(fields); setStep(next); }
    catch { setError("Erro ao salvar. Tente novamente."); }
    finally { setLoading(false); }
  }

  async function handleLogoInstagram() {
    if (!instagram.trim()) { setError("Informe o @ do Instagram."); return; }
    setLoading(true); setError("");
    try {
      let logoUrl = initialData.logo_url ?? null;
      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${userId}/logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        logoUrl = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
      }
      await upsertCompany({ instagram: instagram.replace(/^@/, ""), logo_url: logoUrl, status_cadastro: "completo" });
      router.push("/dashboard/empresa");
    } catch { setError("Erro ao salvar. Tente novamente."); }
    finally { setLoading(false); }
  }

  const btn = (label: string, onClick: () => void, disabled: boolean) => (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", height: 52, borderRadius: "var(--radius-pill)",
      border: "none", background: (disabled || loading) ? "var(--neutral-200)" : "var(--color-brand-primary)",
      color: (disabled || loading) ? "var(--text-tertiary)" : "#fff",
      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
      cursor: (disabled || loading) ? "not-allowed" : "pointer",
      transition: "background var(--duration-fast) var(--ease-standard)",
      marginTop: 8,
    }}>
      {loading ? "Salvando…" : label}
    </button>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, padding: "0 16px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 16,
    color: "var(--text-primary)", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 6,
    fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
  };

  const errBox = error ? (
    <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginTop: 4 }}>
      {error}
    </p>
  ) : null;

  const choiceBtn = (value: string, label: string, current: string, set: (v: string) => void) => (
    <button key={value} onClick={() => set(value)} style={{
      width: "100%", textAlign: "left", padding: "14px 16px",
      borderRadius: "var(--radius-md)",
      border: `2px solid ${current === value ? "var(--color-brand-primary)" : "var(--border-default)"}`,
      background: current === value ? "var(--brand-magenta-50)" : "var(--surface-card)",
      color: current === value ? "var(--brand-magenta-700)" : "var(--text-primary)",
      fontFamily: "var(--font-body)", fontWeight: current === value ? 700 : 400, fontSize: 15,
      cursor: "pointer", transition: "all var(--duration-fast) var(--ease-standard)",
    }}>
      {label}
    </button>
  );

  if (step === 1) return (
    <StepShell step={1} total={TOTAL_STEPS} title="Qual é o CNPJ do seu estabelecimento?"
      subtitle="Vamos validar automaticamente e pré-preencher seus dados.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="text" inputMode="numeric" placeholder="00.000.000/0000-00"
          value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))}
          style={{ ...inputStyle, fontSize: 20, letterSpacing: "0.08em", textAlign: "center" }} />
        {errBox}
        {btn("Consultar CNPJ", handleCnpj, cnpj.replace(/\D/g, "").length !== 14)}
      </div>
    </StepShell>
  );

  if (step === 2) return (
    <StepShell step={2} total={TOTAL_STEPS} title="Confirme os dados do estabelecimento"
      subtitle={cnpjData ? `Dados encontrados para ${cnpjData.razao_social}. Ajuste se necessário.` : undefined}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={labelStyle}>Nome do estabelecimento
          <input value={nomeEstabelecimento} onChange={(e) => setNomeEstabelecimento(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>Endereço (logradouro e número)
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} style={inputStyle} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
          <label style={labelStyle}>Cidade
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>UF
            <input value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2}
              style={{ ...inputStyle, textTransform: "uppercase", textAlign: "center" }} />
          </label>
        </div>
        <label style={labelStyle}>CEP
          <input value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} style={inputStyle} />
        </label>
        {errBox}
        {btn("Continuar", () => save({ nome_estabelecimento: nomeEstabelecimento, endereco, cidade, estado, cep }, 3),
          !nomeEstabelecimento || !endereco || !cidade || !estado)}
      </div>
    </StepShell>
  );

  if (step === 3) return (
    <StepShell step={3} total={TOTAL_STEPS} title="Qual é o seu nome?" subtitle="Nome do responsável pelo cadastro.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Seu nome completo" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} style={inputStyle} />
        {errBox}
        {btn("Continuar", () => save({ responsavel }, 4), !responsavel.trim())}
      </div>
    </StepShell>
  );

  if (step === 4) return (
    <StepShell step={4} total={TOTAL_STEPS} title="Qual é o WhatsApp do estabelecimento?"
      subtitle="Usado para os candidatos entrarem em contato. Não é para login.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="tel" inputMode="numeric" placeholder="(11) 99999-9999"
          value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} />
        {errBox}
        {btn("Continuar", () => save({ telefone }, 5), !telefone.trim())}
      </div>
    </StepShell>
  );

  if (step === 5) return (
    <StepShell step={5} total={TOTAL_STEPS} title="Que tipo de estabelecimento é o seu?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...categorias, outraCategoria].map((nome) => choiceBtn(nome, nome, categoria, setCategoria))}
        {categoria === outraCategoria && (
          <input placeholder="Qual tipo de negócio?" value={categoriaOutro} onChange={(e) => setCategoriaOutro(e.target.value)}
            autoFocus style={inputStyle} />
        )}
        {errBox}
        {btn("Continuar", () => save({
          categoria_negocio: categoria,
          categoria_outro: categoria === outraCategoria ? categoriaOutro || null : null,
        }, 6), !categoria || (categoria === outraCategoria && !categoriaOutro.trim()))}
      </div>
    </StepShell>
  );

  if (step === 6) return (
    <StepShell step={6} total={TOTAL_STEPS} title="Quantos funcionários trabalham com você?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAIXAS.map((f) => choiceBtn(f.value, f.label, faixaFuncionarios, setFaixaFuncionarios))}
        {errBox}
        {btn("Continuar", () => save({ faixa_funcionarios: faixaFuncionarios }, 7), !faixaFuncionarios)}
      </div>
    </StepShell>
  );

  if (step === 7) return (
    <StepShell step={7} total={TOTAL_STEPS} title="Foto e Instagram do estabelecimento"
      subtitle="O Instagram é obrigatório. A foto ajuda os candidatos a conhecer seu negócio.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Upload */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
            Foto do estabelecimento <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(opcional)</span>
          </p>
          <div onClick={() => fileRef.current?.click()} style={{
            border: `2px dashed ${logoPreview ? "var(--color-brand-primary)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-lg)", padding: 20,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", minHeight: 120, background: logoPreview ? "var(--brand-magenta-50)" : "var(--surface-sunken)",
            transition: "all var(--duration-fast)",
          }}>
            {logoPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoPreview} alt="Logo" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "var(--radius-md)" }} />
              : <>
                  <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Toque para selecionar</p>
                </>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
        </div>

        {/* Instagram */}
        <label style={labelStyle}>
          Instagram do estabelecimento
          <div style={{
            display: "flex", alignItems: "center", height: 52,
            border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden",
          }}>
            <span style={{
              padding: "0 14px", background: "var(--surface-sunken)", borderRight: "1px solid var(--border-default)",
              color: "var(--text-tertiary)", fontSize: 16, fontWeight: 600, height: "100%",
              display: "flex", alignItems: "center",
            }}>@</span>
            <input placeholder="seuestablecimento" value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
              style={{ flex: 1, height: "100%", padding: "0 16px", border: "none", outline: "none",
                fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", background: "transparent" }} />
          </div>
        </label>

        {errBox}
        {btn("Concluir cadastro 🎉", handleLogoInstagram, false)}
      </div>
    </StepShell>
  );

  return null;
}
