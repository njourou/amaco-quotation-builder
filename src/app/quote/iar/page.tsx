import Link from "next/link";

export default function IarQuotePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">Industrial All Risks</h1>
      <p className="max-w-md text-center text-muted-foreground">
        This product quote flow is coming soon. Use the full quotation builder
        for IAR quotes in the meantime.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-primary hover:underline"
      >
        &larr; Back to products
      </Link>
    </div>
  );
}
