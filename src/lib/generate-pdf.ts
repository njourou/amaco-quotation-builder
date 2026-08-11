"use client";

export interface PdfOptions {
  filename?: string;
  margin?: number;
}

const PDF_TIMEOUT_MS = 25_000;

/** Remove stray nodes html2canvas may leave on failure. */
function cleanupCaptureArtifacts(container: HTMLElement | null) {
  container?.remove();
  document
    .querySelectorAll("iframe[src='about:blank']")
    .forEach((node) => node.remove());
}

/** Clone quotation off-screen so capture cannot freeze or mutate the live page. */
function createPrintClone(source: HTMLElement): {
  container: HTMLDivElement;
  target: HTMLElement;
} {
  const target = source.cloneNode(true) as HTMLElement;
  target.querySelectorAll(".no-print").forEach((node) => node.remove());
  target.classList.remove("soft-shadow-lg", "soft-shadow");
  target.style.boxShadow = "none";
  target.style.overflow = "visible";
  target.style.width = `${Math.min(source.offsetWidth || 794, 794)}px`;

  const container = document.createElement("div");
  container.setAttribute("data-pdf-clone", "true");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = target.style.width;
  container.style.background = "#ffffff";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";
  container.appendChild(target);
  document.body.appendChild(container);

  return { container, target };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("PDF generation timed out")),
      ms,
    );
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

/** Capture a DOM node and download it as a PDF (client-side). */
export async function downloadElementAsPdf(
  element: HTMLElement,
  options: PdfOptions = {},
): Promise<void> {
  let container: HTMLDivElement | null = null;

  try {
    await withTimeout(
      (async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const clone = createPrintClone(element);
        container = clone.container;

        const filename =
          options.filename ??
          `AMACO-Quotation-${new Date().toISOString().slice(0, 10)}.pdf`;

        // Yield so the loading spinner can paint before heavy canvas work.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        await html2pdf()
          .set({
            margin: options.margin ?? 8,
            filename,
            image: { type: "jpeg", quality: 0.92 },
            html2canvas: {
              scale: 1.25,
              useCORS: true,
              allowTaint: true,
              logging: false,
              backgroundColor: "#ffffff",
              scrollX: 0,
              scrollY: -window.scrollY,
              windowWidth: clone.target.scrollWidth,
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(clone.target)
          .save();
      })(),
      PDF_TIMEOUT_MS,
    );
  } finally {
    cleanupCaptureArtifacts(container);
  }
}

export function getQuotePdfFilename(prefix = "AMACO-Quotation"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.pdf`;
}
