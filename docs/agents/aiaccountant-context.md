# AI Accountant: company and market context for blog writers

Read this before writing or editing a post. Every line comes from one of four sources. First written 24 November 2026; updated 27 November 2026 from the company's rewritten llms.txt, which the owner updated to settle most of the open questions. **Where llms.txt and an older page on the site disagree, llms.txt wins.** If a fact about AI Accountant is not here or on the live site, leave it out.

Source codes:
- **WF**: prompts of the old n8n blog workflow, now retired.
- **LLMS**: https://www.aiaccountant.com/llms.txt, written by the company, version "Last updated: November 2026" (copy kept in `docs/agents/llms-snapshot-2026-11-27.txt`). This is the deciding source.
- **A path** such as `/products/gst-reconciliation`: that page on https://www.aiaccountant.com.
- **Audit**: `docs/blog-audit.md` and `docs/blog-audit-notes.md`.
- **Q-numbers**: a point still unsettled under Open questions. Where you see one, state neither version.

## 1. What AI Accountant is

AI Accountant is an Indian product that automates bookkeeping on top of Tally. It reads bank statements and vendor bills, predicts the ledger, matches payments to bills, and writes vouchers to Tally once a person approves them (LLMS; `/help/concepts/index`). It does not replace Tally: "Tally remains your source of truth" (`/products/bookkeeping-automation`). The company also sells a separate managed service, Virtual Accounting, run by a CA team (LLMS). It is built by Karbon Business, a Y Combinator-backed company (LLMS). Korefi (korefi.ai) is a separate US restaurant accounting product from the same parent; never describe it as AI Accountant (LLMS).

One-line description to reuse: "AI Accountant is an AI-powered accounting automation tool for Tally, built for Indian businesses" (LLMS). It is "an automation layer for Tally", "not accounting software", and "the books stay in Tally" (LLMS).

## 2. The name

Write **AI Accountant**: two words, capital A, I, A. It means this product, not AI bookkeeping in general (LLMS). Never write AIAccountant, AiAccountant, Ai Accountant, AIA, AiA or AiAccountant.com; the Audit found all of these on live pages. WF used "AiA" throughout, and `/products/manufacturing-accounting-software` still does. Copy neither. WhatsApp bot name: Q5.

## 3. What it does

| Feature | Status | What the sources say, with limits |
|---|---|---|
| Tally sync | Live | Masters sync in, approved entries go back (WF). Two-way sync (LLMS). Connector needs Windows 10 or above (`/help/get-started/connect-tally`). Works with TallyPrime, "cloud-hosted or offline" (LLMS). Tally ERP 9: Q4. AI Accountant integrates with Tally only: not Zoho Books, QuickBooks or other accounting software (LLMS). |
| Vendor bills | Live | PDF, PNG, JPG, scans, handwritten bills, Excel import. Extracts vendor, GSTIN, invoice number, dates, line items, HSN, taxes. Flags vendor mismatches (name, GSTIN, address) and duplicates. Every bill is reviewed before sync (WF; `/products/vendor-bill-matching`; `/vs/tally-ira`). Accuracy: "about 95% accuracy on handwritten and scanned bills" (LLMS). Bulk: "up to 100 bills at a time" (LLMS). Languages: Q6. |
| Bill-wise allocation | Live | Payments linked to the bills they settle. Four reference types: New reference, Against reference, Advance, On account. Needs bill-wise entry enabled in Tally at company and ledger level (WF). |
| Bank and credit card statements | Live | PDF (including password-protected), Excel, CSV, scans, screenshots; "50+ Indian banks" (`/products/bookkeeping-automation`). Predicts transaction type, ledger and party (WF). Covers bank and credit-card statements (LLMS). Day-one automation percentages: Q2. |
| GSTR-2B reconciliation | Live | Purchase register (Excel, CSV, JSON) against GSTR-2B, fetched from the GST portal by OTP or uploaded. Statuses: Fully Matched, AI Matched, AI Probable Match, Missing in Books, Missing in 2B. Exports Table 4 of GSTR-3B. Multiple GSTINs under one PAN (`/products/gst-reconciliation`). Scope to state: "GSTR-2B and purchase-register reconciliation" (LLMS); do not claim GSTR-1 or GSTR-3B reconciliation. |
| Sales invoices | Live | Create singly or import from Excel, sync to Tally, download PDF (`/help/concepts/index`). Not in WF; the B-arm page says it was not live in February 2026. |
| Dashboards | Live | AP and AR outstanding, overdue amount and count, DPO, DSO, ageing, vendor spend concentration, drill-through to bills (WF; `/products/mis-reporting`). "Built from Tally data" (LLMS). |
| Dashboard Overview tab | Disputed | Roadmap per WF, live per site: Q3. |
| Accounts receivable | Live | Listed among what it automates, with accounts payable (LLMS). Describe only what a product or help page shows. |
| AI insights on charts; financial projections | Roadmap | "ROADMAP items, not live" (WF). |
| WhatsApp assistant | Live | Send a bill photo or PDF; ask about cash, bank balance, receivables, payables, sales (WF). Up to 10 companies per number; answers reflect the last Tally sync; no sales invoices or bank statements (`/help/aia-bot/what-is-aia-bot`). "Bills can also be sent to Tally from WhatsApp" (LLMS). Users per company: Q5. |
| Multi-org | Live | "one login, many clients"; WF treats it as a CA-firm point. One licence covered 9 Tally companies (B-arm page). |

