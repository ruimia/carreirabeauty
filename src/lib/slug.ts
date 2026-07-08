export function buildSlug(nome: string, cidade: string): string {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  return `${normalize(nome)}-${normalize(cidade)}`;
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}
