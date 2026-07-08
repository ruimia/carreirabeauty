"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StepShell from "@/components/ui/StepShell";

const TOTAL_STEPS = 7;

const CATEGORIAS = [
  { value: "salao_beleza", label: "Salão de beleza / cabeleireiro" },
  { value: "esmalteria", label: "Esmalteria / nail designer" },
  { value: "clinica_estetica", label: "Clínica de estética" },
  { value: "barbearia", label: "Barbearia" },
  { value: "spa_massoterapia", label: "Spa / massoterapia" },
  { value: "estudio_sobrancelha_cilios", label: "Estúdio de sobrancelha/cílios" },
  { value: "outro", label: "Outro" },
] as const;

const FAIXAS = [
  { value: "1_5", label: "1 a 5 funcionários" },
  { value: "6_20", label: "6 a 20 funcionários" },
  { value: "20_mais", label: "Mais de 20 funcionários" },
] as const;

interface Props {
  companyId: string | null;
  initialStep: number;
  initialData: Record<string, string>;
  userId: string;
}

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function EmpresaOnboarding({
  companyId: initialCompanyId,
  initialStep,
  initialData,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(initialStep);
  const [companyId, setCompanyId] = useState<string | null>(initialCompanyId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
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
  const [faixaFuncionarios, setFaixaFuncionarios] = useState(initialData.faixa_funcionarios ?? "");
  const [instagram, setInstagram] = useState(initialData.instagram ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo_url ?? null);

  const fileRef = useRef<HTMLInputElement>(null);

  async function upsertCompany(fields: Record<string, unknown>) {
    if (companyId) {
      const { error } = await supabase
        .from("companies")
        .update(fields)
        .eq("id", companyId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("companies")
        .insert({ user_id: userId, ...fields })
        .select("id")
        .single();
      if (error) throw error;
      setCompanyId(data.id);
    }
  }

  // ── STEP 1: CNPJ ─────────────────────────────────────────────────────────
  async function handleCnpj() {
    setLoading(true);
    setError("");
    const raw = cnpj.replace(/\D/g, "");
    try {
      const res = await fetch(`/api/cnpj/${raw}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `Erro ${res.status} ao consultar CNPJ.`);
        return;
      }
      const data = await res.json();
      setCnpjData(data);

      const nome = data.nome_fantasia || data.razao_social || "";
      const end = [data.logradouro, data.numero, data.complemento]
        .filter(Boolean)
        .join(", ");
      const cepVal = (data.cep || "").replace(/\D/g, "");

      setNomeEstabelecimento(nome);
      setEndereco(end);
      setCidade(data.municipio || "");
      setEstado(data.uf || "");
      setCep(cepVal);

      await upsertCompany({ cnpj: raw });
      setStep(2);
    } catch {
      setError("Erro ao consultar CNPJ. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 2: Endereço ──────────────────────────────────────────────────────
  async function handleEndereco() {
    setLoading(true);
    setError("");
    try {
      await upsertCompany({
        nome_estabelecimento: nomeEstabelecimento,
        endereco,
        cidade,
        estado,
        cep,
      });
      setStep(3);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 3: Responsável ───────────────────────────────────────────────────
  async function handleResponsavel() {
    setLoading(true);
    setError("");
    try {
      await upsertCompany({ responsavel });
      setStep(4);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 4: Telefone ──────────────────────────────────────────────────────
  async function handleTelefone() {
    setLoading(true);
    setError("");
    try {
      await upsertCompany({ telefone });
      setStep(5);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 5: Categoria ─────────────────────────────────────────────────────
  async function handleCategoria() {
    setLoading(true);
    setError("");
    try {
      await upsertCompany({ categoria_negocio: categoria });
      setStep(6);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 6: Faixa funcionários ────────────────────────────────────────────
  async function handleFuncionarios() {
    setLoading(true);
    setError("");
    try {
      await upsertCompany({ faixa_funcionarios: faixaFuncionarios });
      setStep(7);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 7: Logo + Instagram ──────────────────────────────────────────────
  async function handleLogoInstagram() {
    if (!instagram.trim()) {
      setError("Informe o @ do Instagram.");
      return;
    }
    if (!logoPreview && !initialData.logo_url) {
      setError("Adicione uma foto do estabelecimento.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let logoUrl = initialData.logo_url ?? null;

      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const ext = file.name.split(".").pop();
        const path = `${userId}/logo.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      await upsertCompany({
        instagram: instagram.replace(/^@/, ""),
        logo_url: logoUrl,
        status_cadastro: "completo",
      });

      router.push("/dashboard/empresa");
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <StepShell step={1} total={TOTAL_STEPS} title="Qual é o CNPJ do seu estabelecimento?">
        <div className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <p className="text-xs text-gray-400">
            Vamos validar automaticamente e pré-preencher os dados do seu negócio.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCnpj}
            disabled={loading || cnpj.replace(/\D/g, "").length !== 14}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Consultando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell step={2} total={TOTAL_STEPS} title="Confirme os dados do estabelecimento">
        {cnpjData && (
          <p className="text-sm text-gray-500 mb-4 bg-rose-50 rounded-lg px-3 py-2">
            Dados encontrados para{" "}
            <span className="font-medium text-gray-700">
              {cnpjData.razao_social}
            </span>
            . Ajuste se necessário.
          </p>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Nome do estabelecimento</label>
            <input
              value={nomeEstabelecimento}
              onChange={(e) => setNomeEstabelecimento(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Endereço (logradouro e número)</label>
            <input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Estado</label>
              <input
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                maxLength={2}
                className="w-full border border-gray-200 rounded-xl py-3 px-4 uppercase focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">CEP</label>
            <input
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleEndereco}
            disabled={loading || !nomeEstabelecimento || !endereco || !cidade || !estado}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell step={3} total={TOTAL_STEPS} title="Qual é o seu nome?">
        <div className="space-y-4">
          <input
            placeholder="Nome do responsável"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleResponsavel}
            disabled={loading || !responsavel.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 4) {
    return (
      <StepShell step={4} total={TOTAL_STEPS} title="Qual é o seu WhatsApp?">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Usado apenas como contato — não é para login.
          </p>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleTelefone}
            disabled={loading || !telefone.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 5) {
    return (
      <StepShell step={5} total={TOTAL_STEPS} title="Que tipo de estabelecimento é o seu?">
        <div className="space-y-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoria(c.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                categoria === c.value
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCategoria}
            disabled={loading || !categoria}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 6) {
    return (
      <StepShell step={6} total={TOTAL_STEPS} title="Quantos funcionários trabalham com você?">
        <div className="space-y-2">
          {FAIXAS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFaixaFuncionarios(f.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                faixaFuncionarios === f.value
                  ? "border-rose-500 bg-rose-50 text-rose-700 font-medium"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleFuncionarios}
            disabled={loading || !faixaFuncionarios}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (step === 7) {
    return (
      <StepShell step={7} total={TOTAL_STEPS} title="Foto e Instagram do estabelecimento">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Obrigatórios para publicar vagas — ajudam candidatos a conhecer seu negócio.
          </p>

          {/* Logo upload */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">
              Foto do estabelecimento
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-rose-300 transition"
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-24 h-24 object-cover rounded-xl"
                />
              ) : (
                <>
                  <div className="text-3xl mb-1">📷</div>
                  <p className="text-sm text-gray-400">Toque para selecionar</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPreview(URL.createObjectURL(f));
              }}
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Instagram do estabelecimento
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-300">
              <span className="px-3 text-gray-400 bg-gray-50 py-3 border-r border-gray-200">
                @
              </span>
              <input
                placeholder="seuestablecimento"
                value={instagram}
                onChange={(e) =>
                  setInstagram(e.target.value.replace(/^@/, ""))
                }
                className="flex-1 py-3 px-3 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogoInstagram}
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
          >
            {loading ? "Finalizando..." : "Concluir cadastro"}
          </button>
        </div>
      </StepShell>
    );
  }

  return null;
}
