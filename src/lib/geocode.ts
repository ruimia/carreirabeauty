// Geocoding via Nominatim (OpenStreetMap) — gratuito, sem chave de API.
// Limite de uso deles é 1 req/s; cada ponto de cadastro só chama isso uma
// vez (no blur do CEP/CNPJ), então não há risco de rajada. Backfill em
// lote (scripts/backfill-geocode.mjs) respeita o limite com delay manual.
//
// Busca por CEP puro (`postalcode=`) tem cobertura ruim no Brasil no OSM —
// a maioria dos CEPs residenciais retorna vazio. Rua+cidade+estado acha
// bem mais; cidade+estado sozinho (sem rua) ainda serve de fallback
// razoável pra um raio de 30km.
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface EnderecoParaGeocode {
  endereco?: string | null; // logradouro (rua), sem número obrigatório
  cidade: string;
  estado: string;
}

async function buscarNominatim(params: Record<string, string>): Promise<Coordenadas | null> {
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

export async function geocodeEndereco({ endereco, cidade, estado }: EnderecoParaGeocode): Promise<Coordenadas | null> {
  if (!cidade || !estado) return null;

  // Rua da cidade — mais preciso quando o logradouro existe no OSM
  const rua = (endereco ?? "").split(",")[0].trim(); // remove número/complemento
  if (rua) {
    const porRua = await buscarNominatim({ street: rua, city: cidade, state: estado });
    if (porRua) return porRua;
  }

  // Fallback: centro da cidade — impreciso no nível de rua, mas suficiente
  // pra um raio de 30km
  return buscarNominatim({ city: cidade, state: estado });
}

// Mantido pra compatibilidade dos call sites que só têm o CEP à mão —
// tenta postalcode e, se vazio, não tem endereço/cidade pra cair no fallback
// (use geocodeEndereco sempre que tiver cidade/estado disponíveis)
export async function geocodeCep(cep: string): Promise<Coordenadas | null> {
  const raw = cep.replace(/\D/g, "");
  if (raw.length !== 8) return null;
  const cepFormatado = `${raw.slice(0, 5)}-${raw.slice(5)}`;
  return buscarNominatim({ postalcode: cepFormatado });
}

// Distância em km entre dois pontos (fórmula de Haversine)
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
