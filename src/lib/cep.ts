export interface CepData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchCep(cep: string): Promise<CepData | null> {
  const raw = cep.replace(/\D/g, "");
  if (raw.length !== 8) return null;
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${raw}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export function maskCep(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
