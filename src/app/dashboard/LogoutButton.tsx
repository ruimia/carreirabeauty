"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-rose-500 transition"
      >
        Sair
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full border border-rose-200 text-rose-600 font-semibold rounded-xl py-3 hover:bg-rose-50 transition"
    >
      Sair
    </button>
  );
}
