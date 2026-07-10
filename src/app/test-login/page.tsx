"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";


const USERS = [
  {
    email: "empresa@teste.cb",
    label: "Empresa",
    description: "Salão Teste Belle — plano Plus, 3 vagas",
    icon: "🏪",
    redirect: "/dashboard/empresa",
  },
  {
    email: "profissional@teste.cb",
    label: "Profissional",
    description: "Ana Carolina — cabeleireira, plano Grátis",
    icon: "💅",
    redirect: "/dashboard/profissional",
  },
];

const SENHA = "teste123";

export default function TestLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function login(user: (typeof USERS)[0]) {
    setLoading(user.email);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: SENHA,
    });
    if (err) {
      setError(`${err.message} — rode: node scripts/seed-test-users.mjs`);
      setLoading(null);
      return;
    }
    router.push(user.redirect);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f4f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#e11d48", marginBottom: 6 }}>
            DEV ONLY
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>
            Login de Teste
          </h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
            Acesso rápido aos usuários de seed
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {USERS.map((user) => (
            <button
              key={user.email}
              onClick={() => login(user)}
              disabled={loading !== null}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading && loading !== user.email ? 0.5 : 1,
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 32 }}>{user.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
                  {loading === user.email ? "Entrando…" : user.label}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {user.description}
                </div>
                <div style={{ fontSize: 11, color: "#bbb", marginTop: 2, fontFamily: "monospace" }}>
                  {user.email}
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#ccc" }}>→</span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            fontSize: 13,
            color: "#dc2626",
          }}>
            {error}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: 24 }}>
          Senha de todos os usuários: <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>{SENHA}</code>
        </p>
      </div>
    </div>
  );
}
