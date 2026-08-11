"use client";

import { useRef, useState } from "react";
import { FileDown, Loader2, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotationDocument } from "@/components/quotation/QuotationDocument";
import {
  downloadElementAsPdf,
  getQuotePdfFilename,
} from "@/lib/generate-pdf";
import { printQuotation } from "@/lib/print-quotation";
import type {
  ClassSchedule,
  QuotationHeader,
  QuotationTotals,
} from "@/lib/types";

interface AmacoPreviewProps {
  header: QuotationHeader;
  schedules: ClassSchedule[];
  totals: QuotationTotals;
  quoteId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function AmacoPreview({
  header,
  schedules,
  totals,
  quoteId,
  onBack,
  onEdit,
}: AmacoPreviewProps) {
  const documentRef = useRef<HTMLElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    if (!documentRef.current || pdfLoading) return;
    setPdfError(null);
    setPdfLoading(true);
    try {
      await downloadElementAsPdf(documentRef.current, {
        filename: getQuotePdfFilename(`AMACO-Quote-${quoteId.slice(0, 8)}`),
      });
    } catch {
      setPdfError("PDF download failed. Opening print dialog instead…");
      printQuotation(documentRef.current);
      window.setTimeout(() => setPdfError(null), 5000);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {pdfError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive no-print">
          {pdfError}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={handleGeneratePdf}
          disabled={pdfLoading}
          className="gap-1.5"
        >
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {pdfLoading ? "Generating…" : "Download PDF"}
        </Button>
        <Button
          onClick={() => printQuotation(documentRef.current)}
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <QuotationDocument
        ref={documentRef}
        header={header}
        schedules={schedules}
        totals={totals}
        quoteId={quoteId}
      />
    </div>
  );
}