## 4. What it does not do

- Replace Tally or act as accounting software (`/vs/tally-ira`; `/about-us`; LLMS).
- Integrate with anything other than Tally: "does not integrate with Zoho Books, QuickBooks, or other accounting software" (LLMS).
- "No inventory, no BOM, not a standalone system" (our own post, quoted in Audit).
- "Payment execution and approvals are not currently supported" (`/products/hospitality`).
- Replace a POS or sales billing system such as Petpooja (`/products/hospitality`).
- 3-way PO/GRN matching, BOE import, approval routing, voucher-save blocking, a scheduler, sync "every 15 minutes", email or Slack alerts: old posts claimed these and the Audit could not verify them.

## 5. Who it is for

Primary: Indian SMB founders, CFOs and finance heads, ₹1cr to ₹100cr turnover, running in-house Tally teams (WF; LLMS). "Strongest fit: manufacturing, trading and distribution, and hospitality businesses with high purchase-bill volume" (LLMS). Secondary: CA firms serving them; "mention sparingly", and frame a post for CAs only when the topic is plainly CA-specific (WF). The reader already knows GST, TDS, ITC, RCM and GSTR-2B (WF).

## 6. Pricing and trial

Settled by LLMS (November 2026). You may state:
- **Free trial: yes.** "free trial available". Link `/free-trial`.
- **Getting started:** "A customer can book a slot for guided Tally setup, or sign up and connect Tally in about 15 minutes."
- **Pricing model:** "Paid plans scale with company size and are priced per workspace, not per user."
- **Virtual Accounting:** "VA pricing is customised to the services chosen."

Still do not state:
- Any rupee price for AI Accountant or Virtual Accounting. LLMS gives none, and older pages disagree (₹5,000 a month in two case studies, "from ₹500/month" in one post, ₹4,000 a month for VA in the old llms.txt). Do not repeat any of them.
- Any money-back guarantee (Q1).

Older pages that say "no free trial" or "We do not offer open trials" are out of date; do not repeat them.

## 7. Numbers that may be quoted

All from LLMS (November 2026) unless noted. Use the wording given; do not round up or combine.

| Number | Note |
|---|---|
| "300M+ transactions analyzed" | Safe. |
| "500+ paying customers" | Settled. Older pages saying 100+, 200+, 400+ or 450+ are out of date. |
| "about 95% accuracy on handwritten and scanned bills" | Settled. Do not use 90%, 98% or 99% as our own figure; a customer's own result stays the customer's (section 8). |
| "bulk processing of up to 100 bills at a time" | Settled. Not 500. |
| "up to 75% of routine accounting tasks removed" | Now stated by the company. Keep "up to". |
| "connect Tally in about 15 minutes" | Self-serve setup. Not "ten minutes", not "2 to 3 days". |
| "50+ Indian banks" | `/products/bookkeeping-automation` only. Single source. |
| 686 Indian manufacturers, 727 demos (January to September 2026) | Our own research pages (section 11). Quote with the page link. |

WF rule: "Do not cite CA-firm customer counts." Audit rule: link the specific page that states a number, never a homepage.

## 8. Customers that may be named

| Customer | Page | Result the page states |
|---|---|---|
| Sinnova Tech Engineering | `/sinnova-tech-engineering-tally-purchase-bill-automation` | One accountant processes purchase bills in Tally in under 30 seconds each at 95% accuracy (LLMS); 120 bills a month in under 1 hour (page). |
| Laundry Labs | `/ai-accountant-helps-laundry-labs-turn-pdf-bills-into-tally-entries-in-under-1-5-minutes-at-98-accuracy` | 1 to 1.5 minutes per bill at 98% accuracy across three TallyPrime companies (LLMS). |
| Harin Biotech International | `/ai-accountant-helps-harin-biotech-run-tally-from-whatsapp` | 25 bills uploaded via WhatsApp and 34 questions answered since July 2026. |
| Vigor Solar Energy | `/vigor-solar-energy-tally-purchase-bill-and-bank-entry-automation` | Tally entry time cut by up to 80% across bank and purchase entries with a three-person team (LLMS); 318 entries prepared (page). |
| Cook Coffee Club | `/case-studies/founder-live-financial-visibility` | One finance person serving a 7-person team; activated in 15 days. Do not lift its prices. |
| B-arm Medicals ("multi-branch pharmacy" in LLMS) | `/case-studies/medicals-multi-branch-tally-automation` | Tally automation across pharmacy branches; 9 branch Tally companies on one licence (page). |
| A 3-city retailer (do not name it) | `/case-studies/how-a-3-city-retailer-cut-1-200-hours-of-ap-work-every-month` | "1,200 hours of accounts-payable work removed per month" (LLMS). Refer to it as "a 3-city retailer", as LLMS does. |
| CAlculators – The Tax People | `/case-study` | CA firm; no figures given. |

