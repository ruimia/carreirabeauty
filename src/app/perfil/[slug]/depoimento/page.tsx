export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import DepoimentoForm from "./DepoimentoForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("professionals").select("nome").eq("slug", slug).single();
  return { title: p ? `Deixe um depoimento para ${p.nome}` : "Depoimento" };
}

export default async function DepoimentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("professionals")
    .select("id, nome, foto_perfil_url")
    .eq("slug", slug)
    .single();

  if (!p) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px 48px" }}>
        <Link href={`/perfil/${slug}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
          font: "600 13px/1 var(--font-body)", color: "var(--text-secondary)", marginBottom: 24,
        }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 14 }}></i>
          Ver perfil de {p.nome}
        </Link>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {p.foto_perfil_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.foto_perfil_url} alt={p.nome} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", margin: "0 auto 14px" }} />
            : <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px",
                background: "var(--brand-blush-100)", color: "var(--brand-magenta-500)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
              }}>
                {p.nome.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
              </div>
          }
          <p style={{ font: "800 20px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
            Como foi seu atendimento com {p.nome}?
          </p>
          <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 6 }}>
            Seu depoimento ajuda outras pessoas a conhecerem o trabalho dela. 💅
          </p>
        </div>

        <DepoimentoForm professionalId={p.id} slug={slug} />
      </main>
    </div>
  );
}
