"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AmaniChatWidget } from "@/components/amani/AmaniChatWidget";
import { QuotationProvider } from "@/context/QuotationContext";
import { COMPANY } from "@/lib/amaco/rates";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <QuotationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border/70 bg-card/80 backdrop-blur-md no-print">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/amaco-logo.png"
                alt={`${COMPANY.shortName} logo`}
                width={146}
                height={55}
                className="h-11 w-auto object-contain"
                priority
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">
                  {COMPANY.shortName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {COMPANY.tagline}
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Products
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        <footer className="border-t border-border/70 bg-card/50 py-6 no-print">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {COMPANY.name}. All rights
              reserved.
            </p>
          </div>
        </footer>
        <AmaniChatWidget />
      </div>
    </QuotationProvider>
  );
}
