"use client";

import { Calculator, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/amaco/calculations";
import type { QuotationTotals } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PremiumPanelProps {
  totals: QuotationTotals;
  className?: string;
}

export function PremiumPanel({ totals, className }: PremiumPanelProps) {
  return (
    <Card className={cn("sticky top-6 border-border/70 soft-shadow-lg", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">Premium Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <PremiumBody totals={totals} />
      </CardContent>
    </Card>
  );
}

function PremiumBody({ totals }: { totals: QuotationTotals }) {
  if (totals.byClass.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a class schedule to see live premiums.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {totals.byClass.map((item) => (
        <div key={item.scheduleId} className="space-y-1.5 border-b border-border/60 pb-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug">{item.label}</p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
              {formatCurrency(item.totalPremium)}
            </p>
          </div>
          <div className="space-y-1">
            {item.lines.slice(0, -1).map((line) => (
              <div
                key={`${item.scheduleId}-${line.label}`}
                className="flex justify-between gap-3 text-xs text-muted-foreground"
              >
                <span>{line.label}</span>
                <span className="tabular-nums">{formatCurrency(line.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-sm font-semibold">GRAND TOTAL</span>
        <span className="text-lg font-semibold tabular-nums text-primary">
          {formatCurrency(totals.grandTotal)}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Includes basic premium, stamp duty & levies (Excel template rules).
      </p>
    </div>
  );
}

export function MobilePremiumDrawer({ totals }: { totals: QuotationTotals }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 p-3 backdrop-blur-md no-print lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Grand Total</p>
            <p className="text-lg font-semibold tabular-nums text-primary">
              {formatCurrency(totals.grandTotal)}
            </p>
          </div>
          <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
            Details
            <ChevronUp className="h-4 w-4" />
          </SheetTrigger>
        </div>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Premium Summary</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">
            <PremiumBody totals={totals} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
