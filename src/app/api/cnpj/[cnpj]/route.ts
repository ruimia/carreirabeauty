import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj: raw } = await params;
  const cnpj = raw.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    return Response.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  // Tenta BrasilAPI primeiro, fallback para ReceitaWS
  let res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    res = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      next: { revalidate: 3600 },
    });
  }

  if (!res.ok) {
    return Response.json({ error: "CNPJ não encontrado" }, { status: 404 });
  }

  const raw2 = await res.json();

  // Normaliza campos entre BrasilAPI e ReceitaWS
  const data = {
    ...raw2,
    municipio: raw2.municipio ?? raw2.municipio,
    logradouro: raw2.logradouro ?? raw2.logradouro,
    numero: raw2.numero ?? raw2.numero,
    uf: raw2.uf ?? raw2.uf,
    cep: raw2.cep ?? raw2.cep,
    nome_fantasia: raw2.nome_fantasia ?? raw2.fantasia ?? "",
    razao_social: raw2.razao_social ?? raw2.nome ?? "",
  };

  return Response.json(data);
}
