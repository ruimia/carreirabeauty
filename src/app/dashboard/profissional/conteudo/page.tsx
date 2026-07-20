export const dynamic = "force-dynamic";

export const metadata = { title: "Conteúdo" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VoltarLink from "@/components/VoltarLink";

export default async function ConteudoListaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conteudos } = await supabase
    .from("conteudos")
    .select("id, titulo, slug, pro")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  return (
    <div>
      <main className="page-x">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/crescer" />
          <p className="section-label" style={{ margin: 0 }}>Conteúdo pra você crescer</p>
        </div>

        <Link href="/dashboard/profissional/quiz" style={{ textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
            borderRadius: "var(--radius-xl)", border: "1px solid var(--brand-magenta-100)",
            boxShadow: "var(--shadow-xs)", padding: 16, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{
              width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0,
              background: "var(--color-brand-primary)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              <i className="ph-fill ph-seal-check"></i>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                Trilhas e certificados
              </p>
              <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)" }}>
                Complete uma trilha e ganhe um certificado pro seu perfil
              </p>
            </div>
            <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
          </div>
        </Link>

        {(conteudos ?? []).length === 0 && (
          <div className="card card-xl" style={{ padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)" }}>
              Nenhum conteúdo publicado ainda. Volte em breve!
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {/* Sem cadeado nem tag "PRO" na lista de propósito — todo conteúdo
              parece igualmente acessível aqui; quem não é PRO só descobre o
              bloqueio ao abrir e tentar ler além do trecho liberado (o
              gate de verdade vive em conteudo/[slug]/page.tsx + PdfPageViewer). */}
          {(conteudos ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/profissional/conteudo/${c.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div className="job-feed-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0,
                  background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  <i className="ph-fill ph-book-open-text"></i>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                    {c.titulo}
                  </p>
                </div>
                <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
