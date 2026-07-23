import Link from "next/link";
import Image from "next/image";
import StickyCTABar from "@/app/StickyCTABar";

// Conteúdo 100% estático (sem auth, sem query) compartilhado por /entrada
// (destino dos redirects 301 do Cloudflare de subdomínios antigos) e pelo
// not-found.tsx (404 customizado) — mesma LP, com um banner opcional no topo.
export default function EntradaContent({ banner }: { banner?: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo-square.jpg" alt="CarreiraBeauty" width={32} height={32} style={{ borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>CarreiraBeauty</span>
          </a>
          <Link href="/login" style={{
            height: 40, padding: "0 18px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", background: "transparent",
            color: "var(--text-primary)", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", textDecoration: "none",
          }}>Entrar</Link>
        </div>
      </header>

      {banner}

      <main id="top">
        {/* ── Hero ── */}
        <section style={{ background: "var(--surface-accent)", padding: "60px 24px 48px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", color: "var(--text-primary)", maxWidth: 720, lineHeight: 1.2 }}>
              Conectando profissionais de beleza, estética e bem-estar às vagas certas perto de você
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 560, lineHeight: 1.5 }}>
              Encontre vagas em salões, clínicas de estética, spas e studios — ou publique a sua e encontre o profissional ideal.
            </p>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Link href="/onboarding/profissional" style={{ ...btnStyle, background: "var(--brand-cyan-500)", height: 56, padding: "0 28px", fontSize: 16, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,170,200,0.28)" }}>
                  👤 Cadastro Profissional Grátis
                </Link>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 240 }}>
                  Receba vagas na sua área
                </p>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 240 }}>
                  Manicure · Cabeleireira · Esteticista · Massoterapeuta · Recepcionista
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Link href="/onboarding/empresa" style={{ ...btnStyle, background: "var(--color-brand-primary)", height: 56, padding: "0 28px", fontSize: 16, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(220,0,220,0.28)" }}>
                  🏪 Anunciar vaga grátis
                </Link>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 240 }}>
                  Sem cartão, sem prazo — publique já.
                </p>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 240 }}>
                  Salão · Clínica de estética · Spa · Studio Sobrancelha
                </p>
              </div>
            </div>

            <div style={{ width: "100%", maxWidth: 720, borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-md)", marginTop: 8 }}>
              <Image
                src="https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1200&q=80&auto=format&fit=crop"
                alt="Profissional de beleza atendendo cliente em salão"
                width={1200} height={675}
                style={{ width: "100%", height: "auto", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
                unoptimized
                priority
              />
            </div>

            <div style={{ width: "100%", maxWidth: 960, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, textAlign: "left", marginTop: 16 }}>
              <CategoryCard accent="var(--brand-magenta-500)" icon="✂️" title="Beleza" desc="Salões, esmalterias e barbearias"
                tags={["Cabeleireiro(a)", "Manicure/Pedicure", "Barbeiro(a)", "Maquiador(a)", "Depiladora", "Assistente/Auxiliar", "Recepcionista"]} />
              <CategoryCard accent="var(--brand-cyan-500)" icon="✨" title="Estética" desc="Clínicas de estética"
                tags={["Esteticista", "Biomédico(a)", "Designer de sobrancelha/cílios", "Recepcionista"]} />
              <CategoryCard accent="var(--brand-blush-500)" icon="🌿" title="Saúde e bem-estar" desc="Spas e clínicas de terapia"
                tags={["Fisioterapeuta", "Massoterapeuta", "Podólogo(a)", "Recepcionista"]} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-tertiary)" }}>
                📍 De capitais a cidades do interior do Brasil — sua região está aqui
              </span>
            </div>
          </div>
        </section>

        {/* ── Como funciona — profissionais ── */}
        <section id="profissionais" style={{ padding: "56px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap-reverse", gap: 32, alignItems: "center" }}>
            <div style={{ flex: "1 1 320px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--brand-cyan-600)" }}>Para profissionais</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 12px" }}>
                Crie seu perfil e descubra oportunidades perto de você
              </h2>
              <div style={{ marginBottom: 20 }}>
                <GratisBadge accent="var(--brand-cyan-500)" bg="var(--brand-cyan-50)" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
                <Step num={1} title="Cadastre-se em minutos, de graça" desc="Conte sua função, experiência e onde você está." accent="var(--brand-cyan-500)" />
                <Step num={2} title="Ganhe uma página pública" desc="Seu currículo online, indexado no Google, de graça." accent="var(--brand-cyan-500)" />
                <Step num={3} title="Receba vagas perto de você" desc="Filtro geográfico fino — nada de vaga do outro lado da cidade." accent="var(--brand-cyan-500)" />
              </div>
              <Link href="/onboarding/profissional" style={{ ...btnStyle, background: "var(--brand-cyan-500)" }}>
                Criar meu perfil grátis
              </Link>
            </div>
            <div style={{ flex: "1 1 320px", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
              <Image
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80&auto=format&fit=crop"
                alt="Profissional de estética atendendo cliente"
                width={800} height={600}
                style={{ width: "100%", height: "auto", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* ── Como funciona — empresas ── */}
        <section id="empresas" style={{ background: "var(--surface-sunken)", padding: "56px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <div style={{ flex: "1 1 320px", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
              <Image
                src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80&auto=format&fit=crop"
                alt="Interior de salão de beleza"
                width={800} height={600}
                style={{ width: "100%", height: "auto", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                unoptimized
              />
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--brand-magenta-600)" }}>Para empresas</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, color: "var(--text-primary)", margin: "8px 0 12px" }}>
                Divulgue sua vaga grátis e encontre profissionais no seu bairro
              </h2>
              <div style={{ marginBottom: 20 }}>
                <GratisBadge accent="var(--color-brand-primary)" bg="var(--brand-magenta-50)" text="1 vaga grátis, sem prazo" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
                <Step num={1} title="Cadastre seu CNPJ" desc="Validamos e puxamos os dados do seu negócio automaticamente." accent="var(--color-brand-primary)" />
                <Step num={2} title="Publique sua primeira vaga de graça" desc="Sem prazo, sem cartão de crédito — todo estabelecimento tem direito a 1 vaga ativa gratuita." accent="var(--color-brand-primary)" />
                <Step num={3} title="Converse com candidatos" desc="Veja quem se candidatou e fale direto pelo WhatsApp." accent="var(--color-brand-primary)" />
              </div>
              <Link href="/onboarding/empresa" style={{ ...btnStyle, background: "var(--color-brand-primary)" }}>
                Cadastrar minha empresa grátis
              </Link>
            </div>
          </div>
        </section>

        {/* ── Categorias populares ── */}
        <section style={{ padding: "56px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)", marginBottom: 24, textAlign: "center" }}>
              Categorias populares
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {[
                { icon: "✂️", label: "Manicure", color: "var(--brand-magenta-500)" },
                { icon: "💇", label: "Cabeleireiro(a)", color: "var(--brand-cyan-500)" },
                { icon: "✨", label: "Esteticista", color: "var(--brand-blush-500)" },
                { icon: "💄", label: "Maquiador(a)", color: "var(--brand-magenta-500)" },
                { icon: "💈", label: "Barbeiro(a)", color: "var(--brand-cyan-500)" },
                { icon: "👤", label: "Recepcionista", color: "var(--brand-blush-500)" },
              ].map(({ icon, label, color }) => (
                <div key={label} style={{
                  background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
                  padding: "16px 12px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, textAlign: "center",
                }}>
                  <span style={{ fontSize: 26, color }}>{icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Depoimentos ── */}
        <section style={{ background: "var(--surface-sunken)", padding: "56px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)", marginBottom: 24, textAlign: "center" }}>
              Quem já usa o CarreiraBeauty
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <Testimonial photo="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop&crop=faces"
                quote="Achei uma vaga de manicure a duas ruas de casa. Nunca foi tão rápido."
                name="Renata" role="Manicure em Campinas, SP" />
              <Testimonial photo="https://images.unsplash.com/photo-1656399910161-8efafd973a29?w=200&q=80&auto=format&fit=crop&crop=faces"
                quote="Publiquei a vaga e no mesmo dia já tinha candidatos do bairro."
                name="Marcos" role="Dono do Studio Bella, SP" />
              <Testimonial photo="https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=200&q=80&auto=format&fit=crop&crop=faces"
                quote="Minha página pública virou meu currículo — mando o link direto pro cliente."
                name="Joana" role="Esteticista em Campinas, SP" />
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section style={{ background: "var(--color-brand-primary)", padding: "56px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#fff" }}>
              Pronto para começar?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", maxWidth: 480, lineHeight: 1.5 }}>
              Leva menos de 5 minutos para criar sua conta.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/onboarding/profissional" style={{ ...btnStyle, background: "#fff", color: "var(--color-brand-primary)" }}>
                Criar meu perfil profissional
              </Link>
              <Link href="/onboarding/empresa" style={{ ...btnStyle, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.5)" }}>
                Cadastrar minha empresa
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--neutral-900)", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo-square.jpg" alt="" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>CarreiraBeauty</span>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <FooterCol title="Produto" links={[{ label: "Para profissionais", href: "#profissionais" }, { label: "Para empresas", href: "#empresas" }]} />
            <FooterCol title="Vagas" links={[{ label: "Todas as vagas", href: "/vagas" }, { label: "Freelas e diárias", href: "/freelas" }]} />
            <FooterCol title="Ajuda" links={[{ label: "Perguntas frequentes", href: "/perguntas-frequentes" }, { label: "Termos de uso", href: "/termos" }, { label: "Privacidade", href: "/privacidade" }]} />
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 20, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} CarreiraBeauty. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      <StickyCTABar />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  height: 48, padding: "0 24px", borderRadius: "var(--radius-pill)",
  border: "none", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700,
  fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8,
  textDecoration: "none", cursor: "pointer",
};

function CategoryCard({ accent, icon, title, desc, tags }: { accent: string; icon: string; title: string; desc: string; tags: string[] }) {
  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-default)", borderTop: `4px solid ${accent}`,
      boxShadow: "var(--shadow-sm)", padding: 20,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22, color: accent }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t) => <Pill key={t}>{t}</Pill>)}
      </div>
    </div>
  );
}

function Step({ num, title, desc, accent }: { num: number; title: string; desc: string; accent: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{
        width: 32, height: 32, borderRadius: "50%", background: accent, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flexShrink: 0,
      }}>{num}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function Testimonial({ photo, quote, name, role }: { photo: string; quote: string; name: string; role: string }) {
  return (
    <div style={{
      background: "var(--surface-card)", borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-default)", padding: 20,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <span style={{ fontSize: 22, color: "var(--brand-magenta-300)" }}>"</span>
      <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5, flex: 1 }}>{quote}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image src={photo} alt={name} width={36} height={36} unoptimized
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{name}</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

function GratisBadge({ accent, bg, text = "100% grátis" }: { accent: string; bg: string; text?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 13, fontWeight: 700, color: accent,
      background: bg, padding: "6px 14px", borderRadius: "var(--radius-pill)",
    }}>
      ✓ {text}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 13, fontWeight: 500, padding: "4px 10px",
      borderRadius: "var(--radius-pill)",
      background: "var(--neutral-100)", color: "var(--text-secondary)",
    }}>{children}</span>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>{l.label}</Link>
      ))}
    </div>
  );
}
