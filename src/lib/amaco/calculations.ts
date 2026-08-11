import {
  getClassDefinition,
} from "@/lib/amaco/class-defs";
import {
  EARTHQUAKE_RATE,
  FIRE_RATE,
  FLOOD_RATE,
  IAR_RATE,
  LTA_RATE,
  MOTOR_COMMERCIAL_CARTAGE_COMP_RATE,
  MOTOR_COMMERCIAL_EXCESS_PROTECTOR_RATE,
  MOTOR_COMMERCIAL_OWN_GOODS_COMP_RATE,
  MOTOR_COMMERCIAL_PVT_RATE,
  MOTOR_COMMERCIAL_TPO_TABLE,
  MOTOR_PRIVATE_COMP_RATE,
  MOTOR_PRIVATE_EXCESS_PROTECTOR_RATE,
  MOTOR_PRIVATE_PVT_RATE,
  MOTOR_PRIVATE_TPO_PREMIUM,
  NCD_RATE,
  PHCF_LEVY_RATE,
  STAMP_DUTY,
  TRAINING_LEVY_RATE,
} from "@/lib/amaco/rates";
import type {
  ClassPremiumBreakdown,
  ClassSchedule,
  FireConlossSchedule,
  FireSchedule,
  IarSchedule,
  MotorCommercialSchedule,
  MotorPrivateSchedule,
  PropertyDiscounts,
  QuotationTotals,
} from "@/lib/types";

function sumInterests(schedule: { interests: { sumInsured: number }[] }): number {
  return schedule.interests.reduce((sum, line) => sum + (line.sumInsured || 0), 0);
}

function applyPropertyStack(
  totalSi: number,
  rate: number,
  discounts: PropertyDiscounts,
  label: string,
  classId: ClassPremiumBreakdown["classId"],
  scheduleId: string,
): ClassPremiumBreakdown {
  const basePremium = totalSi * rate;
  const ncd = discounts.applyNcd ? -(basePremium * NCD_RATE) : 0;
  const afterNcd = basePremium + ncd;
  const lta = discounts.applyLta ? -(afterNcd * LTA_RATE) : 0;
  const afterLta = afterNcd + lta;
  const earthquake = discounts.applyEarthquake ? totalSi * EARTHQUAKE_RATE : 0;
  const flood = discounts.applyFlood ? totalSi * FLOOD_RATE : 0;
  const netPremium = afterLta + earthquake + flood;
  const trainingLevy = netPremium * TRAINING_LEVY_RATE;
  const phcfLevy = netPremium * PHCF_LEVY_RATE;
  const stampDuty = STAMP_DUTY;
  const totalPremium = netPremium + trainingLevy + phcfLevy + stampDuty;

  const lines: { label: string; amount: number }[] = [
    { label: "Base Premium", amount: basePremium },
  ];
  if (discounts.applyNcd) lines.push({ label: "No Claim Discount (15%)", amount: ncd });
  if (discounts.applyLta) lines.push({ label: "LTA Discount (15%)", amount: lta });
  if (discounts.applyEarthquake) {
    lines.push({ label: "Earthquake", amount: earthquake });
  }
  if (discounts.applyFlood) lines.push({ label: "Flood", amount: flood });
  lines.push(
    { label: "Training Levy (0.2%)", amount: trainingLevy },
    { label: "PHCF (0.25%)", amount: phcfLevy },
    { label: "Stamp Duty", amount: stampDuty },
    { label: "Class Total", amount: totalPremium },
  );

  return {
    classId,
    scheduleId,
    label,
    totalSumInsured: totalSi,
    rate,
    basePremium,
    ncd,
    afterNcd,
    lta,
    afterLta,
    earthquake,
    flood,
    options: 0,
    netPremium,
    trainingLevy,
    phcfLevy,
    stampDuty,
    totalPremium,
    lines,
  };
}

function calculateIar(schedule: IarSchedule): ClassPremiumBreakdown {
  return applyPropertyStack(
    sumInterests(schedule),
    IAR_RATE,
    schedule.discounts,
    getClassDefinition("iar").name,
    "iar",
    schedule.id,
  );
}

function calculateFire(schedule: FireSchedule): ClassPremiumBreakdown {
  return applyPropertyStack(
    sumInterests(schedule),
    FIRE_RATE,
    schedule.discounts,
    getClassDefinition("fire").name,
    "fire",
    schedule.id,
  );
}

function calculateFireConloss(schedule: FireConlossSchedule): ClassPremiumBreakdown {
  const rate = schedule.useFireRate ? FIRE_RATE : FIRE_RATE;
  return applyPropertyStack(
    sumInterests(schedule),
    rate,
    schedule.discounts,
    getClassDefinition("fire-conloss").name,
    "fire-conloss",
    schedule.id,
  );
}

function withMotorLevies(
  netBeforeLevy: number,
  extras: {
    classId: ClassPremiumBreakdown["classId"];
    scheduleId: string;
    label: string;
    totalSumInsured: number;
    rate: number;
    basePremium: number;
    options: number;
    lines: { label: string; amount: number }[];
  },
): ClassPremiumBreakdown {
  const trainingLevy = netBeforeLevy * TRAINING_LEVY_RATE;
  const phcfLevy = netBeforeLevy * PHCF_LEVY_RATE;
  const stampDuty = STAMP_DUTY;
  const totalPremium = netBeforeLevy + trainingLevy + phcfLevy + stampDuty;

  return {
    classId: extras.classId,
    scheduleId: extras.scheduleId,
    label: extras.label,
    totalSumInsured: extras.totalSumInsured,
    rate: extras.rate,
    basePremium: extras.basePremium,
    ncd: 0,
    afterNcd: extras.basePremium,
    lta: 0,
    afterLta: extras.basePremium,
    earthquake: 0,
    flood: 0,
    options: extras.options,
    netPremium: netBeforeLevy,
    trainingLevy,
    phcfLevy,
    stampDuty,
    totalPremium,
    lines: [
      ...extras.lines,
      { label: "Training Levy (0.2%)", amount: trainingLevy },
      { label: "PHCF (0.25%)", amount: phcfLevy },
      { label: "Stamp Duty", amount: stampDuty },
      { label: "Class Total", amount: totalPremium },
    ],
  };
}

