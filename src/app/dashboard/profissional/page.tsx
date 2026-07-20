export const dynamic = "force-dynamic";

export const metadata = { title: "Vagas para você" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VagasExternasLista from "@/components/VagasExternasLista";
import AtividadeRecente from "@/components/AtividadeRecente";
import { getAtividadeRecente } from "@/lib/atividadeRecente";
import { distanciaKm } from "@/lib/geocode";
import { calcularProgressoGeral } from "@/lib/quizContent";
import { calcularConquistas } from "@/lib/conquistas";

const FUNCAO_LABEL: Record<string, string> = {
  cabeleireiro: "Cabeleireiro(a)", manicure_pedicure: "Manicure/pedicure",
  esteticista: "Esteticista", maquiador: "Maquiador(a)", barbeiro: "Barbeiro",
  massoterapeuta: "Massoterapeuta", designer_sobrancelha_cilios: "Designer de sobrancelha/cílios",
  depilador: "Depilador(a)", podologo: "Podólogo(a)", recepcionista: "Recepcionista",
  auxiliar_assistente: "Auxiliar/assistente", outro: "Outro",
};

const VINCULO_LABEL: Record<string, string> = {
  clt: "CLT", pj: "PJ", freela: "Freela", estagio: "Estágio", menor_aprendiz: "Menor aprendiz",
};

// Palavras-chave pra casar vaga agregada (Adzuna) com a função do profissional.
// professionals.funcoes guarda o nome livre da profissão (ex: "Cabeleireiro(a)"),
// não uma chave fixa — então detectamos a partir de qual raiz aparece no texto,
// em vez de indexar por chave exata. Recepcionista/auxiliar entram aqui porque
// o cache (scripts/fetch-vagas-adzuna.mjs) já garante que só guarda esses termos
// genéricos quando o contexto de beleza foi confirmado na ingestão.
const RAIZES_BELEZA = [
  "cabeleir", "hair", "manicur", "pedicur", "unha", "esteticist", "estetica",
  "maquiad", "barbeir", "barber", "massoterap", "massagem", "sobrancel",
  "cilio", "depilad", "podolog", "recepcion", "auxiliar", "assistente",
];

function normaliza(s: string) {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// \b antes do termo evita falso positivo tipo "spa" dentro de "espaços"
function contemTermo(texto: string, termo: string) {
  return new RegExp(`\\b${termo}`).test(texto);
}

function formatoDataRelativa(iso: string | null) {
  if (!iso) return null;
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "var(--radius-md)",
      background: "var(--brand-blush-100)", color: "var(--brand-blush-500)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: size * 0.35, flexShrink: 0,
    }}>
      {initials || <i className="ph-fill ph-storefront"></i>}
    </div>
  );
}

