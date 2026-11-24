# AI Accountant: company and market context for blog writers

Read this before writing or editing a post. Every line comes from one of four sources, checked on 24 November 2026. If a fact about AI Accountant is not here or on the live site, leave it out.

Source codes:
- **WF**: prompts of the old n8n blog workflow, now retired.
- **LLMS**: https://www.aiaccountant.com/llms.txt, written by the company.
- **A path** such as `/products/gst-reconciliation`: that page on https://www.aiaccountant.com.
- **Audit**: `docs/blog-audit.md` and `docs/blog-audit-notes.md`.
- **Q1 to Q22**: an unsettled point under Open questions. Where you see one, state neither version.

## 1. What AI Accountant is

AI Accountant is an Indian product that automates bookkeeping on top of Tally. It reads bank statements and vendor bills, predicts the ledger, matches payments to bills, and writes vouchers to Tally once a person approves them (LLMS; `/help/concepts/index`). It does not replace Tally: "Tally remains your source of truth" (`/products/bookkeeping-automation`). The company also sells a separate managed service, Virtual Accounting, run by a CA team (LLMS). Parent company: Q14.

One-line description to reuse: "AI Accountant is a Tally-native accounting automation platform for Indian businesses and CA firms" (LLMS).

## 2. The name

Write **AI Accountant**: two words, capital A, I, A. It means this product, not AI bookkeeping in general (LLMS). Never write AIAccountant, AiAccountant, Ai Accountant, AIA, AiA or AiAccountant.com; the Audit found all of these on live pages. WF used "AiA" throughout, and `/products/manufacturing-accounting-software` still does. Copy neither. WhatsApp bot name: Q22.

## 3. What it does

| Feature | Status | What the sources say, with limits |
|---|---|---|
| Tally sync | Live | Masters sync in, approved entries go back (WF). Connector needs Windows 10 or above (`/help/get-started/connect-tally`). Versions: Q11. Cloud-hosted Tally: Q10. |
| Vendor bills | Live | PDF, PNG, JPG, scans, handwritten bills, Excel import. Extracts vendor, GSTIN, invoice number, dates, line items, HSN, taxes. Flags vendor mismatches (name, GSTIN, address) and duplicates. Every bill is reviewed before sync (WF; `/products/vendor-bill-matching`; `/vs/tally-ira`). Accuracy: Q5. Bulk limit: Q7. Languages: Q20. |
| Bill-wise allocation | Live | Payments linked to the bills they settle. Four reference types: New reference, Against reference, Advance, On account. Needs bill-wise entry enabled in Tally at company and ledger level (WF). |
| Bank and credit card statements | Live | PDF (including password-protected), Excel, CSV, scans, screenshots; "50+ Indian banks" (`/products/bookkeeping-automation`). Predicts transaction type, ledger and party (WF). Accuracy: Q6. |
| GSTR-2B reconciliation | Live | Purchase register (Excel, CSV, JSON) against GSTR-2B, fetched from the GST portal by OTP or uploaded. Statuses: Fully Matched, AI Matched, AI Probable Match, Missing in Books, Missing in 2B. Exports Table 4 of GSTR-3B. Multiple GSTINs under one PAN (`/products/gst-reconciliation`). Wider GST claims: Q19. |
| Sales invoices | Live | Create singly or import from Excel, sync to Tally, download PDF (`/help/concepts/index`). Not in WF; the B-arm page says it was not live in February 2026. |
| Dashboards | Live | AP and AR outstanding, overdue amount and count, DPO, DSO, ageing, vendor spend concentration, drill-through to bills (WF; `/products/mis-reporting`). Data source: Q18. |
| Dashboard Overview tab | Disputed | Roadmap per WF, live per site: Q8. |
| AI insights on charts; financial projections | Roadmap | "ROADMAP items, not live" (WF). |
| WhatsApp assistant | Live | Send a bill photo or PDF; ask about cash, bank balance, receivables, payables, sales (WF). Up to 10 companies per number; answers reflect the last Tally sync; no sales invoices or bank statements (`/help/aia-bot/what-is-aia-bot`). Users per company: Q9. |
| Multi-org | Live | "one login, many clients"; WF treats it as a CA-firm point. One licence covered 9 Tally companies (B-arm page). |

## 4. What it does not do

- Replace Tally or act as accounting software (`/vs/tally-ira`; `/about-us`).
- "No inventory, no BOM, not a standalone system" (our own post, quoted in Audit).
- "Payment execution and approvals are not currently supported" (`/products/hospitality`).
- Replace a POS or sales billing system such as Petpooja (`/products/hospitality`).
- 3-way PO/GRN matching, BOE import, approval routing, voucher-save blocking, a scheduler, sync "every 15 minutes", email or Slack alerts: old posts claimed these and the Audit could not verify them.

## 5. Who it is for

