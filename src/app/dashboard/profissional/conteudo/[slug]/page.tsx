export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PdfPageViewer from "@/components/PdfPageViewer";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ConteudoViewerPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, plano")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const { data: conteudo } = await supabase
    .from("conteudos")
    .select("id, titulo, slug, pdf_url, pro")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();
  if (!conteudo) notFound();

  const isPro = professional.plano === "pro";
  if (conteudo.pro && !isPro) redirect("/dashboard/profissional/conteudo");

  // Tracking interno — registra a view agora que o acesso foi liberado
  await supabase.from("conteudo_views").insert({
    conteudo_id: conteudo.id,
    professional_id: professional.id,
  });

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Link href="/dashboard/profissional/conteudo" style={{ fontSize: 22, color: "var(--text-tertiary)", textDecoration: "none", lineHeight: 1 }}>←</Link>
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{conteudo.titulo}</p>
        </div>
        <PdfPageViewer src={conteudo.pdf_url} />
      </main>
    </div>
  );
}
