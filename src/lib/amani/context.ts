import type { QuotationState } from "@/lib/types";
import type { AmaniChatContext } from "./types";

export function buildAmaniContext(
  pathname: string,
  quotation?: QuotationState,
): AmaniChatContext {
  const context: AmaniChatContext = {
    pathname,
    url: typeof window !== "undefined" ? window.location.href : pathname,
  };

  const formState = buildFormState(quotation);
  if (formState && Object.keys(formState).length > 0) {
    context.formState = formState;
  }

  return context;
}

function buildFormState(
  quotation?: QuotationState,
): Record<string, unknown> | undefined {
  if (!quotation?.schedules.length) return undefined;

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