Primary: Indian SMB founders, CFOs and finance heads, ₹1cr to ₹100cr turnover, running in-house Tally teams (WF; LLMS). Secondary: CA firms serving them; "mention sparingly", and frame a post for CAs only when the topic is plainly CA-specific (WF). The reader already knows GST, TDS, ITC, RCM and GSTR-2B (WF).

## 6. Pricing and trial

State no trial terms, guarantee or rupee price until the company settles Q1 to Q3. The sources say:
- Site: buttons read "Book a Free Trial"; homepage FAQ: "Is there a free trial available? Yes."
- LLMS: "no free trial; a 100% money-back guarantee for the first month (full refund if unsatisfied). Plans scale with company size and transaction volume".
- `/products/manufacturing-accounting-software`: "We do not offer open trials." and "Pricing is volume-based. We share a custom quote during the demo".

The sources agree only that pricing scales with volume. Say that and no more. Virtual Accounting: "starts at INR 4,000/month for up to 200 transactions" (LLMS only).

## 7. Numbers that may be quoted

| Number | Source | Note |
|---|---|---|
| "300M+ transactions" | WF; LLMS; `/` | Consistent. Safe. |
| "30% monthly growth in ingestion volume" | WF only | Single source. |
| "450+ SMB customers" | WF | Differs across sources: Q4. Do not quote. |
| "95% accuracy" on handwritten and scanned bills | LLMS; `/`; `/products/vendor-bill-matching` | Other pages differ: Q5. |
| "Get rid of 75% of your accounting tasks" | `/` only | The Audit flagged a similar figure as unsourced. Do not quote. |
| "50+ Indian banks" | `/products/bookkeeping-automation` only | Single source. |

WF rule: "Do not cite CA-firm customer counts." Audit rule: link the specific page that states a number, never a homepage.

## 8. Customers that may be named

