"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { calculateQuotationTotal } from "@/lib/amaco/calculations";
import { createEmptySchedule } from "@/lib/amaco/class-defs";
import {
  createEmptyQuotation,
  createSampleQuotation,
  newScheduleId,
} from "@/lib/amaco/quotation";
import type {
  ClassId,
  ClassSchedule,
  QuotationHeader,
  QuotationState,
  QuotationStep,
  QuotationTotals,
} from "@/lib/types";

interface QuotationContextValue {
  quotation: QuotationState;
  totals: QuotationTotals;
  setStep: (step: QuotationStep) => void;
  updateHeader: (patch: Partial<QuotationHeader>) => void;
  addSchedule: (classId: ClassId) => void;
  removeSchedule: (scheduleId: string) => void;
  updateSchedule: (scheduleId: string, updater: (schedule: ClassSchedule) => ClassSchedule) => void;
  setActiveScheduleId: (scheduleId: string | null) => void;
  loadSample: () => void;
  resetQuotation: () => void;
}

const QuotationContext = createContext<QuotationContextValue | null>(null);

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [quotation, setQuotation] = useState<QuotationState>(createEmptyQuotation);

  const totals = useMemo(
    () => calculateQuotationTotal(quotation.schedules),
    [quotation.schedules],
  );

  const setStep = useCallback((step: QuotationStep) => {
    setQuotation((prev) => ({ ...prev, step }));
  }, []);

  const updateHeader = useCallback((patch: Partial<QuotationHeader>) => {
    setQuotation((prev) => ({
      ...prev,
      header: { ...prev.header, ...patch },
    }));
  }, []);

  const addSchedule = useCallback((classId: ClassId) => {
    const id = newScheduleId(classId);
    const schedule = createEmptySchedule(classId, id);
    setQuotation((prev) => ({
      ...prev,
      schedules: [...prev.schedules, schedule],
      activeScheduleId: id,
      step: "classes",
    }));
  }, []);

  const removeSchedule = useCallback((scheduleId: string) => {
    setQuotation((prev) => {
      const schedules = prev.schedules.filter((item) => item.id !== scheduleId);
      return {
        ...prev,
        schedules,
        activeScheduleId:
          prev.activeScheduleId === scheduleId
            ? schedules[0]?.id ?? null
            : prev.activeScheduleId,
      };
    });
  }, []);

  const updateSchedule = useCallback(
    (scheduleId: string, updater: (schedule: ClassSchedule) => ClassSchedule) => {
      setQuotation((prev) => ({
        ...prev,
        schedules: prev.schedules.map((item) =>
          item.id === scheduleId ? updater(item) : item,
        ),
      }));
    },
    [],
  );

  const setActiveScheduleId = useCallback((scheduleId: string | null) => {
    setQuotation((prev) => ({ ...prev, activeScheduleId: scheduleId }));
  }, []);

  const loadSample = useCallback(() => {
    setQuotation(createSampleQuotation());
  }, []);

  const resetQuotation = useCallback(() => {
    setQuotation(createEmptyQuotation());
  }, []);

  const value = useMemo(
    () => ({
      quotation,
      totals,
      setStep,
      updateHeader,
      addSchedule,
      removeSchedule,
      updateSchedule,
      setActiveScheduleId,
      loadSample,
      resetQuotation,
    }),
    [
      quotation,
      totals,
      setStep,
      updateHeader,
      addSchedule,
      removeSchedule,
      updateSchedule,
      setActiveScheduleId,
      loadSample,
      resetQuotation,
    ],
  );

  return (
    <QuotationContext.Provider value={value}>{children}</QuotationContext.Provider>
  );
}

export function useQuotation() {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotation must be used within QuotationProvider");
  }
  return context;
}
