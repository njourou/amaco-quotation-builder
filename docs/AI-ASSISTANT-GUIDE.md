# AMACO Quotation Builder — AI Assistant Guide

Instructions for designing, building, and operating an AI assistant that helps users create quotations, understand premiums, and navigate AMACO insurance classes — aligned to the **Master Quotation Template 2026** and the live app at [amaco-254.vercel.app](https://amaco-254.vercel.app).

---

## 1. Purpose

The assistant should help with:

| Area | Examples |
|------|----------|
| **Product guidance** | Which class to pick (Motor Private vs Commercial, IAR, Fire, etc.) |
| **Form help** | What to enter for make/model, cover type, sum insured, tonnage band |
| **Calculations** | Explain premium breakdown line-by-line; verify totals match Excel rules |
| **Excesses / remarks** | Recommend standard motor excesses; explain what each clause means |
| **Quotation workflow** | Walk through: Products → Quote form → Results → Print / PDF |
| **Company info** | AMACO contacts, disclaimers, validity (30 days), IRA regulation |
| **Developer support** | Where rates live in code, how to add a new class, how to extend calculations |

The assistant must **not** invent rates, legal terms, or policy wording. It must use the encoded rules in the codebase or official AMACO sources.

---

## 2. What you need (checklist)

### A. Knowledge sources (required)

| Item | Location / action |
|------|-------------------|
| Master Quotation Excel template | Source of truth for rates, classes, excesses (already partially encoded) |
| Rate constants | `src/lib/amaco/rates.ts` |
| Calculation engine | `src/lib/amaco/calculations.ts` |
| Class definitions & remarks | `src/lib/amaco/class-defs.ts` |
| TypeScript types | `src/lib/types.ts` |
| Sample quotation | `src/lib/amaco/quotation.ts` (`createSampleQuotation`) |
| AMACO public website | [https://www.amaco.co.ke/](https://www.amaco.co.ke/) — products, contacts, branding |
| This app README | `README.md` |

### B. Technical stack (recommended)

| Component | Purpose |
|-----------|---------|
| **LLM API** | OpenAI, Anthropic, Google Gemini, or Azure OpenAI |
| **Backend route** | Next.js Route Handler `app/api/assistant/route.ts` (keeps API key server-side) |
| **Chat UI** | Floating panel or sidebar in `AppShell` |
| **Structured tools** | Functions the model can call for *deterministic* math (never guess premiums) |
| **Vector store (optional)** | Pinecone, Supabase pgvector, or local JSON for Excel clause text |
| **Session memory (optional)** | Redis / DB if you need persisted chat history |

### C. Environment variables


Never expose API keys in the browser. All LLM calls go through a server route.

### D. Guardrails (required)

- Premium numbers must come from `calculateClassPremium()` / `calculateQuotationTotal()`, not from the model’s arithmetic.
- Disclaimers and validity must match `DISCLAIMERS` in `rates.ts`.
- If a class is “coming soon” in the UI, the assistant must say so and not pretend it is quotable.
- No binding offers — quotations are invitations to offer only.
- Escalate to human contact (`customercare@amaco.co.ke`, `020 2204000`) for binding cover, claims, or complaints.

---

## 3. Architecture (recommended)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Chat UI    │────▶│  /api/assistant  │────▶│  LLM + system prompt │
│  (client)   │◀────│  (Next.js route) │◀────│  + tool calls        │
└─────────────┘     └────────┬─────────┘     └─────────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  Tool: calculate   │──▶ calculations.ts
                    │  Tool: getRates    │──▶ rates.ts
                    │  Tool: getClasses  │──▶ class-defs.ts
                    │  Tool: getCompany  │──▶ rates.ts COMPANY
                    └────────────────────┘
```

**Why tools?** LLMs are bad at consistent insurance math. Expose your existing TypeScript functions as tools so every premium answer is exact.

---

## 4. System prompt (starter)

Use this as the base system message for the assistant:

```text
You are the AMACO Quotation Assistant for Africa Merchant Assurance Company Limited.

Your role:
- Help users choose insurance classes and complete quotation forms.
- Explain premium breakdowns using official calculation rules from the Master Quotation Template.
- Answer questions about excesses, remarks, disclaimers, and AMACO contact details.

Rules:
1. NEVER invent premium amounts. Always use the calculate_premium tool when a numeric quote is requested.
2. NEVER promise binding cover. Quotations are invitations to offer, valid 30 days.
3. Use Kenyan Shillings (KES) and en-KE formatting.
4. For Motor: distinguish Private vs Commercial, Comprehensive vs TPO, and commercial tonnage bands.
5. For Property (IAR, Fire, Fire Conloss): explain NCD 15%, LTA 15%, earthquake, flood, levies, stamp duty.
6. If unsure about a rate not in the tool output, say you need verification against the Excel template.
7. Be concise, professional, and aligned with AMACO branding (Covering What Matters Most).

Contacts when human help is needed:
- Phone: 020 2204000
- Mobile: 0792 256 233 / 0738 312 121
- Email: customercare@amaco.co.ke
- Website: https://www.amaco.co.ke/
```

---

## 5. Tool definitions (implement on server)

These map directly to your codebase.

### `list_insurance_classes`

Returns `CLASS_DEFINITIONS` from `class-defs.ts` plus homepage products and whether each has a live quote route.

### `get_rates`

Returns relevant constants from `rates.ts` for a given `classId`.

### `calculate_premium`

**Input:** JSON matching a schedule (`MotorPrivateSchedule`, `MotorCommercialSchedule`, or property schedule).

**Output:** `ClassPremiumBreakdown` from `calculateClassPremium()`.

Example motor private comprehensive:

```json
{
  "classId": "motor-private",
  "sumInsured": 2500000,
  "cover": "comprehensive",
  "excessProtector": true,
  "politicalViolenceTerrorism": false
}
```

### `get_motor_makes`

Returns makes/models from `src/lib/motor-makes.ts`.

### `get_excesses_remarks`

Returns `MOTOR_PRIVATE_REMARKS` or `MOTOR_COMMERCIAL_REMARKS`, or IAR/Fire clauses.

### `get_company_info`

Returns `COMPANY`, `DISCLAIMERS`, `BRAND_MAGENTA`.

---

## 6. Calculation rules reference (for the assistant)

The assistant must treat this as canonical (already implemented in code).

### Shared levies (all classes)

| Item | Rate / amount |
|------|----------------|
| Training Levy | 0.2% of net premium |
| PHCF | 0.25% of net premium |
| Stamp Duty | KES 40 (flat) |

### Property stack (IAR, Fire, Fire Conloss)

1. Base premium = Sum insured × rate  
2. − NCD 15% (if applied)  
3. − LTA 15% on balance (if applied)  
4. + Earthquake 0.025% of SI (if applied)  
5. + Flood 0.01% of SI (if applied)  
6. + Training Levy + PHCF + Stamp Duty  

| Class | Base rate |
|-------|-----------|
| IAR | 0.225% × 1.25 = 0.28125% |
| Fire | 0.25% |
| Fire Conloss | Fire MD rate (0.25%) |

### Motor Private

| Cover | Rule |
|-------|------|
| Comprehensive | 3.5% of vehicle value + optional benefits |
| TPO | Flat KES 7,500 |
| Excess Protector | +0.25% of value (comp only) |
| PVT | +0.25% of value (comp only) |

### Motor Commercial

| Cover | Rule |
|-------|------|
| Own Goods Comp | 5% of value |
| General Cartage Comp | 5.5% of value |
| TPO | Tonnage table (KES 5,500 – 15,000) |
| Excess Protector | +0.5% (comp) |
| PVT | +0.45% (comp) |

---

## 7. UI integration plan

### Phase 1 — Embedded help (no LLM)

- Static FAQ drawer: classes, calculation glossary, contacts.
- “Explain this premium” button on results page that expands breakdown text from `premium.lines`.

### Phase 2 — LLM chat with tools

1. Add `src/components/assistant/AssistantPanel.tsx` (floating button, bottom-right).
2. Add `src/app/api/assistant/route.ts` with streaming responses.
3. Register tools that import from `@/lib/amaco/calculations`.
4. Pass current page context (e.g. motor quote form values) as JSON in each request.

### Phase 3 — Proactive assistant

- Detect incomplete forms (“You selected Comprehensive but value is empty”).
- Suggest excesses based on cover type.
- Compare TPO vs Comprehensive side-by-side via tool calls.

---

## 8. Context to send with each chat request

```typescript
interface AssistantContext {
  page: "/" | "/quote/motor-private" | "/quote/motor-commercial" | "/quotation/new";
  formState?: Partial<MotorPrivateSchedule | MotorCommercialSchedule>;
  quotationHeader?: QuotationHeader;
  schedules?: ClassSchedule[];
  totals?: QuotationTotals;
}
```

Sending live form state lets the assistant answer “what is my premium?” without the user retyping data.

---

## 9. Cursor / developer assistant (optional)

For **building** the app (not end-users), add a Cursor skill:

**File:** `.cursor/skills/amaco-quotation/SKILL.md`

**Should include:**

- Always read `src/lib/amaco/rates.ts` before changing calculations.
- Never hardcode premiums in UI — use `calculateClassPremium`.
- New classes need: type in `types.ts`, rate in `rates.ts`, def in `class-defs.ts`, calculator branch in `calculations.ts`, UI form, homepage card.
- PDF/print: use `QuoteLogo`, `QuoteCompanyFooter`, `printQuotation()`, `downloadElementAsPdf()`.
- Brand color: `#D82078`, font: Montserrat.

---

## 10. Files to create (implementation checklist)

| File | Purpose |
|------|---------|
| `docs/AI-ASSISTANT-GUIDE.md` | This document |
| `docs/CALCULATION-RULES.md` | Human-readable rules exported from Excel (optional) |
| `src/app/api/assistant/route.ts` | Server-side LLM + tools |
| `src/lib/assistant/tools.ts` | Tool handlers wrapping calculations |
| `src/lib/assistant/system-prompt.ts` | System message |
| `src/components/assistant/AssistantPanel.tsx` | Chat UI |
| `src/context/AssistantContext.tsx` | Chat state + page context |
| `.env.local` | API keys (gitignored) |

---

## 11. Example user questions → expected behaviour

| User asks | Assistant should |
|-----------|------------------|
| “Quote for Toyota RAV4 2022 worth 3M comprehensive” | Call `calculate_premium` with motor-private comp, 3,000,000 |
| “What’s the difference between TPO and comprehensive?” | Explain cover; offer to calculate both via tools |
| “Why is stamp duty 40?” | Cite `STAMP_DUTY` in rates.ts |
| “Add fire cover to my quote” | Explain `/quotation/new` multi-class flow or Fire placeholder route |
| “Is this legally binding?” | No — invitation to offer, 30 days, standard disclaimers |
| “What excess applies to theft?” | List from `MOTOR_PRIVATE_REMARKS` |

---

## 12. Testing the assistant

Before go-live, verify:

- [ ] Motor Private TPO returns exactly KES 7,500 + levies + stamp
- [ ] Motor Private Comp 2,500,000 returns same total as the app UI
- [ ] Commercial TPO tonnage bands match `MOTOR_COMMERCIAL_TPO_TABLE`
- [ ] IAR sample matches “Load Excel sample” grand total
- [ ] Assistant refuses to quote classes not yet implemented
- [ ] No API key in client bundle (`npm run build` + search for `sk-`)
- [ ] Contacts match [amaco.co.ke](https://www.amaco.co.ke/)

---

## 13. Cost & performance notes

- Prefer **gpt-4o-mini** or equivalent for FAQ + form help (low cost).
- Use tool calls only when numbers are needed (reduces hallucination and token use).
- Cache static context (rates table, class list) in the system prompt or a short RAG doc refreshed on deploy.
- Rate-limit `/api/assistant` (e.g. 20 req/min/IP) to control spend.

---

## 14. Security & compliance

- Do not log full chat with PII (proposer names, vehicle reg) in production without consent.
- Add privacy notice: “Chat may be processed by a third-party AI provider.”
- IRA-regulated insurance — assistant is **informational**, not a substitute for licensed advice.
- Sanitize user input before passing to LLM; validate tool inputs with Zod schemas matching `types.ts`.

---

## 15. Quick start (minimal MVP)

1. Copy system prompt from §4 into `src/lib/assistant/system-prompt.ts`.
2. Create API route that accepts `{ messages, context }`.
3. Implement one tool: `calculate_premium`.
4. Add a chat button on motor quote results page only.
5. Test: “Calculate comprehensive premium for 1.5M motor private.”

Once MVP works, expand tools and roll out to `/quotation/new` and homepage.

---

## 16. Related codebase entry points

| Concern | File |
|---------|------|
| Rates | `src/lib/amaco/rates.ts` |
| Math | `src/lib/amaco/calculations.ts` |
| Classes & remarks | `src/lib/amaco/class-defs.ts` |
| Motor quote UI | `src/components/quote/MotorQuoteFlow.tsx` |
| Multi-class wizard | `src/components/quotation/QuotationWizard.tsx` |
| PDF | `src/lib/generate-pdf.ts` |
| Print | `src/lib/print-quotation.ts` |
| Company footer | `src/components/quotation/QuoteCompanyFooter.tsx` |

---

*Document version: 1.0 — aligned to AMACO Quotation Builder codebase and Master Quotation Template 2026.*
