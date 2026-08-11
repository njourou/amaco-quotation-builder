"use client";

import { CurrencyInput } from "@/components/quotation/CurrencyInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MOTOR_COMMERCIAL_REMARKS,
  MOTOR_PRIVATE_REMARKS,
} from "@/lib/amaco/class-defs";
import {
  MOTOR_COMMERCIAL_TONNAGE_LABELS,
} from "@/lib/amaco/rates";
import type {
  CommercialTonnageBand,
  CommercialUseType,
  MotorCommercialSchedule,
  MotorCoverType,
  MotorPrivateSchedule,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type MotorSchedule = MotorPrivateSchedule | MotorCommercialSchedule;

interface MotorScheduleFormProps {
  schedule: MotorSchedule;
  onChange: (schedule: MotorSchedule) => void;
}

const selectClass =
  "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function MotorScheduleForm({ schedule, onChange }: MotorScheduleFormProps) {
  const isCommercial = schedule.classId === "motor-commercial";
  const remarks = isCommercial ? MOTOR_COMMERCIAL_REMARKS : MOTOR_PRIVATE_REMARKS;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${schedule.id}-reg`}>Registration</Label>
          <Input
            id={`${schedule.id}-reg`}
            className="h-11"
            value={schedule.registration}
            placeholder="e.g. KDE 234D"
            onChange={(event) =>
              onChange({ ...schedule, registration: event.target.value })
            }
          />
        </div>

        {schedule.cover === "comprehensive" || !isCommercial ? (
          <CurrencyInput
            id={`${schedule.id}-si`}
            label="Estimated vehicle value"
            value={schedule.sumInsured}
            onChange={(sumInsured) => onChange({ ...schedule, sumInsured })}
            hint={
              schedule.cover === "tpo" && !isCommercial
                ? "Not used for Private TPO (flat KES 7,500)"
                : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`${schedule.id}-tonnage`}>Tonnage / TPO band</Label>
            <select
              id={`${schedule.id}-tonnage`}
              className={selectClass}
              value={(schedule as MotorCommercialSchedule).tonnageBand}
              onChange={(event) =>
                onChange({
                  ...schedule,
                  tonnageBand: event.target.value as CommercialTonnageBand,
                } as MotorCommercialSchedule)
              }
            >
              {(Object.keys(MOTOR_COMMERCIAL_TONNAGE_LABELS) as CommercialTonnageBand[]).map(
                (band) => (
                  <option key={band} value={band}>
                    {MOTOR_COMMERCIAL_TONNAGE_LABELS[band]}
                  </option>
                ),
              )}
            </select>
          </div>
        )}
      </div>

      {isCommercial ? (
        <div className="space-y-2">
          <Label>Commercial use</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["own-goods", "Own Goods"],
                ["general-cartage", "General Cartage"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onChange({
                    ...schedule,
                    useType: value as CommercialUseType,
                  } as MotorCommercialSchedule)
                }
                className={cn(
                  "rounded-xl border border-border/70 p-4 text-left text-sm transition-all",
                  (schedule as MotorCommercialSchedule).useType === value &&
                    "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                )}
              >
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {value === "own-goods" ? "Comp rate 5%" : "Comp rate 5.5%"}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Cover</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["comprehensive", "Comprehensive"],
              ["tpo", "TPO (Third Party Only)"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({ ...schedule, cover: value as MotorCoverType })
              }
              className={cn(
                "rounded-xl border border-border/70 p-4 text-left text-sm transition-all",
                schedule.cover === value &&
                  "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
              )}
            >
              <p className="font-semibold">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {schedule.cover === "comprehensive" ? (
        <div className="rounded-xl border border-border/70 p-4">
          <p className="mb-3 text-sm font-semibold">Optional benefits (extra premium)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm" htmlFor={`${schedule.id}-ep`}>
              <Checkbox
                id={`${schedule.id}-ep`}
                checked={schedule.excessProtector}
                onCheckedChange={(value) =>
                  onChange({ ...schedule, excessProtector: Boolean(value) })
                }
              />
              Excess Protector
              <span className="text-xs text-muted-foreground">
                {isCommercial ? "(0.5%)" : "(0.25%)"}
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm" htmlFor={`${schedule.id}-pvt`}>
              <Checkbox
                id={`${schedule.id}-pvt`}
                checked={schedule.politicalViolenceTerrorism}
                onCheckedChange={(value) =>
                  onChange({
                    ...schedule,
                    politicalViolenceTerrorism: Boolean(value),
                  })
                }
              />
              Political Violence & Terrorism
              <span className="text-xs text-muted-foreground">
                {isCommercial ? "(0.45%)" : "(0.25%)"}
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {isCommercial && schedule.cover === "tpo" ? (
        <CurrencyInput
          id={`${schedule.id}-si-hidden`}
          label="Vehicle value (optional reference)"
          value={schedule.sumInsured}
          onChange={(sumInsured) => onChange({ ...schedule, sumInsured })}
          hint="TPO premium uses tonnage table, not vehicle value"
        />
      ) : null}

      <div className="rounded-xl border border-border/70 p-4">
        <p className="mb-3 text-sm font-semibold">Excess / remarks</p>
        <div className="space-y-2">
          {remarks.map((remark) => {
            const checked = schedule.selectedRemarks.includes(remark);
            return (
              <label key={remark} className="flex items-start gap-2 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={checked}
                  onCheckedChange={() => {
                    const selectedRemarks = checked
                      ? schedule.selectedRemarks.filter((item) => item !== remark)
                      : [...schedule.selectedRemarks, remark];
                    onChange({ ...schedule, selectedRemarks });
                  }}
                />
                <span className="text-muted-foreground">{remark}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
