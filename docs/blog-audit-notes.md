# AI-visibility critique of aiaccountant.com blog posts

Fetched 24 Nov 2026 with curl (browser UA). 14 of our posts + 3 competitor pages, all HTTP 200.
Raw HTML in `raw/`, full text in `txt/`, article body only in `body/`, scripts in `scripts/`.
IDs: A1 tally-integration, A2 gstr-2b-tools, A3 manufacturing-software, A4 purchase-bill-entry,
B1 ca-gpt, B2 tally-shortcuts, B3 best-accounting-software, C1 cfo-kpis, C2 accountants-quitting,
C3 ap-trading, C4 complete-ap-process, C5 500-vendor-bills, C6 workflow-builder, C7 adopt-ai-guide,
X1 skillopedia, X2 potionlabs, X3 batchwise.

Confidence: counts are machine counts on the stripped text. "Looks invented" means I could not find a
source and the page gives none. Sample is 4 vs 7 posts, so A-versus-C differences are correlations,
not proof. I did not check backlinks, internal link counts into each post, or indexing.

## 1. Counts

| Post | Words | Tables | Rupee figures | % figures | External links (deep / homepage-only) | "AI Accountant" mentions | FAQ Qs (naming us) | Product media |
|---|---|---|---|---|---|---|---|---|
| A1 | 3,185 | 0 | 0 | 3 | 7 / 2 | 28 (+2 "AIA") | 12 (9) | none |
| A2 | 2,242 | 1 (9 tools x 7 cols) | 6 | 0 | 4 / 1 | 26 | 10 (10) | none |
| A3 | 4,217 | 1 (6 tools) | 13 | 0 | 0 | 28 | 9 (7) | 2 videos, 6 tool images |
| A4 | 2,385 | 2 | 1 | 7 | 0 | 7 | 8 (2) | 1 video |
| B1 | 2,619 | 0 | 3 | 10 | 0 / 4 | 6 | 7 (0) | 2 CA GPT screenshots |
| B2 | 2,123 | 1 (52 rows) | 1 | 1 | 2 / 4 | 2 (+2 "AiAccountant") | 7 (0) | PDF download |
| B3 | 2,035 | 1 (16 tools x 4 cols) | 0 | 0 | 1 / 0 | 1 (+6 "AIAccountant", 2 "AiAccountant", 4 "AIA") | 8 (5) | none |
| C1 | 3,268 | 0 | 24 | 12 | 0 / 1 | 8 (+4 "AiA") | 15 (7) | none |
| C2 | 2,794 | 0 | 7 | 23 | 1 / 5 | 2 | 5 (0) | 2 stock graphics |
| C3 | 2,658 | 0 | 1 | 14 | 1 / 0 | 5 | 12 (1) | none |
| C4 | 2,556 | 0 | 9 | 6 | 0 | 10 | 12 (8) | none |
| C5 | 2,771 | 0 | 1 | 16 | 1 / 0 | 21 | 15 (15) | none |
| C6 | 2,372 | 0 | 3 | 12 | 2 / 0 | 12 | 12 (8) | none |
| C7 | 1,719 | 0 | 3 | 7 | 0 / 5 | 2 | 7 (0) | none |
| X1 | 5,621 | 2 | 27 | 3 | 10 / 2 | n/a | 12 | none |
| X2 | 3,404 | 1 (8 tools x 6 cols) | 0 | 0 | 1 / 0 | 9 (names us) | 7 | none |
| X3 | 2,880 | 4 | 186 | 6 | 0 / 1 | n/a | 8 | none |

Things the counts rule out as explanations:
- Length. A3 is the longest post we have (4,217 words) and is cited; C7 is the shortest and is not.
- Number of brand mentions. C5 names us 21 times and is never cited.
- External source links. A3 and A4 have none and are cited. X3 has one and no JSON-LD at all and is cited.
- Schema. All 14 of ours carry only Article + BreadcrumbList. X1 and X2 have FAQPage; X3 has nothing.

