import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "noreply@carreirabeauty.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://beta.carreirabeauty.com";

function base(conteudo: string) {
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
            ${conteudo}
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

function btn(texto: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#DC00DC;color:#fff;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none">${texto}</a>`;
}

function h1(texto: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em">${texto}</h1>`;
}

function p(texto: string) {
  return `<p style="margin:12px 0;font-size:15px;color:#52525b;line-height:1.6">${texto}</p>`;
}

function destaque(texto: string) {
  return `<div style="margin:16px 0;padding:14px 16px;background:#fdf4ff;border-left:3px solid #DC00DC;border-radius:0 8px 8px 0;font-size:14px;color:#3f3f46;line-height:1.6">${texto}</div>`;
}

// ─── 1. Nova candidatura → empresa ───────────────────────────────────────────
export async function emailNovaCandidatura({
  empresaEmail,
  empresaNome,
  profissionalNome,
  funcaoVaga,
  tituloVaga,
  mensagem,
  jobId,
}: {
  empresaEmail: string;
  empresaNome: string;
  profissionalNome: string;
  funcaoVaga: string;
  tituloVaga: string;
  mensagem: string | null;
  jobId: string;
}) {
  const link = `${APP_URL}/dashboard/empresa/vagas/${jobId}/candidatos`;
  const html = base(`
    ${h1("Nova candidatura recebida!")}
    ${p(`<strong>${profissionalNome}</strong> se candidatou à sua vaga de <strong>${tituloVaga || funcaoVaga}</strong>.`)}
    ${mensagem ? destaque(`"${mensagem}"`) : ""}
    ${p("Acesse o painel para ver o perfil completo e entrar em contato.")}
    ${btn("Ver candidatos", link)}
  `);

  await resend.emails.send({
    from: FROM,
    to: empresaEmail,
    subject: `Nova candidatura: ${profissionalNome} → ${tituloVaga || funcaoVaga}`,
    html,
  });
}

// ─── 2. Vaga aprovada → empresa ──────────────────────────────────────────────
export async function emailVagaAprovada({
  empresaEmail,
  empresaNome,
  tituloVaga,
  vagaSlug,
}: {
  empresaEmail: string;
  empresaNome: string;
  tituloVaga: string;
  vagaSlug: string;
}) {
  const link = `${APP_URL}/vaga/${vagaSlug}`;
  const html = base(`
    ${h1("Sua vaga foi aprovada! ✅")}
    ${p(`A vaga <strong>${tituloVaga}</strong> foi revisada e está <strong>publicada</strong> no CarreiraBeauty.`)}
    ${p("Profissionais já podem encontrá-la e se candidatar.")}
    ${btn("Ver vaga publicada", link)}
  `);

  await resend.emails.send({
    from: FROM,
    to: empresaEmail,
    subject: `Vaga aprovada: ${tituloVaga}`,
    html,
  });
}

// ─── 3. Vaga rejeitada → empresa ─────────────────────────────────────────────
export async function emailVagaRejeitada({
  empresaEmail,
  empresaNome,
  tituloVaga,
  motivo,
  jobId,
}: {
  empresaEmail: string;
  empresaNome: string;
  tituloVaga: string;
  motivo: string;
  jobId: string;
}) {
  const link = `${APP_URL}/dashboard/empresa/vagas/${jobId}/editar`;
  const html = base(`
    ${h1("Sua vaga precisa de ajustes")}
    ${p(`A vaga <strong>${tituloVaga}</strong> não foi aprovada pela nossa equipe.`)}
    ${destaque(`<strong>Motivo:</strong> ${motivo}`)}
    ${p("Edite a vaga conforme o feedback e envie novamente para análise.")}
    ${btn("Editar vaga", link)}
  `);

  await resend.emails.send({
    from: FROM,
    to: empresaEmail,
    subject: `Vaga não aprovada: ${tituloVaga}`,
    html,
  });
}
