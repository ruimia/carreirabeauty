/**
 * Seed de conteúdos de teste (local, antes de subir pra produção).
 * Uso: node scripts/seed-conteudos-teste.mjs
 */

import { createClient } from "@supabase/supabase-js";
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

// PDF de exemplo hospedado no bucket "conteudos" do Supabase Storage — mesmo
// esquema que os PDFs reais do Gamma vão usar (embeddable em iframe, sem X-Frame-Options)
const PDF_PLACEHOLDER = "https://alfyzgjgsbalynpndgst.supabase.co/storage/v1/object/public/conteudos/teste.pdf";

const CONTEUDOS = [
  { titulo: "Como impressionar no primeiro atendimento", slug: "primeiro-atendimento", pdf_url: PDF_PLACEHOLDER, pro: false, ordem: 1 },
  { titulo: "Como montar um portfólio que atrai cliente", slug: "portfolio-que-atrai", pdf_url: PDF_PLACEHOLDER, pro: true, ordem: 2 },
  { titulo: "Como pedir indicação e fidelizar cliente", slug: "indicacao-e-fidelizacao", pdf_url: PDF_PLACEHOLDER, pro: true, ordem: 3 },
  { titulo: "Como se destacar numa entrevista de vaga", slug: "destaque-na-entrevista", pdf_url: PDF_PLACEHOLDER, pro: false, ordem: 4 },
];

const { error } = await supabase.from("conteudos").upsert(CONTEUDOS, { onConflict: "slug" });
if (error) {
  console.error("Erro ao inserir conteúdos:", error.message);
  process.exit(1);
}
console.log(`${CONTEUDOS.length} conteúdos de teste inseridos/atualizados.`);