Things that do line up with citation: tables (3 of 4 A posts, 0 of 7 C posts), rupee prices attached to
named tools, an opening paragraph that names tools, real Indian competitor names, product video.

## 2. Site-wide defects (every post)

- JSON-LD `author.name` is an empty string on all 14, although a byline is shown (Rohan Sinha, Harsh Khatri, Hanumesh N). No `dateModified`.
- `datePublished` is 2025-12-12 on 7 of 14 (A1, A2, B1, B2, B3, C6, C7): a migration date, not a publish date.
- "3 min read" on every post, 1,719 to 4,217 words.
- Hero image alt text is "AI Accountant Dashboard" on every post, including an ICAI login screenshot and Sora/Gemini generated art (file names `..._simple_compose_...`, `Gemini_Generated_Image_...`). Body images have alt "" or "__wf_reserved_inherit".
- Brand is spelt "Ai Accountant" in the page chrome twice per page; in bodies: AI Accountant, AIAccountant, AiAccountant, AIA, AiA, AiAccountant.com.
- Meta description is auto-truncated "Key takeaways ..." text on A1, A2, C6; empty on A4.
- Footer: "Call Us: +918031341017" links to tel:+919845558267 (number mismatch).
- No post links to a pricing page or states our price, except A2's table ("From ₹500/month").

## 3. Per-post notes

