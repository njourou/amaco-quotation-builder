"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AmacoPreview } from "@/components/quotation/AmacoPreview";
import { ClassPicker } from "@/components/quotation/ClassPicker";
import { HeaderForm } from "@/components/quotation/HeaderForm";
import { MotorScheduleForm } from "@/components/quotation/MotorScheduleForm";
import {
  MobilePremiumDrawer,
  PremiumPanel,
} from "@/components/quotation/PremiumPanel";
import { PropertyScheduleForm } from "@/components/quotation/PropertyScheduleForm";
import { Button } from "@/components/ui/button";
import { useQuotation } from "@/context/QuotationContext";
import { getClassDefinition } from "@/lib/amaco/class-defs";
import type {
  ClassSchedule,
  FireConlossSchedule,
  FireSchedule,
  IarSchedule,
  MotorCommercialSchedule,
  MotorPrivateSchedule,
  QuotationStep,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { id: QuotationStep; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "classes", label: "Classes" },
  { id: "preview", label: "Preview" },
];

export function QuotationWizard() {
  const {
    quotation,
    totals,
    setStep,
    updateHeader,
    addSchedule,
    removeSchedule,
    updateSchedule,
    setActiveScheduleId,
    loadSample,
  } = useQuotation();

  const currentIndex = STEPS.findIndex((step) => step.id === quotation.step);
  const activeSchedule =
    quotation.schedules.find((item) => item.id === quotation.activeScheduleId) ??
    quotation.schedules[0] ??
    null;

  const canContinueHeader =
    quotation.header.proposer.trim().length > 0 &&
    quotation.header.location.trim().length > 0;

  const canContinueClasses = quotation.schedules.length > 0;

  const showPremium = quotation.step === "classes";

  const goNext = () => {
    if (quotation.step === "header") setStep("classes");
    else if (quotation.step === "classes") setStep("preview");
  };

  const goBack = () => {
    if (quotation.step === "classes") setStep("header");
    else if (quotation.step === "preview") setStep("classes");
  };

  return (
    <div className={cn("flex flex-1 flex-col", showPremium && "pb-24 lg:pb-0")}>
      <div className="border-b border-border/70 bg-card/50 px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                AMACO Quotation
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {STEPS[currentIndex]?.label}
              </h1>
            </div>
            {quotation.step !== "preview" ? (
              <Button type="button" variant="outline" size="sm" onClick={loadSample}>
                Load Excel sample
              </Button>
            ) : null}
          </div>
          <StepIndicator
            currentIndex={currentIndex}
            onStepClick={(step) => {
              if (step === "classes" && !canContinueHeader) return;
              if (step === "preview" && !canContinueClasses) return;
              setStep(step);
            }}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 sm:px-8 sm:py-8">
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={quotation.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {quotation.step === "header" ? (
                <HeaderForm value={quotation.header} onChange={updateHeader} />
              ) : null}

              {quotation.step === "classes" ? (
                <div className="space-y-8">
                  <ClassPicker
                    schedules={quotation.schedules}
                    activeScheduleId={activeSchedule?.id ?? null}
                    totals={totals}
                    onAdd={addSchedule}
                    onSelect={setActiveScheduleId}
                    onRemove={removeSchedule}
                  />

                  {activeSchedule ? (
                    <div className="rounded-2xl border border-border/70 bg-card p-6 soft-shadow sm:p-8">
                      <h3 className="mb-1 text-base font-semibold">
                        {getClassDefinition(activeSchedule.classId).name}
                      </h3>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Edit interests, rates options and remarks for this class.
                      </p>
                      <ScheduleEditor
                        schedule={activeSchedule}
                        onChange={(next) =>
                          updateSchedule(activeSchedule.id, () => next)
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {quotation.step === "preview" ? (
                <div>
                  <AmacoPreview
                    header={quotation.header}
                    schedules={quotation.schedules}
                    totals={totals}
                    quoteId={quotation.id}
                    onBack={goBack}
                    onEdit={() => setStep("classes")}
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {quotation.step !== "preview" ? (
            <div className="mt-8 flex items-center justify-between gap-3 no-print">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={quotation.step === "header"}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={goNext}
                disabled={
                  quotation.step === "header"
                    ? !canContinueHeader
                    : !canContinueClasses
                }
                className="gap-1.5"
              >
                {quotation.step === "classes" ? "Preview" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {showPremium ? (
          <div className="hidden w-80 shrink-0 lg:block">
            <PremiumPanel totals={totals} />
          </div>
        ) : null}
      </div>

      {showPremium ? <MobilePremiumDrawer totals={totals} /> : null}
    </div>
  );
}

function ScheduleEditor({
  schedule,
  onChange,
}: {
  schedule: ClassSchedule;
  onChange: (schedule: ClassSchedule) => void;
}) {
  if (
    schedule.classId === "iar" ||
    schedule.classId === "fire" ||
    schedule.classId === "fire-conloss"
  ) {
    return (
      <PropertyScheduleForm
        schedule={schedule as IarSchedule | FireSchedule | FireConlossSchedule}
        onChange={onChange}
      />
    );
  }

  return (
    <MotorScheduleForm
      schedule={schedule as MotorPrivateSchedule | MotorCommercialSchedule}
      onChange={onChange}
    />
  );
}

function StepIndicator({
  currentIndex,
  onStepClick,
}: {
  currentIndex: number;
  onStepClick: (step: QuotationStep) => void;
}) {
  return (
    <ol className="mt-6 flex flex-wrap gap-2">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active && "bg-primary text-primary-foreground",
                done && "bg-primary/10 text-primary",
                !active && !done && "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  active && "bg-primary-foreground/20",
                  done && "bg-primary/20",
                  !active && !done && "bg-background",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
