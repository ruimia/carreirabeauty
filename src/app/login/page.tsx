"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

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
