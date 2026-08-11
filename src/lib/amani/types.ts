export type AmaniRole = "user" | "assistant";

export interface AmaniHistoryTurn {
  role: AmaniRole;
  content: string;
}

export interface AmaniMessage {
  id: string;
  role: AmaniRole;
  content: string;
  createdAt: number;
  premium?: AmaniPremium;
  toolUsed?: string;
  pdfUrl?: string;
  emailTo?: string;
  pdfStatus?: "idle" | "preparing" | "downloaded" | "emailed" | "error";
  pdfStatusText?: string;
}

export interface AmaniPremiumLine {
  label?: string;
  amount?: number;
  formatted?: string;
  [key: string]: unknown;
}

export interface AmaniPremium {
  class?: string;
  cover?: string;
  lines?: AmaniPremiumLine[];
  net_premium?: number;
  total?: number;
  total_formatted?: string;
  [key: string]: unknown;
}

export interface AmaniPdfHeader {
  sn?: string;
  date?: string;
  proposer?: string;
  location?: string;
  occupation?: string;
  intermediary?: string;
}

export interface AmaniPdfRequest {
  filename?: string;
  header: AmaniPdfHeader;
  schedules: Record<string, unknown>[];
}

export interface AmaniChatRequest {
  message: string;
  history: AmaniHistoryTurn[];
  context?: Record<string, unknown>;
  /** Stable per-visitor id (localStorage) — server keys conversation memory by it. */
  session_id?: string;
}

export interface AmaniChatContext {
  pathname?: string;
  url?: string;
  formState?: Record<string, unknown>;
}

export interface AmaniChatResponse {
  reply: string;
  premium?: AmaniPremium;
  tool_used?: string;
  pdf_request?: AmaniPdfRequest;
  pdf_url?: string;
  email_to?: string;
}
