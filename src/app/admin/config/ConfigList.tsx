"use client";

import { useState, useTransition } from "react";

interface Item { id: string; nome: string; ativo: boolean; }

interface Props {
  title: string;
  items: Item[];
  onAdd: (nome: string) => Promise<void>;
  onToggle: (id: string, ativo: boolean) => Promise<void>;
  onRename: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ConfigList({ title, items, onAdd, onToggle, onRename, onDelete }: Props) {
  const [newNome, setNewNome] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [, startTransition] = useTransition();

  function handleAdd() {
    if (!newNome.trim()) return;
    startTransition(async () => { await onAdd(newNome); setNewNome(""); });
  }

  function startEdit(item: Item) { setEditingId(item.id); setEditNome(item.nome); }

  function handleRename(id: string) {
    if (!editNome.trim()) return;
    startTransition(async () => { await onRename(id, editNome); setEditingId(null); });
  }

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 20 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", marginBottom: 16 }}>
        {title} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-tertiary)" }}>({items.length})</span>
      </h2>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {items.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "12px 0" }}>Nenhum item ainda.</p>
        )}
        {items.map((item) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", borderRadius: "var(--radius-md)",
            background: item.ativo ? "var(--surface-page)" : "var(--neutral-100)",
            border: "1px solid var(--border-default)",
            opacity: item.ativo ? 1 : 0.55,
          }}>
            {editingId === item.id ? (
              <>
                <input value={editNome} onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(item.id); if (e.key === "Escape") setEditingId(null); }}
                  autoFocus style={{
                    flex: 1, height: 32, padding: "0 8px", borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-brand-primary)", outline: "none",
                    fontFamily: "var(--font-body)", fontSize: 14,
                  }} />
                <Btn onClick={() => handleRename(item.id)} color="var(--color-brand-primary)">Salvar</Btn>
                <Btn onClick={() => setEditingId(null)} color="var(--text-tertiary)">Cancelar</Btn>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 14, color: "var(--text-primary)" }}>{item.nome}</span>
                <Btn onClick={() => startEdit(item)} color="var(--text-secondary)">Renomear</Btn>
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
      </div>

      {/* Adicionar */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={newNome} onChange={(e) => setNewNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Novo item..." style={{
            flex: 1, height: 38, padding: "0 12px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)", outline: "none",
            fontFamily: "var(--font-body)", fontSize: 14, background: "var(--surface-card)",
          }} />
        <button onClick={handleAdd} disabled={!newNome.trim()} style={{
          height: 38, padding: "0 16px", borderRadius: "var(--radius-md)",
          border: "none", background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          opacity: newNome.trim() ? 1 : 0.4,
        }}>+ Adicionar</button>
      </div>
    </div>
  );
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, fontWeight: 600, color, background: "none", border: "none",
      cursor: "pointer", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}
