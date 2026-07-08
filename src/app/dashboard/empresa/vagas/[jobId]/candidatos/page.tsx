export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)",
  manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista",
  maquiador: "Maquiador(a)",
  barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta",
  designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)",
  podologo: "Podólogo(a)",
  recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente",
  outro: "Outro",
};

export default async function CandidatosPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Confirma que a vaga pertence à empresa do usuário logado
  const { data: job } = await supabase
    .from("jobs")
    .select("*, companies!inner(user_id, nome_estabelecimento)")
    .eq("id", jobId)
    .single();

  if (!job) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((job.companies as any).user_id !== user.id) notFound();

  // Candidatos com dados do profissional
  const { data: applications } = await supabase
    .from("applications")
    .select("id, criado_em, professionals(id, nome, telefone, funcao, funcao_outro, cidade, estado, experiencia, disponibilidade, foto_perfil_url, slug)")
    .eq("job_id", jobId)
    .order("criado_em", { ascending: false });

  const funcaoVaga = job.funcao === "outro"
    ? (job.funcao_outro || "Outro")
    : (FUNCAO_LABEL[job.funcao] ?? job.funcao);

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/empresa" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 truncate">{funcaoVaga}</h1>
            <p className="text-sm text-gray-400">
              {applications?.length ?? 0} candidato{applications?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!applications || applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
            <p className="text-lg mb-1">Nenhum candidato ainda</p>
            <p className="text-sm">Os candidatos aparecem aqui quando se aplicarem à vaga.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = app.professionals as any;
              if (!p) return null;

              const funcao = p.funcao === "outro"
                ? (p.funcao_outro || "Outro")
                : (FUNCAO_LABEL[p.funcao] ?? p.funcao);

              const whatsapp = p.telefone?.replace(/\D/g, "");
              const whatsappUrl = whatsapp
                ? `https://wa.me/55${whatsapp}?text=${encodeURIComponent(`Olá ${p.nome}, vi sua candidatura no CarreiraBeauty para a vaga de ${funcaoVaga}!`)}`
                : null;

              return (
                <div key={app.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex items-center gap-3">
                    {p.foto_perfil_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.foto_perfil_url} alt={p.nome}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      : (
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-xl font-bold text-rose-400 flex-shrink-0">
                          {p.nome?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{p.nome}</p>
                      <p className="text-sm text-rose-500">{funcao}</p>
                      {p.cidade && (
                        <p className="text-xs text-gray-400">{p.cidade} · {p.estado}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    {p.experiencia && <p>⏱ {p.experiencia}</p>}
                    {p.disponibilidade && <p>📅 {p.disponibilidade}</p>}
                  </div>

                  <div className="mt-4 flex gap-2">
                    {p.slug && (
                      <Link href={`/perfil/${p.slug}`}
                        className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl py-2 text-center hover:bg-gray-50 transition">
                        Ver perfil
                      </Link>
                    )}
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl py-2 text-center transition">
                        WhatsApp
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 mt-2">
                    Candidatou-se em {new Date(app.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