Index pages: `/customer-stories`, `/testimonials`.

## 9. Competitors

LLMS names the alternatives buyers usually compare: "Docs by Ira (TallyIra) from Tally Solutions, Vyapar TaxOne (formerly Suvit), and VoucherIT". Lead comparisons with these three.

**Tools Indian buyers and AI assistants name (Audit):**
- **Docs by Ira** (Tally Solutions): turns documents into draft vouchers; needs TallyPrime 7.1 or later with active TSS. Our comparison is `/vs/tally-ira`, "based on hands-on testing ... in August 2026"; quote it with that date. Posts saying Tally has no automation are now wrong (Audit).
- **Vyapar TaxOne (formerly Suvit)**: renamed December 2025 (Audit). Always write it this way. Our comparison: `/blog/suvit-alternative`. Do not repeat unsourced criticism of its support (Audit).
- **Zoho Books**: accounting software that asks you "to move your books off Tally" (`/products/bookkeeping-automation`). A tool buyers compare, so it may appear in comparisons with its own sourced facts. AI Accountant does not integrate with it (LLMS); never say Zoho Books is supported.
- **ClearTax, Hisabkitab**: named by the Audit; no source describes Hisabkitab.
- **VoucherIT**: write it this way, as LLMS does. Our comparison: `/blog/voucherit`.
- Also in our cited posts (Audit): Winman, KDK Spectrum, IRIS Sapphire, Refrens, RealBooks, Busy, Marg ERP.

**Tools the old workflow's posts leaned on:** QuickBooks, Xero, FreshBooks, Sage. The Audit calls this the "wrong competitor set" and says Intuit withdrew QuickBooks from India in 2023. WF itself names only QuickBooks, as a banned link. Do not pad lists with these four.

Treatment (Audit): compare in a table, give each tool's source and the date checked. Read competitor sites and cite them with a date; the old workflow's ban on them as sources no longer holds.

## 10. Trust and compliance

- "ISO 27001:2022 and SOC 2 Type II certified" (LLMS). Use this wording.
- Personal data stored in India on encrypted servers; not sold or leased (`/resources/security-compliance`).
- "256-bit encryption in transit and at rest", DPDP Act 2023 (`/products/bookkeeping-automation` only).

## 11. Pages worth linking

- Product: `/products/bookkeeping-automation` (bank entries, ledgers), `/products/vendor-bill-matching` (AP, purchase bills), `/products/gst-reconciliation` (GSTR-2B, ITC), `/products/mis-reporting` (dashboards), `/products/manufacturing-accounting-software`, `/products/hospitality`, `/vs/tally-ira`. Link only when relevant (WF). Do not link `/products/construction-accounting-software`: it returns 404 and is no longer in LLMS.
- Getting started: `/free-trial`, `/interactive-tour` (click-through product tour, no sign-up), `/help`.
- Comparisons: `/vs/tally-ira`, `/blog/suvit-alternative`, `/blog/voucherit`, `/blog/ai-accountant-vs-human-accountant`, `/hire-accountant`.
- Our research: `/indian-manufacturers-tally-accounting-research` (calls with 686 Indian manufacturers), `/manufacturing-ai-accounting-growth-report` (727 demos with 686 manufacturers, January to September 2026).
- Free tools: `/free-tools` hub; `/resources/gst-return-status`, `/resources/bank-statement-converter`, `/resources/image-to-excel-converter`, `/resources/invoice-pdf-splitter`, `/resources/gst-late-fee-calculator`, `/resources/e-invoice-applicability-checker`, `/resources/mca-fees-calculator`, `/resources/invoice-generator`. Link one where it helps the reader do the task.
- Virtual Accounting: `/accounting-bookkeeping-services`.
- Case studies: section 8.
- Help: `/help/get-started/connect-tally`, `/help/concepts/how-sync-to-tally-works`, `/help/concepts/bill-by-bill-tracking`, `/help/accounts-payable/overview`, `/help/banking/overview`, `/help/gst/overview`, `/help/aia-bot/what-is-aia-bot`. Full list: `/help/llms.txt`. Skip troubleshooting and release-log pages (WF).
- Trust: `/resources/security-compliance`. Guide: `/guides-page/ai-accountant-tally-integration-guide`.
- Never invent or guess a blog address (WF).

