// Muita gente cola a URL inteira do perfil (https://www.instagram.com/fulana/,
// instagram.com/fulana?hl=en, m.instagram.com/fulana/tagged/...) em vez de só
// o @handle — guardar isso sem normalizar quebra o link montado como
// `instagram.com/${valor}` (vira instagram.com/https://instagram.com/fulana).
// Normaliza pra sempre guardar só o handle puro, não importa o que foi colado.
export function normalizeInstagramHandle(input: string): string {
  let v = (input ?? "").trim();
  if (!v) return "";

  v = v.replace(/^https?:\/\//i, "");
  v = v.replace(/^(www\.|m\.)?instagram\.com\/?/i, "");
  v = v.split(/[?#]/)[0];
  v = v.replace(/^\/+/, "").split("/")[0];
  v = v.replace(/^@+/, "");

  return v.trim();
}
