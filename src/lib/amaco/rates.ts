import type { CommercialTonnageBand } from "@/lib/types";

/** Excel: Training Levy 0.2%, PHCF 0.25%, Stamp Duty KES 40 */
export const TRAINING_LEVY_RATE = 0.002;
export const PHCF_LEVY_RATE = 0.0025;
export const STAMP_DUTY = 40;

/** Excel: NCD 15%, LTA 15% */
export const NCD_RATE = 0.15;
export const LTA_RATE = 0.15;

/** Excel: Earthquake 0.00025, Flood 0.0001 of sum insured */
export const EARTHQUAKE_RATE = 0.00025;
export const FLOOD_RATE = 0.0001;

/**
 * Industrial All Risks base rate from Excel:
 * =0.225%*1.25 → 0.0028125
 */
export const IAR_RATE = 0.00225 * 1.25;

/** Fire & Perils MD rate from Excel D55 */
export const FIRE_RATE = 0.0025;

/** Motor Private Comprehensive */
export const MOTOR_PRIVATE_COMP_RATE = 0.035;
export const MOTOR_PRIVATE_EXCESS_PROTECTOR_RATE = 0.0025;
export const MOTOR_PRIVATE_PVT_RATE = 0.0025;
export const MOTOR_PRIVATE_TPO_PREMIUM = 7_500;

/** Motor Commercial Comprehensive */
export const MOTOR_COMMERCIAL_OWN_GOODS_COMP_RATE = 0.05;
export const MOTOR_COMMERCIAL_CARTAGE_COMP_RATE = 0.055;
export const MOTOR_COMMERCIAL_EXCESS_PROTECTOR_RATE = 0.005;
export const MOTOR_COMMERCIAL_PVT_RATE = 0.0045;

/** Motor Commercial TPO tonnage table from Excel sheet */
export const MOTOR_COMMERCIAL_TPO_TABLE: Record<CommercialTonnageBand, number> = {
  "0-3": 5_500,
  "3-8": 8_000,
  "9-15": 10_000,
  "15-above": 12_000,
  "prime-mover": 7_500,
  trailer: 10_000,
  fleet: 15_000,
};

export const MOTOR_COMMERCIAL_TONNAGE_LABELS: Record<CommercialTonnageBand, string> = {
  "0-3": ">0 – 3 tons",
  "3-8": ">3 – 8 tons",
  "9-15": ">9 – 15 tons",
  "15-above": ">15 & above",
  "prime-mover": "Prime Mover",
  trailer: "Trailer",
  fleet: "Fleet (Truck & Trailer)",
};

/** Brand + company details from https://www.amaco.co.ke/ */
export const COMPANY = {
  name: "Africa Merchant Assurance Company Limited",
  shortName: "AMACO",
  tagline: "Covering What Matters Most",
  peaceOfMind: "your peace of mind.",
  about:
    "Africa Merchant Assurance Company Limited is incorporated in Kenya and licensed to transact General insurance business.",
  vision: "To be the most trusted and customer-centric insurance provider",
  mission:
    "To provide affordable and innovative insurance solutions while delivering superior customer experience",
  website: "https://www.amaco.co.ke/",
  phone: "020 2204000",
  mobile: "0792 256 233 / 0738 312 121",
  emailPrimary: "customercare@amaco.co.ke",
  emailSecondary: "info@amaco.co.ke",
  location: "NextGen Mall, 4th Floor, Nairobi",
} as const;

/** Logo magenta sampled from brand mark ≈ #D82078 */
export const BRAND_MAGENTA = "#D82078";

export const DISCLAIMERS = [
  "Premiums quoted include basic premium, stamp duty & levies.",
  "Occupation defined in this quotation is certified as the true occupation.",
  "This quotation is an invitation to offer and does not constitute an offer.",
  "Quotation valid for 30 days.",
  "These terms take precedence irrespective of terms indicated on risk notes/emails.",
  "Provide loss ratio for further discount (if applicable).",
  "Final terms will be as per our standard policy terms and conditions.",
] as const;
