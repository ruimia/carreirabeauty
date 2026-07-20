export const dynamic = "force-dynamic";

export const metadata = { title: "Crescer" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calcularProgressoGeral } from "@/lib/quizContent";
import { calcularConquistas, checksPerfil } from "@/lib/conquistas";

export default async function CrescerHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, slug, plano, foto_perfil_url, educacao_basica, habilidades, educacao, experiencia_prof, portfolio_urls")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const [{ data: progresso }, { data: certificadosRows }, { count: totalConteudos }, { count: candidaturas }] = await Promise.all([
    supabase
      .from("quiz_progresso")
      .select("trilha_slug, modulo_slug")
      .eq("professional_id", professional.id),
    supabase.from("certificados").select("trilha_slug").eq("professional_id", professional.id),
    supabase.from("conteudos").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("professional_id", professional.id),
  ]);

  const { modulosFeitosTotal, trilhasConcluidas, trilhasTotal } = calcularProgressoGeral(progresso ?? []);
  const certificadosConquistados = certificadosRows?.length ?? 0;
  const temTrilhaPendenteDeResgate = trilhasConcluidas > certificadosConquistados;

  const checks = checksPerfil(professional);
  const conquistas = calcularConquistas({
    temFoto: !!professional.foto_perfil_url,
    itensPerfilFeitos: checks.filter((c) => c.done).length,
    itensPerfilTotal: checks.length,
    portfolioCount: professional.portfolio_urls?.length ?? 0,
    candidaturas: candidaturas ?? 0,
    modulosFeitosTotal,
    trilhasConcluidas,
    trilhasTotal,
  });
  const conquistasFeitas = conquistas.filter((c) => c.done).length;

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        {/* Hero — o "porquê" da aba: uma série de ferramentas pra valorizar o talento */}
        <p style={{ font: "800 22px/1.2 var(--font-display)", color: "var(--text-primary)", marginBottom: 6 }}>
          Ferramentas pra seu talento valer mais 🚀
        </p>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 16 }}>
          A gente tá criando uma série de ferramentas pra você <b>aprender</b>, <b>provar</b> o que sabe
          e <b>mostrar</b> seu trabalho — pra ser mais valorizada e conseguir trabalhos melhores.
        </p>

        {/* Mini-loop — deixa claro por que essas ferramentas vivem juntas */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
          border: "1px solid var(--brand-magenta-100)", borderRadius: "var(--radius-xl)",
          padding: "12px 10px", marginBottom: 24,
        }}>
          {[
            { icon: "ph-fill ph-graduation-cap", label: "Aprende" },
            { icon: "ph-fill ph-seal-check", label: "Prova" },
            { icon: "ph-fill ph-globe", label: "Mostra" },
          ].map((step, i, arr) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: "50%", background: "var(--color-brand-primary)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>
                  <i className={step.icon}></i>
                </span>
                <span style={{ font: "700 11px/1 var(--font-body)", color: "var(--color-brand-primary)" }}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <i className="ph-bold ph-arrow-right" style={{ color: "var(--color-brand-primary)", fontSize: 14, opacity: 0.5 }}></i>}
            </div>
          ))}
        </div>

        {/* SEU PROGRESSO — conquistas são privadas/motivacionais (não viram selo
            público); aqui entram como âncora de "onde eu tô" antes das ferramentas */}
        <p className="section-label">Seu progresso</p>
        <div style={{ marginBottom: 24 }}>
          <Ferramenta
            href="/dashboard/profissional/conquistas"
            icon="ph-fill ph-trophy"
            titulo="Suas conquistas"
            desc={conquistasFeitas === conquistas.length
              ? "Você conquistou todas! 🎉"
              : `${conquistasFeitas} de ${conquistas.length} — veja o que falta pra conquistar as outras`}
            badge={`${conquistasFeitas}/${conquistas.length}`}
          />
        </div>

        {/* CERTIFICADOS — priorizado: dado real mostra que quem termina uma
            trilha bate no paywall quase toda vez, o maior sinal de intenção de
            compra do produto hoje. Fica logo após "Seu progresso", acima de
            tudo mais. Uma trilha nova (Preço Justo, Mãos Seguras) foi somada
            ao catálogo — o card mostra o agregado das 3, não uma só. */}
        <p className="section-label">Certificados</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <Ferramenta
            href="/dashboard/profissional/quiz"
            icon="ph-fill ph-medal"
            titulo="Trilhas e certificados"
            desc={temTrilhaPendenteDeResgate
              ? "Trilha completa! Resgate seu certificado"
              : certificadosConquistados > 0
                ? `${certificadosConquistados} de ${trilhasTotal} conquistados`
                : "Complete trilhas rápidas e ganhe certificados pro seu perfil"}
            badge={certificadosConquistados > 0 ? `${certificadosConquistados}/${trilhasTotal}` : undefined}
          />
        </div>

        {/* SUAS PROVAS */}
        <p className="section-label">Suas provas — aparecem no seu site</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <Ferramenta
            icon="ph-fill ph-chat-centered-text"
            titulo="Depoimentos de clientes"
            desc="Peça uma recomendação pra quem você já atendeu"
            emBreve
          />
        </div>

        {/* SUA VITRINE */}
        <p className="section-label">Sua vitrine</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <Ferramenta
            href="/dashboard/profissional/perfil"
            icon="ph-fill ph-globe"
            titulo="Meu perfil"
            desc="Já tá pronto ✓ — é seu site, use como cartão de visita"
          />
        </div>

        {/* DIA A DIA — conteúdo desce pra cá: consumo mais raso e passivo,
            junto de materiais de apoio, em vez de competir com Certificados
            por atenção como "aprendizado" */}
        <p className="section-label">Pro dia a dia</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Ferramenta
            href="/dashboard/profissional/conteudo"
            icon="ph-fill ph-book-open-text"
            titulo="Guias rápidos"
            desc={totalConteudos ? `${totalConteudos} conteúdo${totalConteudos > 1 ? "s" : ""} pra atender melhor e crescer` : "Dicas pra atender melhor e crescer"}
          />
          <Ferramenta
            icon="ph-fill ph-toolbox"
            titulo="Materiais"
            desc="Planilhas e modelos prontos pra organizar seu trabalho"
            emBreve
          />
        </div>
      </main>
    </div>
  );
}

function Ferramenta({ href, icon, titulo, desc, emBreve, badge }: {
  href?: string; icon: string; titulo: string; desc: string; emBreve?: boolean; badge?: string;
}) {
  const inner = (
    <div className="job-feed-card" style={{
      display: "flex", alignItems: "center", gap: 14,
      opacity: emBreve ? 0.7 : 1,
    }}>
      <span style={{
        width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0,
        background: emBreve ? "var(--surface-sunken)" : "var(--brand-magenta-50)",
        color: emBreve ? "var(--text-tertiary)" : "var(--color-brand-primary)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        <i className={icon}></i>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ font: "600 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>{titulo}</p>
          {badge && (
            <span style={{
              minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999,
              background: "var(--color-success-fg)", color: "#fff", fontSize: 11, fontWeight: 800,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>{badge}</span>
          )}
          {emBreve && (
            <span className="tag" style={{ background: "var(--surface-sunken)", color: "var(--text-tertiary)" }}>
              Chegando
            </span>
          )}
        </div>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2 }}>{desc}</p>
      </div>
      {!emBreve && <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>}
    </div>
  );

  if (emBreve || !href) return inner;
  return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
}
