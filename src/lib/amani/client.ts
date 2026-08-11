import type {
  AmaniChatContext,
  AmaniChatRequest,
  AmaniChatResponse,
  AmaniHistoryTurn,
  AmaniPremium,
} from "./types";

function parsePremium(value: unknown): AmaniPremium | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as AmaniPremium;
}

function extractReply(data: Record<string, unknown>): string {
  if (typeof data.reply === "string") return data.reply;
  if (typeof data.message === "string") return data.message;
  throw new Error("Could not read assistant reply from API response.");
}

export async function sendAmaniMessage(
  endpoint: string,
  message: string,
  history: AmaniHistoryTurn[],
  context?: AmaniChatContext,
): Promise<AmaniChatResponse> {
  const payload: AmaniChatRequest = {
    message,
    history,
    context,
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
    premium: parsePremium(data.premium),
    tool_used: typeof data.tool_used === "string" ? data.tool_used : undefined,
  };
}
