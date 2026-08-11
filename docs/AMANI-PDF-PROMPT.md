# Amani — PDF Generator Integration Prompt

Give this to the **Electric Link backend** team to add to Amani’s system prompt and API response schema.

The AMACO web app generates PDFs **client-side** using `downloadElementAsPdf()` (`src/lib/generate-pdf.ts`). The assistant cannot attach a file directly. Instead, it must return a structured **`pdf_request`** payload so the chat widget can render the official AMACO quotation layout and trigger download.

---

## System prompt block (copy into Amani)

```text
## PDF quotation documents

When the user asks to download, print, save, or email a quotation PDF — or when you have completed a premium calculation and the user confirms they want a document — you MUST use the app's PDF generator, not describe a fake attachment.

Rules:
1. NEVER say you attached, emailed, or sent a PDF file. You cannot send files.
2. ALWAYS call calculate_premium first so totals match the Master Quotation Template exactly.
3. After a successful calculation, if the user wants a PDF (or says "yes", "download", "print", "send me the quote"), include a `pdf_request` object in your API response alongside `reply` and `premium`.
4. The frontend will render the official AMACO quotation (logo, company footer, excesses, disclaimers, 30-day validity) and download the PDF automatically.
5. In your reply text, say something like: "I'm preparing your AMACO quotation PDF now — it should download in a moment."
6. If required fields are missing (proposer name, vehicle value, cover type, etc.), ask for them BEFORE returning pdf_request.
7. Use today's date (ISO YYYY-MM-DD) for quotation date unless the user specifies otherwise.
8. Leave `header.sn` empty unless the user provides a quotation serial number.
9. For motor quotes, include standard remarks from MOTOR_PRIVATE_REMARKS or MOTOR_COMMERCIAL_REMARKS when comprehensive cover applies.
10. If PDF cannot be prepared (class not implemented, incomplete data), explain clearly and direct the user to:
    - Motor Private: https://amaco-254.vercel.app/quote/motor-private
    - Motor Commercial: https://amaco-254.vercel.app/quote/motor-commercial
    - Multi-class: https://amaco-254.vercel.app/quotation/new

PDF document contents (rendered by the app, not by you):
- AMACO logo and company details (Africa Merchant Assurance Company Limited)
- Proposer, location, occupation, intermediary
- Class schedule with sum insured, rate, premium breakdown lines
- Training Levy (0.2%), PHCF (0.25%), Stamp Duty (KES 40)
- Excesses and remarks (motor)
- Disclaimers: invitation to offer, valid 30 days, IRA regulated
- Contacts: 020 2204000, customercare@amaco.co.ke, amaco.co.ke

Do not invent premium amounts in pdf_request — schedules must match calculate_premium output.
```

---

## API response schema (extend existing response)

Current response:

```json
{
  "reply": "...",
  "premium": { ... },
  "tool_used": "calculate_premium"
}
```

Add when user wants a PDF:

```json
{
  "reply": "Sawa! I'm preparing your AMACO quotation PDF now — it should download in a moment.",
  "premium": { ... },
  "tool_used": "calculate_premium",
  "pdf_request": {
    "filename": "AMACO-Motor-Private-2026-03-11",
    "header": {
      "sn": "",
      "date": "2026-03-11",
      "proposer": "John Kamau",
      "location": "Nairobi",
      "occupation": "",
      "intermediary": ""
    },
    "schedules": [
      {
        "id": "sch-motor-1",
        "classId": "motor-private",
        "registration": "KDA 123A",
        "sumInsured": 900000,
        "cover": "comprehensive",
        "excessProtector": false,
        "politicalViolenceTerrorism": false,
        "selectedRemarks": []
      }
    ]
  }
}
```

### Field reference

| Field | Required | Notes |
|-------|----------|-------|
| `pdf_request.filename` | No | Defaults to `AMACO-Quotation-YYYY-MM-DD.pdf` |
| `pdf_request.header.date` | Yes | ISO date string |
| `pdf_request.header.proposer` | Yes | Customer / company name |
| `pdf_request.schedules` | Yes | At least one schedule; must match `types.ts` |
| `pdf_request.schedules[].classId` | Yes | `motor-private`, `motor-commercial`, `iar`, `fire`, `fire-conloss` |

### Motor private schedule example

```json
{
  "id": "sch-mp-1",
  "classId": "motor-private",
  "registration": "KCA 456B",
  "sumInsured": 3000000,
  "cover": "comprehensive",
  "excessProtector": true,
  "politicalViolenceTerrorism": false,
  "selectedRemarks": [
    "Young/Novice drivers below 21 years - Kshs.5,000 additional excess"
  ]
}
```

### Motor commercial schedule example

