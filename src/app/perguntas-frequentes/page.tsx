import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/seo";

const TITLE = "Perguntas frequentes";
const DESCRIPTION = "Tire dúvidas sobre como encontrar vagas, freelas e diárias em beleza, estética e bem-estar no CarreiraBeauty — pra profissionais e estabelecimentos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}/perguntas-frequentes` },
  openGraph: { title: `${TITLE} — CarreiraBeauty`, description: DESCRIPTION, url: `${APP_URL}/perguntas-frequentes`, type: "website" },
};

const FAQ: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Como encontrar um freela de manicure, cabeleireiro(a) ou esteticista?",
    resposta: "No CarreiraBeauty, acesse a página de Vagas (carreirabeauty.com/vagas) e veja trabalhos por diária publicados por salões, clínicas e espaços de beleza perto de você. É grátis pra se candidatar.",
  },
  {
    pergunta: "O CarreiraBeauty tem vagas CLT e PJ, ou só freela?",
    resposta: "Tem os três: CLT, PJ e freela/diária. Na página de Vagas (carreirabeauty.com/vagas) dá pra ver o tipo de vínculo de cada oportunidade antes de se candidatar.",
  },
  {
    pergunta: "É grátis se cadastrar como profissional de beleza?",
    resposta: "Sim, o cadastro é 100% grátis pra profissionais — cria seu perfil público, aparece no matching de vagas da sua região e pode se candidatar sem custo.",
  },
  {
    pergunta: "Como uma empresa (salão, clínica, spa) publica uma vaga de emprego ou freela?",
    resposta: "A empresa se cadastra com CNPJ, e a primeira vaga ativa é gratuita. Depois da aprovação (leva até 1 dia útil), a vaga aparece pra profissionais compatíveis com a função e a região.",
  },
  {
    pergunta: "O matching de vagas é só por cidade ou considera a distância real?",
    resposta: "Considera distância real — usamos a localização geocodificada do profissional e da empresa pra mostrar vagas num raio de até 30km, não só vagas da mesma cidade.",
  },
  {
    pergunta: "Dá pra ver o perfil de um profissional de beleza antes de contratar?",
    resposta: "Sim, todo profissional tem uma página pública (ex: carreirabeauty.com/perfil/nome) com função, experiência, localização e portfólio — pode ser compartilhada como um currículo online.",
  },
];

const faqLd = {
  "@context": "https://schema.org/",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.pergunta,
    acceptedAnswer: { "@type": "Answer", text: f.resposta },
  })),
};

export default function PerguntasFrequentesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", fontFamily: "var(--font-body)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header style={{
        background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo-square.jpg" alt="CarreiraBeauty" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>CarreiraBeauty</span>
          </Link>
          <Link href="/login" style={{
            height: 36, padding: "0 16px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)", color: "var(--text-primary)",
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
          }}>
            Entrar
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)", margin: "0 0 20px", letterSpacing: "-0.02em" }}>
          Perguntas frequentes
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ.map((f) => (
            <div key={f.pergunta} style={{
              background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)",
              padding: "18px 20px",
            }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 8px" }}>
                {f.pergunta}
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {f.resposta}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
