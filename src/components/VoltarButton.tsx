"use client";

import { useRouter } from "next/navigation";

export default function VoltarButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button onClick={handleClick} style={{
      fontSize: 22, color: "var(--text-tertiary)", background: "none", border: "none",
      cursor: "pointer", lineHeight: 1, padding: 0,
    }}>
      ←
    </button>
  );
}
