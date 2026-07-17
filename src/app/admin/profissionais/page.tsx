export const dynamic = "force-dynamic";

export const metadata = { title: "Profissionais — Admin" };
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminProfissionaisPage() {
  const supabase = await createClient();
  const { data: profissionais } = await supabase
    .from("professionals")
    .select("id, nome, funcoes, funcao_outro, bairro, cidade, estado, bloqueado, criado_em, slug")
    .order("criado_em", { ascending: false });

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Profissionais</h1>
        <span className="text-sm text-gray-400">{profissionais?.length ?? 0} total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Função</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Localização</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profissionais?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[160px]">{p.nome}</p>
                    {p.bloqueado && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Bloqueado</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {p.funcoes?.length
                      ? p.funcoes.map((f: string) => f === "Outro" ? (p.funcao_outro || "Outro") : f).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{[p.bairro, p.cidade].filter(Boolean).join(", ")} · {p.estado}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.bloqueado ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    }`}>
                      {p.bloqueado ? "Bloqueado" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/profissionais/${p.id}`} className="text-rose-500 hover:text-rose-600 font-medium text-xs">
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
