"use client";

import { Plus, Trash2 } from "lucide-react";
import { CurrencyInput } from "@/components/quotation/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FIRE_CLAUSES,
  FIRE_EXCESSES,
  IAR_CLAUSES,
  IAR_EXCESSES,
  createInterestId,
} from "@/lib/amaco/class-defs";
import { FIRE_RATE, IAR_RATE } from "@/lib/amaco/rates";
import type {
  FireConlossSchedule,
  FireSchedule,
  IarSchedule,
  InterestLine,
  PropertyDiscounts,
} from "@/lib/types";

type PropertySchedule = IarSchedule | FireSchedule | FireConlossSchedule;

interface PropertyScheduleFormProps {
  schedule: PropertySchedule;
  onChange: (schedule: PropertySchedule) => void;
}

export function PropertyScheduleForm({ schedule, onChange }: PropertyScheduleFormProps) {
  const isIar = schedule.classId === "iar";
  const isConloss = schedule.classId === "fire-conloss";
  const clauses = isIar ? IAR_CLAUSES : isConloss ? [] : FIRE_CLAUSES;
  const excesses = isIar ? IAR_EXCESSES : FIRE_EXCESSES;
  const rateLabel =
    schedule.classId === "iar"
      ? `Rate ${(IAR_RATE * 100).toFixed(4)}% (0.225% × 1.25)`
      : `Rate ${(FIRE_RATE * 100).toFixed(2)}%`;

  const updateInterest = (id: string, patch: Partial<InterestLine>) => {
    onChange({
      ...schedule,
      interests: schedule.interests.map((line) =>
        line.id === id ? { ...line, ...patch } : line,
      ),
    } as PropertySchedule);
  };

  const addInterest = (section?: InterestLine["section"]) => {
    onChange({
      ...schedule,
      interests: [
        ...schedule.interests,
        {
          id: createInterestId(),
          description: "",
          sumInsured: 0,
          section: section ?? "default",
        },
      ],
    } as PropertySchedule);
  };

  const removeInterest = (id: string) => {
    onChange({
      ...schedule,
      interests: schedule.interests.filter((line) => line.id !== id),
    } as PropertySchedule);
  };

  const updateDiscounts = (patch: Partial<PropertyDiscounts>) => {
    onChange({
      ...schedule,
      discounts: { ...schedule.discounts, ...patch },
    } as PropertySchedule);
  };

  const mdLines = isIar
    ? schedule.interests.filter((l) => l.section === "material-damage")
    : schedule.interests;
  const biLines = isIar
    ? schedule.interests.filter((l) => l.section === "business-interruption")
    : [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{rateLabel}</p>

      {isIar ? (
        <>
          <InterestSection
            title="Section A — Material Damage"
            lines={mdLines}
            onUpdate={updateInterest}
            onRemove={removeInterest}
            onAdd={() => addInterest("material-damage")}
          />
          <InterestSection
            title="Section B — Business Interruption"
            lines={biLines}
            onUpdate={updateInterest}
            onRemove={removeInterest}
            onAdd={() => addInterest("business-interruption")}
          />
        </>
      ) : (
        <InterestSection
          title={isConloss ? "Consequential Loss Interests" : "Interests Insured"}
          lines={schedule.interests}
          onUpdate={updateInterest}
          onRemove={removeInterest}
          onAdd={() => addInterest(isConloss ? "default" : "default")}
        />
      )}

      {(isIar || isConloss) && "indemnityPeriodMonths" in schedule ? (
        <div className="space-y-2">
          <Label htmlFor="indemnity">Indemnity period (months)</Label>
          <Input
            id="indemnity"
            type="number"
            min={1}
            max={36}
            className="h-11 max-w-xs"
            value={schedule.indemnityPeriodMonths}
            onChange={(event) =>
              onChange({
                ...schedule,
                indemnityPeriodMonths: Number(event.target.value) || 12,
              } as PropertySchedule)
            }
          />
        </div>
      ) : null}

      <div className="rounded-xl border border-border/70 p-4">
        <p className="mb-3 text-sm font-semibold">Discounts & natural perils</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            id={`${schedule.id}-ncd`}
            label="No Claim Discount 15%"
            checked={schedule.discounts.applyNcd}
            onChange={(applyNcd) => updateDiscounts({ applyNcd })}
          />
          <Toggle
            id={`${schedule.id}-lta`}
            label="LTA Discount 15%"
            checked={schedule.discounts.applyLta}
            onChange={(applyLta) => updateDiscounts({ applyLta })}
          />
          <Toggle
            id={`${schedule.id}-eq`}
            label="Earthquake (0.025% of SI)"
            checked={schedule.discounts.applyEarthquake}
            onChange={(applyEarthquake) => updateDiscounts({ applyEarthquake })}
          />
          <Toggle
            id={`${schedule.id}-flood`}
            label="Flood (0.01% of SI)"
            checked={schedule.discounts.applyFlood}
            onChange={(applyFlood) => updateDiscounts({ applyFlood })}
          />
        </div>
      </div>

      {clauses.length > 0 && "selectedClauses" in schedule ? (
        <div className="rounded-xl border border-border/70 p-4">
          <p className="mb-3 text-sm font-semibold">Clauses</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {clauses.map((clause) => {
              const checked = schedule.selectedClauses.includes(clause.id);
              return (
                <label
                  key={clause.id}
                  className="flex items-center gap-2 text-sm"
                  htmlFor={`${schedule.id}-${clause.id}`}
                >
                  <Checkbox
                    id={`${schedule.id}-${clause.id}`}
                    checked={checked}
                    onCheckedChange={() => {
                      const selectedClauses = checked
                        ? schedule.selectedClauses.filter((id) => id !== clause.id)
                        : [...schedule.selectedClauses, clause.id];
                      onChange({ ...schedule, selectedClauses } as PropertySchedule);
                    }}
                  />
                  {clause.label}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
        <p className="mb-2 text-sm font-semibold">Excesses / remarks (from template)</p>
        <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          {excesses.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InterestSection({
  title,
  lines,
  onUpdate,
  onRemove,
  onAdd,
}: {
  title: string;
  lines: InterestLine[];
  onUpdate: (id: string, patch: Partial<InterestLine>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add line
        </Button>
      </div>
      {lines.map((line) => (
        <div
          key={line.id}
          className="grid gap-3 rounded-xl border border-border/60 p-3 md:grid-cols-[1fr_200px_auto]"
        >
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Interest</Label>
            <Input
              value={line.description}
              onChange={(event) => onUpdate(line.id, { description: event.target.value })}
              className="h-10"
              placeholder="Description of interest"
            />
          </div>
          <CurrencyInput
            id={`${line.id}-si`}
            label="Sum insured"
            value={line.sumInsured}
            onChange={(sumInsured) => onUpdate(line.id, { sumInsured })}
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(line.id)}
              aria-label="Remove line"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(Boolean(value))}
      />
      {label}
    </label>
  );
}
