"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { emailVagaAprovada, emailVagaRejeitada, emailNovaVagaProfissional, renderNovaVagaProfissionalHtml, MENSAGEM_PADRAO_NOVA_VAGA } from "@/lib/email";
import { distanciaKm } from "@/lib/geocode";
import { normalizeInstagramHandle } from "@/lib/instagram";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Acesso negado");
  return supabase;
}

export async function toggleBloqueioEmpresa(id: string, bloqueado: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("companies").update({ bloqueado }).eq("id", id);
  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${id}`);
}

export async function toggleBloqueadoProfissional(id: string, bloqueado: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("professionals").update({ bloqueado }).eq("id", id);
  revalidatePath("/admin/profissionais");
  revalidatePath(`/admin/profissionais/${id}`);
}

export async function updateJobStatus(id: string, status: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status }).eq("id", id);
  revalidatePath("/admin/vagas");
}

export interface EmpresaEditData {
  nome_estabelecimento: string;
  responsavel: string;
  telefone: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  categoria_negocio: string;
  faixa_funcionarios: string;
  instagram: string;
}

export async function atualizarEmpresaAdmin(id: string, dados: EmpresaEditData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("companies").update({
    nome_estabelecimento: dados.nome_estabelecimento,
    responsavel: dados.responsavel,
    telefone: dados.telefone,
    cnpj: dados.cnpj || null,
    endereco: dados.endereco,
    bairro: dados.bairro,
    cidade: dados.cidade.trim(),
    estado: dados.estado,
    cep: dados.cep,
    categoria_negocio: dados.categoria_negocio || null,
    faixa_funcionarios: dados.faixa_funcionarios || null,
    instagram: normalizeInstagramHandle(dados.instagram) || null,
  }).eq("id", id);
  revalidatePath(`/admin/empresas/${id}`);
  revalidatePath("/admin/empresas");
  if (error) throw new Error(error.message);
}

export interface VagaEditData {
  titulo: string;
  funcoes: string[];
  funcao_outro: string;
  descricao: string;
  tipo_vinculo: string;
  faixa_salarial: string;
  comissao: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export async function atualizarVagaAdmin(id: string, dados: VagaEditData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("jobs").update({
    titulo: dados.titulo,
    funcao: dados.funcoes[0] ?? "",
    funcoes: dados.funcoes,
    funcao_outro: dados.funcao_outro || null,
    descricao: dados.descricao,
    tipo_vinculo: dados.tipo_vinculo || null,
    faixa_salarial: dados.faixa_salarial,
    comissao: dados.comissao,
    endereco: dados.endereco,
    bairro: dados.bairro,
    cidade: dados.cidade.trim(),
    estado: dados.estado,
    cep: dados.cep,
  }).eq("id", id);
  revalidatePath("/admin/vagas");
  revalidatePath("/admin/empresas");
  if (error) throw new Error(error.message);
}

export async function aprovarVaga(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status: "ativa", motivo_rejeicao: null }).eq("id", id);
  revalidatePath("/admin/vagas");

  const { data: job } = await supabase
    .from("jobs")
    .select("titulo, funcao, slug, company_id, companies(nome_estabelecimento, user_id)")
    .eq("id", id).single();

  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = job.companies as any;
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", comp?.user_id ?? "").single();
    if (profile?.email) {
      await emailVagaAprovada({
        empresaEmail: profile.email,
        empresaNome: comp?.nome_estabelecimento ?? "",
        tituloVaga: job.titulo || job.funcao || "Vaga",
        vagaSlug: job.slug ?? id,
      }).catch(() => {});
    }
  }
  // Notificar candidatos por email agora é uma ação manual e separada —
  // ver previewEmailCandidatos/dispararEmailCandidatos abaixo
}

// Ignora acento/maiúscula na comparação — cidade vem digitada à mão em
// alguns cadastros (ex: "SAO PAULO" vs "São Paulo") e uma comparação exata
// deixava candidatos de fora silenciosamente
function normalizaCidade(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

const RAIO_KM_EMAIL = 30;

// Profissionais com alguma função da vaga, dentro do raio de 30km da empresa —
// candidatos elegíveis pro disparo manual de email. Cai pro comparativo de
// cidade (mesmo critério de antes) quando algum dos lados ainda não tem
// coordenada geocodificada.
async function buscarCandidatosVaga(id: string) {
  const supabase = await assertAdmin();
  const { data: job } = await supabase
    .from("jobs")
    .select("titulo, funcao, funcoes, slug, companies(nome_estabelecimento, cidade, latitude, longitude)")
    .eq("id", id).single();
  const funcoesVaga = job?.funcoes?.length ? job.funcoes : (job?.funcao ? [job.funcao] : []);
  if (!job || funcoesVaga.length === 0) return { job: null, candidatos: [] as { user_id: string; nome: string | null; cidade: string | null }[] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comp = job.companies as any;
  // OR: qualquer sobreposição entre as funções da vaga e as do profissional
  const { data: todosComFuncao } = await supabase
    .from("professionals")
    .select("user_id, nome, cidade, latitude, longitude")
    .overlaps("funcoes", funcoesVaga);

  const empresaGeo = comp?.latitude && comp?.longitude
    ? { latitude: comp.latitude, longitude: comp.longitude }
    : null;
  const cidadeEmpresa = normalizaCidade(comp?.cidade);

  const candidatos = (todosComFuncao ?? []).filter((p) => {
    const profGeo = p.latitude && p.longitude ? { latitude: p.latitude, longitude: p.longitude } : null;
    if (empresaGeo && profGeo) return distanciaKm(empresaGeo, profGeo) <= RAIO_KM_EMAIL;
    if (!cidadeEmpresa) return true;
    return normalizaCidade(p.cidade) === cidadeEmpresa;
  });

  return { job: { ...job, companies: comp }, candidatos };
}

// Monta os dados pro admin revisar antes de disparar: quantidade, regra de
// filtro usada, e um preview real do HTML do email (com o primeiro candidato
// como exemplo de nome) — pra evitar disparo às cegas.
export async function previewEmailCandidatos(id: string, mensagemCustom?: string) {
  await assertAdmin();
  const { job, candidatos } = await buscarCandidatosVaga(id);
  if (!job) return null;

  const cidade = job.companies?.cidade ?? null;
  const empresaNome = job.companies?.nome_estabelecimento ?? "";
  const tituloVaga = job.titulo || job.funcao || "Vaga";
  const funcoesVaga = job.funcoes?.length ? job.funcoes : (job.funcao ? [job.funcao] : []);
  const assuntoPadrao = `Nova vaga: ${tituloVaga} em ${empresaNome}`;
  const nomeExemplo = candidatos[0]?.nome || "Profissional";

  const htmlPreview = renderNovaVagaProfissionalHtml({
    profissionalNome: nomeExemplo,
    tituloVaga,
    funcaoVaga: funcoesVaga.join(", "),
    empresaNome,
    cidade,
    vagaSlug: job.slug ?? id,
    mensagem: mensagemCustom || MENSAGEM_PADRAO_NOVA_VAGA,
  });

  return {
    total: candidatos.length,
    funcao: funcoesVaga.join(", "),
    cidade,
    assuntoPadrao,
    mensagemPadrao: MENSAGEM_PADRAO_NOVA_VAGA,
    nomeExemplo,
    htmlPreview,
  };
}

export async function dispararEmailCandidatos(id: string, assunto?: string, mensagem?: string) {
  const supabase = await assertAdmin();
  const { job, candidatos } = await buscarCandidatosVaga(id);
  if (!job || candidatos.length === 0) return { enviados: 0, semEmail: 0, total: 0, falhas: 0 };

  const userIds = candidatos.map((p) => p.user_id);
  const { data: perfis } = await supabase.from("profiles").select("id, email").in("id", userIds);
  const emailPorUserId = Object.fromEntries((perfis ?? []).map((p) => [p.id, p.email]));

  let enviados = 0;
  let semEmail = 0;
  let falhas = 0;

  // Disparar tudo de uma vez (Promise.allSettled com .map) estourava o limite
  // do Resend (~2 req/s no plano padrão) — a maioria caía com 429 e era
  // engolida em silêncio, além do contador de "enviados" somar antes de saber
  // se o envio deu certo. Envia sequencial com respiro, só conta sucesso de
  // verdade e loga cada falha.
  for (const prof of candidatos) {
    const email = emailPorUserId[prof.user_id];
    if (!email) { semEmail++; continue; }
    try {
      await emailNovaVagaProfissional({
        profissionalEmail: email,
        profissionalNome: prof.nome ?? "",
        tituloVaga: job.titulo || job.funcao || "Vaga",
        funcaoVaga: job.funcao ?? "",
        empresaNome: job.companies?.nome_estabelecimento ?? "",
        cidade: prof.cidade ?? null,
        vagaSlug: job.slug ?? id,
        assunto,
        mensagem,
      });
      enviados++;
    } catch (e) {
      falhas++;
      console.error(`dispararEmailCandidatos: falha ao enviar pra ${email}`, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  return { enviados, semEmail, total: candidatos.length, falhas };
}

export async function rejeitarVaga(id: string, motivo: string) {
  const supabase = await assertAdmin();
  await supabase.from("jobs").update({ status: "rejeitada", motivo_rejeicao: motivo }).eq("id", id);
  revalidatePath("/admin/vagas");

  const { data: job } = await supabase
    .from("jobs")
    .select("titulo, funcao, company_id, companies(nome_estabelecimento, user_id)")
    .eq("id", id).single();

  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = job.companies as any;
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", comp?.user_id ?? "").single();
    if (profile?.email) {
      await emailVagaRejeitada({
        empresaEmail: profile.email,
        empresaNome: comp?.nome_estabelecimento ?? "",
        tituloVaga: job.titulo || job.funcao || "Vaga",
        motivo,
        jobId: id,
      }).catch(() => {});
    }
  }
}
