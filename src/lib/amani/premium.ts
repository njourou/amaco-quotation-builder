import type { AmaniPremium, AmaniPremiumLine } from "./types";

function normalizePremiumLine(line: unknown): AmaniPremiumLine | null {
  if (Array.isArray(line) && line.length >= 2) {
    const label = String(line[0] ?? "").trim();
    const amount = Number(line[1]);
    if (!label) return null;
    return {
      label,
      amount: Number.isFinite(amount) ? amount : undefined,
    };
  }

  if (!line || typeof line !== "object") return null;

  const record = line as Record<string, unknown>;
  const label = String(record.label ?? record.name ?? "").trim();
  if (!label) return null;

  return {
    label,
    amount: typeof record.amount === "number" ? record.amount : undefined,
    formatted: typeof record.formatted === "string" ? record.formatted : undefined,
  };
}

export function normalizePremium(value: unknown): AmaniPremium | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  const rawLines = record.lines;

  const lines = Array.isArray(rawLines)
    ? rawLines
        .map(normalizePremiumLine)
        .filter((line): line is AmaniPremiumLine => line !== null)
    : undefined;

  return {
    class: typeof record.class === "string" ? record.class : undefined,
    cover: typeof record.cover === "string" ? record.cover : undefined,
    lines,
    net_premium: typeof record.net_premium === "number" ? record.net_premium : undefined,
    total: typeof record.total === "number" ? record.total : undefined,
    total_formatted:
      typeof record.total_formatted === "string" ? record.total_formatted : undefined,
  };
}

export function replyHasMarkdownTable(content: string): boolean {
  const lines = content.split("\n").map((line) => line.trim());
  let pipeRows = 0;

  for (const line of lines) {
    if (line.startsWith("|") && line.endsWith("|")) {
      pipeRows += 1;
    } else if (pipeRows >= 2) {
      return true;
    } else {
      pipeRows = 0;
    }
  }

  return pipeRows >= 2;
}

export function shouldShowPremiumCard(content: string, premium?: AmaniPremium): boolean {
  if (!premium) return false;
  if (replyHasMarkdownTable(content)) return false;

  const hasLines = Array.isArray(premium.lines) && premium.lines.length > 0;
  const hasTotal =
    Boolean(premium.total_formatted) ||
    typeof premium.total === "number" ||
    typeof premium.net_premium === "number";

  return hasLines || hasTotal;
}