export default async function DashboardProfissionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals").select("*").eq("user_id", user.id).maybeSingle();

  if (!professional) redirect("/onboarding/tipo");
  if (!professional.slug) redirect("/onboarding/profissional");

  const funcoes: string[] = professional.funcoes ?? [];

  const [{ data: allJobs }, { data: applications }, { data: vagasExternas }, { data: quizProgresso }, { data: certificados }, { count: depoimentosAprovados }, { count: depoimentosPendentes }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, titulo, funcao, funcoes, funcao_outro, slug, faixa_salarial, tipo_vinculo, descricao, criado_em, companies(nome_estabelecimento, bairro, cidade, estado, logo_url, latitude, longitude)")
      .eq("status", "ativa")
      .order("criado_em", { ascending: false }),
    supabase
      .from("applications")
      .select("job_id, criado_em, jobs(titulo, funcao, funcao_outro, slug, companies(nome_estabelecimento, logo_url))")
      .eq("professional_id", professional.id)
      .order("criado_em", { ascending: false }),
    professional.cidade
      ? supabase
          .from("vagas_externas")
          .select("id, titulo, empresa, cidade, estado, url, salario_min, salario_max, descricao, publicado_em")
          .eq("cidade_busca", professional.cidade.trim())
          .order("publicado_em", { ascending: false })
          // Filtro por função roda em JS depois desse fetch — limite baixo
          // cortava vagas de funções menos frequentes (ex: manicure) antes
          // mesmo do filtro rodar, porque profissões mais postadas (ex:
          // cabeleireiro) ocupavam as posições mais recentes
          .limit(200)
      : Promise.resolve({ data: [] }),
    supabase
      .from("quiz_progresso")
      .select("trilha_slug, modulo_slug")
      .eq("professional_id", professional.id),
    supabase
      .from("certificados")
      .select("trilha_slug")
      .eq("professional_id", professional.id),
    supabase
      .from("depoimentos")
      .select("*", { count: "exact", head: true })
      .eq("professional_id", professional.id)
      .eq("status", "aprovado"),
    supabase
      .from("depoimentos")
      .select("*", { count: "exact", head: true })
      .eq("professional_id", professional.id)
      .eq("status", "pendente"),
  ]);

  const atividades = await getAtividadeRecente(supabase, 10);

  // Casa vaga agregada com a(s) função(ões) do profissional — mesma lógica das
  // vagas nativas (se não tem função marcada ou marcou "outro", não filtra)
  const palavrasFuncoes = funcoes.flatMap((f) => {
    const fNormalizado = normaliza(f);
    return RAIZES_BELEZA.filter((raiz) => contemTermo(fNormalizado, raiz));
  });
  const vagasExternasFiltradas = (vagasExternas ?? []).filter((v) => {
    if (palavrasFuncoes.length === 0) return true;
    const t = normaliza(v.titulo);
    return palavrasFuncoes.some((p) => contemTermo(t, p));
  }).slice(0, 5).map((v) => ({
    // tempo relativo calculado aqui (servidor) — a lista é client component e
    // recalcular lá divergiria na hidratação
    ...v,
    publicadoRelativo: formatoDataRelativa(v.publicado_em),
  }));

  const appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));

  // RLS só expõe a vaga do join quando ela está ativa — candidatura pra vaga
  // pausada/em moderação vem com jobs=null e não tem o que renderizar no card
  const candidaturas = (applications ?? []).filter((a) => a.jobs);

  // Vagas compatíveis ainda não candidatadas — mesma função e localização
  // compatível. Localização prioriza raio de 30km quando ambos os lados têm
  // coordenadas (geocoding via CEP); sem coordenadas ainda (backfill em
  // andamento), cai pro comparativo por estado como antes.
  const profissionalGeo = professional.latitude && professional.longitude
    ? { latitude: professional.latitude, longitude: professional.longitude }
    : null;
  const RAIO_KM = 30;

  const jobs = (allJobs ?? []).filter((j) => {
    if (appliedJobIds.has(j.id)) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresa = (j.companies as any);
    const empresaGeo = empresa?.latitude && empresa?.longitude
      ? { latitude: empresa.latitude, longitude: empresa.longitude }
      : null;

    if (profissionalGeo && empresaGeo) {
      if (distanciaKm(profissionalGeo, empresaGeo) > RAIO_KM) return false;
    } else if (professional.estado && empresa?.estado && empresa.estado !== professional.estado) {
      return false;
    }

    if (funcoes.length === 0) return true;
    // OR: casa se qualquer função da vaga bater com qualquer função do
    // profissional — vaga pode servir pra vários perfis ao mesmo tempo
    const funcoesVaga: string[] = j.funcoes?.length ? j.funcoes : (j.funcao ? [j.funcao] : []);
    return funcoesVaga.some((fv) =>
      funcoes.some((f) => f.toLowerCase() === fv.toLowerCase()) ||
      (fv.toLowerCase() === "outro" && funcoes.includes("outro"))
    );
  });

  // Força do perfil — quanto mais completo, mais fácil empresas encontrarem
  const checks: { label: string; done: boolean }[] = [
    { label: "Foto de perfil", done: !!professional.foto_perfil_url },
    { label: "Apresentação", done: !!professional.educacao_basica },
    { label: "Habilidades", done: (professional.habilidades?.length ?? 0) > 0 },
    { label: "Formação e cursos", done: (professional.educacao?.length ?? 0) > 0 },
    { label: "Experiência profissional", done: (professional.experiencia_prof?.length ?? 0) > 0 },
    { label: "Portfólio", done: (professional.portfolio_urls?.length ?? 0) > 0 },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const perfilPct = Math.round((doneCount / checks.length) * 100);
  const faltando = checks.filter((c) => !c.done).map((c) => c.label);

  // Dicas práticas — versão em ação de cada item que falta, com ícone
  const DICA: Record<string, { texto: string; icon: string }> = {
    "Foto de perfil": { texto: "Coloque uma foto sua", icon: "ph-fill ph-camera" },
    "Apresentação": { texto: "Escreva um pouco sobre você", icon: "ph-fill ph-chat-circle-text" },
    "Habilidades": { texto: "Marque suas habilidades", icon: "ph-fill ph-star" },
    "Formação e cursos": { texto: "Adicione seus cursos", icon: "ph-fill ph-graduation-cap" },
    "Experiência profissional": { texto: "Conte sua experiência", icon: "ph-fill ph-briefcase" },
    "Portfólio": { texto: "Mostre fotos do seu trabalho", icon: "ph-fill ph-images" },
  };
  const dicas = faltando.slice(0, 3).map((label) => DICA[label]).filter(Boolean);

  // Conquistas de ativação (fase 1) — todas calculadas na hora a partir do que já
  // existe, sem tabela nova. São privadas e motivacionais: engajamento nunca vira
  // selo público. Ver badges-conquistas-selos-carreirabeauty.md.
  const { porTrilha, modulosFeitosTotal, trilhasConcluidas, trilhasTotal } = calcularProgressoGeral(quizProgresso ?? []);
  const conquistas = calcularConquistas({
    temFoto: !!professional.foto_perfil_url,
    itensPerfilFeitos: doneCount,
    itensPerfilTotal: checks.length,
    portfolioCount: professional.portfolio_urls?.length ?? 0,
    candidaturas: (applications ?? []).length,
    modulosFeitosTotal,
    trilhasConcluidas,
    trilhasTotal,
  });
  const conquistasFeitas = conquistas.filter((c) => c.done).length;

  // Destaque do certificado na home — dado real: quem termina uma trilha bate
  // no paywall quase toda vez (maior sinal de intenção de compra do produto).
  // Some quando os 3 certificados já foram conquistados.
  const certificadosConquistados = certificados?.length ?? 0;
  // Trilha terminada (respondeu tudo) mas ainda não resgatou o certificado —
  // é o momento de maior intenção, merece o CTA mais forte
  const temTrilhaPendenteDeResgate = trilhasConcluidas > certificadosConquistados;
  const trilhaEmAndamento = porTrilha.find((t) => t.feitos > 0 && !t.concluida);

  return (
    <div>
      <main className="page-x">

        {/* Saudação — o app fala com a pessoa antes de cobrar qualquer coisa */}
        <p style={{ font: "800 22px/1.2 var(--font-display)", color: "var(--text-primary)", marginBottom: 4 }}>
          Oi, {(professional.nome ?? "").split(" ")[0] || "você"}! 👋
        </p>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 16 }}>
          {jobs.length > 0
            ? `Tem ${jobs.length} vaga${jobs.length > 1 ? "s" : ""} esperando você hoje.`
            : "A gente tá de olho em vagas pra você."}
        </p>

        {/* Isso é sucesso — os 3 pilares que fazem o perfil ser notado e
            chamado: perfil completo, certificado e prova social. Os 3 cards
            abaixo (perfil/certificados/depoimentos) vivem sob esse guarda-chuva,
            mesmo sem um card visual único agrupando — a repetição do estilo já
            comunica que são a mesma "categoria" de ação. */}
        <p style={{ font: "700 12px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Isso é sucesso
        </p>

        {/* Perfil incompleto — card de destaque: é a ação de maior impacto pra
            ela ser chamada, então ganha peso visual e CTA explícito */}
        {perfilPct < 100 && (
          <Link href="/dashboard/profissional/perfil" style={{
            display: "block", textDecoration: "none", marginBottom: 20,
            background: "linear-gradient(135deg, var(--brand-magenta-50), var(--surface-card))",
            border: "1.5px solid var(--brand-magenta-100)",
            borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <svg width="60" height="60" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-card)" strokeWidth="4.5" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-brand-primary)" strokeWidth="4.5"
                  strokeLinecap="round" strokeDasharray={`${(perfilPct / 100) * 100.5} 100.5`}
                  transform="rotate(-90 20 20)" />
                <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-brand-primary)">
                  {perfilPct}%
                </text>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ font: "800 18px/1.25 var(--font-display)", color: "var(--text-primary)", marginBottom: 4 }}>
                  Complete seu perfil
                </p>
                <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {faltando.length === 1
                    ? `Falta só ${faltando[0].toLowerCase()} — perfil completo é chamado primeiro`
                    : `Faltam ${faltando.length} itens — perfil completo é chamado primeiro`}
                </p>
              </div>
            </div>
            <div style={{
              marginTop: 14, height: 46, borderRadius: "var(--radius-pill)",
              background: "var(--color-brand-primary)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              font: "700 15px/1 var(--font-body)", boxShadow: "var(--shadow-xs)",
            }}>
              Completar meu perfil <i className="ph-bold ph-arrow-right" style={{ fontSize: 15 }}></i>
            </div>
          </Link>
        )}

        {/* Certificados — destaque proposital: dado real mostra que quem termina
            uma trilha bate no paywall quase toda vez, o maior sinal de intenção
            de compra do produto hoje. Some quando os 3 já foram conquistados. */}
        {certificadosConquistados < trilhasTotal && (
          <Link href="/dashboard/profissional/quiz" style={{
            display: "block", textDecoration: "none", marginBottom: 20,
            background: "var(--surface-card)", border: "1.5px solid var(--brand-magenta-100)",
            borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
                background: temTrilhaPendenteDeResgate
                  ? "linear-gradient(135deg, #DC00DC, #ffb020)"
                  : "var(--brand-magenta-50)",
                color: temTrilhaPendenteDeResgate ? "#fff" : "var(--color-brand-primary)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                <i className="ph-fill ph-medal"></i>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ font: "700 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                  {temTrilhaPendenteDeResgate
                    ? "Sua trilha está completa! 🎉"
                    : trilhaEmAndamento
                      ? "Continue sua trilha"
                      : certificadosConquistados > 0
                        ? "Ganhe mais certificados"
                        : "Ganhe certificados grátis"}
                </p>
                <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2 }}>
                  {temTrilhaPendenteDeResgate
                    ? "Resgate seu certificado e mostre no seu perfil"
                    : trilhaEmAndamento
                      ? `${trilhaEmAndamento.titulo} — ${trilhaEmAndamento.feitos} de ${trilhaEmAndamento.total} módulos`
                      : certificadosConquistados > 0
                        ? `${certificadosConquistados} de ${trilhasTotal} conquistados — continue evoluindo`
                        : "Trilhas rápidas sobre atendimento, preço e higiene"}
                </p>
              </div>
              <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
            </div>
            {trilhaEmAndamento && (
              <div style={{ height: 6, borderRadius: 999, background: "var(--surface-sunken)", overflow: "hidden", marginTop: 12 }}>
                <div style={{
                  width: `${Math.round((trilhaEmAndamento.feitos / trilhaEmAndamento.total) * 100)}%`, height: "100%",
                  borderRadius: 999, background: "var(--color-brand-primary)",
                }} />
              </div>
            )}
          </Link>
        )}

        {/* Depoimentos — terceiro pilar de "sucesso": prova social real de
            quem já foi atendida. Pendente de aprovação é o estado de maior
            prioridade (ação real esperando), por isso ganha o destaque forte
            igual ao do certificado quando existe. */}
        <Link href="/dashboard/profissional/depoimentos" style={{
          display: "block", textDecoration: "none", marginBottom: 20,
          background: "var(--surface-card)", border: "1.5px solid var(--brand-magenta-100)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
              background: (depoimentosPendentes ?? 0) > 0
                ? "linear-gradient(135deg, #DC00DC, #ffb020)"
                : "var(--brand-magenta-50)",
              color: (depoimentosPendentes ?? 0) > 0 ? "#fff" : "var(--color-brand-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              <i className="ph-fill ph-chat-centered-text"></i>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ font: "700 15px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                {(depoimentosPendentes ?? 0) > 0
                  ? `${depoimentosPendentes} depoimento${depoimentosPendentes! > 1 ? "s" : ""} esperando aprovação`
                  : (depoimentosAprovados ?? 0) > 0
                    ? "Ganhe mais depoimentos"
                    : "Ganhe depoimentos grátis"}
              </p>
              <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2 }}>
                {(depoimentosPendentes ?? 0) > 0
                  ? "Aprove e mostre no seu perfil"
                  : (depoimentosAprovados ?? 0) > 0
                    ? `${depoimentosAprovados} no seu perfil — peça pra outro cliente avaliar`
                    : "Peça pra quem você já atendeu avaliar seu trabalho"}
              </p>
            </div>
            <i className="ph ph-caret-right" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}></i>
          </div>
        </Link>

        {/* Conquistas — deliberadamente discretas: são motivacionais, não a ação
            principal. Só ícones + contador; o nome e o "como conquistar" de cada
            uma ficam na tela de detalhe, pra onde a faixa leva ao ser tocada. */}
        <Link href="/dashboard/profissional/conquistas" style={{
          display: "block", textDecoration: "none",
          background: "var(--surface-card)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xs)", padding: "10px 0 10px 14px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, paddingRight: 14 }}>
            <i className="ph-fill ph-trophy" style={{ fontSize: 13, color: "var(--text-tertiary)" }}></i>
            <p style={{ font: "700 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", flex: 1 }}>
              Suas conquistas
            </p>
            <span style={{ font: "700 11px/1 var(--font-body)", color: "var(--text-tertiary)" }}>
              {conquistasFeitas}/{conquistas.length}
            </span>
            <i className="ph ph-caret-right" style={{ fontSize: 13, color: "var(--text-tertiary)" }}></i>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingRight: 14, WebkitOverflowScrolling: "touch" }}>
            {conquistas.map((c) => (
              <div key={c.slug} title={c.nome} style={{
                flex: "0 0 auto", width: 32, height: 32, borderRadius: "50%",
                background: c.done ? "var(--brand-magenta-50)" : "var(--surface-sunken)",
                color: c.done ? "var(--color-brand-primary)" : "var(--text-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                border: c.done ? "1px solid var(--brand-magenta-100)" : "1px dashed var(--border-default)",
                opacity: c.done ? 1 : 0.6,
              }}>
                <i className={c.done ? c.icon : "ph ph-lock-simple"}></i>
              </div>
            ))}
          </div>
        </Link>

        {/* Minhas candidaturas — o "e aí, me chamaram?" vem antes de tudo */}
        {candidaturas.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p className="section-label">Suas candidaturas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {candidaturas.map((app) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const job = app.jobs as any;
                if (!job) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const company = job.companies as any;
                const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);

                return (
                  <Link key={app.job_id} href={`/vaga/${job.slug}`} style={{ textDecoration: "none" }}>
                    <div className="job-feed-card" style={{ borderLeft: "3px solid var(--color-success-fg)" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {company?.logo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                              style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                          : <Avatar name={company?.nome_estabelecimento ?? "?"} size={40} />
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ font: "600 15px/1.2 var(--font-display)", color: "var(--text-primary)" }}>
                            {job.titulo || title}
                          </p>
                          <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 2 }}>
                            {company?.nome_estabelecimento}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span className="status-pill" style={{ background: "var(--color-success-bg)", color: "var(--color-success-fg)" }}>
                            <i className="ph-fill ph-check-circle"></i> Enviada
                          </span>
                          <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 4 }}>
                            {new Date(app.criado_em).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Vagas compatíveis — vaga nativa é o produto principal, por isso o
            selo de marca e o destaque visual mais forte que o das agregadas */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p className="section-label" style={{ margin: 0 }}>Vagas para você</p>
          {jobs.length > 0 && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, height: 23, padding: "0 8px",
              borderRadius: "var(--radius-sm)", background: "var(--brand-magenta-50)",
              color: "var(--color-brand-primary)", fontSize: 10, fontWeight: 700,
            }}>
              <i className="ph-fill ph-seal-check"></i> CarreiraBeauty
            </span>
          )}
        </div>

        {jobs.length === 0 && vagasExternasFiltradas.length === 0 ? (
          <div className="card card-xl" style={{ padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--brand-magenta-100), var(--brand-cyan-100))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>
              🔍
            </div>
            <p style={{ font: "var(--text-h2)", color: "var(--text-primary)", marginBottom: 8 }}>
              Sua vaga tá chegando! 🎉
            </p>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto 14px" }}>
              A gente já tá de olho em vagas pra você
              {professional.cidade && professional.estado ? ` em ${professional.cidade} - ${professional.estado}` : " na sua região"}.
              Assim que aparecer uma, te avisamos na hora por email!
            </p>
            {funcoes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {funcoes.map((f) => (
                  <span key={f} className="tag" style={{ background: "var(--brand-cyan-50)", color: "var(--brand-cyan-700)", border: "1px solid var(--brand-cyan-100)" }}>
                    {FUNCAO_LABEL[f] ?? f}
                  </span>
                ))}
              </div>
            )}

            {dicas.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-default)", textAlign: "left" }}>
                <DicasPerfil dicas={dicas} />
              </div>
            )}

            <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 12 }}>
              <Link href="/dashboard/profissional/perfil" style={{ color: "var(--color-brand-primary)", fontWeight: 600 }}>
                Editar especialidades
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
            {jobs.map((job) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const company = job.companies as any;
              const title = job.funcao === "outro" ? (job.funcao_outro || "Outro") : (FUNCAO_LABEL[job.funcao] ?? job.funcao);
              const empresaGeo = company?.latitude && company?.longitude
                ? { latitude: company.latitude, longitude: company.longitude }
                : null;
              const distancia = profissionalGeo && empresaGeo
                ? Math.round(distanciaKm(profissionalGeo, empresaGeo))
                : null;
              const publicadoRelativo = formatoDataRelativa(job.criado_em);

              return (
                <Link key={job.id} href={`/vaga/${job.slug}`} style={{ textDecoration: "none" }}>
                  <div className="job-feed-card" style={{
                    borderLeft: "3px solid var(--color-brand-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      {company?.logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={company.logo_url} alt={company.nome_estabelecimento}
                            style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                        : <Avatar name={company?.nome_estabelecimento ?? "?"} size={48} />
                      }
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ font: "500 11px/1 var(--font-body)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                            {company?.nome_estabelecimento}
                            {company?.cidade ? ` · ${[company.bairro, company.cidade].filter(Boolean).join(", ")} - ${company.estado}` : ""}
                          </p>
                          <p style={{ font: "600 17px/1.3 var(--font-display)", color: "var(--text-primary)" }}>
                            {job.titulo || title}
                          </p>
                        </div>
                        {job.faixa_salarial && (
                          <span className="chip" style={{ background: "var(--brand-magenta-50)", color: "var(--brand-magenta-700)", flexShrink: 0 }}>
                            <i className="ph ph-currency-circle-dollar"></i> {job.faixa_salarial}
                          </span>
                        )}
                      </div>
                    </div>

                    {job.descricao && (
                      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.descricao}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      {job.tipo_vinculo && (
                        <span className="tag"><i className="ph ph-briefcase"></i> {VINCULO_LABEL[job.tipo_vinculo] ?? job.tipo_vinculo}</span>
                      )}
                      {distancia !== null && (
                        <span className="tag"><i className="ph ph-map-pin"></i> {distancia === 0 ? "menos de 1 km" : `${distancia} km`}</span>
                      )}
                      {publicadoRelativo && (
                        <span className="tag"><i className="ph ph-clock"></i> {publicadoRelativo}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {atividades.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <AtividadeRecente eventos={atividades} maxVisivel={3} />
          </div>
        )}

        {/* Vagas agregadas (Adzuna) — continuam na mesma lista, só com um divisor
            sutil de origem em vez de uma segunda seção com título próprio */}
        {vagasExternasFiltradas.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 12px" }}>
              <span style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
              <a href="https://www.adzuna.com.br" target="_blank" rel="noopener noreferrer" style={{
                fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textDecoration: "none",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                de outros sites · Jobs by Adzuna
              </a>
              <span style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
            </div>
            <VagasExternasLista vagas={vagasExternasFiltradas} professionalId={professional.id} maxVisivel={3} />
          </div>
        )}

      </main>
    </div>
  );
}

function DicasPerfil({ dicas }: { dicas: { texto: string; icon: string }[] }) {
  return (
    <>
      <p style={{ font: "700 13px/1 var(--font-display)", color: "var(--text-primary)", marginBottom: 12, textAlign: "center" }}>
        Capricha aqui pra se destacar mais 👇
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dicas.map((dica) => (
          <Link key={dica.texto} href="/dashboard/profissional/perfil" style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
            background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "10px 14px",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "var(--brand-magenta-50)", color: "var(--color-brand-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>
              <i className={dica.icon}></i>
            </span>
            <span style={{ font: "600 13px/1.3 var(--font-body)", color: "var(--text-primary)" }}>{dica.texto}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
