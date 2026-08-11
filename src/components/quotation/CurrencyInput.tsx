"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, parseCurrencyInput } from "@/lib/amaco/calculations";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  className?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  hint,
  className,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(value ? formatNumber(value) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value ? formatNumber(value) : "");
    }
  }, [value, focused]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground/80">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          KES
        </span>
        <Input
          id={id}
          inputMode="decimal"
          value={display}
          onFocus={() => {
            setFocused(true);
            setDisplay(value ? String(value) : "");
          }}
          onBlur={() => {
            setFocused(false);
            setDisplay(value ? formatNumber(value) : "");
          }}
          onChange={(event) => {
            const raw = event.target.value;
            setDisplay(raw);
            onChange(parseCurrencyInput(raw));
          }}
          className="h-11 pl-12 transition-shadow focus-visible:ring-primary/30"
          placeholder="0"
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
