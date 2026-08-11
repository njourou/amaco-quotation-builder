"use client";

import { Building2, Car, Factory, Flame, Plus, Trash2, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/amaco/calculations";
import { CLASS_DEFINITIONS, getClassDefinition } from "@/lib/amaco/class-defs";
import type { ClassId, ClassSchedule, QuotationTotals } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<ClassId, LucideIcon> = {
  iar: Factory,
  fire: Flame,
  "fire-conloss": Building2,
  "motor-private": Car,
  "motor-commercial": Truck,
};

interface ClassPickerProps {
  schedules: ClassSchedule[];
  activeScheduleId: string | null;
  totals: QuotationTotals;
  onAdd: (classId: ClassId) => void;
  onSelect: (scheduleId: string) => void;
  onRemove: (scheduleId: string) => void;
}

export function ClassPicker({
  schedules,
  activeScheduleId,
  totals,
  onAdd,
  onSelect,
  onRemove,
}: ClassPickerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Add class</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select one or more classes. Each becomes a schedule section on the quotation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CLASS_DEFINITIONS.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onAdd(item.id)}
                className="group rounded-xl border border-border/70 bg-card p-4 text-left soft-shadow transition-all hover:border-primary/30 hover:soft-shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Plus className="h-3.5 w-3.5" />
                  Add schedule
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {schedules.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Schedules on this quote</h3>
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const def = getClassDefinition(schedule.classId);
              const premium = totals.byClass.find((item) => item.scheduleId === schedule.id);
              const active = schedule.id === activeScheduleId;
              return (
                <Card
                  key={schedule.id}
                  className={cn(
                    "border-border/70 soft-shadow transition-all",
                    active && "border-primary/40 ring-1 ring-primary/20",
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelect(schedule.id)}
                    >
                      <CardTitle className="text-sm font-semibold">{def.name}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {premium
                          ? formatCurrency(premium.totalPremium)
                          : "No premium yet"}
                      </CardDescription>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(schedule.id)}
                      aria-label="Remove schedule"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            No classes added yet. Pick a class above to start a schedule.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
