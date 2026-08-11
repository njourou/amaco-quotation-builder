"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LayoutTemplate,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuotation } from "@/context/QuotationContext";
import { COMPANY } from "@/lib/amaco/rates";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quotation/new", label: "New Quotation", icon: Plus },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resetQuotation } = useQuotation();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (item.href === "/quotation/new") {
                resetQuotation();
              }
              setMobileOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
            AM
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">{COMPANY.shortName}</p>
            <p className="text-xs text-muted-foreground">Quotation desk</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Master template
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Rates & levies from AMACO Master Quotation Template 2026. Frontend
              prototype only.
            </p>
          </div>
        </div>
      </aside>

      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            AM
          </div>
          <span className="text-sm font-semibold">{COMPANY.shortName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {mobileOpen ? (
        <div
          className="no-print fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                AM
              </div>
              <div>
                <p className="text-sm font-semibold">{COMPANY.shortName}</p>
                <p className="text-xs text-muted-foreground">Quotation desk</p>
              </div>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
