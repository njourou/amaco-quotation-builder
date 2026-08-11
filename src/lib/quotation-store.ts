import type { QuotationState, RecentQuotation } from "@/lib/types";

const DRAFT_KEY = "amaco:quotation:draft";
const SAVED_KEY = "amaco:quotation:saved";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

export function loadDraft(): QuotationState | null {
  return read<QuotationState | null>(DRAFT_KEY, null);
}

export function saveDraft(state: QuotationState): void {
  write(DRAFT_KEY, state);
}

export function clearDraft(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // no-op
  }
}

export function listSavedQuotes(): RecentQuotation[] {
  const list = read<RecentQuotation[]>(SAVED_KEY, []);
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export interface SaveQuoteInput {
  id: string;
  clientName: string;
  productName: string;
  totalPremium: number;
  updatedAt: string;
  status?: RecentQuotation["status"];
}

export function saveQuote(input: SaveQuoteInput): RecentQuotation {
  const entry: RecentQuotation = {
    id: input.id,
    clientName: input.clientName || "Untitled client",
    productName: input.productName || "Quotation",
    totalPremium: input.totalPremium,
    updatedAt: input.updatedAt,
    status: input.status ?? "draft",
  };
  const list = read<RecentQuotation[]>(SAVED_KEY, []);
  const next = [entry, ...list.filter((q) => q.id !== entry.id)];
  write(SAVED_KEY, next);
  return entry;
}

export function deleteSavedQuote(id: string): void {
  const list = read<RecentQuotation[]>(SAVED_KEY, []);
  write(
    SAVED_KEY,
    list.filter((q) => q.id !== id),
  );
}
