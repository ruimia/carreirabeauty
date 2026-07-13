const TZ = "America/Sao_Paulo";

/** Formata uma data (UTC ou qualquer offset) como YYYY-MM-DD no horário de São Paulo. */
export function toSaoPauloDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** ISO instant correspondente à meia-noite de hoje em São Paulo. */
export function saoPauloStartOfTodayISO(): string {
  return new Date(`${toSaoPauloDay(new Date())}T00:00:00-03:00`).toISOString();
}

/** ISO instant correspondente ao início do mês atual (dia 1, meia-noite) em São Paulo. */
export function saoPauloStartOfMonthISO(): string {
  const [year, month] = toSaoPauloDay(new Date()).split("-");
  return new Date(`${year}-${month}-01T00:00:00-03:00`).toISOString();
}
