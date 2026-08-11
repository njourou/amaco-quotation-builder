/** Default Amani assistant API. Override with `NEXT_PUBLIC_AMANI_CHAT_ENDPOINT`. */
export const AMANI_DEFAULT_ENDPOINT = "https://assistant.electriclink.co.ke/amaco";

/** Chat API URL — set via env or pass directly to the widget. */
export function getAmaniChatEndpoint(override?: string): string {
  const fromProp = override?.trim();
  if (fromProp) return fromProp;

  const fromEnv = process.env.NEXT_PUBLIC_AMANI_CHAT_ENDPOINT?.trim();
  return fromEnv || AMANI_DEFAULT_ENDPOINT;
}

export const AMANI_WIDGET_TITLE = "Amani";
export const AMANI_AVATAR_SRC = "/amani-avatar.png";
