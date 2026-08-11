import type {
  ClassDefinition,
  ClassId,
  FireConlossSchedule,
  FireSchedule,
  IarSchedule,
  InterestLine,
  MotorCommercialSchedule,
  MotorPrivateSchedule,
  PropertyDiscounts,
} from "@/lib/types";

export const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    id: "iar",
    name: "Industrial All Risks",
    shortName: "IAR",
    description: "Material damage and business interruption for industrial risks.",
    category: "property",
  },
  {
    id: "fire",
    name: "Fire & Perils",
    shortName: "Fire",
    description: "Fire and allied perils on buildings, stock and fixtures.",
    category: "property",
  },
  {
    id: "fire-conloss",
    name: "Fire Consequential Loss",
    shortName: "Fire Conloss",
    description: "Gross profit and increase in cost of working after fire.",
    category: "property",
  },
  {
    id: "motor-private",
    name: "Motor Private",
    shortName: "Motor Private",
    description: "Comprehensive or TPO cover for private motor vehicles.",
    category: "motor",
  },
  {
    id: "motor-commercial",
    name: "Motor Commercial",
    shortName: "Motor Commercial",
    description: "Own goods or general cartage — comprehensive or TPO.",
    category: "motor",
  },
];

export const DEFAULT_DISCOUNTS: PropertyDiscounts = {
  applyNcd: true,
  applyLta: true,
  applyEarthquake: true,
  applyFlood: true,
};

export const IAR_CLAUSES = [
  { id: "pmow-1", label: "PMOW 1" },
  { id: "72-hour", label: "72 Hours clause" },
  { id: "electrical-i", label: "Electrical clause I" },
  { id: "eq-excess", label: "EQ Excess" },
  { id: "hazardous-goods", label: "Hazardous goods clause" },
  { id: "safe-books", label: "Safe and books clause" },
  { id: "stock-declaration", label: "Stock Declaration" },
  { id: "terrorism-exclusion", label: "Terrorism Exclusion" },
  { id: "insure-100-machinery", label: "Insure 100% of machinery" },
];

export const FIRE_CLAUSES = [
  { id: "pmow-1", label: "PMOW 1" },
  { id: "72-hour", label: "72 Hours clause" },
  { id: "electrical-i", label: "Electrical clause I" },
  { id: "eq-excess", label: "EQ Excess" },
  { id: "hazardous-goods", label: "Hazardous goods clause" },
  { id: "safe-books", label: "Safe and books clause" },
  { id: "stock-declaration", label: "Stock Declaration" },
  { id: "terrorism-exclusion", label: "Terrorism Exclusion" },
];

export const IAR_EXCESSES = [
  "EQ Excess Clause 2% of sum insured maximum Kshs.5M per location",
  "Flooding Excess: 10% of the loss amount, minimum as per policy",
  "Excess All Other Claims: 10% Each and Every loss min 250,000/=",
  "Time excess — 7 days (Consequential Loss)",
  "Indemnity Period: 12 months",
];

export const FIRE_EXCESSES = [
  "EQ Excess Clause 2% of sum insured maximum Kshs.5M per location",
  "Flooding Excess: 10% of the loss amount, minimum as per policy",
  "Availability at all times of working firefighting appliances",
  "Excluding Makuti Risks",
];

export const MOTOR_PRIVATE_REMARKS = [
  "Accidental damage — 2.5% of sum insured min. Shs. 15,000",
  "Theft — With anti-theft device 10% of SI min. Shs. 20,000",
  "Theft — Without anti-theft device 20% of SI Min Shs. 20,000",
  "Theft — With tracking device 5% of SI Min Shs. 20,000",
  "TPPD — Shs. 10,000",
  "Young/Novice Drivers — Shs. 7,500/= (additional)",
  "Third party property damage — Shs.5,000,000",
  "Mandatory valuation within 30 days of cover inception",
];

export const MOTOR_COMMERCIAL_REMARKS = [
  "Accidental damage/Partial Theft — 5% of SI min. Shs.30,000/=",
  "Theft — With anti-theft device 10% of SI min. Shs. 30,000/=",
  "TPPD — Shs. 20,000/= (Own Goods) / 30,000/= (Cartage)",
  "Young/Novice Drivers — Shs.7,500/= (additional)",
  "Third party property damage — Shs.5,000,000",
  "Geographical area: Kenya",
  "Mandatory Valuation within 30 days from inception",
  "Basis of valuation Pre-Accident/Pre-Theft",
];

function line(
  description: string,
  sumInsured: number,
  section: InterestLine["section"] = "default",
): InterestLine {
  return {
    id: `line-${Math.random().toString(36).slice(2, 9)}`,
    description,
    sumInsured,
    section,
  };
}

