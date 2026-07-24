import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas — redireciona para /login se não autenticado. Onboarding
  // exige login antes de começar (mesma regra que já existia dentro de cada
  // page.tsx) — mover pra cá evita rodar a Function inteira só pra descobrir
  // isso, o que importa porque bots batem bastante nesses paths ignorando o
  // robots.txt.
  if (!user && (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboarding/profissional") ||
    request.nextUrl.pathname.startsWith("/onboarding/empresa")
  )) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redireciona usuário logado para o dashboard se tentar acessar /login ou a home
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/", "/onboarding/profissional/:path*", "/onboarding/empresa/:path*"],
};
