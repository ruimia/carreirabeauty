import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("professionals")
    .select("nome, funcao, funcao_outro, cidade, estado")
    .eq("slug", slug)
    .single();

  if (!p) return { title: "Perfil não encontrado — CarreiraBeauty" };

  const funcao = p.funcao === "outro" ? p.funcao_outro : FUNCAO_LABEL[p.funcao] ?? p.funcao;
  return {
    title: `${p.nome} — ${funcao} em ${p.cidade} | CarreiraBeauty`,
    description: `Perfil profissional de ${p.nome}, ${funcao} em ${p.cidade} - ${p.estado}. Encontre profissionais de beleza no CarreiraBeauty.`,
  };
}

export default async function PerfilPublicoPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  let { data: p } = await supabase
    .from("professionals")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!p) {
    // Verifica se é um slug antigo e redireciona para o atual
    const { data: history } = await supabase
      .from("professional_slug_history")
      .select("professional_id, professionals(slug)")
      .eq("slug", slug)
      .maybeSingle();

    if (!history) notFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentSlug = (history.professionals as any)?.slug;
    if (currentSlug) redirect(`/perfil/${currentSlug}`);
    notFound();
  }

  const funcao = p.funcao === "outro"
    ? (p.funcao_outro || "Outro")
    : (FUNCAO_LABEL[p.funcao] ?? p.funcao);

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            {p.foto_perfil_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.foto_perfil_url} alt={p.nome}
                  className="w-20 h-20 rounded-full object-cover" />
              : (
                <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-3xl font-bold text-rose-400">
                  {p.nome?.[0]?.toUpperCase() ?? "?"}
                </div>
              )
            }
            <div>
              <h1 className="text-xl font-bold text-gray-800">{p.nome}</h1>
              <p className="text-rose-500 font-medium">{funcao}</p>
              <p className="text-sm text-gray-400">{p.cidade} · {p.estado}</p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow label="Experiência" value={p.experiencia} />
            <InfoRow label="Disponibilidade" value={p.disponibilidade} />
            <InfoRow label="Pretensão salarial" value={p.pretensao_salarial} />
            {p.educacao_basica && <InfoRow label="Formação" value={p.educacao_basica} />}
            {p.tipo_vinculo && (
              <InfoRow label="Tipo de vínculo" value={p.tipo_vinculo.toUpperCase()} />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Perfil no CarreiraBeauty — marketplace de empregos do setor de beleza
        </p>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-gray-800 text-sm">{value}</p>
    </div>
  );
}
