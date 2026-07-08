import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-rose-600 mb-1">
          CarreiraBeauty
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Bem-vindo(a)! Você está logado(a).
        </p>
        <div className="bg-rose-50 rounded-xl p-4 mb-6 text-left text-sm space-y-1">
          <p>
            <span className="text-gray-400">Email:</span>{" "}
            <span className="font-medium text-gray-700">{user.email}</span>
          </p>
          {profile?.tipo && (
            <p>
              <span className="text-gray-400">Tipo:</span>{" "}
              <span className="font-medium text-gray-700 capitalize">
                {profile.tipo}
              </span>
            </p>
          )}
        </div>
        <LogoutButton />
      </div>
    </main>
  );
}
