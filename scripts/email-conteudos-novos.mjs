/**
 * Disparo: avisa profissionais sobre os conteúdos disponíveis no app.
 * Uso:
 *   node scripts/email-conteudos-novos.mjs           → dry-run (só lista os destinatários)
 *   node scripts/email-conteudos-novos.mjs --send    → dispara de verdade via Resend
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

function primeiroNome(nomeCompleto) {
  return (nomeCompleto ?? "").trim().split(/\s+/)[0] || "";
}

function emailHtml(primeiroNome, headlines) {
  const itens = headlines
    .map((h) => `<div style="padding:12px 16px;background:#fdf4ff;border-left:3px solid #DC00DC;border-radius:0 8px 8px 0;font-size:14px;color:#3f3f46;margin-bottom:8px">📖 ${h}</div>`)
    .join("\n");

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
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em">${primeiroNome ? primeiroNome + ", p" : "P"}reparamos um conteúdo especial pra você! 🎉</h1>
            <p style="margin:12px 0;font-size:15px;color:#52525b;line-height:1.6">Guias rápidos pra você atender melhor, conquistar mais clientes e crescer na profissão:</p>
            <div style="margin:20px 0">
              ${itens}
            </div>
            <p style="margin:12px 0;font-size:15px;color:#52525b;line-height:1.6">É só entrar no seu painel pra ler.</p>
            <a href="${APP_URL}/dashboard/profissional/conteudo" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#DC00DC;color:#fff;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none">Ver conteúdos agora</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f4f4f5">
            <p style="margin:0;font-size:12px;color:#a1a1aa">Você está recebendo este email porque tem uma conta no CarreiraBeauty.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function main() {
  const { data: conteudos } = await supabase
    .from("conteudos")
    .select("titulo")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  const headlines = (conteudos ?? []).map((c) => c.titulo);

  const { data: profissionais } = await supabase
    .from("professionals")
    .select("user_id, nome")
    .not("slug", "is", null);

  const userIds = profissionais.map((p) => p.user_id);
  const { data: perfis } = await supabase.from("profiles").select("id, email").in("id", userIds);
  const emailPorUserId = Object.fromEntries((perfis ?? []).map((p) => [p.id, p.email]));

  const destinatarios = profissionais
    .map((p) => ({ nome: p.nome, email: emailPorUserId[p.user_id] }))
    .filter((d) => d.email && !d.email.endsWith("@teste.cb"));

  console.log(`${destinatarios.length} profissional(is) vão receber:\n`);
  destinatarios.forEach((d) => console.log(`  - ${primeiroNome(d.nome)} <${d.email}>`));

  if (!SEND) {
    console.log("\nDRY-RUN — nenhum email foi enviado. Rode com --send para disparar de verdade.");
    return;
  }

  console.log("\nDisparando...");
  for (const d of destinatarios) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: d.email,
      subject: "Preparamos um conteúdo especial pra você! 🎉",
      html: emailHtml(primeiroNome(d.nome), headlines),
    });
    console.log(`  ${error ? "✗ erro: " + error.message : "✓ enviado"} → ${d.email}`);
  }
}

main();