| Customer | Page | Result the page states |
|---|---|---|
| Sinnova Tech Engineering | `/sinnova-tech-engineering-tally-purchase-bill-automation` | 120 purchase bills a month in under 1 hour; 95% accuracy (customer's estimate). |
| Laundry Labs | `/ai-accountant-helps-laundry-labs-turn-pdf-bills-into-tally-entries-in-under-1-5-minutes-at-98-accuracy` | 1 to 1.5 minutes per bill; 98% of entries prepared correctly. |
| Harin Biotech International | `/ai-accountant-helps-harin-biotech-run-tally-from-whatsapp` | 25 bills uploaded via WhatsApp and 34 questions answered since July 2026. |
| Vigor Solar Energy | `/vigor-solar-energy-tally-purchase-bill-and-bank-entry-automation` | 60 to 80% less time per entry; 318 entries prepared. |
| Cook Coffee Club | `/case-studies/founder-live-financial-visibility` | One finance person serving a 7-person team; activated in 15 days. Do not lift its prices. |
| B-arm Medicals | `/case-studies/medicals-multi-branch-tally-automation` | 9 branch Tally companies on one licence; about 6 days from demo to live. |
| Distacart | `/case-studies/how-a-3-city-retailer-cut-1-200-hours-of-ap-work-every-month` | "1,200+ man-hours saved per month", an estimate from a demo: Q21. |
| CAlculators – The Tax People | `/case-study` | CA firm; no figures given. |

Index pages: `/customer-stories`, `/testimonials`.

## 9. Competitors

**Tools Indian buyers and AI assistants name (Audit):**
- **Docs by Ira** (Tally Solutions): turns documents into draft vouchers; needs TallyPrime 7.1 or later with active TSS. Our comparison is `/vs/tally-ira`, "based on hands-on testing ... in August 2026"; quote it with that date. Posts saying Tally has no automation are now wrong (Audit).
- **Vyapar TaxOne (formerly Suvit)**: renamed December 2025 (Audit). Always write it this way. Do not repeat unsourced criticism of its support (Audit).
- **Zoho Books**: accounting software that asks you "to move your books off Tally" (`/products/bookkeeping-automation`). WF forbade linking or citing it: Q12.
- **ClearTax, Hisabkitab**: named by the Audit; no source describes Hisabkitab.
- **VouchrIt** (Audit), spelt "VoucherIT" in LLMS: Q17.
- Also in our cited posts (Audit): Winman, KDK Spectrum, IRIS Sapphire, Refrens, RealBooks, Busy, Marg ERP.

**Tools the old workflow's posts leaned on:** QuickBooks, Xero, FreshBooks, Sage. The Audit calls this the "wrong competitor set" and says Intuit withdrew QuickBooks from India in 2023. WF itself names only QuickBooks, as a banned link. Do not pad lists with these four.

Treatment (Audit): compare in a table, give each tool's source and the date checked, and state our own limits. WF's rule on competitor sources conflicts: Q16.

## 10. Trust and compliance

- ISO 27001 and SOC 2 Type II (WF; LLMS; `/resources/security-compliance`). Exact wording differs: Q15.
- Personal data stored in India on encrypted servers; not sold or leased (`/resources/security-compliance`).
- "256-bit encryption in transit and at rest", DPDP Act 2023 (`/products/bookkeeping-automation` only).

## 11. Pages worth linking

- Product: `/products/bookkeeping-automation` (bank entries, ledgers), `/products/vendor-bill-matching` (AP, purchase bills), `/products/gst-reconciliation` (GSTR-2B, ITC), `/products/mis-reporting` (dashboards), `/products/manufacturing-accounting-software`, `/products/hospitality`, `/vs/tally-ira`. Link only when relevant (WF). Broken link: Q20.
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

- A roadmap item is live, or the WhatsApp assistant is multi-user (WF; Q8, Q9).
- AI Accountant replaces Tally, or is somewhere to migrate to from Tally (Audit).
- Any trial, guarantee or price (Q1 to Q3), or any customer count (Q4).
- Self-awarded praise such as "set a new standard" or "highest ROI" (Audit).
- Unsourced figures from old posts: "75 percent reduction in data entry", payback "within two quarters", "ROI arrives in 6 to 9 months" (Audit).
- An invented customer, example, code or threshold (Audit).
- QuickBooks as an option in India; "Suvit" alone (Audit).
- An e-invoicing threshold of ₹1 crore: the Audit found ₹5 crore still stands.
- Figures from the CA GPT post (₹499/month, 20 prompts a day): the Audit found no support.

## 14. Open questions

1. **Free trial.** Site says yes; LLMS says "no free trial"; the manufacturing page says "We do not offer open trials."
2. **Guarantee.** First month (LLMS); "30-day money-back window" (Cook Coffee Club page); "14-day money-back guarantee" (Distacart page; `/products/hospitality`).
3. **Price.** No pricing page. Two case studies say "The standard ₹5,000/month plan covers 300 bills and 30 bank statements"; one post says "From ₹500/month" (Audit).
4. **Customer count.** "450+ SMB customers" (WF); "500+ paying customers" (LLMS); "450+ Clients" (product pages); "400+ companies" (`/about-us`); "100+ companies" (`/testimonials`); "200+ finance teams" (Distacart page).
5. **Bill accuracy.** 95% (three sources); "90% Accuracy" badge (product pages); 98% (manufacturing page); 99% (B-arm page). The Audit found one post both claiming and denying handwritten accuracy.
6. **Day-one automation.** "automates 60%+ of bookkeeping from day one, scaling toward 95%" (LLMS); categorisation "approximately 70% accuracy on Day 1", "90%+" later, and "99%" in the header (`/products/bookkeeping-automation`).
7. **Bulk upload.** "up to 100 at a time" (LLMS); "100+ bills" (`/vs/tally-ira`); "500 bills" (B-arm page).
8. **Overview tab.** Roadmap (WF); `/help/release-log` says it shipped on 27 Jul 2026.
9. **WhatsApp users.** "one user per company today" (WF; `/vs/tally-ira`); "Each person added to the company can use AIA Bot" (help).
10. **Cloud Tally.** "does not currently integrate with cloud-hosted Tally setups" (manufacturing page); works on cloud (Vigor Solar page).
11. **Tally versions.** "Tally Prime and Tally ERP 9" (help); "TallyPrime 6.0 and later" (`/vs/tally-ira`).
12. **Zoho Books.** "also supported" (LLMS; GST page); WF: never link it, cite it or "mention Zoho as an authority".
13. **Setup time.** "about ten minutes" (help); "about 15 minutes" (`/`); "2 to 3 days" (manufacturing page); posts say hours to four weeks (Audit).
14. **Parent.** "Karbon Business (YC-backed)" (LLMS); "the team behind Karbon Card" (`/about-us`); "KOREFI BUSINESS SOLUTIONS PRIVATE LIMITED" (site footer).
15. **Certificates.** "certified" (LLMS); "SOC-2 Type II verified" (WF); "SOC 2 Type 2 tested" (security page).
16. **Competitor sources.** WF bans competitor sites as sources and links (cleartax.in, zoho.com, suvit.io, vyapar.com, tallysolutions.com); the Audit says read them and cite each with a date.
17. **Competitor list.** LLMS names "Vyapar TaxOne (formerly Suvit), VoucherIT, and Petpooja"; the site treats Petpooja as a POS we work beside. GSTHero and Nanonets appear in no source.
18. **Dashboard data.** "computed on AiA's own data" (WF); "pulled directly from your synced Tally instance" (`/products/mis-reporting`).
19. **GST scope.** GSTR-1 and GSTR-3B reconciliation appear only on `/products/bookkeeping-automation`; other sources describe GSTR-2B only. Posts disagree on ITC eligibility and forecasting (Audit).
20. **Pages and languages.** `/products/construction-accounting-software` is in WF and LLMS but returns 404; `/products/hospitality` is in neither. "8+ Indian languages" (`/products/bookkeeping-automation`) against "English and Hindi" for bills (`/vs/tally-ira`).
21. **Distacart.** The page says "If they decide to move forward". Is it a customer?
22. **Bot name.** Help calls it "AIA Bot", which breaks the name rule.
