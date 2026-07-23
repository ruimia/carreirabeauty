import type { Metadata } from "next";
import EntradaContent from "@/components/EntradaContent";
import { APP_URL } from "@/lib/seo";

// Página 100% estática — destino dos redirects 301 do Cloudflare pra
// subdomínios antigos, pra não bater na home dinâmica.
const DESCRIPTION = "Empregos, freelas e diárias em beleza, estética e bem-estar. Cabeleireiro(a), manicure, esteticista, maquiador(a) e mais — cadastro grátis, matching por região.";

export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}/entrada` },
  openGraph: { title: "CarreiraBeauty — Empregos e freelas em beleza", description: DESCRIPTION, url: `${APP_URL}/entrada`, type: "website" },
};

export default function EntradaPage() {
  return <EntradaContent />;
}
