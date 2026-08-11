"use client";

/** Scroll the quotation into view, then open the browser print dialog. */
export function printQuotation(element?: HTMLElement | null): void {
  if (element) {
    element.scrollIntoView({ behavior: "instant", block: "start" });
  }
  // Allow layout/paint to settle before printing (motion, images).
  requestAnimationFrame(() => {
    window.setTimeout(() => window.print(), 100);
  });
}
