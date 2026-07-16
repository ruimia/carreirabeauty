export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toggleBloqueadoProfissional } from "../../actions";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

function funcoesLabel(funcoes: string[] | null, funcaoOutro: string | null): string {
  if (!funcoes?.length) return "—";
  return funcoes.map((f) => (f === "Outro" ? (funcaoOutro || "Outro") : f)).join(", ");
}

export default async function AdminProfissionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase.from("professionals").select("*, profiles(email)").eq("id", id).single();
  if (!p) notFound();

  const email = (p.profiles as { email?: string } | null)?.email;

  const { data: apps } = await supabase
    .from("applications")
    .select("id, criado_em, jobs(funcao, funcao_outro, companies(nome_estabelecimento))")
    .eq("professional_id", id)
    .order("criado_em", { ascending: false });

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/profissionais" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-xl font-bold text-gray-800 flex-1 truncate">{p.nome}</h1>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        {/* Email + WhatsApp em destaque */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">E-mail</p>
            {email
              ? <a href={`mailto:${email}`} className="text-sm font-medium text-rose-600 hover:underline break-all">{email}</a>
              : <p className="text-sm text-gray-400">—</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400">WhatsApp / Telefone</p>
            {p.telefone
              ? <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-green-600 hover:underline">{p.telefone}</a>
              : <p className="text-sm text-gray-400">—</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Funções", funcoesLabel(p.funcoes, p.funcao_outro)],
            ["Cidade", `${[p.bairro, p.cidade].filter(Boolean).join(", ")} · ${p.estado}`],
            ["Experiência", p.experiencia],
            ["Disponibilidade", p.disponibilidade],
            ["Tipo de vínculo", p.tipo_vinculo],
            ["Instagram", p.instagram ? `@${p.instagram}` : "—"],
            ["Slug", p.slug],
            ["Desde", new Date(p.criado_em).toLocaleDateString("pt-BR")],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-gray-400">{l}</p>
              <p className="font-medium text-gray-700">{v || "—"}</p>
            </div>
          ))}
        </div>

        {p.educacao_basica && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Apresentação</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{p.educacao_basica}</p>
          </div>
        )}

        {!!p.habilidades?.length && (
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Habilidades</p>
            <div className="flex flex-wrap gap-1.5">
              {p.habilidades.map((h: string) => (
                <span key={h} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{h}</span>
              ))}
            </div>
          </div>
        )}

        {!!p.educacao?.length && (
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Formação e cursos</p>
            <div className="space-y-1.5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {p.educacao.map((edu: any, i: number) => (
                <div key={i} className="text-sm text-gray-700">
                  <span className="font-medium">{edu.curso}</span>
                  {edu.instituicao && <span className="text-gray-400"> — {edu.instituicao}</span>}
                  {edu.ano && <span className="text-gray-400"> ({edu.ano})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!!p.experiencia_prof?.length && (
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Experiência profissional</p>
            <div className="space-y-1.5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {p.experiencia_prof.map((exp: any, i: number) => (
                <div key={i} className="text-sm text-gray-700">
                  <span className="font-medium">{exp.cargo}</span>
                  {exp.empresa && <span className="text-gray-400"> — {exp.empresa}</span>}
                  {exp.periodo && <span className="text-gray-400"> ({exp.periodo})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pt-2 border-t border-gray-100 flex gap-2">
          <Link href={`/perfil/${p.slug}`} target="_blank"
            className="text-sm text-blue-500 hover:text-blue-600 font-medium px-4 py-2 rounded-xl border border-blue-100">
            Ver perfil público
          </Link>
          <form action={toggleBloqueadoProfissional.bind(null, p.id, !p.bloqueado)}>
            <button className={`text-sm font-medium px-4 py-2 rounded-xl transition ${
              p.bloqueado
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
              {p.bloqueado ? "Desbloquear" : "Bloquear"}
            </button>
          </form>
        </div>
      </div>

      {/* Candidaturas */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Candidaturas ({apps?.length ?? 0})</h2>
        </div>
        {!apps?.length ? (
          <p className="text-sm text-gray-400 px-4 py-4">Nenhuma candidatura.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {apps.map((a) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const job = a.jobs as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const empresa = job?.companies as any;
              return (
                <div key={a.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">
                    {job?.funcao === "outro" ? job?.funcao_outro : FUNCAO_LABEL[job?.funcao] ?? job?.funcao}
                  </p>
                  <p className="text-xs text-gray-400">
                    {empresa?.nome_estabelecimento} · {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
