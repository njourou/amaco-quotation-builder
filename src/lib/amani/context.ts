import type { QuotationState } from "@/lib/types";

export function buildAmaniFormState(
  quotation?: QuotationState,
): Record<string, unknown> {
  if (!quotation?.schedules.length) return {};

  const schedule =
    quotation.schedules.find((item) => item.id === quotation.activeScheduleId) ??
    quotation.schedules[0];

  const formState: Record<string, unknown> = { classId: schedule.classId };

  if ("sumInsured" in schedule && schedule.sumInsured > 0) {
    formState.sumInsured = schedule.sumInsured;
  }

  if ("cover" in schedule && schedule.cover) {
    formState.cover = schedule.cover;
  }

  if ("registration" in schedule && schedule.registration) {
    formState.registration = schedule.registration;
  }

  if ("useType" in schedule) {
    formState.useType = schedule.useType;
  }

  if ("tonnageBand" in schedule) {
    formState.tonnageBand = schedule.tonnageBand;
  }

  if ("excessProtector" in schedule) {
    formState.excessProtector = schedule.excessProtector;
  }

  if ("politicalViolenceTerrorism" in schedule) {
    formState.politicalViolenceTerrorism = schedule.politicalViolenceTerrorism;
  }

  if ("interests" in schedule && schedule.interests.length > 0) {
    formState.interests = schedule.interests.map((line) => ({
      description: line.description,
      sumInsured: line.sumInsured,
    }));
  }

  if (quotation.header.proposer) {
    formState.proposer = quotation.header.proposer;
  }

  return formState;
}
