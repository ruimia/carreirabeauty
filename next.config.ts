import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Arquivos soltos em /public (logo, favicon) saem do Vercel com
  // Cache-Control: max-age=0 por padrão — isso faz o Cloudflare (e qualquer
  // cache no meio) tratar como "não guarde", batendo no Vercel toda vez.
  // Como são poucos arquivos e mudam raramente, força cache longo aqui;
  // se o logo mudar de verdade, troca o nome do arquivo pra invalidar.
  async headers() {
    return [
      {
        source: "/:path(logo-square\\.jpg|logo\\.png|favicon\\.ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
