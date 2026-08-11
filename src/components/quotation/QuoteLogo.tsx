/** AMACO logo for quotation PDF/print — native img prints reliably (Next/Image often does not). */
export function QuoteLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/amaco-logo.png"
      alt="AMACO logo"
      width={200}
      height={76}
      className={className ?? "mx-auto h-auto w-40 object-contain sm:w-50"}
    />
  );
}