### A1 tally-integration (35 citations)
1. Opens with "Key takeaways" bullets of benefits ("eliminate repetitive exports... unlock real time insights"). No direct answer, but the query is brand-navigational so the title does the work.
2. Title is the query. Headings descriptive ("Prerequisites checklist", "Common Tally sync troubleshooting").
3. Most concrete T1 post: port 9000, XML over HTTP vs ODBC, AlterID/LastAlterID, sample XML envelope, seven error/fix pairs. "Up to 75 percent reduction in data entry" has no source. Sync "every 15 minutes", "Email or Slack notifications" are product claims I cannot verify.
4. A human-written "2026 Updates" section describes real features (Cost Centre Class "60% Delhi / 40% Mumbai", AP/AR cycle). No screenshots of the connector.
5. 28 mentions. "Alternative accounting integration tools" lists QuickBooks Desktop Connector, Xero, FreshBooks API, Zoho Books, TallyPrime Server, each dismissed in a clause ("does not match the advanced AI mapping depth of AI Accountant"). Reads as an advert.
6. None of the real alternatives (Vyapar TaxOne/Suvit, Tally's Docs by Ira, KolossusAI) is named. No table.
7. Troubleshooting list and FAQ answers are extractable. 12 FAQ answers stand alone.
8. Three "see the ultimate guide to Tally Prime automation" link-outs repeated 5 times; "Getting started" restates the intro.
9. "Updated August 18, 2026" but no mention of TallyPrime 7.1 / Docs by Ira in a section titled "2026 Updates: What Can AI In Tally Prime Do?". Dangling text "see the AI agent directory for Tally" with no link.

### A2 gstr-2b-tools (25)
1. Key takeaways first, then a correct two-sentence definition of GSTR-2B. Good definition, but the tool answer is 600 words down.
2. Title matches the query. Headings are marketing lines: "How AI Accountant Revolutionizes GSTR-2B Reconciliation", "Automation Benefits: Transforming Input Tax Credit Matching".
3. The table is the asset: 9 tools, 7 attributes, 9 starting prices (AI Accountant "From ₹500/month", Winman "~₹13,500/year", KDK "From ₹20/day", TallyPrime "₹750/month (Silver rental)", Zoho "from ₹899/org/month"). No source or check date for any price.
4. The "4 mismatch buckets" and "Quick checklist before filing" read as practitioner knowledge. No screenshot of our reconciliation screen.
5. We are row 1 of the table and first bullet in the tool list. Key takeaway says we "set a new standard". All 10 FAQ questions are about us ("What training resources are available for AI Accountant users?").
6. Real competitors named (ClearTax, Winman, KDK Spectrum, IRIS Sapphire, Refrens, RealBooks, Avalara, SAP). Fair one-liners. This is why it gets cited.
7. The table has no heading or caption; it sits under "Quick checklist before filing". The tool list is an H3 under the wrong H2.
8. Filler: "Future of GST Compliance Automation" (blockchain, RegTech), "Building Confidence in Your GST Compliance".
9. Says "Suvit / Vyapar TaxOne" (half-updated). Our link in the table goes to /book-a-demo.

### A3 manufacturing-software (22)
1. Best opening we have: "The top accounting software for manufacturing in India are AI Accountant, Tally Prime, Zoho Books, Busy Accounting Software, and Marg ERP."
2. Title is the query, with "Honest Comparison". Tool headings carry a use case ("Best for Pharma, FMCG, and Distribution Manufacturing").
3. Prices for 4 competitors, "300 to 600 purchase bills a month", "up to 100 line items", "1,000 bills per month". No source links at all. Our own price is the vaguest on the page: "Plans are available based on monthly bill volume".
4. Two product videos. Tool images are homepage captures, not product screens (checked the AI Accountant one: `img/a3_aia.png`). "Karbon Business (YC S21)... 500+ active users". No named customer.
5. We are ranked 2 after Tally, described by job ("automation layer that sits on top of it"), with a section "Where it's honest about its limits" listing five things we do not do. This is the model to copy.
6. Table has a Limitations column for every tool including us ("No inventory, no BOM, not a standalone system").
7. Per-tool Pricing/Verdict blocks, five-stage chooser, FAQ in real query wording ("Can AI Accountant replace Tally Prime for manufacturing?").
8. One-sentence paragraphs pad the length; "Stage" section repeats the Tally + AI Accountant verdict three times.
9. Risks, see section 7: Tally price wrong, Suvit renamed, unsourced claims against Suvit.

### A4 purchase-bill-entry (22)
1. Answers in sentence one: "Purchase bill entry in Tally can be automated using AI-powered invoice extraction tools such as AI Accountant."
2. Title is a how-to query. "Short answer:" labels used twice.
3. "10-15 hours for every 100-150 bills", "85-95% of invoices", "90-98% on primary fields": plausible, none sourced. No steps inside Tally (no menu path, no screen name) for the Excel import method.
4. One product video. No screenshot, no customer figure.
5. Only 7 mentions; reads as an explainer. Other tools named: VouchrIt, Suvit, Razorpay.
6. Compares three methods, not tools, in a table. Honest limitation lines per method.
7. Five numbered steps, comparison table, eight FAQs that stand alone.
8. Tight. Least padded post in the sample.
9. Contradiction: "AI Accountant offers 95%+ accuracy, even for handwritten bills" and, two sections later, "Accuracy drops for handwritten invoices". Does not mention Docs by Ira.

### B1 ca-gpt (4,479 clicks, no citations)
1. Key takeaways first; bullet 1 does define CA GPT and gives the URL.
2. "So, What Is CA GPT AI?", "ICAI CA GPT Login & Access Guide" match searches.
3. Dense with numbers, almost all unsourced: "500,000 active users", "1.2 million daily prompts", "20 prompts", "premium tier at ₹499/month", "94% accuracy... per ICAI's internal benchmarks", "12% improvement in pass rates", "SEBI and MCA mandated AI disclosure in audits from January 2026". All four external links go to homepages (icai.org, sebi.gov.in).
4. Two real screenshots of the login page. Nothing of ours.
5. We appear as a bolt-on ("pair research tools like CA GPT with... AI Accountant"). No FAQ mentions us. Topic is someone else's product; an assistant will cite ai.icai.org.
6. n/a.
7. Login steps and the 23-item GPT list are extractable.
8. T2 "What's New in 2026" block.
9. See section 7. This is the highest-risk page in the sample.

### B2 tally-shortcuts (1,614 clicks)
1. Key takeaways then a four-paragraph warm-up ("Tally Prime is one of the most trusted...").
2. Good FAQ wording ("How to copy a voucher in Tally Prime shortcut key?").
3. 52-row table. Claims "over 130 shortcut keys... exhaustive". Several rows look like Tally.ERP 9 behaviour or are wrong for TallyPrime (see section 7).
4. A PDF download. Nothing first-hand.
5. Two product-link sentences. Brand spelt "AiAccountant". No reason for an assistant to name us for this query.
7. Table and FAQ are extractable; the answers name a key, which is what assistants want. The page fails on trust (errors) and on having no brand relevance.
8. "How to Become an Expert" (mnemonics, spaced repetition) is filler.

### B3 best-accounting-software (1,139 clicks; ChatGPT skips us at number 1)
1. Three paragraphs of warm-up ending "Let's start." No answer.
2. Title "15 Best Accounting Software for SMEs to Avoid GST Penalties" does not match the H2 ("for Small Businesses in India"), and the list has 16 entries.
3. Zero rupee figures on the whole page. Table has four columns with values like "Yes / Low / Medium".
4. Nothing first-hand.
5. Why we get skipped, in my reading:
   - The entry is headed "AIAccountant (AIA)". "AI Accountant" as two words appears once in the body. An assistant matching entities sees a different string from our brand.
   - We are not accounting software for a small business. The entry itself says "It sits on top of existing systems like Tally". The assistant is answering "best accounting software" and correctly drops a non-ledger.
   - Our entry has no price, no "best for", no limitation; it has "delivers the highest ROI" and "Very High" automation, self-awarded.
   - The FAQ says "Can I migrate from Tally to cloud accounting software? Yes, tools like AiAccountant..." which contradicts A3 ("not a replacement for Tally").
6. 15 real tools named, two sentences each, no prices, no limitations. Refrens gets a longer entry and two links (looks like a link swap).
7. The table is extractable, which is why the page is cited at all.
9. A hidden run of 16 zero-width characters sits inside "Let's start." (humaniser or watermark artefact).

### C1 cfo-kpis
1. Has a "Short Answer" section, but it opens "Every finance head knows the feeling: it is the 5th of the month...".
2. Title "CFO Dashboard KPIs Operational" is a keyword string nobody types; it is repeated in the H2.
3. The most specific C post: formulas, thresholds, Section 15 MSMED, Rule 36(4), worked interest figure. One external link (gst.gov.in homepage). No statute links.
4. None. Thresholds such as "ITC at risk above ₹50,000" are asserted, not sourced to our data.
5. "AiA plugs directly into Tally" in bold blocks, then "AI Accountant" as the last sentence of 7 FAQ answers. Feature claims I cannot verify: "blocking voucher save if references are missing", "AiA's WhatsApp assistant", "AI Accountant's scheduler".
7. The 12-KPI list would be a table anywhere else; here it is a dash-separated bullet list.
8. KPIs are defined three times (takeaways, short answer, full section).

### C2 accountants-quitting
1. Opens with a US statistic with no country or source: "Over 300,000 accountants have left the profession since 2019."
2. Seven body headings are H1 (8 H1 in total). Headings are essay lines ("The Common Root Most Finance Leaders Miss").
3. 23 percentages, one deep source link (ACCA Global Talent Trends 2025). The rest link to homepages (icai.org, economictimes.indiatimes.com, gstcouncil.gov.in). "52% of India's population falls into Gen Z or Gen Y" misreads a survey sample.
5. Two mentions. No reason to name a product.
8. Opinion essay; "The Future of Accounting Teams" and "Conclusion" restate the body. No buyer question.

### C3 ap-trading
1. Key takeaways of unsourced outcomes ("cut manual AP work by 50% or more").
2. "The Complete Playbook". "Why AP Automation Matters...".
3. Numbers without source: "ROI arrives in 6 to 9 months", "touchless 85% to 95%", "posting accuracy 98%". The "India-Context Examples" are invented and contain errors (section 7).
5. The body describes "the platform" doing 3-way matching, BOE capture, RCM auto-posting; we are named only in a "Recommended tools" list beside QuickBooks, Xero, FreshBooks, and once in the last FAQ.
6. No AP competitor is named (no Finifi, Clear Capture, Vyapar TaxOne). The one external link goes to a competitor's listicle (finifi.io).
8. "Best AP automation software in India" appears 4 times as plain text where a link was meant.

### C4 complete-ap-process
Textbook AP process any model can write. 13 H2, 52 H3, most sections two sentences. "Blockchain and Smart Contracts" section. One worked example (₹50,000 + 18% GST, 194J at 10%). Tool sentence lists "QuickBooks, Xero, FreshBooks, Zoho Books, and SAP Business One". FAQ questions are persona prompts: "How should a CA design an end-to-end AP SOP for an Indian SMB processing 200 to 500 invoices monthly?". Zero external links.

### C5 500-vendor-bills
Best title in group C, but opens with takeaways. All 15 FAQ answers end with an AI Accountant sentence ("AI Accountant applies multi-parameter de-duplication..."). "high-volume invoice processing" appears 8 times as unlinked text. The case study is anonymous ("A Bangalore CA firm serving six SMEs") and its figures (3 FTEs, 6 to 8 day closes, 75% touchless, 3% ITC mismatch) are the same benchmark numbers the post lists two sections earlier. Tool list: SAP Concur, QuickBooks Online. "Download a checklist" with no link.

### C6 workflow-builder
"Accounting workflow builder" is not a category Indian buyers search. Title: "The Indian Finance Team Game Changer". Table of contents is rendered inside the Key takeaways list. "Popular options" are QuickBooks Online, Xero, FreshBooks, Sage. FAQ: "We are a CA firm with 150 clients, what is the fastest way to roll out approval matrices across entities?". Claims "AI Accountant users often report payback within two quarters" with no source. External links go to two unrelated agencies.

### C7 adopt-ai-guide
Title: "Proven Steps for Massive Growth". The "Step by Step Guide" stops at Step 2. FAQ questions are H2, not H3. "Deloitte India survey" and "PwC India report" link to homepages. Repeats the ₹1 crore e-invoicing claim.

## 4. Templates visible across our posts

**T1, the n8n original** (A1, A2, C3, C4, C5, C6):
1. H1: "[Keyword]: [superlative]" ("The Complete Playbook", "Game Changer", "Complete Setup and Automation Guide").
2. "Key takeaways": 5 to 8 benefit bullets, no answer.
3. "Why X matters for Indian businesses": pain paragraph.
4. Feature H2s, each a list of "**Bold label:** one sentence" bullets.
5. "Tooling checklist / Choosing the right X".
6. Tool list: AI Accountant first with a "purpose-built" line, then QuickBooks, Xero, FreshBooks, Zoho Books.
7. "Implementation roadmap" in three phases (pilot, expand, scale / 30-60-90).
8. "ROI / metrics" with round unsourced ranges (60 to 75%, 85 to 95%, 6 to 9 months).
9. "Future of ..." (AI, blockchain, real-time payments).
10. "Conclusion / Getting started / Taking the next step".
11. FAQ: 10 to 15 long persona questions; answer ends "AI Accountant does this".
Sentence tells: comma splices in place of dashes ("it is a configurable system..., You stay in control"), no hyphens ("real time", "India specific", "step by step"), "Example, you receive...".

**T2, the 2026 refresh layer** (B1, B2, C2, C7):
"Key Takeaways" then "[Topic]: What's New in 2026" in a fixed shape: "In 2025 X. From 2026 Y" → "Who does this affect most?" → "The cost of ignoring/inaction" → "What to do now:" three bullets → product-link sentence. "(2026 update)" appended inside FAQ answers. Government and Big Four homepages used as citations. This layer is where the invented facts cluster.

**T3, the comparison format** (A3, A4; C1 partly): answer paragraph, comparison table, per-item "Best for / Limitation / Pricing / Verdict", chooser by stage, FAQ in query wording. Reads as written or heavily edited by a person.

## 5. What group A does that group C does not

- Title is a string buyers type, with a named thing in it (Tally, GSTR-2B, manufacturing). C titles are category abstractions or essays.
- A3 and A4 answer in sentence one and name tools. No C post does.
- Tables: A2, A3, A4 yes; all seven C posts no.
- Real Indian tools named with prices or limitations (A2: 9 tools, A3: 6). C names QuickBooks, Xero, FreshBooks, SAP Concur.
- We are described as a specific thing with stated limits (A3) or one option among several (A4, A2). In C we are appended to FAQ answers.
- Product video in A3 and A4.
- A1 carries real implementation detail (port, protocol, error fixes).
- Not different: source links (A is no better), length, mention count.
- Caveat: A1 and A2 are old T1 posts with human-inserted sections, so "which template" is not a clean split. The inserted table in A2 and the "2026 Updates" block in A1 are the parts doing the work.

## 6. What the competitor pages do that ours do not

- A labelled answer block at the top that names several tools: X1 "The quick answer", X2 "In one line", X3 "Short answer." with rupee ranges.
- Dated evidence per claim: X1 ends each tool with "Source: [vendor pricing page], checked October 2026"; X3 says "publicly available pricing data as of May 2026" and cites "Notification 15/2025-Central Tax dated 17 September 2025".
- A stated method and interest: X1 "No ratings, no paid placements... Skillopedia sells none of these tools".
- Their own product is kept out of the ranking: X1 has "Where Skillopedia fits" after the list; X2 puts PotionLabs last in the table in its own category and says "PotionLabs does not keep your books today" and "that's the goal we're building toward, not what ships today".
- Decision rules: X2 "Which should you choose?" as five if-then bullets, each naming a competitor.
- Current market facts ours miss: Docs by Ira (TallyPrime 7.1), Suvit renamed Vyapar TaxOne, QuickBooks not sold in India, Income-tax Act 2025 renumbering.
- X3 publishes its own prices beside competitors' in every section (186 rupee figures).
- FAQ questions are short real queries: "Does Tally have AI?", "Is QuickBooks available in India?".
- One canonical sentence repeated verbatim (X2: connector "sets up in about 5 to 10 minutes and needs no developer", 6 times).
- Named author with role and a linked profile; X1 and X2 mark it up in schema.
- X2 names AI Accountant 9 times and defines us for the reader: "Good fit if: your finance team's bottleneck is bank lines and reconciliation." Third parties are setting our category, and it is not the bills-first position A3 takes. X2 also links a "Docs by Ira and AI Accountant alternatives" page.
- Weakness to note: X2's price column is "Check vendor site" for every tool and the page is dated 2027 while "as of October 2026". Prices are not the only route to citation; clear categorisation is another.

## 7. Factually wrong, contradictory or risky

High confidence:
- **E-invoicing threshold.** C2 and C7 say it "dropped to ₹1 crore" from April 2025. B2, C1, C3 say ₹5 crore. Search finds no ₹1 crore notification; ₹5 crore (Notification 10/2023-CT, effective 1 Aug 2023) still stands. B2 also dates the ₹5 crore change to "April 2023" (it was 1 August 2023).
- **QuickBooks** is recommended in A1, C3, C4, C5, C6. Intuit withdrew it from India in 2023.
- **Suvit** was rebranded Vyapar TaxOne in December 2025. A3 and A4 (both 2026) still call it Suvit.
- **Tally's own AI.** TallyPrime 7.1 ships "Docs by Ira" (invoice to draft voucher). A1 ("2026 Updates", updated Aug 2026) and A4 omit it; A3 says Tally has "no automation layer" and "Every purchase bill... has to be manually entered". A3 may predate the release, but it is now wrong.
- **C3 examples.** "HSN 4861 triggers RCM" (chapter 48 is paper; GTA is SAC 9965/9967) and "port code CHNA" (Indian port codes look like INMAA1).
- **B3** title says 15, list has 16; FAQ says we are a Tally migration target.
- **A4** contradicts itself on handwritten bills.
- **Our own facts disagree across posts.** Setup time: "hours" (A1), "one to two days" (A3), "2 to 4 weeks" (C3). Analytics/forecasting: "not currently offered" (A3) vs "enabling accurate ITC forecasting" (A2 FAQ). ITC eligibility: "not currently automated" (A3) vs "auto-tags ITC eligibility" (C5). Audience: "purpose-built for Indian trading companies" (C3), "for Indian CA firms and SMEs" (C5), "for Indian finance teams" (C6). Parent: "Karbon Business (YC S21)" (A3) vs footer "KOREFI BUSINESS SOLUTIONS PRIVATE LIMITED". Zoho Books integration is claimed in A2, C3, C4, C5, C6 and absent from A3.

Medium confidence (could not find support; treat as invented until sourced):
- **B1 CA GPT figures**: ₹499/month premium, 20 prompts/day, 500,000 users, 1.2 million daily prompts, 94% accuracy, 12% pass-rate gain, Aadhaar/DigiLocker SSO, "Audit Risk Simulator", and "SEBI and MCA mandated AI disclosure in audits from January 2026". ICAI's own manual says 10 prompts a day and extra prompts via a ChatGPT licence. Our page is the top search result for the ₹499 claim, so we are the origin. This is our highest-traffic post.
- **C7** "GST portal introduced stricter GSTR-2B based ITC matching from January 2026"; Deloitte and PwC statistics linked to homepages.
- **C5** anonymous case study whose numbers equal the post's own benchmarks.
- **C1/C3/C4/C6 product features**: 3-way PO/GRN matching, BOE import flows, approval routing, voucher-save blocking, WhatsApp assistant, scheduler. A3 describes a narrower product. If A3 is right, these over-claim.
- **A3 on Suvit**: "the trial version has been noted to differ from the paid product experience. Post-sales support has been flagged as a concern by users". Unsourced negative claims about a named competitor.
- **A3 Tally price**: "Silver... approximately ₹18,000/year" and "Gold... ₹54,000/year". These look like old one-time licence prices labelled per year. A2 says ₹750/month rental; X1 quotes ₹22,500 single-user licence. Zoho Books is "₹2,499 to ₹7,499/month" in A3 and "from ₹899/org/month" in A2.
- **B2 shortcuts**: F1 "Select Company" (TallyPrime: Help), F10 "Reversing Journals / Memo" (TallyPrime: Other Vouchers), "Ctrl + Shift + C Copy value" (TallyPrime: Ctrl+Alt+C), Ctrl+F9 "Inventory features / Production", Ctrl+S "TallyShop". I am working from memory of Tally's help pages; verify each row.
- **Income-tax Act 2025** took effect 1 April 2026 and renumbered sections (X3 notes 44AB became 63). C4, C5 and A-group posts updated after that date still cite 194C, 194J, 194Q, 43B(h) with no note. Check the mapping before reuse.
- **C2** "300,000 accountants" is a US figure presented in an India article with no source.

## 8. Recurring faults, short list

1. No answer at the top; benefit bullets instead (12 of 14).
2. Generic category text; nothing only we could know: no named customer and no in-product screenshot in 14 posts. The "screenshots" in A3 are homepage captures with empty alt text (the AI Accountant one shows "300M+ Transactions Analyzed", a first-hand number no post uses; A3 instead says "500+ active users").
3. Brand attached as an advert at the end of FAQ answers, under several spellings, with no price.
4. Wrong or fake competitor set (QuickBooks/Xero/FreshBooks) in T1; real set only in A2, A3.
5. Unsourced round-number statistics and homepage links posing as citations.
6. Invented or stale facts, concentrated in the "What's New in 2026" layer.
7. Self-contradiction about our own product between posts.

## Sources used for verification
- https://tallysolutions.com/gst/e-invoicing-threshold/
- https://www.gimbooks.com/blog/5-crore-e-invoice-turnover-rule-2026/amp/
- https://ai.icai.org/cagpt/User_Manual_for_Activation_of_ICAI_CA_GPT_20.pdf
- https://help.tallysolutions.com/docs-by-ira-faq/
- https://tallysolutions.com/tallyprime-7-1-whats-new/
- https://www.socialsamosa.com/industry-updates/suvit-rebrands-vyapar-taxone-10924728
