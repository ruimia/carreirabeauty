import type { Metadata } from "next";
import "./globals.css";
import { APP_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | CarreiraBeauty",
    default: "CarreiraBeauty — Empregos em beleza",
  },
  description: "Conectando profissionais e estabelecimentos de beleza",
  icons: { icon: "/logo-square.jpg" },
  openGraph: {
    siteName: "CarreiraBeauty",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary" },
};

const GTM_ID = "GTM-KTDFWTMG";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Phosphor Icons */}
        <script src="https://unpkg.com/@phosphor-icons/web@2.1.1" async />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');` }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* GTM noscript fallback */}
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
        </noscript>
        {children}
      </body>
    </html>
  );
}
