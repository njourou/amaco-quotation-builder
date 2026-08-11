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

export interface AmaniChatRequest {
  message: string;
  history?: AmaniHistoryTurn[];
  context?: AmaniChatContext;
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
}
