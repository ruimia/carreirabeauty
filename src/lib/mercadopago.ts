import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from "mercadopago";

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preApprovalPlanClient = new PreApprovalPlan(mp);
export const preApprovalClient = new PreApproval(mp);

// IDs dos planos criados no MP (preenchidos após criar via API)
export const MP_PLAN_IDS: Record<string, string> = {
  // empresa
  "empresa_premium": process.env.MP_PLAN_EMPRESA_PREMIUM ?? "",
  // profissional
  "profissional_pro": process.env.MP_PLAN_PROFISSIONAL_PRO ?? "",
};
