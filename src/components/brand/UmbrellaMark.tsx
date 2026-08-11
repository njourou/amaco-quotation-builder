import { cn } from "@/lib/utils";

/**
 * The AMACO mark, abstracted: an umbrella canopy drawn as radiating gores.
 * This is the brand's signature — coverage/protection made literal — and is
 * reused at the hero, in empty states, and on the ledger. It scales cleanly
 * because it is pure geometry, and it inherits currentColor so a single
 * element can be tinted magenta, plum, or white per context.
 */
export function UmbrellaMark({
  className,
  gores = 7,
}: {
  className?: string;
  gores?: number;
}) {
  // Canopy spans a half-dome from (4,52) to (100,52), apex at (52,8).
  const cx = 52;
  const apexY = 8;
  const rimY = 52;
  const left = 6;
  const right = 98;
  const step = (right - left) / gores;

  // Each gore is a triangle-ish wedge from the apex down to two rim points,
  // with the rim bowed slightly so the canopy reads as scalloped fabric.
  const wedges = Array.from({ length: gores }, (_, i) => {
    const x0 = left + step * i;
    const x1 = left + step * (i + 1);
    const dip = 4; // how far the scallop dips below the rim line
    return `M ${cx} ${apexY} L ${x0} ${rimY} Q ${(x0 + x1) / 2} ${rimY + dip} ${x1} ${rimY} Z`;
  });

  return (
    <svg
      viewBox="0 0 104 78"
      fill="none"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="amaco-canopy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.72" />
        </linearGradient>
      </defs>
      {wedges.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="url(#amaco-canopy)"
          stroke="var(--color-background)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          opacity={i % 2 === 0 ? 1 : 0.86}
        />
      ))}
      {/* Ferrule + shaft dropping from the apex. */}
      <line
        x1={cx}
        y1={apexY - 3}
        x2={cx}
        y2={apexY}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={rimY}
        x2={cx}
        y2={72}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* J-hook handle. */}
      <path
        d={`M ${cx} 72 q 0 4 -5 4 q -5 0 -5 -4`}
        stroke="currentColor"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
