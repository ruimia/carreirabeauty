/**
 * Seed de usuários de teste para desenvolvimento local.
 * Uso: node scripts/seed-test-users.mjs
 *
 * Cria (ou recria) dois usuários com todos os dados preenchidos:
 *   empresa@teste.cb   / senha: teste123
 *   profissional@teste.cb / senha: teste123
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Lê .env.local manualmente
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1")];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMPRESA_EMAIL = "empresa@teste.cb";
const PROF_EMAIL = "profissional@teste.cb";
const SENHA = "teste123";

async function upsertUser(email, tipo) {
  // Tenta buscar usuário existente
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);

  if (existing) {
    console.log(`  ♻️  Usuário já existe: ${email} (${existing.id})`);
    // Garante senha correta
    await supabase.auth.admin.updateUserById(existing.id, { password: SENHA });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: SENHA,
    email_confirm: true,
    user_metadata: { tipo },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  console.log(`  ✅ Criado: ${email} (${data.user.id})`);
  return data.user.id;
}

async function seedEmpresa(userId) {
  // Profile (trigger pode já ter criado)
  await supabase.from("profiles").upsert({ id: userId, email: EMPRESA_EMAIL, tipo: "empresa" }, { onConflict: "id" });

  // Company
  const { data: existing } = await supabase.from("companies").select("id").eq("user_id", userId).maybeSingle();
  let companyId = existing?.id;

  if (!companyId) {
    const { data, error } = await supabase.from("companies").insert({
      user_id: userId,
      cnpj: "00000000000100",
      nome_estabelecimento: "Salão Teste Belle",
      responsavel: "Marina Silva",
      telefone: "11999990001",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310100",
      categoria_negocio: "Salão de beleza",
      faixa_funcionarios: "1_5",
      status_cadastro: "completo",
      status_assinatura: "ativa",
      plano: "plus",
      slug: "salao-teste-belle",
    }).select("id").single();
    if (error) throw new Error(`insert company: ${error.message}`);
    companyId = data.id;
    console.log(`  ✅ Empresa criada (${companyId})`);
  } else {
    console.log(`  ♻️  Empresa já existe (${companyId})`);
  }

  // Vagas
  const { data: vagas } = await supabase.from("jobs").select("id").eq("company_id", companyId);
  if (!vagas?.length) {
    await supabase.from("jobs").insert([
      {
        company_id: companyId,
        titulo: "Cabeleireiro(a) — período integral",
        funcao: "Cabeleireiro(a)",
        descricao: "Buscamos cabeleireiro(a) experiente para atender em salão movimentado no centro de SP. Necessário dominar cortes femininos, colorimetria e escova.",
        tipo_vinculo: "clt",
        modelo_remuneracao: "fixo_comissao",
        faixa_salarial: "R$ 2.000 – R$ 3.000",
        comissao: "30% – 40%",
        endereco: "Rua das Flores, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310100",
        status: "ativa",
        slug: "cabeleireiro-salao-teste-belle-sp",
      },
      {
        company_id: companyId,
        titulo: "Manicure / Pedicure",
        funcao: "Manicure/Pedicure",
        descricao: "Vaga para manicure com experiência em unhas em gel e nail art. Ambiente descontraído, boa clientela já formada.",
        tipo_vinculo: "pj",
        modelo_remuneracao: "comissao",
        faixa_salarial: "",
        comissao: "50% – 60%",
        endereco: "Rua das Flores, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310100",
        status: "pendente_moderacao",
        slug: "manicure-salao-teste-belle-sp",
      },
      {
        company_id: companyId,
        titulo: "Esteticista — Clínica Integrada",
        funcao: "Esteticista",
        descricao: "Procuramos esteticista com conhecimento em limpeza de pele e microagulhamento.",
        tipo_vinculo: "clt",
        modelo_remuneracao: "fixo",
        faixa_salarial: "R$ 3.000 – R$ 4.000",
        comissao: "",
        endereco: "Rua das Flores, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310100",
        status: "rejeitada",
        motivo_rejeicao: "Descrição muito genérica — reescreva com mais detalhes sobre o perfil buscado.",
        slug: "esteticista-salao-teste-belle-sp",
      },
    ]);
    console.log("  ✅ 3 vagas criadas (ativa, pendente, rejeitada)");
  } else {
    console.log(`  ♻️  Vagas já existem (${vagas.length})`);
  }

  return companyId;
}

async function seedProfissional(userId, companyId) {
  await supabase.from("profiles").upsert({ id: userId, email: PROF_EMAIL, tipo: "profissional" }, { onConflict: "id" });

  const { data: existing } = await supabase.from("professionals").select("id").eq("user_id", userId).maybeSingle();
  let profId = existing?.id;

  if (!profId) {
    const { data, error } = await supabase.from("professionals").insert({
      user_id: userId,
      nome: "Ana Carolina Teste",
      telefone: "11988880002",
      funcao: "Cabeleireiro(a)",
      funcoes: ["Cabeleireiro(a)"],
      localizacao: "Pinheiros, São Paulo",
      cidade: "São Paulo",
      estado: "SP",
      cep: "05422010",
      endereco: "Rua Teodoro Sampaio, 55",
      experiencia: "3 a 5 anos",
      disponibilidade: "integral",
      pretensao_salarial: "R$ 2.000 – R$ 3.000",
      tipo_vinculo: "clt",
      educacao_basica: "Técnico em Cabeleireiro — Senac SP",
      habilidades: ["Corte feminino", "Colorimetria", "Mechas", "Balayage", "Escova"],
      plano: "gratis",
      slug: "ana-carolina-teste-sp",
    }).select("id").single();
    if (error) throw new Error(`insert professional: ${error.message}`);
    profId = data.id;
    console.log(`  ✅ Profissional criado (${profId})`);
  } else {
    console.log(`  ♻️  Profissional já existe (${profId})`);
  }

  // Candidatura na vaga ativa da empresa teste
  if (companyId) {
    const { data: vaga } = await supabase.from("jobs").select("id").eq("company_id", companyId).eq("status", "ativa").maybeSingle();
    if (vaga) {
      const { data: cand } = await supabase.from("applications").select("id").eq("job_id", vaga.id).eq("professional_id", profId).maybeSingle();
      if (!cand) {
        await supabase.from("applications").insert({
          job_id: vaga.id,
          professional_id: profId,
          mensagem: "Olá! Tenho 4 anos de experiência em cortes femininos e colorimetria. Adoraria fazer parte do time!",
        });
        console.log("  ✅ Candidatura criada");
      } else {
        console.log("  ♻️  Candidatura já existe");
      }
    }
  }
}

async function main() {
  console.log("🌱 Seed de usuários de teste\n");

  console.log("👔 Criando usuário EMPRESA...");
  const empresaId = await upsertUser(EMPRESA_EMAIL, "empresa");
  const companyId = await seedEmpresa(empresaId);

  console.log("\n💅 Criando usuário PROFISSIONAL...");
  const profId = await upsertUser(PROF_EMAIL, "profissional");
  await seedProfissional(profId, companyId);

  console.log("\n✨ Seed concluído!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Empresa:       ${EMPRESA_EMAIL} / ${SENHA}`);
  console.log(`  Profissional:  ${PROF_EMAIL} / ${SENHA}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Acesse: http://localhost:3000/test-login");
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
