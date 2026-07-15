"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PdfPageViewer({ src, locked = false }: { src: string; locked?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjsLib.getDocument({ url: src }).promise;
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";

        // Preview parcial pra quem não é PRO — só as primeiras páginas, o
        // resto fica escondido atrás do véu escuro (evita baixar o PDF
        // inteiro à toa pra quem nunca vai passar do véu).
        const ultimaPagina = locked ? Math.min(pdf.numPages, 2) : pdf.numPages;

        for (let i = 1; i <= ultimaPagina; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const containerWidth = containerRef.current.clientWidth || 800;
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          containerRef.current.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [src, locked]);

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>
        Não foi possível carregar o conteúdo. Tente novamente em instantes.
      </div>
    );
  }

  if (!locked) {
    return <div ref={containerRef} style={{ width: "100%" }} />;
  }

  return (
    <div style={{ position: "relative", maxHeight: "100vh", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: "55%",
        background: "linear-gradient(to bottom, transparent, rgba(10,10,15,0.94) 55%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
        gap: 14, padding: "0 20px 32px",
      }}>
        <p style={{ font: "700 16px/1.4 var(--font-display)", color: "#fff", textAlign: "center", maxWidth: 320 }}>
          Vire PRO pra continuar lendo 🔒
        </p>
        <Link href="/dashboard/profissional/planos" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          height: 48, padding: "0 28px", borderRadius: "var(--radius-pill)",
          background: "var(--color-brand-primary)", color: "#fff",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, textDecoration: "none",
        }}>
          Ver planos PRO
        </Link>
      </div>
    </div>
  );
}
