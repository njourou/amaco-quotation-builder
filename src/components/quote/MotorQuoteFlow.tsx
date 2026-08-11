"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Download,
  Loader2,
  Printer,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteCompanyFooter } from "@/components/quotation/QuoteCompanyFooter";
import { QuoteLogo } from "@/components/quotation/QuoteLogo";
import {
  MOTOR_COMMERCIAL_REMARKS,
  MOTOR_PRIVATE_REMARKS,
  createEmptySchedule,
} from "@/lib/amaco/class-defs";
import { calculateClassPremium, formatCurrency } from "@/lib/amaco/calculations";
import {
  COMPANY,
  DISCLAIMERS,
  MOTOR_COMMERCIAL_TONNAGE_LABELS,
} from "@/lib/amaco/rates";
import { MOTOR_MAKES, YEARS } from "@/lib/motor-makes";
import {
  downloadElementAsPdf,
  getQuotePdfFilename,
} from "@/lib/generate-pdf";
import { printQuotation } from "@/lib/print-quotation";
import type {
  CommercialTonnageBand,
  CommercialUseType,
  MotorCommercialSchedule,
  MotorCoverType,
  MotorPrivateSchedule,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "form" | "results";

const selectClass =
  "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface MotorQuoteFlowProps {
  type: "motor-private" | "motor-commercial";
}

