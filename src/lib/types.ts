export type QuotationStep = "header" | "classes" | "preview";

export type ClassId =
  | "iar"
  | "fire"
  | "fire-conloss"
  | "motor-private"
  | "motor-commercial";

export type MotorCoverType = "comprehensive" | "tpo";

export type CommercialUseType = "own-goods" | "general-cartage";

export type CommercialTonnageBand =
  | "0-3"
  | "3-8"
  | "9-15"
  | "15-above"
  | "prime-mover"
  | "trailer"
  | "fleet";

export interface QuotationHeader {
  sn: string;
  date: string;
  proposer: string;
  location: string;
  occupation: string;
  intermediary: string;
}

export interface InterestLine {
  id: string;
  description: string;
  sumInsured: number;
  section?: "material-damage" | "business-interruption" | "default";
}

export interface PropertyDiscounts {
  applyNcd: boolean;
  applyLta: boolean;
  applyEarthquake: boolean;
  applyFlood: boolean;
}

export interface IarSchedule {
  id: string;
  classId: "iar";
  interests: InterestLine[];
  discounts: PropertyDiscounts;
  selectedClauses: string[];
  indemnityPeriodMonths: number;
}

export interface FireSchedule {
  id: string;
  classId: "fire";
  interests: InterestLine[];
  discounts: PropertyDiscounts;
  selectedClauses: string[];
}

export interface FireConlossSchedule {
  id: string;
  classId: "fire-conloss";
  interests: InterestLine[];
  discounts: PropertyDiscounts;
  indemnityPeriodMonths: number;
  /** Links Fire Conloss rate to Fire MD rate from Excel D55. */
  useFireRate: boolean;
}

export interface MotorPrivateSchedule {
  id: string;
  classId: "motor-private";
  registration: string;
  sumInsured: number;
  cover: MotorCoverType;
  excessProtector: boolean;
  politicalViolenceTerrorism: boolean;
  selectedRemarks: string[];
}

export interface MotorCommercialSchedule {
  id: string;
  classId: "motor-commercial";
  registration: string;
  sumInsured: number;
  cover: MotorCoverType;
  useType: CommercialUseType;
  tonnageBand: CommercialTonnageBand;
  excessProtector: boolean;
  politicalViolenceTerrorism: boolean;
  selectedRemarks: string[];
}

export type ClassSchedule =
  | IarSchedule
  | FireSchedule
  | FireConlossSchedule
  | MotorPrivateSchedule
  | MotorCommercialSchedule;

export interface ClassPremiumBreakdown {
  classId: ClassId;
  scheduleId: string;
  label: string;
  totalSumInsured: number;
  rate: number;
  basePremium: number;
  ncd: number;
  afterNcd: number;
  lta: number;
  afterLta: number;
  earthquake: number;
  flood: number;
  options: number;
  netPremium: number;
  trainingLevy: number;
  phcfLevy: number;
  stampDuty: number;
  totalPremium: number;
  lines: { label: string; amount: number }[];
}

export interface QuotationTotals {
  byClass: ClassPremiumBreakdown[];
  grandTotal: number;
}

export interface QuotationState {
  id: string;
  step: QuotationStep;
  header: QuotationHeader;
  schedules: ClassSchedule[];
  activeScheduleId: string | null;
  createdAt: string;
}

export interface RecentQuotation {
  id: string;
  clientName: string;
  productName: string;
  totalPremium: number;
  updatedAt: string;
  status: "draft" | "issued";
}

export interface ClassDefinition {
  id: ClassId;
  name: string;
  shortName: string;
  description: string;
  category: "property" | "motor";
}
