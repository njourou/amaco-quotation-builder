"use client";

import { forwardRef } from "react";
import { Separator } from "@/components/ui/separator";
import { QuoteCompanyFooter } from "@/components/quotation/QuoteCompanyFooter";
import { QuoteLogo } from "@/components/quotation/QuoteLogo";
import {
  FIRE_CLAUSES,
  FIRE_EXCESSES,
  IAR_CLAUSES,
  IAR_EXCESSES,
  getClassDefinition,
} from "@/lib/amaco/class-defs";
import {
  formatCurrency,
  formatNumber,
  formatRate,
} from "@/lib/amaco/calculations";
import { COMPANY, DISCLAIMERS, MOTOR_COMMERCIAL_TONNAGE_LABELS } from "@/lib/amaco/rates";
import type {
  ClassSchedule,
  QuotationHeader,
  QuotationTotals,
} from "@/lib/types";

interface QuotationDocumentProps {
  header: QuotationHeader;
  schedules: ClassSchedule[];
  totals: QuotationTotals;
  quoteId: string;
  className?: string;
}

export const QuotationDocument = forwardRef<HTMLElement, QuotationDocumentProps>(
  function QuotationDocument(
    { header, schedules, totals, quoteId, className },
    ref,
  ) {
    return (
      <article
        ref={ref}
        className={
          className ??
          "print-area quote-document mx-auto max-w-4xl rounded-2xl border border-border/70 bg-white soft-shadow-lg"
        }
      >
        <div className="quote-doc-header border-b border-primary/20 bg-linear-to-b from-primary/6 to-transparent px-8 py-8 text-center sm:px-10">
          <QuoteLogo />
          <h1 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">
            {COMPANY.name}
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
            {COMPANY.tagline}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {header.date
              ? new Date(header.date).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
            {header.sn ? ` · SN: ${header.sn}` : ` · ${quoteId}`}
          </p>
        </div>

        <div className="space-y-8 p-8 sm:p-10">
          <section className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Proposer" value={header.proposer || "—"} className="sm:col-span-2" />
            <Info label="Location" value={header.location || "—"} className="sm:col-span-2" />
            <Info label="Occupation" value={header.occupation || "—"} />
            <Info label="Intermediary" value={header.intermediary || "—"} />
          </section>

          <Separator />

          <div className="space-y-8">
            {schedules.map((schedule) => {
              const premium = totals.byClass.find((item) => item.scheduleId === schedule.id);
              const def = getClassDefinition(schedule.classId);
              return (
                <section key={schedule.id} className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {def.name}
                  </h2>

                  {"interests" in schedule ? (
                    <div className="overflow-hidden rounded-xl border border-border/70">
                      <table className="w-full text-sm">
                        <tbody>
                          {schedule.interests
                            .filter((line) => line.sumInsured > 0 || line.description)
                            .map((line) => (
                              <tr key={line.id} className="border-t border-border/60 first:border-t-0">
                                <td className="px-4 py-2.5">{line.description || "—"}</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">
                                  {formatNumber(line.sumInsured)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/70 px-4 py-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span>
                          {schedule.registration || "Vehicle"} ·{" "}
                          {schedule.cover === "comprehensive" ? "Comprehensive" : "TPO"}
                        </span>
                        {schedule.cover === "comprehensive" ? (
                          <span className="tabular-nums">
                            {formatCurrency(schedule.sumInsured)}
                          </span>
                        ) : schedule.classId === "motor-commercial" ? (
                          <span>
                            {MOTOR_COMMERCIAL_TONNAGE_LABELS[schedule.tonnageBand]}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {premium ? (
                    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Rate {formatRate(premium.rate)} · SI{" "}
                          {formatCurrency(premium.totalSumInsured)}
                        </span>
                        <span className="font-semibold tabular-nums text-primary">
                          {formatCurrency(premium.totalPremium)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {premium.lines.map((line) => (
                          <div
                            key={`${premium.scheduleId}-${line.label}`}
                            className="flex justify-between gap-3 text-xs text-muted-foreground"
                          >
                            <span>{line.label}</span>
                            <span className="tabular-nums">{formatCurrency(line.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <RemarksBlock schedule={schedule} />
                </section>
              );
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <span className="text-sm font-semibold uppercase tracking-wide">Grand Total</span>
            <span className="text-xl font-semibold tabular-nums text-primary">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>

          <Separator />

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Disclaimer
            </h2>
            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              {DISCLAIMERS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <QuoteCompanyFooter />
        </div>
      </article>
    );
  },
);

function RemarksBlock({ schedule }: { schedule: ClassSchedule }) {
  if (schedule.classId === "iar") {
    const clauses = IAR_CLAUSES.filter((c) => schedule.selectedClauses.includes(c.id));
    return (
      <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
        <p className="mb-2 text-sm font-semibold text-foreground">Excesses / Remarks</p>
        <ul className="space-y-1.5">
          {clauses.map((c) => (
            <li key={c.id} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{c.label}</span>
            </li>
          ))}
          {IAR_EXCESSES.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (schedule.classId === "fire") {
    const clauses = FIRE_CLAUSES.filter((c) => schedule.selectedClauses.includes(c.id));
    return (
      <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
        <p className="mb-2 text-sm font-semibold text-foreground">Excesses / Remarks</p>
        <ul className="space-y-1.5">
          {clauses.map((c) => (
            <li key={c.id} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{c.label}</span>
            </li>
          ))}
          {FIRE_EXCESSES.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (schedule.classId === "fire-conloss") {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
        <p className="mb-2 text-sm font-semibold text-foreground">Excesses / Remarks</p>
        <ul className="space-y-1.5">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>Time Excess — 7 days</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>Material Damage Proviso</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>Indemnity Period: {schedule.indemnityPeriodMonths} months</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
      <p className="mb-2 text-sm font-semibold text-foreground">Excesses / Remarks</p>
      <ul className="space-y-1.5">
        {schedule.selectedRemarks.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Info({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}
