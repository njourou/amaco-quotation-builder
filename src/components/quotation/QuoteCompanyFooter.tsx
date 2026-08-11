"use client";

import type { ReactNode } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/lib/amaco/rates";

/** Shared company block for on-screen quotes and printable PDF. */
export function QuoteCompanyFooter() {
  return (
    <footer className="border-t-2 border-primary pt-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{COMPANY.name}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {COMPANY.tagline}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {COMPANY.about}
        </p>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-4 text-xs sm:grid-cols-2">
        <ContactRow
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone"
          value={COMPANY.phone}
        />
        <ContactRow
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Mobile"
          value={COMPANY.mobile}
        />
        <ContactRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={COMPANY.emailPrimary}
        />
        <ContactRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={COMPANY.emailSecondary}
        />
        <ContactRow
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Location"
          value={COMPANY.location}
          className="sm:col-span-2"
        />
        <ContactRow
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Website"
          value={COMPANY.website}
          className="sm:col-span-2"
          href={COMPANY.website}
        />
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Quotation valid for 30 days · Regulated by the Insurance Regulatory
        Authority (IRA)
      </p>
    </footer>
  );
}

function ContactRow({
  icon,
  label,
  value,
  className,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
  href?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground underline-offset-2 hover:underline"
            >
              {value}
            </a>
          ) : (
            <p className="text-muted-foreground">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
