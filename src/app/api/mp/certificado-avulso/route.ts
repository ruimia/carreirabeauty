import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { CERTIFICADO_AVULSO_PRECO } from "@/lib/planos";
import { TRILHA_AUTOESTIMA } from "@/lib/quizContent";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: professional } = await supabase
    .from("professionals").select("id, plano, certificado_autoestima_desbloqueado_em")
    .eq("user_id", user.id).single();
  if (!professional) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  if (professional.plano === "pro" || professional.certificado_autoestima_desbloqueado_em) {
    return NextResponse.json({ error: "Você já tem o certificado" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();

  // Escreve o pagamento (pendente) e a preferência do MP com service role —
  // a linha de pagamento não pode ser criada/aprovada só pelo profissional
  // (RLS só permite insert dele mesmo; update é só via webhook).
  const supabaseService = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pagamento, error: insertError } = await supabaseService
    .from("pagamentos_avulsos")
    .insert({
      professional_id: professional.id,
      produto: "certificado_autoestima",
      valor: CERTIFICADO_AVULSO_PRECO,
      status: "pendente",
    })
    .select("id")
    .single();
  if (insertError || !pagamento) {
    return NextResponse.json({ error: "Erro ao iniciar pagamento" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carreirabeauty.com";
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  const preference = new Preference(mp);

  try {
    const result = await preference.create({
      body: {
        items: [{
          id: "certificado_autoestima",
          title: `Certificado — ${TRILHA_AUTOESTIMA.certificadoNome}`,
          quantity: 1,
          unit_price: CERTIFICADO_AVULSO_PRECO,
          currency_id: "BRL",
        }],
        payer: profile?.email ? { email: profile.email } : undefined,
        external_reference: pagamento.id,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${appUrl}/dashboard/profissional/quiz`,
          pending: `${appUrl}/dashboard/profissional/quiz`,
          failure: `${appUrl}/dashboard/profissional/quiz`,
        },
        auto_return: "approved",
      },
    });

    await supabaseService
      .from("pagamentos_avulsos")
      .update({ mp_preference_id: result.id })
      .eq("id", pagamento.id);

    return NextResponse.json({ init_point: result.init_point });
  } catch (e) {
    console.error("[certificado-avulso] erro ao criar preferência", e);
    await supabaseService.from("pagamentos_avulsos").update({ status: "rejeitado" }).eq("id", pagamento.id);
    return NextResponse.json({ error: "Erro ao iniciar pagamento" }, { status: 500 });
  }
}
