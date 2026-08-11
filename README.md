# AMACO Quotation Builder

Frontend-only prototype for Africa Merchant Assurance Company Limited, aligned to the **Master Quotation Template 2026**.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Lucide icons + Framer Motion

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Classes in v1

- Industrial All Risks (rate `0.225% × 1.25`)
- Fire & Perils (`0.25%`)
- Fire Consequential Loss (Fire MD rate)
- Motor Private (Comp 3.5% / TPO KES 7,500)
- Motor Commercial Own Goods / General Cartage (Comp + TPO tonnage table)

Shared property stack: NCD 15% → LTA 15% → Earthquake / Flood → Training Levy 0.2% → PHCF 0.25% → Stamp Duty KES 40.

## Flow

1. Header (Proposer, Location, Occupation, Intermediary)
2. Add one or more class schedules
3. Combined quotation preview (Print / mock PDF)

Use **Load Excel sample** on the quotation screen to preload template sample figures.

## Notes

No authentication, APIs, or database. All state is in-browser React context.
