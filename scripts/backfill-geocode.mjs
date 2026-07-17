/**
 * Backfill de latitude/longitude para professionals e companies que já têm
 * endereço cadastrado mas nunca foram geocodificados (todos os registros
 * antes da seção "matching por raio" nascem com lat/long nulos).
 *
 * Usa Nominatim (OpenStreetMap) — gratuito, limite de 1 req/s, por isso o
 * delay de 1.1s entre chamadas. Busca por rua+cidade+estado primeiro (mais
 * preciso), com fallback pro centro da cidade+estado quando a rua não é
 * encontrada no OSM (comum em bairros menos mapeados) — ainda assim
 * suficiente pra um raio de 30km.
 *
 * Uso: node scripts/backfill-geocode.mjs
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function buscarNominatim(params) {
  try {
    const query = new URLSearchParams({ ...params, country: "Brazil", format: "json", limit: "1" });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
      headers: { "User-Agent": "CarreiraBeauty/1.0 (contato@carreirabeauty.com)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const { lat, lon } = data[0];
    if (!lat || !lon) return null;
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch {
    return null;
  }
}

async function geocodeEndereco(endereco, cidade, estado) {
  if (!cidade || !estado) return null;
  const rua = (endereco ?? "").split(",")[0].trim();
  if (rua) {
    const porRua = await buscarNominatim({ street: rua, city: cidade, state: estado });
    if (porRua) return porRua;
    await sleep(1100);
  }
  return buscarNominatim({ city: cidade, state: estado });
}

async function backfillTabela(tabela) {
  const { data: registros } = await supabase
    .from(tabela)
    .select("id, endereco, cidade, estado")
    .is("latitude", null)
    .not("cidade", "is", null)
    .neq("cidade", "");

  console.log(`${tabela}: ${registros?.length ?? 0} registro(s) sem coordenadas`);

  let sucesso = 0, semResultado = 0;
  for (const r of registros ?? []) {
    const coords = await geocodeEndereco(r.endereco, r.cidade, r.estado);
    if (coords) {
      await supabase.from(tabela).update(coords).eq("id", r.id);
      sucesso++;
    } else {
      semResultado++;
    }
    await sleep(1100);
  }
  console.log(`${tabela}: ${sucesso} geocodificado(s), ${semResultado} sem resultado`);
}

await backfillTabela("professionals");
await backfillTabela("companies");
console.log("Backfill concluído.");
