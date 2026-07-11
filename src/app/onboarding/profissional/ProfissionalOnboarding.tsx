"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StepShell from "@/components/ui/StepShell";
import { buildSlug, randomSuffix } from "@/lib/slug";
import { fetchCep, maskCep, maskPhone } from "@/lib/cep";
import { compressImage } from "@/lib/compressImage";
import { trackLead } from "@/lib/trackLead";

const TOTAL_STEPS = 7;

const VINCULOS = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freela", label: "Freela / autônomo" },
] as const;

interface Props {
  professionalId: string | null;
  initialStep: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: Record<string, any>;
  userId: string;
  profissoes: string[];
}

export default function ProfissionalOnboarding({ professionalId: initialId, initialStep, initialData, userId, profissoes }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(initialStep);
  const [professionalId, setProfessionalId] = useState<string | null>(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nome, setNome] = useState(initialData.nome ?? "");
  const [telefone, setTelefone] = useState(initialData.telefone ?? "");
  const [funcoes, setFuncoes] = useState<string[]>(initialData.funcoes?.length ? initialData.funcoes : []);
  const [funcaoOutro, setFuncaoOutro] = useState(initialData.funcao_outro ?? "");
  const outroProfissao = "Outro";
  function toggleFuncao(nome: string) {
    setFuncoes((prev) => prev.includes(nome) ? prev.filter((x) => x !== nome) : [...prev, nome]);
  }
  const [cep, setCep] = useState(initialData.cep ?? "");
  const [endereco, setEndereco] = useState(initialData.endereco ?? "");
  const [cidade, setCidade] = useState(initialData.cidade ?? "");
  const [estado, setEstado] = useState(initialData.estado ?? "");
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
  const [experiencia, setExperiencia] = useState(initialData.experiencia ?? "");
  const [disponibilidade, setDisponibilidade] = useState(initialData.disponibilidade ?? "");
  const [pretensao, setPretensao] = useState(initialData.pretensao_salarial ?? "");
  const [educacao, setEducacao] = useState(initialData.educacao_basica ?? "");
  const [tipoVinculo, setTipoVinculo] = useState<string[]>(initialData.tipo_vinculo ? [initialData.tipo_vinculo] : []);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.foto_perfil_url ?? null);

  async function upsert(fields: Record<string, unknown>) {
    if (professionalId) {
      const { error } = await supabase.from("professionals").update(fields).eq("id", professionalId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase.from("professionals").insert({ user_id: userId, ...fields }).select("id").single();
      if (error) throw new Error(error.message);
      setProfessionalId(data.id);
    }
  }

  async function go(fields: Record<string, unknown>, nextStep: number) {
    setLoading(true); setError("");
    try { await upsert(fields); setStep(nextStep); }
    catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar."); }
    finally { setLoading(false); }
  }

  async function finish(extraFields: Record<string, unknown> = {}) {
    setLoading(true); setError("");
    try {
      const base = buildSlug(nome, cidade);
      let slug = base;
      const { data: existing } = await supabase.from("professionals").select("id").eq("slug", slug).neq("id", professionalId ?? "").maybeSingle();
      if (existing) slug = `${base}-${randomSuffix()}`;
      await upsert({ ...extraFields, slug });
      trackLead();
      router.push("/dashboard/profissional");
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao finalizar."); }
    finally { setLoading(false); }
  }

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, padding: "0 16px",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
    background: "var(--surface-card)", fontFamily: "var(--font-body)", fontSize: 16,
    color: "var(--text-primary)", outline: "none",
  };

  const errBox = error ? (
    <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
      {error}
    </p>
  ) : null;

  function PrimaryBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
    const off = disabled || loading;
    return (
      <button onClick={onClick} disabled={off} style={{
        width: "100%", height: 52, borderRadius: "var(--radius-pill)", border: "none",
        background: off ? "var(--neutral-200)" : "var(--color-brand-primary)",
        color: off ? "var(--text-tertiary)" : "#fff",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
        cursor: off ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard)", marginTop: 4,
      }}>
        {loading ? "Salvando…" : label}
      </button>
    );
  }

  function ChoiceBtn({ value, label, current, onSelect }: { value: string; label: string; current: string; onSelect: (v: string) => void }) {
    const active = current === value;
    return (
      <button onClick={() => onSelect(value)} style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: `2px solid ${active ? "var(--color-brand-primary)" : "var(--border-default)"}`,
        background: active ? "var(--brand-magenta-50)" : "var(--surface-card)",
        color: active ? "var(--brand-magenta-700)" : "var(--text-primary)",
        fontFamily: "var(--font-body)", fontWeight: active ? 700 : 400, fontSize: 15,
        cursor: "pointer", transition: "all var(--duration-fast) var(--ease-standard)",
      }}>
        {label}
      </button>
    );
  }

  function MultiBtn({ value, label }: { value: string; label: string }) {
    const active = tipoVinculo.includes(value);
    return (
      <button onClick={() => setTipoVinculo(active ? tipoVinculo.filter((x) => x !== value) : [...tipoVinculo, value])} style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: `2px solid ${active ? "var(--color-brand-secondary)" : "var(--border-default)"}`,
        background: active ? "var(--brand-cyan-50)" : "var(--surface-card)",
        color: active ? "var(--brand-cyan-700)" : "var(--text-primary)",
        fontFamily: "var(--font-body)", fontWeight: active ? 700 : 400, fontSize: 15,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all var(--duration-fast) var(--ease-standard)",
      }}>
        {label}
        {active && <span style={{ fontSize: 18, color: "var(--brand-cyan-500)" }}>✓</span>}
      </button>
    );
  }

  function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
      <button onClick={onClick} disabled={loading} style={{
        flex: 1, height: 52, borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border-default)", background: "transparent",
        color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
        cursor: "pointer",
      }}>
        {label}
      </button>
    );
  }

  if (step === 1) return (
    <StepShell step={1} total={TOTAL_STEPS} title="Como você se chama?" subtitle="Seu nome aparece no perfil público e nas candidaturas.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
        <input type="tel" inputMode="numeric" placeholder="WhatsApp (11) 99999-9999" value={telefone}
          onChange={(e) => setTelefone(maskPhone(e.target.value))} style={inputStyle} />
        {errBox}
        <PrimaryBtn label="Continuar" onClick={() => go({ nome, telefone }, 2)} disabled={!nome.trim() || !telefone.trim()} />
      </div>
    </StepShell>
  );

  if (step === 2) return (
    <StepShell step={2} total={TOTAL_STEPS} title="Quais são suas especialidades?" subtitle="Pode escolher mais de uma.">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...profissoes, outroProfissao].map((nome) => {
          const active = funcoes.includes(nome);
          return (
            <button key={nome} onClick={() => toggleFuncao(nome)} style={{
              width: "100%", textAlign: "left", padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${active ? "var(--color-brand-primary)" : "var(--border-default)"}`,
              background: active ? "var(--brand-magenta-50)" : "var(--surface-card)",
              color: active ? "var(--brand-magenta-700)" : "var(--text-primary)",
              fontFamily: "var(--font-body)", fontWeight: active ? 700 : 400, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "all var(--duration-fast) var(--ease-standard)",
            }}>
              {nome}
              {active && <span style={{ fontSize: 18, color: "var(--color-brand-primary)" }}>✓</span>}
            </button>
          );
        })}
        {funcoes.includes(outroProfissao) && (
          <input placeholder="Qual especialidade?" value={funcaoOutro} onChange={(e) => setFuncaoOutro(e.target.value)}
            autoFocus style={{ ...inputStyle, marginTop: 4 }} />
        )}
        {errBox}
        <PrimaryBtn label="Continuar"
          onClick={() => go({ funcoes, funcao_outro: funcoes.includes(outroProfissao) ? funcaoOutro || null : null }, 3)}
          disabled={!funcoes.length || (funcoes.includes(outroProfissao) && !funcaoOutro.trim())} />
      </div>
    </StepShell>
  );

  if (step === 3) return (
    <StepShell step={3} total={TOTAL_STEPS} title="Qual é o seu endereço?" subtitle="Usado para encontrar vagas perto de você.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <input type="text" inputMode="numeric" placeholder="CEP (00000-000)" value={maskCep(cep)}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
            onBlur={handleCepBlur} style={inputStyle} />
          {cepLoading && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-tertiary)" }}>buscando…</span>}
        </div>
        <input placeholder="Logradouro e número" value={endereco} onChange={(e) => setEndereco(e.target.value)} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
          <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} style={inputStyle} />
          <input placeholder="UF" value={estado} maxLength={2} onChange={(e) => setEstado(e.target.value.toUpperCase())}
            style={{ ...inputStyle, textTransform: "uppercase", textAlign: "center" }} />
        </div>
        {errBox}
        <PrimaryBtn label="Continuar"
          onClick={() => go({ cep: cep.replace(/\D/g, ""), endereco, localizacao: `${cidade} - ${estado}`, cidade, estado }, 4)}
          disabled={!cep.replace(/\D/g, "") || !endereco.trim() || !cidade.trim() || !estado.trim()} />
      </div>
    </StepShell>
  );

  if (step === 4) {
    const opcoes = ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "Mais de 5 anos"];
    return (
      <StepShell step={4} total={TOTAL_STEPS} title="Há quanto tempo você atua na área?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {opcoes.map((o) => <ChoiceBtn key={o} value={o} label={o} current={experiencia} onSelect={setExperiencia} />)}
          {errBox}
          <PrimaryBtn label="Continuar" onClick={() => go({ experiencia }, 5)} disabled={!experiencia} />
        </div>
      </StepShell>
    );
  }

  if (step === 5) {
    const opcoes = ["Integral", "Meio período", "Freela / por demanda", "Finais de semana"];
    return (
      <StepShell step={5} total={TOTAL_STEPS} title="Qual a sua disponibilidade?" subtitle="Opcional.">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {opcoes.map((o) => <ChoiceBtn key={o} value={o} label={o} current={disponibilidade} onSelect={setDisponibilidade} />)}
          {errBox}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <GhostBtn label="Pular" onClick={() => go({ disponibilidade: null }, 6)} />
            <PrimaryBtn label="Continuar" onClick={() => go({ disponibilidade }, 6)} disabled={!disponibilidade} />
          </div>
        </div>
      </StepShell>
    );
  }

  if (step === 6) return (
    <StepShell step={6} total={TOTAL_STEPS} title="Que tipo de trabalho você busca?" subtitle="Pode escolher mais de um. Opcional.">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {VINCULOS.map((v) => <MultiBtn key={v.value} value={v.value} label={v.label} />)}
        {errBox}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <GhostBtn label="Pular" onClick={() => go({}, 7)} />
          <PrimaryBtn label="Continuar" onClick={() => go({ tipo_vinculo: tipoVinculo[0] ?? null }, 7)} disabled={false} />
        </div>
      </div>
    </StepShell>
  );

  if (step === 7) {
    async function handleFinish(withPhoto: boolean) {
      setLoading(true); setError("");
      try {
        let fotoUrl = initialData.foto_perfil_url ?? null;
        if (withPhoto && fileRef.current?.files?.[0]) {
          const rawFile = fileRef.current.files[0];
          const file = await compressImage(rawFile);
          const ext = rawFile.name.split(".").pop();
          const path = `${userId}/avatar.${ext}`;
          const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
          if (upErr) throw new Error(upErr.message);
          fotoUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
        await finish({ foto_perfil_url: fotoUrl });
      } catch (e) { setError(e instanceof Error ? e.message : "Erro ao finalizar."); setLoading(false); }
    }

    return (
      <StepShell step={7} total={TOTAL_STEPS} title="Adicione uma foto de perfil" subtitle="Opcional — aparece no seu perfil público e nas candidaturas.">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div onClick={() => fileRef.current?.click()} style={{
            border: `2px dashed ${avatarPreview ? "var(--color-brand-primary)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-lg)", padding: 24, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 140, background: avatarPreview ? "var(--brand-magenta-50)" : "var(--surface-sunken)",
            transition: "all var(--duration-fast)",
          }}>
            {avatarPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarPreview} alt="Foto" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }} />
              : <>
                  <i className="ph ph-camera" style={{ fontSize: 40, color: "var(--text-tertiary)", marginBottom: 8 }}></i>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Toque para selecionar</p>
                </>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
          {errBox}
          <div style={{ display: "flex", gap: 10 }}>
            <GhostBtn label="Pular" onClick={() => handleFinish(false)} />
            <PrimaryBtn label="Concluir 🎉" onClick={() => handleFinish(true)} disabled={false} />
          </div>
        </div>
      </StepShell>
    );
  }

  return null;
}
