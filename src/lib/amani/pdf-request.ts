import { createEmptySchedule } from "@/lib/amaco/class-defs";
import type {
  ClassId,
  ClassSchedule,
  CommercialTonnageBand,
  CommercialUseType,
  InterestLine,
  MotorCoverType,
  QuotationHeader,
} from "@/lib/types";
import type { AmaniPdfRequest } from "./types";

const CLASS_IDS: ClassId[] = [
  "iar",
  "fire",
  "fire-conloss",
  "motor-private",
  "motor-commercial",
];

function isClassId(value: unknown): value is ClassId {
  return typeof value === "string" && CLASS_IDS.includes(value as ClassId);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asCover(value: unknown): MotorCoverType {
  return value === "tpo" ? "tpo" : "comprehensive";
}

function asUseType(value: unknown): CommercialUseType {
  return value === "general-cartage" ? "general-cartage" : "own-goods";
}

function asTonnage(value: unknown): CommercialTonnageBand {
  const allowed: CommercialTonnageBand[] = [
    "0-3",
    "3-8",
    "9-15",
    "15-above",
    "prime-mover",
    "trailer",
    "fleet",
  ];
  return allowed.includes(value as CommercialTonnageBand)
    ? (value as CommercialTonnageBand)
    : "0-3";
}

function normalizeSchedule(raw: Record<string, unknown>, index: number): ClassSchedule | null {
  if (!isClassId(raw.classId)) return null;

  const id =
    asString(raw.id) ||
    `sch-amani-${raw.classId}-${Date.now()}-${index}`;

  const base = createEmptySchedule(raw.classId, id);

  if (base.classId === "motor-private") {
    return {
      ...base,
      registration: asString(raw.registration),
      sumInsured: asNumber(raw.sumInsured),
      cover: asCover(raw.cover),
      excessProtector: asBoolean(raw.excessProtector),
      politicalViolenceTerrorism: asBoolean(raw.politicalViolenceTerrorism),
      selectedRemarks: Array.isArray(raw.selectedRemarks)
        ? raw.selectedRemarks.filter((item): item is string => typeof item === "string")
        : [],
    };
  }

  if (base.classId === "motor-commercial") {
    return {
      ...base,
      registration: asString(raw.registration),
      sumInsured: asNumber(raw.sumInsured),
      cover: asCover(raw.cover),
      useType: asUseType(raw.useType),
      tonnageBand: asTonnage(raw.tonnageBand),
      excessProtector: asBoolean(raw.excessProtector),
      politicalViolenceTerrorism: asBoolean(raw.politicalViolenceTerrorism),
      selectedRemarks: Array.isArray(raw.selectedRemarks)
        ? raw.selectedRemarks.filter((item): item is string => typeof item === "string")
        : [],
    };
  }

  if (base.classId === "iar" || base.classId === "fire" || base.classId === "fire-conloss") {
    const interests: InterestLine[] = Array.isArray(raw.interests)
      ? raw.interests
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item, i) => {
            const section =
              item.section === "material-damage" ||
              item.section === "business-interruption" ||
              item.section === "default"
                ? item.section
                : ("default" as const);
            return {
              id: asString(item.id, `int-${i + 1}`),
              description: asString(item.description),
              sumInsured: asNumber(item.sumInsured),
              section,
            };
          })
      : base.interests;

    const discountsRaw =
      raw.discounts && typeof raw.discounts === "object"
        ? (raw.discounts as Record<string, unknown>)
        : {};

    const discounts = {
      applyNcd: asBoolean(discountsRaw.applyNcd, true),
      applyLta: asBoolean(discountsRaw.applyLta, true),
      applyEarthquake: asBoolean(discountsRaw.applyEarthquake),
      applyFlood: asBoolean(discountsRaw.applyFlood),
    };

    if (base.classId === "iar") {
      return {
        ...base,
        interests,
        discounts,
        selectedClauses: Array.isArray(raw.selectedClauses)
          ? raw.selectedClauses.filter((item): item is string => typeof item === "string")
          : [],
        indemnityPeriodMonths: asNumber(raw.indemnityPeriodMonths, 12),
      };
    }

    if (base.classId === "fire") {
      return {
        ...base,
        interests,
        discounts,
        selectedClauses: Array.isArray(raw.selectedClauses)
          ? raw.selectedClauses.filter((item): item is string => typeof item === "string")
          : [],
      };
    }

    return {
      ...base,
      interests,
      discounts,
      indemnityPeriodMonths: asNumber(raw.indemnityPeriodMonths, 12),
      useFireRate: asBoolean(raw.useFireRate, true),
    };
  }

  return null;
}

export function normalizePdfRequest(raw: unknown): {
  filename: string;
  header: QuotationHeader;
  schedules: ClassSchedule[];
  quoteId: string;
} | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as AmaniPdfRequest;
  if (!Array.isArray(record.schedules) || record.schedules.length === 0) return null;

  const headerRaw = (record.header ?? {}) as AmaniPdfRequest["header"];
  const today = new Date().toISOString().slice(0, 10);

  const header: QuotationHeader = {
    sn: asString(headerRaw.sn),
    date: asString(headerRaw.date, today),
    proposer: asString(headerRaw.proposer),
    location: asString(headerRaw.location),
    occupation: asString(headerRaw.occupation),
    intermediary: asString(headerRaw.intermediary),
  };

  const schedules = record.schedules
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => normalizeSchedule(item, index))
    .filter((item): item is ClassSchedule => item !== null);

  if (schedules.length === 0) return null;

  const filenameRaw = asString(record.filename).trim();
  const filename = filenameRaw
    ? filenameRaw.endsWith(".pdf")
      ? filenameRaw
      : `${filenameRaw}.pdf`
    : `AMACO-Quotation-${today}.pdf`;

  return {
    filename,
    header,
    schedules,
    quoteId: `amani-${Date.now()}`,
  };
}

export function parsePdfRequestField(value: unknown) {
  return normalizePdfRequest(value);
}
