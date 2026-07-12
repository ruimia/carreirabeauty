/**
 * Disparo ad-hoc: lembrete de cadastro incompleto.
 * Uso:
 *   node scripts/email-cadastro-incompleto.mjs           → dry-run (só lista e mostra o que seria enviado)
 *   node scripts/email-cadastro-incompleto.mjs --send    → dispara de verdade via Resend
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1")];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const resend = new Resend(env.RESEND_API_KEY);
const FROM = env.RESEND_FROM ?? "noreply@carreirabeauty.com";
const APP_URL = env.NEXT_PUBLIC_APP_URL ?? "https://beta.carreirabeauty.com";

const SEND = process.argv.includes("--send");

function emailHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden">
        <tr>
          <td style="background:#DC00DC;padding:20px 32px">
            <p style="margin:0;font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.02em">CarreiraBeauty</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em">Falta pouco para começar! 💅</h1>
            <p style="margin:12px 0;font-size:15px;color:#52525b;line-height:1.6">Você começou seu cadastro no CarreiraBeauty, mas ainda não finalizou.</p>
            <div style="margin:16px 0;padding:14px 16px;background:#fdf4ff;border-left:3px solid #DC00DC;border-radius:0 8px 8px 0;font-size:14px;color:#3f3f46;line-height:1.6">
              Leva menos de 2 minutos para concluir e você já pode começar a receber vagas ou candidatos na sua área.
            </div>
            <p style="margin:12px 0;font-size:15px;color:#52525b;line-height:1.6">Termine agora e não perca oportunidades perto de você.</p>
            <a href="${APP_URL}/login" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#DC00DC;color:#fff;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none">Concluir meu cadastro</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f4f4f5">
            <p style="margin:0;font-size:12px;color:#a1a1aa">Você está recebendo este email porque iniciou um cadastro no CarreiraBeauty.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function main() {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, tipo, criado_em")
    .order("criado_em", { ascending: false });

  const ids = profiles.map((p) => p.id);
  const { data: companies } = await supabase.from("companies").select("user_id, status_cadastro").in("user_id", ids);
  const { data: professionals } = await supabase.from("professionals").select("user_id, slug").in("user_id", ids);

  const incompletos = profiles.filter((p) => {
    const c = companies.find((x) => x.user_id === p.id);
    const pr = professionals.find((x) => x.user_id === p.id);
    const completo = (c && c.status_cadastro === "completo") || (pr && pr.slug);
    return !completo;
  });

  console.log(`${incompletos.length} contato(s) com cadastro incompleto:\n`);
  incompletos.forEach((p) => console.log(`  - ${p.email} (tipo: ${p.tipo ?? "não escolhido"}, criado em ${p.criado_em})`));

  if (!SEND) {
    console.log("\nDRY-RUN — nenhum email foi enviado. Rode com --send para disparar de verdade.");
    return;
  }

  console.log("\nDisparando...");
  for (const p of incompletos) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: p.email,
      subject: "Falta pouco para começar no CarreiraBeauty 💅",
      html: emailHtml(),
    });
    console.log(`  ${error ? "✗ erro: " + error.message : "✓ enviado"} → ${p.email}`);
  }
}

main();
