import { AMANI_DEFAULT_ENDPOINT } from "./config";

export interface EmailPdfPayload {
  email: string;
  pdf_base64: string;
  filename?: string;
  total?: string;
  customer_name?: string;
}

export function getAmaniEmailPdfEndpoint(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AMANI_EMAIL_PDF_ENDPOINT?.trim();
  if (fromEnv) return fromEnv;
  return `${AMANI_DEFAULT_ENDPOINT}/email-pdf`;
}

export async function emailQuotationPdf(payload: EmailPdfPayload): Promise<void> {
  const response = await fetch(getAmaniEmailPdfEndpoint(), {
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
    throw new Error(detail || `Email failed (${response.status})`);
  }
}
