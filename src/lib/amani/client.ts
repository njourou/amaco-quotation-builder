import type {
  AmaniChatRequest,
  AmaniChatResponse,
  AmaniHistoryTurn,
  AmaniPdfRequest,
} from "./types";
import { normalizePremium } from "./premium";
import { parsePdfRequestField } from "./pdf-request";

function extractReply(data: Record<string, unknown>): string {
  if (typeof data.reply === "string") return data.reply;
  if (typeof data.message === "string") return data.message;
  throw new Error("Could not read assistant reply from API response.");
}

function parsePdfRequest(value: unknown): AmaniPdfRequest | undefined {
  const normalized = parsePdfRequestField(value);
  if (!normalized) return undefined;
  return value as AmaniPdfRequest;
}

export async function sendAmaniMessage(
  endpoint: string,
  message: string,
  history: AmaniHistoryTurn[],
  context: Record<string, unknown>,
  sessionId?: string | null,
): Promise<AmaniChatResponse> {
  const payload: AmaniChatRequest = {
    message,
    history,
    context,
    ...(sessionId ? { session_id: sessionId } : {}),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errBody = (await response.json()) as Record<string, unknown>;
      if (typeof errBody.error === "string") detail = errBody.error;
      else if (typeof errBody.message === "string") detail = errBody.message;
    } catch {
      /* use statusText */
    }
    throw new Error(detail || `Request failed (${response.status})`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  return {
    reply: extractReply(data),
    premium: normalizePremium(data.premium),
    tool_used: typeof data.tool_used === "string" ? data.tool_used : undefined,
    pdf_request: parsePdfRequest(data.pdf_request),
    pdf_url: typeof data.pdf_url === "string" ? data.pdf_url : undefined,
    email_to: typeof data.email_to === "string" ? data.email_to : undefined,
  };
}
