"use client";

import { useEffect, useMemo, useRef } from "react";
import { QuotationDocument } from "@/components/quotation/QuotationDocument";
import { calculateQuotationTotal } from "@/lib/amaco/calculations";
import { emailQuotationPdf } from "@/lib/amani/email-pdf";
import { normalizePdfRequest } from "@/lib/amani/pdf-request";
import type { AmaniPdfRequest, AmaniPremium } from "@/lib/amani/types";
import {
  blobToBase64,
  downloadElementAsPdf,
  elementToPdfBlob,
} from "@/lib/generate-pdf";

export type AmaniPdfJobStatus =
  | "preparing"
  | "downloaded"
  | "emailed"
  | "error";

interface AmaniPdfRunnerProps {
  request: AmaniPdfRequest;
  emailTo?: string;
  premium?: AmaniPremium;
  onStatus: (status: AmaniPdfJobStatus, text: string) => void;
}

export function AmaniPdfRunner({
  request,
  emailTo,
  premium,
  onStatus,
}: AmaniPdfRunnerProps) {
  const documentRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);

  const normalized = useMemo(() => normalizePdfRequest(request), [request]);
  const totals = useMemo(
    () => (normalized ? calculateQuotationTotal(normalized.schedules) : null),
    [normalized],
  );

  useEffect(() => {
    if (!normalized || !totals || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    const run = async () => {
      onStatus("preparing", emailTo ? "Preparing PDF to email…" : "Preparing PDF download…");

      // Wait for QuotationDocument to mount and paint.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await new Promise((resolve) => window.setTimeout(resolve, 250));

      if (cancelled || !documentRef.current) {
        onStatus("error", "Could not prepare the quotation document.");
        return;
      }

      try {
        if (emailTo) {
          const blob = await elementToPdfBlob(documentRef.current, {
            filename: normalized.filename,
          });
          if (cancelled) return;

          await emailQuotationPdf({
            email: emailTo,
            pdf_base64: await blobToBase64(blob),
            filename: normalized.filename,
            total: premium?.total_formatted,
            customer_name: normalized.header.proposer || undefined,
          });

          if (!cancelled) {
            onStatus("emailed", `Quotation PDF emailed to ${emailTo}.`);
          }
          return;
        }

        await downloadElementAsPdf(documentRef.current, {
          filename: normalized.filename,
        });

        if (!cancelled) {
          onStatus("downloaded", "Quotation PDF downloaded.");
        }
      } catch {
        if (!cancelled) {
          onStatus(
            "error",
            emailTo
              ? "Could not email the quotation PDF. Try the download link or ask again."
              : "Could not download the quotation PDF. Try the link below or ask again.",
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [emailTo, normalized, onStatus, premium?.total_formatted, totals]);

  if (!normalized || !totals) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] w-[794px] bg-white"
    >
      <QuotationDocument
        ref={documentRef}
        header={normalized.header}
        schedules={normalized.schedules}
        totals={totals}
        quoteId={normalized.quoteId}
        className="print-area quote-document w-full bg-white"
      />
    </div>
  );
}
