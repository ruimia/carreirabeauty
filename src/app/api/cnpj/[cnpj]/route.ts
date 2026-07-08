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

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return Response.json({ error: "CNPJ não encontrado" }, { status: 404 });
  }

  const data = await res.json();
  return Response.json(data);
}