export function MotorQuoteFlow({ type }: MotorQuoteFlowProps) {
  const isCommercial = type === "motor-commercial";
  const allRemarks = isCommercial ? MOTOR_COMMERCIAL_REMARKS : MOTOR_PRIVATE_REMARKS;

  const [step, setStep] = useState<Step>("form");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [value, setValue] = useState("");
  const [year, setYear] = useState("");
  const [cover, setCover] = useState<MotorCoverType | "">("");
  const [excessProtector, setExcessProtector] = useState(false);
  const [pvt, setPvt] = useState(false);
  const [useType, setUseType] = useState<CommercialUseType>("own-goods");
  const [tonnageBand, setTonnageBand] = useState<CommercialTonnageBand>("0-3");
  const [selectedRemarks, setSelectedRemarks] = useState<string[]>(
    allRemarks.slice(0, 4),
  );
  const documentRef = useRef<HTMLElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const models = make ? MOTOR_MAKES[make] ?? [] : [];
  const quoteDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const canSubmit =
    make &&
    model &&
    year &&
    cover &&
    (cover === "tpo" && !isCommercial ? true : Number(value) > 0);

  const schedule = useMemo(() => {
    if (!canSubmit || !cover) return null;

    if (isCommercial) {
      const s = createEmptySchedule(
        "motor-commercial",
        "preview",
      ) as MotorCommercialSchedule;
      return {
        ...s,
        registration: `${make} ${model}`,
        sumInsured: Number(value) || 0,
        cover,
        useType,
        tonnageBand,
        excessProtector,
        politicalViolenceTerrorism: pvt,
        selectedRemarks,
      } satisfies MotorCommercialSchedule;
    }

    const s = createEmptySchedule(
      "motor-private",
      "preview",
    ) as MotorPrivateSchedule;
    return {
      ...s,
      registration: `${make} ${model}`,
      sumInsured: Number(value) || 0,
      cover,
      excessProtector,
      politicalViolenceTerrorism: pvt,
      selectedRemarks,
    } satisfies MotorPrivateSchedule;
  }, [
    canSubmit,
    cover,
    make,
    model,
    value,
    isCommercial,
    useType,
    tonnageBand,
    excessProtector,
    pvt,
    selectedRemarks,
  ]);

  const premium = useMemo(
    () => (schedule ? calculateClassPremium(schedule) : null),
    [schedule],
  );

  const toggleRemark = (remark: string) => {
    setSelectedRemarks((prev) =>
      prev.includes(remark)
        ? prev.filter((item) => item !== remark)
        : [...prev, remark],
    );
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current || pdfLoading) return;
    setPdfError(null);
    setPdfLoading(true);
    try {
      const label = isCommercial ? "Motor-Commercial" : "Motor-Private";
      await downloadElementAsPdf(documentRef.current, {
        filename: getQuotePdfFilename(`AMACO-${label}`),
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
    <div className="flex-1 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground no-print"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="mb-8 flex items-center gap-3 no-print">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isCommercial ? (
              <Truck className="h-6 w-6" />
            ) : (
              <Car className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isCommercial ? "Motor Commercial" : "Motor Private"} Quote
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCommercial
                ? "Get a quote for your commercial vehicle"
                : "Protect your next adventure in just a few clicks"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <select
                      className={selectClass}
                      value={make}
                      onChange={(e) => {
                        setMake(e.target.value);
                        setModel("");
                      }}
                    >
                      <option value="">Choose Make</option>
                      {Object.keys(MOTOR_MAKES)
                        .sort()
                        .map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Model</Label>
                    <select
                      className={selectClass}
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={!make}
                    >
                      <option value="">
                        {make ? "Choose Model" : "Select Make"}
                      </option>
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value (KES)</Label>
                    <Input
                      className="h-11"
                      type="number"
                      min={0}
                      placeholder="e.g. 2,500,000"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Year of Manufacture</Label>
                    <select
                      className={selectClass}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">Choose Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isCommercial ? (
                  <div className="mt-6 space-y-2">
                    <Label>Commercial use</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["own-goods", "Own Goods", "Comp rate 5%"],
                          [
                            "general-cartage",
                            "General Cartage",
                            "Comp rate 5.5%",
                          ],
                        ] as const
                      ).map(([val, label, hint]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setUseType(val)}
                          className={cn(
                            "rounded-xl border border-border/70 p-4 text-left text-sm transition-all",
                            useType === val &&
                              "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                          )}
                        >
                          <p className="font-semibold">{label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {hint}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {isCommercial && cover === "tpo" ? (
                  <div className="mt-6 space-y-2">
                    <Label>Tonnage / TPO band</Label>
                    <select
                      className={selectClass}
                      value={tonnageBand}
                      onChange={(e) =>
                        setTonnageBand(e.target.value as CommercialTonnageBand)
                      }
                    >
                      {(
                        Object.keys(
                          MOTOR_COMMERCIAL_TONNAGE_LABELS,
                        ) as CommercialTonnageBand[]
                      ).map((band) => (
                        <option key={band} value={band}>
                          {MOTOR_COMMERCIAL_TONNAGE_LABELS[band]}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="mt-6 space-y-2">
                  <Label>
                    What&apos;s your preferred cover option, Comprehensive or
                    TPO (Third Party)?
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["comprehensive", "Comprehensive"],
                        ["tpo", "TPO (Third Party)"],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCover(val)}
                        className={cn(
                          "rounded-xl border border-border/70 p-4 text-left text-sm transition-all",
                          cover === val &&
                            "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                        )}
                      >
                        <p className="font-semibold">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {cover === "comprehensive" ? (
                  <div className="mt-6 rounded-xl border border-border/70 p-4">
                    <p className="mb-3 text-sm font-semibold">
                      Optional benefits
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={excessProtector}
                          onCheckedChange={(v) =>
                            setExcessProtector(Boolean(v))
                          }
                        />
                        Excess Protector
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={pvt}
                          onCheckedChange={(v) => setPvt(Boolean(v))}
                        />
                        Political Violence &amp; Terrorism
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 rounded-xl border border-border/70 p-4">
                  <p className="mb-1 text-sm font-semibold">
                    Excesses / Remarks
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Select the excesses and remarks to include on the quotation.
                  </p>
                  <div className="space-y-2.5">
                    {allRemarks.map((remark) => {
                      const checked = selectedRemarks.includes(remark);
                      return (
                        <label
                          key={remark}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Checkbox
                            className="mt-0.5"
                            checked={checked}
                            onCheckedChange={() => toggleRemark(remark)}
                          />
                          <span className="leading-snug text-muted-foreground">
                            {remark}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Button
                  className="mt-8 h-12 w-full gap-2 text-base"
                  disabled={!canSubmit}
                  onClick={() => setStep("results")}
                >
                  Get Quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {premium ? (
                <div className="space-y-6">
                  {pdfError ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive no-print">
                      {pdfError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 no-print">
                    <Button
                      variant="outline"
                      onClick={() => setStep("form")}
                      className="gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Edit Quote
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => printQuotation(documentRef.current)}
                      className="gap-1.5"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      onClick={handleDownloadPdf}
                      disabled={pdfLoading}
                      className="gap-1.5"
                    >
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {pdfLoading ? "Generating…" : "Download PDF"}
                    </Button>
                  </div>

                  <article
                    ref={documentRef}
                    className="print-area quote-document mx-auto rounded-2xl border border-border/70 bg-white soft-shadow-lg"
                  >
                    <div className="quote-doc-header border-b border-primary/20 bg-linear-to-b from-primary/6 to-transparent px-6 py-8 text-center sm:px-10">
                      <QuoteLogo />
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                        {COMPANY.tagline}
                      </p>
                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Motor Insurance Quotation
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {quoteDate}
                      </p>
                    </div>

                    <div className="space-y-8 px-6 py-8 sm:px-10">
                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Vehicle Details
                        </h3>
                        <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm sm:grid-cols-2">
                          <Detail label="Make" value={make} />
                          <Detail label="Model" value={model} />
                          <Detail label="Year" value={year} />
                          <Detail
                            label="Cover"
                            value={
                              cover === "comprehensive"
                                ? "Comprehensive"
                                : "TPO (Third Party Only)"
                            }
                          />
                          <Detail
                            label="Estimated Value"
                            value={
                              Number(value) > 0
                                ? formatCurrency(Number(value))
                                : "—"
                            }
                          />
                          <Detail
                            label="Class"
                            value={
                              isCommercial
                                ? "Motor Commercial"
                                : "Motor Private"
                            }
                          />
                          {isCommercial ? (
                            <>
                              <Detail
                                label="Use"
                                value={
                                  useType === "own-goods"
                                    ? "Own Goods"
                                    : "General Cartage"
                                }
                              />
                              {cover === "tpo" ? (
                                <Detail
                                  label="Tonnage Band"
                                  value={
                                    MOTOR_COMMERCIAL_TONNAGE_LABELS[tonnageBand]
                                  }
                                />
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </section>

                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Premium Summary
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-border/70">
                          <table className="w-full text-sm">
                            <tbody>
                              {premium.lines.map((line) => {
                                const isTotal = line.label === "Class Total";
                                return (
                                  <tr
                                    key={line.label}
                                    className={cn(
                                      "border-t border-border/60 first:border-t-0",
                                      isTotal && "bg-primary/5",
                                    )}
                                  >
                                    <td
                                      className={cn(
                                        "px-4 py-2.5",
                                        isTotal
                                          ? "font-semibold text-foreground"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {isTotal ? "Total Premium" : line.label}
                                    </td>
                                    <td
                                      className={cn(
                                        "px-4 py-2.5 text-right tabular-nums",
                                        isTotal
                                          ? "text-base font-semibold text-primary"
                                          : "text-foreground",
                                      )}
                                    >
                                      {formatCurrency(line.amount)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Premium is per annum and includes training levy, PHCF
                          and stamp duty.
                        </p>
                      </section>

                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Excesses / Remarks
                        </h3>
                        {selectedRemarks.length > 0 ? (
                          <ul className="space-y-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-4 text-sm text-muted-foreground">
                            {selectedRemarks.map((remark) => (
                              <li
                                key={remark}
                                className="flex gap-2 leading-snug"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>{remark}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                            No excesses or remarks selected.
                          </p>
                        )}
                      </section>

                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Disclaimer
                        </h3>
                        <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                          {DISCLAIMERS.map((item) => (
                            <li key={item}>** {item}</li>
                          ))}
                        </ul>
                      </section>

                      <QuoteCompanyFooter />
                    </div>
                  </article>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}
