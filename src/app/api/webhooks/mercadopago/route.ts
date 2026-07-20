import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago";

const PLANO_KEY_MAP: Record<string, { plano: string; tabela: "companies" | "professionals" }> = {
  empresa_premium:  { plano: "premium", tabela: "companies" },
  profissional_pro: { plano: "pro",     tabela: "professionals" },
};

// Webhooks chegam sem sessão de usuário (POST direto do Mercado Pago) — o
// client de sessão (cookies) nunca teria auth.uid(), e as tabelas que esta
// rota escreve (profiles/companies/professionals/pagamentos_avulsos) exigem
// auth.uid() = user_id via RLS. Só o service role escreve aqui de verdade.
function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function tratarAssinatura(preapprovalId: string) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  const preApproval = new PreApproval(mp);
  const subscription = await preApproval.get({ id: preapprovalId });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const planId: string = sub.preapproval_plan_id ?? "";
  const payerEmail: string = sub.payer_email ?? "";
  const status = subscription.status;
  const ativo = status === "authorized";

  const MP_PLAN_IDS: Record<string, string> = {
    [process.env.MP_PLAN_EMPRESA_PREMIUM  ?? ""]: "empresa_premium",
    [process.env.MP_PLAN_PROFISSIONAL_PRO ?? ""]: "profissional_pro",
  };

  const planoKey = MP_PLAN_IDS[planId];
  if (!planoKey) return;

  const mapa = PLANO_KEY_MAP[planoKey];
  if (!mapa) return;

  const validade = ativo ? (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString();
  })() : null;

  const supabase = service();

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("email", payerEmail).maybeSingle();
  if (!profile) return;

  await supabase
    .from(mapa.tabela)
    .update({
      plano: ativo ? mapa.plano : "gratis",
      plano_status: ativo ? "ativo" : "cancelado",
      plano_validade: validade,
      mp_subscription_id: preapprovalId,
    })
    .eq("user_id", profile.id);
}

async function tratarPagamento(paymentId: string) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  const payment = new Payment(mp);
  const pag = await payment.get({ id: Number(paymentId) });

  // external_reference é o id que geramos em pagamentos_avulsos ao criar a
  // preferência — é assim que ligamos o pagamento de volta ao profissional
  const pagamentoId = pag.external_reference;
  if (!pagamentoId) return;

  const statusMp = pag.status; // approved | pending | rejected | ...
  const novoStatus = statusMp === "approved" ? "aprovado" : statusMp === "rejected" ? "rejeitado" : "pendente";

  const supabase = service();

  const { data: pagamento } = await supabase
    .from("pagamentos_avulsos")
    .select("id, professional_id, produto, status")
    .eq("id", pagamentoId)
    .maybeSingle();
  if (!pagamento) return;

  await supabase
    .from("pagamentos_avulsos")
    .update({ status: novoStatus, mp_payment_id: String(paymentId), atualizado_em: new Date().toISOString() })
    .eq("id", pagamento.id);

  // Idempotente: só concede se ainda não tinha sido concedido — evita
  // reprocessar notificação duplicada do MP
  if (novoStatus === "aprovado" && pagamento.status !== "aprovado" && pagamento.produto === "certificado_autoestima") {
    await supabase
      .from("professionals")
      .update({
        certificado_autoestima_desbloqueado_em: new Date().toISOString(),
        certificado_autoestima_origem: "avulso",
      })
      .eq("id", pagamento.professional_id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "subscription_preapproval" && body.data?.id) {
      await tratarAssinatura(body.data.id);
    } else if (body.type === "payment" && body.data?.id) {
      await tratarPagamento(body.data.id);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[MP webhook]", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
