"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuotationHeader } from "@/lib/types";

interface HeaderFormProps {
  value: QuotationHeader;
  onChange: (patch: Partial<QuotationHeader>) => void;
}

const FIELDS: {
  key: keyof QuotationHeader;
  label: string;
  placeholder: string;
  type?: string;
  optional?: boolean;
}[] = [
  { key: "proposer", label: "Proposer", placeholder: "e.g. ABC Manufacturing Ltd" },
  { key: "location", label: "Location / Risk Location", placeholder: "Industrial Area, Nairobi" },
  { key: "occupation", label: "Occupation", placeholder: "Manufacturing — leaf springs" },
  {
    key: "intermediary",
    label: "Intermediary",
    placeholder: "Broker / agent name",
    optional: true,
  },
  { key: "sn", label: "SN / Quote reference", placeholder: "AMACO/2026/001", optional: true },
  { key: "date", label: "Date", type: "date", placeholder: "" },
];

export function HeaderForm({ value, onChange }: HeaderFormProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 soft-shadow sm:p-8">
      <p className="mb-6 text-sm text-muted-foreground">
        These details appear once at the top of the quotation, matching the Excel header.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className={field.key === "proposer" || field.key === "location" ? "md:col-span-2" : ""}
          >
            <Label htmlFor={field.key} className="text-sm font-medium text-foreground/80">
              {field.label}
              {field.optional ? (
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              ) : null}
            </Label>
            <Input
              id={field.key}
              type={field.type ?? "text"}
              value={value[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => onChange({ [field.key]: event.target.value })}
              className="mt-2 h-11"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
