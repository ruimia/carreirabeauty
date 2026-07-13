"use client";

import { useEffect, useRef, useState } from "react";

export default function PdfPageViewer({ src }: { src: string }) {
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

        for (let i = 1; i <= pdf.numPages; i++) {
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
  }, [src]);

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>
        Não foi possível carregar o conteúdo. Tente novamente em instantes.
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
