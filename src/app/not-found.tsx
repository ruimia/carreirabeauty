import type { Metadata } from "next";
import EntradaContent from "@/components/EntradaContent";

// 404 customizado — reaproveita a mesma LP estática de /entrada, com um
// aviso no topo, em vez do 404 em branco padrão do Next.
export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const banner = (
    <div style={{ background: "var(--brand-magenta-50)", borderBottom: "1px solid var(--brand-magenta-100)", padding: "14px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-magenta-700)", margin: 0 }}>
        😕 Essa página não existe ou mudou de endereço. Mas o CarreiraBeauty continua aqui:
      </p>
    </div>
  );

  return <EntradaContent banner={banner} />;
}