function calculateMotorPrivate(schedule: MotorPrivateSchedule): ClassPremiumBreakdown {
  const label = getClassDefinition("motor-private").name;

  if (schedule.cover === "tpo") {
    const basePremium = MOTOR_PRIVATE_TPO_PREMIUM;
    return withMotorLevies(basePremium, {
      classId: "motor-private",
      scheduleId: schedule.id,
      label: `${label} (TPO)`,
      totalSumInsured: 0,
      rate: 0,
      basePremium,
      options: 0,
      lines: [{ label: "Third Party Only Premium", amount: basePremium }],
    });
  }

  const value = schedule.sumInsured;
  const basePremium = value * MOTOR_PRIVATE_COMP_RATE;
  const excessProtector = schedule.excessProtector
    ? value * MOTOR_PRIVATE_EXCESS_PROTECTOR_RATE
    : 0;
  const pvt = schedule.politicalViolenceTerrorism
    ? value * MOTOR_PRIVATE_PVT_RATE
    : 0;
  const options = excessProtector + pvt;
  const net = basePremium + options;

  const lines: { label: string; amount: number }[] = [
    { label: "Comprehensive Premium (3.5%)", amount: basePremium },
  ];
  if (excessProtector) {
    lines.push({ label: "Excess Protector (0.25%)", amount: excessProtector });
  }
  if (pvt) {
    lines.push({ label: "Political Violence & Terrorism (0.25%)", amount: pvt });
  }

  return withMotorLevies(net, {
    classId: "motor-private",
    scheduleId: schedule.id,
    label: `${label} (Comp)`,
    totalSumInsured: value,
    rate: MOTOR_PRIVATE_COMP_RATE,
    basePremium,
    options,
    lines,
  });
}

function calculateMotorCommercial(
  schedule: MotorCommercialSchedule,
): ClassPremiumBreakdown {
  const label = getClassDefinition("motor-commercial").name;
  const useLabel =
    schedule.useType === "own-goods" ? "Own Goods" : "General Cartage";

  if (schedule.cover === "tpo") {
    const basePremium = MOTOR_COMMERCIAL_TPO_TABLE[schedule.tonnageBand];
    return withMotorLevies(basePremium, {
      classId: "motor-commercial",
      scheduleId: schedule.id,
      label: `${label} TPO (${useLabel})`,
      totalSumInsured: 0,
      rate: 0,
      basePremium,
      options: 0,
      lines: [{ label: `TPO Premium (${schedule.tonnageBand})`, amount: basePremium }],
    });
  }

  const rate =
    schedule.useType === "own-goods"
      ? MOTOR_COMMERCIAL_OWN_GOODS_COMP_RATE
      : MOTOR_COMMERCIAL_CARTAGE_COMP_RATE;
  const value = schedule.sumInsured;
  const basePremium = value * rate;
  const excessProtector = schedule.excessProtector
    ? value * MOTOR_COMMERCIAL_EXCESS_PROTECTOR_RATE
    : 0;
  const pvt = schedule.politicalViolenceTerrorism
    ? value * MOTOR_COMMERCIAL_PVT_RATE
    : 0;
  const options = excessProtector + pvt;
  const net = basePremium + options;

  const lines: { label: string; amount: number }[] = [
    {
      label: `Comprehensive Premium (${(rate * 100).toFixed(1)}%)`,
      amount: basePremium,
    },
  ];
  if (excessProtector) {
    lines.push({ label: "Excess Protector (0.5%)", amount: excessProtector });
  }
  if (pvt) {
    lines.push({ label: "Political Violence & Terrorism (0.45%)", amount: pvt });
  }

  return withMotorLevies(net, {
    classId: "motor-commercial",
    scheduleId: schedule.id,
    label: `${label} Comp (${useLabel})`,
    totalSumInsured: value,
    rate,
    basePremium,
    options,
    lines,
  });
}

export function calculateClassPremium(schedule: ClassSchedule): ClassPremiumBreakdown {
  switch (schedule.classId) {
    case "iar":
      return calculateIar(schedule);
    case "fire":
      return calculateFire(schedule);
    case "fire-conloss":
      return calculateFireConloss(schedule);
    case "motor-private":
      return calculateMotorPrivate(schedule);
    case "motor-commercial":
      return calculateMotorCommercial(schedule);
  }
}

export function calculateQuotationTotal(schedules: ClassSchedule[]): QuotationTotals {
  const byClass = schedules.map(calculateClassPremium);
  const grandTotal = byClass.reduce((sum, item) => sum + item.totalPremium, 0);
  return { byClass, grandTotal };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-KE").format(value);
}

export function formatRate(rate: number): string {
  if (rate === 0) return "—";
  return `${(rate * 100).toFixed(4).replace(/\.?0+$/, "")}%`;
}

export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
