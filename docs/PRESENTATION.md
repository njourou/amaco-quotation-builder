# AMACO Digital Quotation Platform
### Presentation Brief · Africa Merchant Assurance Company Limited

**Live demo:** [https://amaco-254.vercel.app](https://amaco-254.vercel.app)  
**Tagline:** *Covering What Matters Most*

---

## 1. Opening (30 seconds)

> *"Today I'm presenting a digital quotation platform built for AMACO — one that turns the Master Quotation Template into a fast, branded, client-ready experience, powered by an AI assistant named **Amani** who can quote, explain, and guide users in plain language."*

This is not a mock-up of a website. It is a **working quotation engine** aligned to AMACO's Excel tariff rules, with print-ready documents and an intelligent assistant on every page.

---

## 2. The Problem We Solve

### Before: How quotations happen today

| Pain point | Impact |
|------------|--------|
| **Excel-dependent workflow** | Staff manually copy rates, levies, and remarks from the Master Template — slow and error-prone |
| **No self-service for clients** | Brokers and customers wait on email/phone for indicative quotes |
| **Inconsistent outputs** | Different staff may apply NCD, LTA, stamp duty, or excesses differently |
| **No product discovery** | AMACO offers 18+ insurance classes — hard to navigate without guidance |
| **Knowledge locked in templates** | New staff need training to understand classes, tonnage bands, and premium breakdowns |

### What breaks without a digital layer

- Turnaround time for a simple motor quote can stretch to hours
- Premium arithmetic mistakes erode trust and create rework
- AMACO's brand experience stays offline while competitors move online
- No scalable way to answer *"Which cover do I need?"* or *"Why is my premium KES X?"*

---

## 3. Our Solution

A **single web platform** that:

1. **Showcases all AMACO insurance classes** in a modern product catalogue
2. **Guides users through structured quote flows** (motor today; multi-class wizard for property)
3. **Calculates premiums deterministically** from encoded Excel rules — never guessed
4. **Generates print-ready quotation documents** (PDF download + browser print)
5. **Provides an AI assistant (Amani)** on every page to quote, explain, and support

```
┌─────────────────────────────────────────────────────────────────┐
│                     AMACO Quotation Platform                     │
├──────────────┬──────────────────────┬───────────────────────────┤
│  Product     │  Quotation Engine    │  Amani AI Assistant       │
│  Catalogue   │  (Excel-accurate)    │  (Electric Link API)      │
│  18 classes  │  Motor + Property    │  Chat · Quote · Explain   │
├──────────────┴──────────────────────┴───────────────────────────┤
│              Branded PDF / Print Output                          │
│              AMACO logo · Contacts · Disclaimers · Excesses        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Live Demo Script (5–7 minutes)

### Step 1 — Product catalogue (`/`)

- Show the clean, AMACO-branded homepage (Montserrat, magenta `#D82078`)
- **18 insurance classes** grouped by category: Motor, Property, Marine, Liability, Engineering, Financial, Accident
- Point out *Motor Private* as the flagship guided flow

### Step 2 — Motor quote flow (`/quote/motor-private`)

Walk through the AAR-style guided journey:

1. **Vehicle details** — make, model, value, year
2. **Cover selection** — Comprehensive vs Third Party Only
3. **Options** — Excess Protector, Political Violence & Terrorism
4. **Results** — full premium breakdown with levies and stamp duty
5. **Output** — Download PDF or Print

*Key line:* *"Every figure on this screen matches the Master Quotation Template — not an estimate from a chatbot."*

### Step 3 — Multi-class wizard (`/quotation/new`)

- Show proposer header, add multiple classes (IAR, Fire, Motor on one quote)
- Combined preview with class-level breakdown and grand total
- Demonstrate **Load Excel sample** for instant demo data

### Step 4 — Amani AI assistant (bottom-right avatar)

- Click Amani's photo — personal, ready-to-help feel
- Ask: *"Quote motor private comprehensive, value 3,000,000"*
- Show streaming reply + **premium card** with line-by-line breakdown
- Ask a follow-up: *"Explain the premium breakdown"* — show conversation memory

*Key line:* *"Amani doesn't invent numbers — she calls the same calculation engine and returns exact KES amounts."*

---

## 5. What's Built Today

### Product & UX

| Feature | Status |
|---------|--------|
| AMACO-branded homepage with 18 product cards | ✅ Live |
| Motor Private guided quote flow | ✅ Live |
| Motor Commercial guided quote flow (tonnage bands, own goods / cartage) | ✅ Live |
| Multi-class quotation wizard (header → classes → preview) | ✅ Live |
| Responsive layout, print-safe CSS | ✅ Live |
| Production deployment | ✅ [amaco-254.vercel.app](https://amaco-254.vercel.app) |

### Calculation engine (Excel Master Template 2026)

| Class | Rates encoded |
|-------|---------------|
| Industrial All Risks | 0.225% × 1.25 |
| Fire & Perils | 0.25% |
| Fire Consequential Loss | Linked to Fire MD rate |
| Motor Private | Comp 3.5% / TPO KES 7,500 |
| Motor Commercial | Comp (own goods / cartage) + TPO tonnage table |

**Shared property stack:** NCD 15% → LTA 15% → Earthquake / Flood → Training Levy 0.2% → PHCF 0.25% → Stamp Duty KES 40

All logic lives in typed TypeScript — auditable, testable, version-controlled.

### Document output

- **PDF download** via client-side generation (html2pdf)
- **Print layout** with AMACO logo, company contacts, IRA disclaimer
- Motor **excesses & remarks** from template
- 30-day validity disclaimer on every quotation

### Amani AI assistant

| Capability | Detail |
|------------|--------|
| Branded chat widget | Amani avatar, streaming ChatGPT-style replies |
| API integration | `assistant.electriclink.co.ke/amaco` |
| Natural language quotes | *"Quote motor private comprehensive, value 3M"* |
| Premium cards | Class, cover, line items, net premium, total |
| Conversation memory | Full history sent on every turn |
| Page context | Pathname + quotation form state auto-attached |
| Graceful errors | Friendly apology — no raw HTTP codes shown |

---

## 6. Business Value

### For AMACO operations

- **Faster quotations** — seconds instead of manual Excel work
- **Fewer calculation errors** — one engine, one source of truth
- **Consistent branding** — every PDF looks like AMACO, not a spreadsheet export
- **Staff enablement** — junior team members guided by Amani on classes, excesses, and workflow

### For brokers & customers

- **Self-service indicative quotes** — 24/7, no waiting on email
- **Transparent breakdowns** — see exactly how premium is built
- **Professional documents** — ready to share with clients
- **Guided product selection** — 18 classes explained in plain language

### For leadership

- **Digital transformation milestone** — from template to platform
- **AI without risk** — LLM explains and guides; **math stays in code**
- **Extensible foundation** — add classes, CRM, auth, and payments on the same base
- **Regulatory alignment** — disclaimers, IRA note, invitation-to-offer wording built in

---

## 7. Technical Architecture

```
User Browser
    │
    ├── Homepage / Quote Flows / Wizard
    │       └── QuotationContext (in-browser state)
    │
    ├── Calculation Engine
    │       ├── rates.ts          ← tariff constants
    │       ├── calculations.ts   ← premium logic
    │       └── class-defs.ts     ← remarks, excesses, schedules
    │
    ├── PDF / Print
    │       ├── generate-pdf.ts
    │       └── print-quotation.ts
    │
    └── Amani Chat Widget
            └── POST → assistant.electriclink.co.ke/amaco
                    ├── message + history + context
                    └── reply + premium + tool_used
```

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion

**Repository:** [github.com/njourou/amaco-quotation-builder](https://github.com/njourou/amaco-quotation-builder)

---

## 8. Roadmap — What We Can Add Next

### Phase 1 — Complete all quotable classes (4–6 weeks)

| Item | Description |
|------|-------------|
| IAR / Fire / Fire Conloss guided flows | Same step-by-step UX as motor (currently wizard-only) |
| Domestic Package, Marine Cargo, GPA | Encode rates from Excel + build forms |
| Remaining 13 catalogue classes | Full quote flows for every homepage card |
| Class-specific excess & clause pickers | Template-driven remarks per class |

### Phase 2 — Platform & persistence (4–6 weeks)

| Item | Description |
|------|-------------|
| User authentication | Broker login, role-based access (staff vs intermediary) |
| Quotation database | Save, retrieve, duplicate, and version quotes |
| Quotation numbering | Auto SN sequence aligned to AMACO format |
| Email / WhatsApp share | Send PDF link directly from the platform |
| Admin dashboard | View quotes, conversion metrics, popular classes |

### Phase 3 — Amani enhancements (2–4 weeks)

| Item | Description |
|------|-------------|
| Deep form integration | Amani pre-fills motor/property forms from chat |
| PDF from chat | *"Generate a PDF for this quote"* inside the widget |
| Voice input | Speak a quote request on mobile |
| Swahili support | Bilingual assistant for wider reach |
| Escalation to human | One-click handoff to customercare@amaco.co.ke |

### Phase 4 — Enterprise integration (6–8 weeks)

| Item | Description |
|------|-------------|
| Core system / policy admin API | Push accepted quotes into AMACO backend |
| Intermediary portal | White-label for brokers with commission tracking |
| Payment gateway | M-Pesa / card for binder deposits |
| IR A compliance reporting | Audit trail on every quotation issued |
| Mobile app (PWA) | Installable on brokers' phones |

---

## 9. Why This Approach Is Safe

Insurance AI must not hallucinate premiums. Our design enforces:

| Rule | How we enforce it |
|------|-------------------|
| Premiums are exact | Calculated by `calculateClassPremium()` — not LLM arithmetic |
| Disclaimers are consistent | Sourced from `DISCLAIMERS` in code |
| No binding offers | Every output states 30-day invitation to offer |
| Human escalation | Amani directs binding cover, claims, complaints to AMACO contacts |
| "Coming soon" classes | Assistant won't pretend unbuilt flows are quotable |

---

## 10. Key Numbers to Quote in the Room

| Metric | Value |
|--------|-------|
| Insurance classes on homepage | **18** |
| Classes with full calculation engine | **5** (IAR, Fire, Fire Conloss, Motor Private, Motor Commercial) |
| Motor quote time (guided flow) | **Under 2 minutes** |
| PDF generation | **Client-side, no server dependency** |
| Production URL | **amaco-254.vercel.app** |
| AI assistant | **Amani — live on every page** |

---

## 11. Closing Statement

> *"We've taken AMACO's Master Quotation Template and turned it into a digital platform that staff, brokers, and customers can use today — with accurate premiums, branded documents, and an AI assistant that speaks like a human but calculates like Excel. The foundation is live. The roadmap takes us to full class coverage, saved quotations, broker portals, and core system integration."*

**Contacts on every quotation:**
- Phone: 020 2204000
- Mobile: 0792 256 233 / 0738 312 121
- Email: customercare@amaco.co.ke
- Web: [amaco.co.ke](https://www.amaco.co.ke/)

---

## Appendix — Demo Prompts for Amani

Use these during the presentation:

1. *"Quote motor private comprehensive, value 3,000,000"*
2. *"What's the difference between motor private and motor commercial?"*
3. *"Explain the premium breakdown"*
4. *"What excesses apply to motor private comprehensive?"*
5. *"How do I download a PDF quote?"*

---

## Appendix — Slide Outline (if converting to PowerPoint)

1. Title + live URL
2. The problem (Excel, speed, errors, no self-service)
3. The solution (platform overview diagram)
4. Product catalogue screenshot
5. Motor quote flow (3 steps)
6. Premium breakdown screenshot
7. PDF / print output
8. Meet Amani (avatar + chat screenshot)
9. Business value (operations · brokers · leadership)
10. What's live vs roadmap
11. Safe AI design
12. Next steps + Q&A

---

*Document version: March 2026 · Built for AMACO presentation*
