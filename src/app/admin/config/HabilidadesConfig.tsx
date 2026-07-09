"use client";

import { useState, useTransition } from "react";

interface Habilidade { id: string; nome: string; ativo: boolean; profissao: string | null; }

interface Props {
  items: Habilidade[];
  profissoes: string[];
  onAdd: (nome: string, profissao: string) => Promise<void>;
  onToggle: (id: string, ativo: boolean) => Promise<void>;
  onRename: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function HabilidadesConfig({ items, profissoes, onAdd, onToggle, onRename, onDelete }: Props) {
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [adding, setAdding] = useState<string | null>(null); // profissao being added to
  const [newNome, setNewNome] = useState("");

  function handleRename(id: string) {
    if (!editNome.trim()) return;
    startTransition(async () => { await onRename(id, editNome); setEditingId(null); });
  }

  function handleAdd(profissao: string) {
    if (!newNome.trim()) return;
    startTransition(async () => { await onAdd(newNome, profissao); setNewNome(""); setAdding(null); });
  }

  // Group by profissao
  const grupos: Record<string, Habilidade[]> = {};
  for (const h of items) {
    const key = h.profissao ?? "Geral";
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(h);
  }

  // Order: profissoes first, then anything else
  const ordem = [...profissoes, ...Object.keys(grupos).filter((k) => !profissoes.includes(k))];
  // include profissoes with no habilidades yet
  for (const p of profissoes) { if (!grupos[p]) grupos[p] = []; }

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 20 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", marginBottom: 20 }}>
        Habilidades <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-tertiary)" }}>({items.length})</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {ordem.map((prof) => {
          const list = grupos[prof] ?? [];
          const isAdding = adding === prof;
          return (
            <div key={prof}>
              {/* Profissão header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-brand-primary)", fontFamily: "var(--font-body)" }}>
                  {prof}
                </p>
                <button onClick={() => { setAdding(isAdding ? null : prof); setNewNome(""); }} style={{
                  fontSize: 12, fontWeight: 600, color: "var(--color-brand-primary)", background: "none", border: "none", cursor: "pointer",
                }}>
                  {isAdding ? "Cancelar" : "+ Adicionar"}
                </button>
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {list.length === 0 && !isAdding && (
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "6px 0" }}>Nenhuma habilidade nesta categoria.</p>
                )}
                {list.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: "var(--radius-md)",
                    background: item.ativo ? "var(--surface-page)" : "var(--neutral-100)",
                    border: "1px solid var(--border-default)", opacity: item.ativo ? 1 : 0.55,
                  }}>
                    {editingId === item.id ? (
                      <>
                        <input value={editNome} onChange={(e) => setEditNome(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRename(item.id); if (e.key === "Escape") setEditingId(null); }}
                          autoFocus style={{ flex: 1, height: 30, padding: "0 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-brand-primary)", outline: "none", fontFamily: "var(--font-body)", fontSize: 13 }} />
                        <Btn onClick={() => handleRename(item.id)} color="var(--color-brand-primary)">Salvar</Btn>
                        <Btn onClick={() => setEditingId(null)} color="var(--text-tertiary)">✕</Btn>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>{item.nome}</span>
                        <Btn onClick={() => { setEditingId(item.id); setEditNome(item.nome); }} color="var(--text-secondary)">Renomear</Btn>
                        <Btn onClick={() => startTransition(async () => onToggle(item.id, !item.ativo))}
                          color={item.ativo ? "var(--color-warning-fg)" : "var(--color-success-fg)"}>
                          {item.ativo ? "Desativar" : "Ativar"}
                        </Btn>
                        <Btn onClick={() => { if (confirm(`Excluir "${item.nome}"?`)) startTransition(async () => onDelete(item.id)); }}
                          color="var(--color-danger-fg)">Excluir</Btn>
                      </>
                    )}
                  </div>
                ))}

                {/* Inline add form */}
                {isAdding && (
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <input value={newNome} onChange={(e) => setNewNome(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd(prof)}
                      autoFocus placeholder={`Nova habilidade em ${prof}…`}
                      style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", outline: "none", fontFamily: "var(--font-body)", fontSize: 13, background: "var(--surface-card)" }} />
                    <button onClick={() => handleAdd(prof)} disabled={!newNome.trim()} style={{
                      height: 36, padding: "0 14px", borderRadius: "var(--radius-md)", border: "none",
                      background: "var(--color-brand-primary)", color: "#fff",
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                      opacity: newNome.trim() ? 1 : 0.4,
                    }}>Adicionar</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, fontWeight: 600, color, background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}
