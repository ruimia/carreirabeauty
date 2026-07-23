import { createClient } from "@supabase/supabase-js";

// Client anônimo (sem ler cookies) pra páginas públicas que não dependem de
// sessão — o client de `server.ts` chama cookies() do Next, o que força a
// rota inteira a renderizar dinâmica (desliga cache do Vercel/Cloudflare)
// mesmo quando a query em si não precisa de auth.uid(). Este client evita
// isso, mantendo a mesma RLS de visitante anônimo (chave anon, sem sessão).
// `export const revalidate` só cacheia dados vindos de fetch() com semântica
// de cache do Next — o supabase-js não marca suas próprias requisições assim,
// então sem isso a página fica sem nada cacheável e volta a renderizar 100%
// dinâmica a cada visita, mesmo com revalidate definido na página.
export function createPublicClient(revalidateSeconds = 300) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: revalidateSeconds } }),
      },
    }
  );
}
