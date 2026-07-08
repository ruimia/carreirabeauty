"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-rose-600 mb-2">
            Verifique seu email
          </h1>
          <p className="text-gray-600">
            Enviamos um link de acesso para{" "}
            <span className="font-medium">{email}</span>. Clique no link para
            entrar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-rose-600 mb-1">
          CarreiraBeauty
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Conectando profissionais e estabelecimentos de beleza
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.5 42.7 14.7 48 24 48z"/><path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.6C1 17.3 0 20.5 0 24s1 6.7 2.6 9.8l8.2-5z"/><path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.5 0 24 0 14.7 0 6.5 5.3 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/></svg>
          Entrar com Google
        </button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de acesso"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Receba um link por email para entrar sem senha.
        </p>
      </div>
    </main>
  );
}
