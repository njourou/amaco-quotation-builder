"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AmaniPremium } from "@/lib/amani/types";

function tokenizeForStream(text: string): string[] {
  return text.match(/\S+\s*|\n+/g) ?? (text ? [text] : []);
}

function useStreamingText(
  fullText: string,
  enabled: boolean,
  onComplete?: () => void,
  onProgress?: () => void,
) {
  const [displayed, setDisplayed] = useState(enabled ? "" : fullText);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);

  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) {
      setDisplayed(fullText);
      return;
    }

    const tokens = tokenizeForStream(fullText);
    if (tokens.length === 0) {
      setDisplayed("");
      onCompleteRef.current?.();
      return;
    }

    let index = 0;
    let cancelled = false;
    let timer: number | undefined;

    const tick = () => {
      if (cancelled) return;
      index += 1;
      setDisplayed(tokens.slice(0, index).join(""));
      onProgressRef.current?.();

      if (index >= tokens.length) {
        onCompleteRef.current?.();
        return;
      }

      const next = tokens[index] ?? "";
      const delay = next.length > 12 ? 14 : next.endsWith("\n") ? 48 : 22;
      timer = window.setTimeout(tick, delay);
    };

    setDisplayed("");
    timer = window.setTimeout(tick, 80);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [fullText, enabled]);

  return displayed;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function AmaniMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^[-*]\s/.test(line.trim()) || line.trim() === "");

        if (isList && lines.some((line) => /^[-*]\s/.test(line.trim()))) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-4">
              {lines
                .filter((line) => /^[-*]\s/.test(line.trim()))
                .map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
                ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function formatAmount(line: { amount?: number; formatted?: string }) {
  if (line.formatted) return line.formatted;
  if (typeof line.amount === "number") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(line.amount);
  }
  return "—";
}

export function AmaniPremiumCard({ premium }: { premium: AmaniPremium }) {
  return (
    <div className="mt-2 rounded-xl border border-primary/20 bg-accent/40 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Premium quote
        </p>
        {premium.class && (
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {premium.class}
          </span>
        )}
        {premium.cover && (
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {premium.cover}
          </span>
        )}
      </div>

      {Array.isArray(premium.lines) && premium.lines.length > 0 && (
        <dl className="space-y-1 border-b border-border/60 pb-2 text-xs">
          {premium.lines.map((line, index) => (
            <div key={index} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{line.label ?? "Line"}</dt>
              <dd className="font-medium tabular-nums">{formatAmount(line)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          {typeof premium.net_premium === "number" && (
            <p className="text-[11px] text-muted-foreground">
              Net premium:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatAmount({ amount: premium.net_premium })}
              </span>
            </p>
          )}
        </div>
        <p className="text-base font-bold text-primary tabular-nums">
          {premium.total_formatted ??
            (typeof premium.total === "number"
              ? formatAmount({ amount: premium.total })
              : "—")}
        </p>
      </div>
    </div>
  );
}

function StreamingCursor() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-px animate-pulse bg-primary align-middle"
    />
  );
}

export function AmaniMessageBody({
  content,
  premium,
  className,
  streaming = false,
  onStreamComplete,
  onStreamProgress,
}: {
  content: string;
  premium?: AmaniPremium;
  className?: string;
  streaming?: boolean;
  onStreamComplete?: () => void;
  onStreamProgress?: () => void;
}) {
  const [streamDone, setStreamDone] = useState(!streaming);
  const displayed = useStreamingText(
    content,
    streaming,
    () => {
      setStreamDone(true);
      onStreamComplete?.();
    },
    onStreamProgress,
  );

  const isAnimating = streaming && !streamDone;

  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <AmaniMarkdown content={displayed} />
      {isAnimating && <StreamingCursor />}
      {premium && streamDone && <AmaniPremiumCard premium={premium} />}
    </div>
  );
}
