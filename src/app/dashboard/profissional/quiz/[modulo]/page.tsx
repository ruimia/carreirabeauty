export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TRILHA_AUTOESTIMA } from "@/lib/quizContent";
import QuizModuloForm from "./QuizModuloForm";

interface Props {
  params: Promise<{ modulo: string }>;
}

export default async function QuizModuloPage({ params }: Props) {
  const { modulo: moduloSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const modulo = TRILHA_AUTOESTIMA.modulos.find((m) => m.slug === moduloSlug);
  if (!modulo) notFound();

  const { data: professional } = await supabase
    .from("professionals")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const { data: progresso } = await supabase
    .from("quiz_progresso")
    .select("acertos, total")
    .eq("professional_id", professional.id)
    .eq("trilha_slug", TRILHA_AUTOESTIMA.slug)
    .eq("modulo_slug", modulo.slug)
    .maybeSingle();

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Link href="/dashboard/profissional/quiz" style={{ fontSize: 22, color: "var(--text-tertiary)", textDecoration: "none", lineHeight: 1 }}>←</Link>
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{modulo.titulo}</p>
        </div>
        <QuizModuloForm
          professionalId={professional.id}
          trilhaSlug={TRILHA_AUTOESTIMA.slug}
          modulo={modulo}
          progressoExistente={progresso ?? null}
        />
      </main>
    </div>
  );
}
