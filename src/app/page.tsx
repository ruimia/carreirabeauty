import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <header style={{
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border-default)",
        position: "sticky", top: 0, zIndex: 10,
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo-square.jpg" alt="CarreiraBeauty" width={32} height={32}
            style={{ borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
            CarreiraBeauty
          </span>
        </div>
        <Link href="/login" style={{
          height: 36, padding: "0 18px", borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border-default)", background: "transparent",
          color: "var(--text-primary)", fontWeight: 600, fontSize: 14,
          display: "flex", alignItems: "center", textDecoration: "none",
        }}>
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(160deg, #f8e8f8 0%, #e8f4f8 50%, #f8e8f0 100%)",
        padding: "64px 24px 48px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(220,0,220,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(0,170,200,0.07)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 6vw, 48px)",
            color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 20,
          }}>
            O maior site de empregos de beleza, estética e bem-estar do Brasil
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 48 }}>
            Salões, clínicas e profissionais se encontram perto de casa.<br />
            Simples, rápido e feito para o seu bairro.
          </p>

          {/* Category cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left", marginBottom: 40 }}>
            <CategoryCard
              color="var(--color-brand-primary)"
              bg="#fdf0ff"
              icon="✂️"
              title="Beleza"
              desc="Salões, esmalterias e barbearias"
              tags={["Cabeleireiro(a)", "Manicure/Pedicure", "Barbeiro(a)", "Maquiador(a)", "Depiladora", "Recepcionista"]}
            />
            <CategoryCard
              color="var(--color-brand-secondary)"
              bg="#f0fbff"
              icon="✨"
              title="Estética"
              desc="Clínicas de estética"
              tags={["Esteticista", "Biomédico(a)", "Recepcionista"]}
            />
            <CategoryCard
              color="var(--brand-blush-500)"
              bg="#fff0f6"
              icon="🌿"
              title="Saúde e bem-estar"
              desc="Spas e clínicas de terapia"
              tags={["Fisioterapeuta", "Massoterapeuta", "Podólogo(a)", "Recepcionista"]}
            />
          </div>

          {/* Cities */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 12 }}>
              📍 Sua praça está aqui
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center", fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
              {["São Paulo, SP", "Campinas, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR"].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/onboarding/profissional" style={{
              height: 52, padding: "0 28px", borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-secondary)", color: "#fff",
              fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none", boxShadow: "0 4px 16px rgba(0,170,200,0.3)",
            }}>
              <span>🎨</span> Sou profissional
            </Link>
            <Link href="/onboarding/empresa" style={{
              height: 52, padding: "0 28px", borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-primary)", color: "#fff",
              fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none", boxShadow: "0 4px 16px rgba(220,0,220,0.3)",
            }}>
              <span>🏪</span> Sou empresa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer style={{ padding: "20px 24px", textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>
        <span>© {new Date().getFullYear()} CarreiraBeauty · </span>
        <Link href="/privacidade" style={{ color: "var(--text-tertiary)", textDecoration: "underline" }}>Privacidade</Link>
        <span> · </span>
        <Link href="/termos" style={{ color: "var(--text-tertiary)", textDecoration: "underline" }}>Termos</Link>
      </footer>
    </div>
  );
}

function CategoryCard({ color, bg, icon, title, desc, tags }: {
  color: string; bg: string; icon: string; title: string; desc: string; tags: string[];
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: "var(--radius-lg)",
      border: `2px solid ${color}`, padding: "18px 16px",
      boxShadow: "var(--shadow-xs)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
          {icon}
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 12 }}>{desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t) => (
          <span key={t} style={{
            fontSize: 12, fontWeight: 500, padding: "4px 10px",
            borderRadius: "var(--radius-pill)", background: bg, color,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
