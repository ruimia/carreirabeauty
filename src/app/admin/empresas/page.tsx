export const dynamic = "force-dynamic";

export const metadata = { title: "Empresas — Admin" };
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = { trial: "Trial", ativa: "Ativa", expirada: "Expirada" };
const STATUS_COLOR: Record<string, string> = {
  trial: "bg-yellow-100 text-yellow-700",
  ativa: "bg-green-100 text-green-700",
  expirada: "bg-gray-100 text-gray-500",
};

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from("companies")
    .select("id, nome_estabelecimento, cnpj, bairro, cidade, estado, categoria_negocio, status_assinatura, status_cadastro, bloqueado, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Empresas</h1>
        <span className="text-sm text-gray-400">{empresas?.length ?? 0} total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Localização</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Cadastro</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {empresas?.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[180px]">{e.nome_estabelecimento}</p>
                    <p className="text-xs text-gray-400">{e.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</p>
                    {e.bloqueado && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Bloqueada</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{[e.bairro, e.cidade].filter(Boolean).join(", ")} · {e.estado}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[e.status_assinatura] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[e.status_assinatura] ?? e.status_assinatura}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(e.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/empresas/${e.id}`} className="text-rose-500 hover:text-rose-600 font-medium text-xs">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