```json
{
  "id": "sch-mc-1",
  "classId": "motor-commercial",
  "registration": "KBT 789C",
  "sumInsured": 2000000,
  "cover": "comprehensive",
  "useType": "own-goods",
  "tonnageBand": "0-3",
  "excessProtector": false,
  "politicalViolenceTerrorism": false,
  "selectedRemarks": []
}
```

### Property (IAR) schedule example

```json
{
  "id": "sch-iar-1",
  "classId": "iar",
  "interests": [
    {
      "id": "int-1",
      "description": "Buildings, plant & machinery",
      "sumInsured": 50000000,
      "section": "material-damage"
    }
  ],
  "discounts": {
    "applyNcd": true,
    "applyLta": true,
    "applyEarthquake": false,
    "applyFlood": false
  },
  "selectedClauses": [],
  "indemnityPeriodMonths": 12
}
```

---

## When to include `pdf_request`

| User intent | Action |
|-------------|--------|
| "Download PDF" / "Print quote" / "Send me the quotation" | Include `pdf_request` if calculation is complete |
| "Quote for motor 900k comprehensive" (first message) | Return `premium` only; ask if they want PDF |
| "Yes" / "Download it" after a quote | Include `pdf_request` using data from conversation + context |
| Missing proposer or value | Ask first; do NOT include `pdf_request` |

---

## Example multi-turn flow

**User:** Quote motor private comprehensive, value 900,000

**Assistant response:**
```json
{
  "reply": "Sawa! Motor Private Comprehensive for KES 900,000:\n\n| Line Item | Amount |\n|---|---|\n| Comprehensive (3.5%) | KES 31,500.00 |\n| Training Levy (0.2%) | KES 63.00 |\n| PHCF (0.25%) | KES 78.75 |\n| Stamp Duty | KES 40.00 |\n| **Total Premium** | **KES 31,681.75** |\n\nValid 30 days. Would you like me to prepare the PDF quotation?",
  "premium": { ... },
  "tool_used": "calculate_premium"
}
```

**User:** Yes, download PDF. Proposer is Jane Wanjiku, Nairobi.

**Assistant response:**
```json
{
  "reply": "I'm preparing your AMACO quotation PDF now — it should download in a moment.",
  "premium": { ... },
  "tool_used": "calculate_premium",
  "pdf_request": {
    "filename": "AMACO-Motor-Private-Jane-Wanjiku",
    "header": {
      "sn": "",
      "date": "2026-03-11",
      "proposer": "Jane Wanjiku",
      "location": "Nairobi",
      "occupation": "",
      "intermediary": ""
    },
    "schedules": [
      {
        "id": "sch-1",
        "classId": "motor-private",
        "registration": "",
        "sumInsured": 900000,
        "cover": "comprehensive",
        "excessProtector": false,
        "politicalViolenceTerrorism": false,
        "selectedRemarks": []
      }
    ]
  }
}
```

---

## Frontend handling (AMACO widget — implemented)

When the chat widget receives `pdf_request` / `email_to` / `pdf_url`:

1. **`pdf_request`** → render official `QuotationDocument` off-screen → `downloadElementAsPdf()`  
2. **`email_to`** → `elementToPdfBlob()` → POST base64 to `https://assistant.electriclink.co.ke/amaco/email-pdf`  
3. **`pdf_url`** → render clickable “Open quotation PDF” link in the chat bubble  

Relevant files:

| File | Purpose |
|------|---------|
| `src/components/amani/AmaniPdfRunner.tsx` | Off-screen render + download/email trigger |
| `src/lib/amani/pdf-request.ts` | Normalize API `pdf_request` → schedules |
| `src/lib/amani/email-pdf.ts` | Email upload client |
| `src/lib/generate-pdf.ts` | `downloadElementAsPdf`, `elementToPdfBlob`, `blobToBase64` |
| `src/components/quotation/QuotationDocument.tsx` | Official AMACO PDF layout |

---

## Tool suggestion for backend (optional)

Add tool **`prepare_quotation_pdf`**:

**Input:** Same as `calculate_premium` + optional `header` fields  
**Output:** Validated `pdf_request` object matching the schema above  
**Behaviour:** Calls calculation internally; rejects if totals don't match

This keeps the LLM from hand-building inconsistent schedule JSON.

---

## Testing checklist

- [ ] User asks "download PDF" after motor quote → response includes `pdf_request`
- [ ] `sumInsured` and `cover` in `pdf_request` match `premium` object
- [ ] Assistant never claims file was emailed/attached
- [ ] Missing proposer → assistant asks before `pdf_request`
- [ ] Widget receives `pdf_request` → PDF downloads with AMACO logo and footer
- [ ] PDF total matches chat premium table (e.g. KES 31,681.75 for 900k comp)

---

*Hand this document to the Electric Link / Amani backend team. Once `pdf_request` is live in API responses, the AMACO frontend can wire the download trigger.*
