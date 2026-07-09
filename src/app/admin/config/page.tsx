import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ConfigList from "./ConfigList";
import HabilidadesConfig from "./HabilidadesConfig";
import {
  addProfissao, toggleProfissao, renameProfissao, deleteProfissao,
  addCategoriaNegocio, toggleCategoriaNegocio, renameCategoriaNegocio, deleteCategoriaNegocio,
  addHabilidade, toggleHabilidade, renameHabilidade, deleteHabilidade,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = await createClient();

  const [{ data: profissoes }, { data: categorias }, { data: habilidades }] = await Promise.all([
    supabase.from("profissoes").select("id, nome, ativo, ordem").order("ordem"),
    supabase.from("categorias_negocio").select("id, nome, ativo, ordem").order("ordem"),
    supabase.from("habilidades").select("id, nome, ativo, ordem, profissao").order("profissao, ordem"),
  ]);

  const profissaoNomes = (profissoes ?? []).filter((p) => p.ativo).map((p) => p.nome);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ color: "var(--text-tertiary)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>
          Configurações
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        <ConfigList
          title="Profissões"
          items={profissoes ?? []}
          onAdd={addProfissao}
          onToggle={toggleProfissao}
          onRename={renameProfissao}
          onDelete={deleteProfissao}
        />
        <ConfigList
          title="Tipos de negócio"
          items={categorias ?? []}
          onAdd={addCategoriaNegocio}
          onToggle={toggleCategoriaNegocio}
          onRename={renameCategoriaNegocio}
          onDelete={deleteCategoriaNegocio}
        />
        <HabilidadesConfig
          items={habilidades ?? []}
          profissoes={profissaoNomes}
          onAdd={addHabilidade}
          onToggle={toggleHabilidade}
          onRename={renameHabilidade}
          onDelete={deleteHabilidade}
        />
      </div>
    </div>
  );
}
