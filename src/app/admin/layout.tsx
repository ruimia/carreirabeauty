import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const nav = [
    { href: "/admin", label: "Visão geral" },
    { href: "/admin/assinaturas", label: "Assinaturas" },
    { href: "/admin/empresas", label: "Empresas" },
    { href: "/admin/profissionais", label: "Profissionais" },
    { href: "/admin/vagas", label: "Vagas" },
    { href: "/admin/candidaturas", label: "Candidaturas" },
    { href: "/admin/conteudo", label: "Conteúdo" },
    { href: "/admin/vagas-externas", label: "Vagas externas" },
    { href: "/admin/config", label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-square.jpg" alt="CarreiraBeauty" className="w-7 h-7 rounded-md object-cover" />
          <span className="font-bold text-rose-600 hidden sm:inline">Admin</span>
          <nav className="hidden sm:flex gap-4">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className="text-sm text-gray-500 hover:text-rose-500 transition">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Sair do admin
        </Link>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-100 px-4 py-2 flex gap-3 overflow-x-auto">
        {nav.map((n) => (
          <Link key={n.href} href={n.href}
            className="text-sm text-gray-500 hover:text-rose-500 whitespace-nowrap transition">
            {n.label}
          </Link>
        ))}
      </div>

      <main className="p-4 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
