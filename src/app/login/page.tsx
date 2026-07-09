"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleGoogle() {
    setLoading(true);
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h1 style={styles.h1}>Verifique seu e-mail</h1>
          <p style={{ ...styles.body, color: "var(--text-secondary)", marginTop: 8 }}>
            Enviamos um link de acesso para{" "}
            <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
            Clique no link para entrar.
          </p>
          <button onClick={() => setSent(false)} style={{ ...styles.btnGhost, marginTop: 24 }}>
            Usar outro e-mail
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="CarreiraBeauty" style={{ height: 48, objectFit: "contain", marginBottom: 8 }} />
        <p style={{ ...styles.caption, marginBottom: 32 }}>
          Conectando profissionais e estabelecimentos de beleza
        </p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={styles.btnGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.5 42.7 14.7 48 24 48z"/>
            <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.6C1 17.3 0 20.5 0 24s1 6.7 2.6 9.8l8.2-5z"/>
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.5 0 24 0 14.7 0 6.5 5.3 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
          </svg>
          Entrar com Google
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>ou entre com e-mail</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Magic link form */}
        <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={styles.label}>
            E-mail
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </label>

          {error && (
            <p style={{ fontSize: 13, color: "var(--color-danger-fg)", background: "var(--color-danger-bg)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={styles.btnPrimary}>
            {loading ? "Enviando…" : "Receber link de acesso"}
          </button>
        </form>

        <p style={{ ...styles.caption, marginTop: 24, textAlign: "center" }}>
          Ao entrar, você concorda com nossos{" "}
          <Link href="/termos" style={{ color: "var(--text-link)" }}>Termos</Link>
          {" "}e{" "}
          <Link href="/privacidade" style={{ color: "var(--text-link)" }}>Privacidade</Link>.
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface-accent)",
    padding: "24px var(--space-page-x)",
  },
  card: {
    background: "var(--surface-card)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-md)",
    padding: "40px 32px",
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
  },
  h1: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 24,
    color: "var(--text-primary)",
  },
  body: {
    fontFamily: "var(--font-body)",
    fontSize: 15,
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--text-tertiary)",
    lineHeight: 1.4,
  },
  label: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  input: {
    height: 48,
    padding: "0 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    background: "var(--surface-card)",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    color: "var(--text-primary)",
    outline: "none",
    width: "100%",
  },
  btnPrimary: {
    height: 48,
    borderRadius: "var(--radius-pill)",
    border: "none",
    background: "var(--color-brand-primary)",
    color: "#fff",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    transition: "background var(--duration-fast) var(--ease-standard)",
  },
  btnGoogle: {
    height: 48,
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-default)",
    background: "var(--surface-card)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "background var(--duration-fast) var(--ease-standard)",
  },
  btnGhost: {
    height: 44,
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-default)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--border-default)",
    display: "block",
  },
  dividerText: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-tertiary)",
    whiteSpace: "nowrap" as const,
  },
};
