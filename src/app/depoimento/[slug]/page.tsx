import { redirect } from "next/navigation";

// Rota antiga (/depoimento/{slug}) — mantida só como redirect pra não quebrar
// links já compartilhados antes da URL passar a viver sob /perfil/{slug}.
export default async function DepoimentoLegadoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/perfil/${slug}/depoimento`);
}