export function createInterestId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyIar(id: string): IarSchedule {
  return {
    id,
    classId: "iar",
    interests: [
      line("On Building Of 1st Class Construction Including Boundary Walls", 0, "material-damage"),
      line("On Plant, Machinery And Trade Fixtures", 0, "material-damage"),
      line("On Raw Materials", 0, "material-damage"),
      line("On Work In Progress", 0, "material-damage"),
      line("On Finished Goods", 0, "material-damage"),
      line("On Gross Profit Less Wages", 0, "business-interruption"),
      line("On Wages / Salaries", 0, "business-interruption"),
      line("On Audit Fees", 0, "business-interruption"),
    ],
    discounts: { ...DEFAULT_DISCOUNTS },
    selectedClauses: IAR_CLAUSES.slice(0, 6).map((c) => c.id),
    indemnityPeriodMonths: 12,
  };
}

export function createEmptyFire(id: string): FireSchedule {
  return {
    id,
    classId: "fire",
    interests: [
      line("On Building of First Class construction", 0),
      line("On Stock in Trade", 0),
      line("On Furniture, Fixtures & Fittings", 0),
    ],
    discounts: { ...DEFAULT_DISCOUNTS },
    selectedClauses: FIRE_CLAUSES.slice(0, 5).map((c) => c.id),
  };
}

export function createEmptyFireConloss(id: string): FireConlossSchedule {
  return {
    id,
    classId: "fire-conloss",
    interests: [
      line("On Gross profit", 0),
      line("Additional Increase in Cost of working", 0),
    ],
    discounts: { ...DEFAULT_DISCOUNTS },
    indemnityPeriodMonths: 12,
    useFireRate: true,
  };
}

export function createEmptyMotorPrivate(id: string): MotorPrivateSchedule {
  return {
    id,
    classId: "motor-private",
    registration: "",
    sumInsured: 0,
    cover: "comprehensive",
    excessProtector: false,
    politicalViolenceTerrorism: false,
    selectedRemarks: MOTOR_PRIVATE_REMARKS.slice(0, 4),
  };
}

export function createEmptyMotorCommercial(id: string): MotorCommercialSchedule {
  return {
    id,
    classId: "motor-commercial",
    registration: "",
    sumInsured: 0,
    cover: "comprehensive",
    useType: "own-goods",
    tonnageBand: "0-3",
    excessProtector: false,
    politicalViolenceTerrorism: false,
    selectedRemarks: MOTOR_COMMERCIAL_REMARKS.slice(0, 4),
  };
}

export function createEmptySchedule(classId: ClassId, id: string) {
  switch (classId) {
    case "iar":
      return createEmptyIar(id);
    case "fire":
      return createEmptyFire(id);
    case "fire-conloss":
      return createEmptyFireConloss(id);
    case "motor-private":
      return createEmptyMotorPrivate(id);
    case "motor-commercial":
      return createEmptyMotorCommercial(id);
  }
}

export function getClassDefinition(classId: ClassId): ClassDefinition {
  return CLASS_DEFINITIONS.find((item) => item.id === classId)!;
}

/** Sample values from MASTER QUOTATION TEMPLATE 2026 */
export function createSampleIar(id: string): IarSchedule {
  const base = createEmptyIar(id);
  return {
    ...base,
    interests: [
      line(
        "On Building Of 1St Class Construction Including Boundary Walls &",
        15_000_000,
        "material-damage",
      ),
      line("On Plant, Machinery And Trade Fixtures", 9_800_000, "material-damage"),
      line(
        "On Raw Materials Consisting Of Flat Steel Bars Etc",
        120_000,
        "material-damage",
      ),
      line(
        "On Work In Progress Consisting Of Flat Steel Bars Etc",
        3_400_000,
        "material-damage",
      ),
      line(
        "On Finished Goods Consisting Of Leaf Springs And Ancilliary Products & Rims",
        3_230_000,
        "material-damage",
      ),
      line("On Gross Profit Less Wages", 12_000_000, "business-interruption"),
      line("On Wages/ Salaries", 120_000, "business-interruption"),
      line("On Audit Fees", 320_000, "business-interruption"),
    ],
  };
}

export function createSampleFire(id: string): FireSchedule {
  const base = createEmptyFire(id);
  return {
    ...base,
    interests: [
      line(
        "On Building of First Class construction whilst situate at - Bellevue Estate South C - House No. 315 on Popo Road",
        80_400_000,
      ),
      line("On Stock in Trade Consisting of xxxxxx", 500_000),
      line("On Furniture, Fixtures & Fittings", 230_000),
    ],
  };
}

export function createSampleFireConloss(id: string): FireConlossSchedule {
  const base = createEmptyFireConloss(id);
  return {
    ...base,
    interests: [
      line("On Gross profit", 19_400_000),
      line("Additional Increase in Cost of working", 400_000),
    ],
  };
}

export function createSampleMotorPrivate(id: string): MotorPrivateSchedule {
  return {
    ...createEmptyMotorPrivate(id),
    registration: "KDE 234D",
    sumInsured: 3_000_000,
    cover: "comprehensive",
    excessProtector: true,
    politicalViolenceTerrorism: true,
  };
}

export function createSampleMotorCommercial(id: string): MotorCommercialSchedule {
  return {
    ...createEmptyMotorCommercial(id),
    registration: "KDE 234D",
    sumInsured: 2_400_000,
    cover: "comprehensive",
    useType: "own-goods",
    excessProtector: true,
    politicalViolenceTerrorism: true,
  };
}