## 12. Voice

Tone (WF): an experienced finance operator talking to a fellow finance leader, never a CA explaining to a client. Answer in the first sentence, without hedging. Consequence first, source after. Cite each source once. One rule, one example. Round numbers in examples (₹10 lakh, ₹2 crore). No defining known terms, no compliance-memo prose.

Indian English (WF): organise, behaviour, cheque, centre. ₹ only, never Rs, INR or rupees. Indian commas: ₹1,50,000, ₹2.5 lakh, ₹15 crore. "GSTR-1" not "GST 1". "Section 194Q" not "194Q". Dates as 31 March 2026; FY 2025–26 or FY26; AY 2026–27.

Banned words (WF): delve, leverage, navigate the complexities, ever-evolving, in the realm of, moreover, furthermore, in conclusion, tapestry, landscape, unlock, unleash, harness, embark, journey, foster, robust, seamless, cutting-edge, game-changer, revolutionise, paradigm shift, plays a crucial role. No em dashes, no emojis.

Sources for rules and statistics (WF whitelist): incometax.gov.in, cbic-gst.gov.in, gst.gov.in, mca.gov.in, indiacode.nic.in, dpiit.gov.in, dgft.gov.in, icai.org, rbi.org.in, sebi.gov.in; for data points KPMG, EY, PwC and Deloitte India, Bain India, McKinsey India, Nasscom, Inc42, Tracxn; for cited statistics Mint, Business Standard, Economic Times, BQ Prime, Moneycontrol. Never Wikipedia, Reddit, Quora, taxguru.in, indiafilings.com, caclubindia.com, vakilsearch.com, legalraasta.com or razorpay.com (WF).

Do not carry over WF's "ZERO product mentions", "Max 3 external links" or fixed post skeleton; the Audit lists them as faults.

## 13. Never say

- A roadmap item is live, or the WhatsApp assistant is multi-user (WF; Q3, Q5).
- AI Accountant replaces Tally, or is somewhere to migrate to from Tally (Audit; LLMS).
- AI Accountant works with Zoho Books, QuickBooks or any software other than Tally (LLMS).
- Any rupee price, or any money-back guarantee (section 6; Q1).
- A customer count other than "500+ paying customers", or an accuracy figure of our own other than "about 95%" (section 7).
- Korefi as part of AI Accountant (LLMS).
- "Distacart" by name; it is "a 3-city retailer" (section 8).
- Self-awarded praise such as "set a new standard" or "highest ROI" (Audit).
- Unsourced figures from old posts: "75 percent reduction in data entry" as a flat fact (the company's line is "up to 75% of routine accounting tasks removed"), payback "within two quarters", "ROI arrives in 6 to 9 months" (Audit).
- An invented customer, example, code or threshold (Audit).
- QuickBooks as an option in India; "Suvit" alone (Audit).
- An e-invoicing threshold of ₹1 crore: the Audit found ₹5 crore still stands.
- Figures from the CA GPT post (₹499/month, 20 prompts a day): the Audit found no support.

## 14. Open questions

Sixteen of the original 22 were settled by the November 2026 llms.txt and are now written into the sections above. These six remain; state neither version.

1. **Guarantee.** LLMS no longer mentions one. Older pages say first month, "30-day money-back window" or "14-day money-back guarantee".
2. **Day-one automation.** Old llms.txt: "automates 60%+ of bookkeeping from day one, scaling toward 95%"; `/products/bookkeeping-automation`: "approximately 70% accuracy on Day 1", "90%+" later, "99%" in the header. The new LLMS gives only "up to 75% of routine accounting tasks removed".
3. **Overview tab.** Roadmap (WF); `/help/release-log` says it shipped on 27 Jul 2026.
4. **Tally ERP 9.** LLMS says TallyPrime only. Help says "Tally Prime and Tally ERP 9"; `/vs/tally-ira` says "TallyPrime 6.0 and later". Say "TallyPrime" and no version number.
5. **WhatsApp assistant.** Users per company: "one user per company today" (WF; `/vs/tally-ira`) against "Each person added to the company can use AIA Bot" (help). Its name: help calls it "AIA Bot", which breaks the name rule; call it "the WhatsApp assistant".
6. **Bill languages.** "8+ Indian languages" (`/products/bookkeeping-automation`) against "English and Hindi" (`/vs/tally-ira`). LLMS does not say.
