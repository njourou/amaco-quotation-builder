import {
  createEmptySchedule,
  createSampleFire,
  createSampleFireConloss,
  createSampleIar,
  createSampleMotorCommercial,
  createSampleMotorPrivate,
} from "@/lib/amaco/class-defs";
import type { QuotationHeader, QuotationState, RecentQuotation } from "@/lib/types";

export function createDefaultHeader(): QuotationHeader {
  const today = new Date().toISOString().slice(0, 10);
  return {
    sn: "",
    date: today,
    proposer: "",
    location: "",
    occupation: "",
    intermediary: "",
  };
}

export function createEmptyQuotation(): QuotationState {
  return {
    id: `q-${Date.now()}`,
    step: "header",
    header: createDefaultHeader(),
    schedules: [],
    activeScheduleId: null,
    createdAt: new Date().toISOString(),
  };
}

export function createSampleQuotation(): QuotationState {
  const iarId = `sch-iar-${Date.now()}`;
  const fireId = `sch-fire-${Date.now()}`;
  const conlossId = `sch-conloss-${Date.now()}`;
  const motorId = `sch-motor-${Date.now()}`;

  return {
    id: `q-sample-${Date.now()}`,
    step: "classes",
    header: {
      sn: "AMACO/2026/001",
      date: new Date().toISOString().slice(0, 10),
      proposer: "ABC Manufacturing Ltd",
      location: "Industrial Area, Nairobi",
      occupation: "Manufacturing — Leaf Springs & Ancilliary Products",
      intermediary: "Sample Broker Ltd",
    },
    schedules: [
      createSampleIar(iarId),
      createSampleFire(fireId),
      createSampleFireConloss(conlossId),
      createSampleMotorPrivate(motorId),
    ],
    activeScheduleId: iarId,
    createdAt: new Date().toISOString(),
  };
}

export function newScheduleId(classId: string): string {
  return `sch-${classId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export { createEmptySchedule, createSampleMotorCommercial };

export const RECENT_QUOTATIONS: RecentQuotation[] = [
  {
    id: "q-001",
    clientName: "ABC Manufacturing Ltd",
    productName: "IAR + Fire + Motor",
    totalPremium: 412_850,
    updatedAt: "2026-07-22T10:30:00",
    status: "issued",
  },
  {
    id: "q-002",
    clientName: "Bellevue Estate Owner",
    productName: "Fire & Perils",
    totalPremium: 168_420,
    updatedAt: "2026-07-20T14:15:00",
    status: "draft",
  },
  {
    id: "q-003",
    clientName: "KDE 234D — Private Motor",
    productName: "Motor Private Comp",
    totalPremium: 106_280,
    updatedAt: "2026-07-18T09:00:00",
    status: "issued",
  },
];
