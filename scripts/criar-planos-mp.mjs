/**
 * Roda UMA VEZ para criar os PreApproval Plans no Mercado Pago.
 * Execute: node scripts/criar-planos-mp.mjs
 * Copie os IDs retornados para o .env.local e para o Vercel.
 */

import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error("Defina MP_ACCESS_TOKEN no ambiente antes de rodar.");
  process.exit(1);
}

const mp = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const client = new PreApprovalPlan(mp);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://beta.carreirabeauty.com";

const planos = [
  {
    key: "empresa_basic",
    reason: "CarreiraBeauty Empresa Basic",
    amount: 49,
    back_url: `${APP_URL}/dashboard/empresa/planos/sucesso`,
  },
  {
    key: "empresa_plus",
    reason: "CarreiraBeauty Empresa Plus",
    amount: 99,
    back_url: `${APP_URL}/dashboard/empresa/planos/sucesso`,
  },
  {
    key: "empresa_premium",
    reason: "CarreiraBeauty Empresa Premium",
    amount: 179,
    back_url: `${APP_URL}/dashboard/empresa/planos/sucesso`,
  },
  {
    key: "profissional_pro",
    reason: "CarreiraBeauty Profissional Pro",
    amount: 29,
    back_url: `${APP_URL}/dashboard/profissional/planos/sucesso`,
  },
];

console.log("Criando planos no Mercado Pago...\n");

for (const plano of planos) {
  try {
    const result = await client.create({
      body: {
        reason: plano.reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plano.amount,
          currency_id: "BRL",
        },
        back_url: plano.back_url,
        payment_methods_allowed: {
          payment_types: [{ id: "credit_card" }, { id: "debit_card" }],
        },
      },
    });
    console.log(`✅ ${plano.key}: ${result.id}`);
    console.log(`   MP_PLAN_${plano.key.toUpperCase()}=${result.id}\n`);
  } catch (e) {
    console.error(`❌ ${plano.key}:`, e.message);
  }
}

console.log("Copie as variáveis acima para .env.local e para o Vercel.");
