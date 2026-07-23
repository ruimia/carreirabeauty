import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { PACOTES_PRO_PROFISSIONAL, PacoteProKey } from "@/lib/planos";

export async function POST(req: NextRequest) {
  const { pacote } = await req.json();
  const config = PACOTES_PRO_PROFISSIONAL[pacote as PacoteProKey];
  if (!config) return NextResponse.json({ error: "Pacote inválido" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: professional } = await supabase
    .from("professionals").select("id").eq("user_id", user.id).single();
  if (!professional) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();

  // Mesmo padrão do certificado avulso: a linha de pagamento e a preferência
  // são escritas com service role — RLS só deixa o profissional inserir a
  // linha pendente dele mesmo; a aprovação é só via webhook.
  const supabaseService = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pagamento, error: insertError } = await supabaseService
    .from("pagamentos_avulsos")
    .insert({
      professional_id: professional.id,
      produto: "pacote_pro",
      dias: config.dias,
      valor: config.preco,
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
          id: `pacote_pro_${pacote}`,
          title: `CarreiraBeauty PRO — ${config.nome}`,
          quantity: 1,
          unit_price: config.preco,
          currency_id: "BRL",
        }],
        payer: profile?.email ? { email: profile.email } : undefined,
        external_reference: pagamento.id,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${appUrl}/dashboard/profissional/planos/sucesso`,
          pending: `${appUrl}/dashboard/profissional/planos/sucesso`,
          failure: `${appUrl}/dashboard/profissional/planos`,
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
    console.error("[pacote-pro] erro ao criar preferência", e);
    await supabaseService.from("pagamentos_avulsos").update({ status: "rejeitado" }).eq("id", pagamento.id);
    return NextResponse.json({ error: "Erro ao iniciar pagamento" }, { status: 500 });
  }
}
