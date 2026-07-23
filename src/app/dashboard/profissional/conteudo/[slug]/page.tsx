export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PdfPageViewer from "@/components/PdfPageViewer";
import { isProAtivo } from "@/lib/planos";

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
    .select("id, plano, plano_validade")
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

  const isPro = isProAtivo(professional.plano, professional.plano_validade);
  const locked = conteudo.pro && !isPro;

  // Tracking interno — registra a view mesmo pra quem só vê o preview
  // parcial (conteúdo PRO travado), pra medir interesse real de quem é grátis
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
        <PdfPageViewer src={conteudo.pdf_url} locked={locked} />
      </main>
    </div>
  );
}
