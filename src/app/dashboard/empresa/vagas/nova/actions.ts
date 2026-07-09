"use server";

import { createClient } from "@/lib/supabase/server";
import { limiteVagasEmpresa } from "@/lib/planos";
import { buildSlug, randomSuffix } from "@/lib/slug";

interface CriarVagaInput {
  titulo: string;
  funcao: string;
  funcaoOutro: string | null;
  descricao: string;
  tipoVinculo: string | null;
  modeloRemuneracao: string;
  faixaSalarial: string;
  comissao: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  fotoUrl: string | null;
}

export async function criarVaga(input: CriarVagaInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: company } = await supabase
    .from("companies")
    .select("id, plano")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!company) throw new Error("Empresa não encontrada");

  // Checa limite de vagas do plano (conta apenas vagas ativas + em análise)
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id)
    .in("status", ["ativa", "pendente_moderacao", "pausada"]);

  const limite = limiteVagasEmpresa(company.plano ?? "gratis");
  if ((count ?? 0) >= limite) {
    throw new Error(`LIMITE_PLANO:${company.plano ?? "gratis"}`);
  }

  const slugBase = buildSlug(input.titulo || input.funcao, input.cidade);
  const { data: existing } = await supabase.from("jobs").select("id").eq("slug", slugBase).maybeSingle();
  const slug = existing ? `${slugBase}-${randomSuffix()}` : slugBase;

  const { error } = await supabase.from("jobs").insert({
    company_id: company.id,
    titulo: input.titulo,
    funcao: input.funcao === "Outro" ? "outro" : input.funcao,
    funcao_outro: input.funcao === "Outro" ? input.funcaoOutro : null,
    descricao: input.descricao,
    tipo_vinculo: input.tipoVinculo || null,
    modelo_remuneracao: input.modeloRemuneracao,
    faixa_salarial: input.faixaSalarial,
    comissao: input.comissao,
    cep: input.cep.replace(/\D/g, ""),
    endereco: input.endereco,
    cidade: input.cidade,
    estado: input.estado,
    foto_url: input.fotoUrl,
    slug,
    status: "pendente_moderacao",
  });

  if (error) throw new Error("Erro ao publicar vaga. Tente novamente.");
  return { slug };
}
