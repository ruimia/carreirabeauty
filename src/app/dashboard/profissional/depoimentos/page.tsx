export const dynamic = "force-dynamic";

export const metadata = { title: "Depoimentos" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VoltarLink from "@/components/VoltarLink";
import CompartilharLink from "./CompartilharLink";
import ModerarBotoes from "./ModerarBotoes";

export default async function DepoimentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!professional) redirect("/onboarding/tipo");

  const { data: depoimentos } = await supabase
    .from("depoimentos")
    .select("id, nome_cliente, telefone_cliente, estrelas, texto, status, criado_em")
    .eq("professional_id", professional.id)
    .order("criado_em", { ascending: false });

  const pendentes = (depoimentos ?? []).filter((d) => d.status === "pendente");
  const aprovados = (depoimentos ?? []).filter((d) => d.status === "aprovado");
  const rejeitados = (depoimentos ?? []).filter((d) => d.status === "rejeitado");

  return (
    <div>
      <main className="page-x" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <VoltarLink fallbackHref="/dashboard/profissional/crescer" />
          <p style={{ font: "600 16px/1.3 var(--font-display)", color: "var(--text-primary)" }}>Depoimentos</p>
        </div>
        <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
          Peça pra quem você atendeu deixar um depoimento — ele aparece no seu perfil assim que você aprovar.
        </p>

        {professional.slug && <CompartilharLink slug={professional.slug} />}

        {pendentes.length > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 24 }}>Aguardando sua aprovação ({pendentes.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {pendentes.map((d) => <DepoimentoCard key={d.id} d={d} pendente />)}
            </div>
          </>
        )}

        <p className="section-label" style={{ marginTop: pendentes.length > 0 ? 0 : 24 }}>
          No seu perfil ({aprovados.length})
        </p>
        {aprovados.length === 0 ? (
          <div className="card card-xl" style={{ padding: "24px 20px", textAlign: "center", marginBottom: 24 }}>
            <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)" }}>
              Nenhum depoimento aprovado ainda. Compartilhe seu link acima!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {aprovados.map((d) => <DepoimentoCard key={d.id} d={d} />)}
          </div>
        )}

        {rejeitados.length > 0 && (
          <>
            <p className="section-label">Rejeitados ({rejeitados.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rejeitados.map((d) => <DepoimentoCard key={d.id} d={d} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DepoimentoCard({ d, pendente }: {
  d: { id: string; nome_cliente: string; telefone_cliente: string; estrelas: number; texto: string; status: string };
  pendente?: boolean;
}) {
  return (
    <div className="job-feed-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className="ph-fill ph-star" style={{ fontSize: 14, color: n <= d.estrelas ? "#ffb020" : "var(--surface-sunken)" }}></i>
          ))}
        </div>
        {d.status === "rejeitado" && (
          <span className="tag" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-fg)" }}>Rejeitado</span>
        )}
      </div>
      <p style={{ font: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>&ldquo;{d.texto}&rdquo;</p>
      <div>
        <p style={{ font: "700 13px/1 var(--font-body)", color: "var(--text-primary)" }}>{d.nome_cliente}</p>
        <p style={{ font: "var(--text-caption)", color: "var(--text-tertiary)", marginTop: 2 }}>{d.telefone_cliente}</p>
      </div>
      {pendente && <ModerarBotoes depoimentoId={d.id} />}
    </div>
  );
}
