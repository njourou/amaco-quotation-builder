"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { shouldShowPremiumCard } from "@/lib/amani/premium";
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

const URL_PATTERN =
  /((?:https?:\/\/|www\.)[^\s<>()[\]]+[^\s<>()[\].,;:!?'"”’])/gi;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function shortenUrlLabel(url: string, max = 42): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
    const compact = `${parsed.host}${path}`;
    if (compact.length <= max) return compact;
    return `${compact.slice(0, max - 1)}…`;
  } catch {
    return url.length <= max ? url : `${url.slice(0, max - 1)}…`;
  }
}

function LinkChip({ href, children }: { href: string; children?: ReactNode }) {
  const absolute = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={absolute}
      target="_blank"
      rel="noopener noreferrer"
      className="inline break-all text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
    >
      {children ?? shortenUrlLabel(absolute)}
    </a>
  );
}

function renderPlainWithUrls(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const pattern = new RegExp(URL_PATTERN.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <LinkChip key={`${keyPrefix}-url-${match.index}`} href={match[0]} />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderInline(text: string): ReactNode[] {
  const withMarkdownLinks: ReactNode[] = [];
  let cursor = 0;
  const mdPattern = new RegExp(MARKDOWN_LINK_PATTERN.source, "g");
  let mdMatch: RegExpExecArray | null;

  while ((mdMatch = mdPattern.exec(text)) !== null) {
    if (mdMatch.index > cursor) {
      withMarkdownLinks.push(
        ...renderDecoratedText(text.slice(cursor, mdMatch.index), `pre-${mdMatch.index}`),
      );
    }
    withMarkdownLinks.push(
      <LinkChip key={`md-${mdMatch.index}`} href={mdMatch[2]}>
        {mdMatch[1]}
      </LinkChip>,
    );
    cursor = mdMatch.index + mdMatch[0].length;
  }

  if (cursor < text.length) {
    withMarkdownLinks.push(...renderDecoratedText(text.slice(cursor), `tail-${cursor}`));
  }

  return withMarkdownLinks.length > 0 ? withMarkdownLinks : renderDecoratedText(text, "all");
}

function renderDecoratedText(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.flatMap((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return [
        <strong key={key} className="font-semibold">
          {renderPlainWithUrls(part.slice(2, -2), key)}
        </strong>,
      ];
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return [<em key={key}>{renderPlainWithUrls(part.slice(1, -1), key)}</em>];
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return [
        <code
          key={key}
          className="break-all rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>,
      ];
    }
    return renderPlainWithUrls(part, key);
  });
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const separatorIndex = lines.findIndex(isTableSeparator);
  const headerLines = separatorIndex > 0 ? lines.slice(0, separatorIndex) : [];
  const bodyLines = separatorIndex >= 0 ? lines.slice(separatorIndex + 1) : lines;

  const headers = headerLines.length > 0 ? parseTableRow(headerLines[0]) : [];
  const rows = bodyLines.filter((line) => !isTableSeparator(line)).map(parseTableRow);

  if (headers.length === 0 && rows.length === 0) {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-xs">
        {lines.join("\n")}
      </pre>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <table className="w-full min-w-60 border-collapse text-xs">
        {headers.length > 0 && (
          <thead>
            <tr className="border-b border-border/80 bg-muted/60">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left font-semibold text-foreground"
                >
                  {renderInline(header)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/50 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-3 py-2 text-muted-foreground",
                    cellIndex === row.length - 1 && "text-right font-medium tabular-nums text-foreground",
                  )}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownBlock({ block }: { block: string }) {
  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  const isTable = lines.length >= 2 && lines.every((line) => line.trim().startsWith("|"));

  if (isTable) {
    return <MarkdownTable lines={lines} />;
  }

  const isList = lines.every((line) => /^[-*]\s/.test(line.trim()));

  if (isList) {
    return (
      <ul className="list-disc space-y-1 pl-4">
        {lines.map((line, lineIndex) => (
          <li key={lineIndex}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{renderInline(block)}</p>;
}

export function AmaniMarkdown({ content }: { content: string }) {
  const blocks: string[] = [];
  let current: string[] = [];
  let inTable = false;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableLine) {
      if (!inTable && current.length > 0) {
        blocks.push(current.join("\n"));
        current = [];
      }
      inTable = true;
      current.push(line);
      continue;
    }

    if (inTable) {
      blocks.push(current.join("\n"));
      current = [];
      inTable = false;
    }

    if (trimmed.length === 0) {
      if (current.length > 0) {
        blocks.push(current.join("\n"));
        current = [];
      }
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIndex) => (
        <MarkdownBlock key={blockIndex} block={block} />
      ))}
    </div>
  );
}

function formatAmount(line: { amount?: number; formatted?: string }) {
  if (line.formatted) return line.formatted;
  if (typeof line.amount === "number") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: line.amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(line.amount);
  }
  return "—";
}

export function AmaniPremiumCard({ premium }: { premium: AmaniPremium }) {
  const lines = premium.lines ?? [];

  return (
    <div className="mt-2 rounded-xl border border-primary/20 bg-accent/40 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Premium quote
        </p>
        {premium.class && (
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {premium.class.replace(/-/g, " ")}
          </span>
        )}
        {premium.cover && (
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {premium.cover}
          </span>
        )}
      </div>

      {lines.length > 0 && (
        <dl className="space-y-1 border-b border-border/60 pb-2 text-xs">
          {lines.map((line, index) => (
            <div key={index} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{line.label}</dt>
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
  pdfUrl,
  pdfStatusText,
  className,
  streaming = false,
  onStreamComplete,
  onStreamProgress,
}: {
  content: string;
  premium?: AmaniPremium;
  pdfUrl?: string;
  pdfStatusText?: string;
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
  const showPremiumCard = streamDone && shouldShowPremiumCard(displayed, premium);

  return (
    <div className={cn("min-w-0 text-sm leading-relaxed [overflow-wrap:anywhere]", className)}>
      <AmaniMarkdown content={displayed} />
      {isAnimating && <StreamingCursor />}
      {showPremiumCard && premium && <AmaniPremiumCard premium={premium} />}
      {streamDone && pdfStatusText && (
        <p className="mt-2 text-xs text-muted-foreground [overflow-wrap:anywhere]">
          {pdfStatusText}
        </p>
      )}
      {streamDone && pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block max-w-full break-all rounded-lg border border-primary/20 bg-accent/50 px-3 py-2 text-xs font-medium text-primary"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-primary/70">
            Quotation PDF
          </span>
          <span className="mt-0.5 block break-all underline-offset-2 hover:underline">
            {shortenUrlLabel(pdfUrl, 56)}
          </span>
        </a>
      )}
    </div>
  );
}
