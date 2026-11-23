# AEO Plan — AiA (2 weeks)

## Plan overview
- Duration: 2 weeks. Day 1 = Monday 16 Nov 2026. Final review = Monday 30 Nov 2026.
- Pass condition: meet every goal by its due date. A goal that is missed or falls below its bar counts as not met.

## Goal 1: AEO visibility baseline (Google AI answers + ChatGPT)
**Due:** Thursday 19 Nov 2026
**Task:** Set up a repeatable way to measure where AiA stands in Google AI answers and ChatGPT, then share the baseline.
**Bar:**
- Covers both channels: how visible AiA is, how it compares with competitors, and how much traffic and conversion AEO brings in.
- Every number can be traced back to raw data.
- Someone else can re-run it from my documentation. Proven by a second run before Monday 30 Nov.

## Goal 2: Major AEO opportunities identified
**Due:** Monday 23 Nov 2026
**Task:** Present the biggest AEO opportunities for AiA, ranked, with a recommendation on where to start.
**Bar:**
- Every opportunity is backed by my baseline data, not generic AEO best practice.
- In the review, I can explain why the sources cited today win, and why my proposed action would change that.
**Approval:** Rohan approves which opportunities go into Goal 3 by Tuesday 24 Nov 2026.

## Goal 3: Execution on 2 AEO opportunities
**Due:** Monday 30 Nov 2026
**Task:** Ship two of the approved opportunities.
**Bar:**
- Both are live by Monday 30 Nov. A draft or plan does not count.
- Before/after measurement is set up for both.
- Citation lift is checked after 30 days and does NOT decide this PIP.

## Working rule (from user, 13 Nov)
Ask before any paid call (treg/cloro, Ahrefs units), any write/change (Supabase, n8n, Ahrefs, treg), or any batch run. State expected cost first.

## Decisions so far (Goal 1)
- Capture: cloro via treg.to. ChatGPT = `cloro.ai-search.chatgpt.scrape` (web interface); AIO = `cloro.google.serp.organic` with AI Overview. Tested by user, works.
- Runs: ChatGPT 10 runs per prompt, AIO 5 runs per keyword.
- Backbone: existing n8n + Supabase (AI Accountant project). Ahrefs Standard is too limited (300 checks/mo).
- Competitor set v1 (locked 13 Nov):
  - Share of voice: AiA (`AI Accountant` case-sensitive, `aiaccountant.com`), Vyapar TaxOne (aliases: Vyapar TaxOne, TaxOne, Suvit),
    Tally AI (only Docs by Ira / TallyPrime AI / Tally described doing AI work), Hisabkitab, GSTHero, VouchrIt.
  - Context (reported separately): Tally (all mentions).
  - Watchlist (reported separately): Nanonets, Cashflo, Provi AI, Qosh AI, Zoho Books.
- Prompts v1 (locked 13 Nov): the existing 100 tracked prompts in Supabase `public.prompts` (chatgpt_track = true and is_active = true).
- Drop cloro `searchQueries` option (returned empty in the pilot).
- Cadence: full baseline run every 4th day (~$4.20/run, ~$32/mo); dashboard tabs: ChatGPT | Google AIO | Traffic & Conversions | Runs/Raw data.
- Keywords v1 DRAFT (13 Nov): /home/user/aeo-keywords-v1-draft.csv, 100 keywords (88 buyer-intent across 8 topics + 12 informational).
  Sources: Ahrefs (AiA + TaxOne/GSTHero/Hisabkitab/Tally AI organic keywords, India; seed-term ideas) + GSC India 90d.
  Live cloro check: 99/100 show an AI Overview in India. Awaiting approval.
- Keywords v1 (draft 13 Nov, awaiting approval): /home/user/keywords-v1.csv, 100 keywords (84 buyer / 16 informational),
  sources: Ahrefs organic keywords (AiA, TaxOne, GSTHero, Hisabkitab, Tally /ai-for-business/, VouchrIt; IN), Ahrefs Keywords Explorer seeds, GSC 90-day India queries.
  AIO check 13 Nov (cloro, IN, 1 run): 97/100 show an AIO. Raw: scratchpad/keywords/aio/.
- Cadence: full run every 4 days from anchor Wed 18 Nov; tabs Overview / ChatGPT / AI Overviews / Traffic & conversions / Runs.
- Open: approve keyword list; GA4 connection in treg; treg cost check (batch of 101 AIO calls cost $0.56 vs $0.28 list).

## Key dates
| Date | Milestone |
|---|---|
| Mon 16 Nov | Day 1 |
| Thu 19 Nov | Goal 1 due |
| Mon 23 Nov | Goal 2 due |
| Tue 24 Nov | Rohan approves the Goal 3 opportunities |
| Before Mon 30 Nov | Second run of the Goal 1 baseline by someone else |
| Mon 30 Nov | Goal 3 due + final review |

## Tracking config (updated 17 Nov 2026)
- Every run (scheduled every 4 days from 18 Nov 06:00 IST, or manual): prompts v2 (89 = 86 unbranded + 3 branded) x 4 ChatGPT runs = 356 answers;
  keywords v1 (100) x 4 AIO captures = 400. Competitors v1.
- Branded prompts are captured but excluded from headline, share of voice and topic metrics.
- Cost per run ~ $0.71 ChatGPT + ~$1.12 AIO = ~$1.83; ~7.5 runs/month = ~$14/month (excl. possible treg reservation issue).

## Prompt list v3 live (16 Nov 2026)
- Second audit of prompts v2 against aiaccountant.com + help docs, Profound / SE Ranking / Omnius / Averi guidance, GSC India 90d and fresh India autocomplete.
- v3 = 82 prompts: 71 unbranded (headline + share of voice), 6 competitor comparison, 5 own brand (both reported separately). Keys P001-P071, C001-C006, B001-B005.
- From v2: 55 kept (15 reworded), 34 dropped (off-category, duplicates, artefact evidence); 27 new. Files: /home/user/prompts-v3/.
- Supabase: aeo_prompts list_version 'v3'; aeo_create_run default prompt list = v3 (4 runs each = 328 answers, 284 headline; ~$0.66 ChatGPT per run). v2 kept in the table, unused.
- Open: add Riko AI to competitor watchlist? (seen in India autocomplete "riko ai for tally").

## Prompt list v4 live (17 Nov 2026)
- Team rules: (1) keep prompts that compete with Tally's Docs by Ira; (2) remove only what Tally does easily and is widely known for (new-release features stay);
  (3) product only, no virtual accounting / virtual CFO services.
- v4 = v3 minus 24 (3 Tally-native, 6 accounting-software category, 10 services, 5 with no route to AiA) plus 17 new (13 unbranded, 4 competitor incl. 2 Docs by Ira).
- v4 = 75 prompts: 62 unbranded, 8 competitor comparison, 5 own brand. 4 runs each = 300 answers per run, 248 in the headline. ~$0.60 ChatGPT per run.
- Supabase: aeo_prompts list_version 'v4'; aeo_create_run default = v4. v3 kept, unused. Files: /home/user/prompts-v4/.
- Keyword list (Google AIO) reviewed with the same rules, NOT changed: 35 of 100 flagged, see /home/user/prompts-v4/keywords-review.csv. Awaiting decision.

## Wording + keyword list v2 (17 Nov 2026, later)
- Prompts v4 reworded in place (no run had used v4): short, informal wording the way people in India type into a chatbot, e.g. "AI agent for tally prime?".
  Earlier full-sentence wording kept in aeo_prompts.prompt_text_formal. Still 75 prompts (62 unbranded, 8 competitor, 5 own brand).
- Keywords v2 live: v1 minus 35 (19 accounting-software category, 6 services, 3 basic Tally how-tos, 7 software AiA does not sell) plus 28 new product keywords
  (Tally AI, invoice/bank to Tally, Docs by Ira, AI GST reconciliation, CA AI tools, OCR). 93 keywords: 78 buyer, 15 informational.
  All 28 new keywords showed an AI Overview in a 17 Nov check (AiA cited on 10); raw captures in scratchpad v4/kwaio. aeo_create_run default keyword list = v2.
- Per run: 300 ChatGPT answers (~$0.60) + 372 Google captures (~$1.04) = ~$1.64. treg balance $10.32 on 17 Nov; cloro AIO now charged at list price ($0.0028).
- Selection caveat: the new keywords come from queries where AiA already gets Search Console impressions, so the buyer citation rate will sit higher than the pilot's and is not comparable with it.

## First baseline run started (17 Nov 2026, 17:13 IST)
- Run R20261117-M1 (manual): prompts v4 (75 x 4 = 300 answers), keywords v2 (93 x 4 = 372 captures), competitors v1.
- Started from the Claude session with /home/user/aeo-runner/run_batch.py because the n8n treg credential is not yet added. The script calls the same
  Supabase queue functions and the same cloro request bodies as n8n workflow 9jZMztEJIPSHacM7. Log: /home/user/aeo-runner/run_R20261117-M1.log.
- Schedule anchor moved from 18 Nov to 21 Nov (n8n node + aeo_ensure_scheduled_run default) so the cadence stays every 4 days from the first run: 21, 25, 29 Nov.
- n8n workflow still inactive: needs Header Auth credential "treg AEO token (X-Treg-Token)" on the 3 treg nodes, then Activate.

## First baseline run complete (17 Nov 2026, 17:30 IST)
- R20261117-M1: 300/300 ChatGPT answers, 372/372 Google captures, 0 failed, 0 retried, ~17 minutes. Cost $1.64 (treg balance $10.32 -> $8.68).
- ChatGPT (62 unbranded prompts, 248 answers): AiA mentioned 4.4% (11 answers, CI 2.5-7.8%), aiaccountant.com cited 13.7% (34, CI 10.0-18.6%),
  5 of 62 prompts mention AiA. Share of voice (mentions): Tally AI 59.8%, Vyapar TaxOne 26.1%, AiA 12.0%, GSTHero 2.2%.
- Google (78 buyer keywords, 312 captures): AI Overview shown 99.7%; AiA cited 24.8% (CI 20.3-29.8%), 21 of 78 keywords. All 93 keywords: 27.8%. Informational: 43.3%.
  Share of voice (citations): AiA 55.7%, Vyapar TaxOne 20.0%, Tally AI 11.4%, Hisabkitab 10.8%, GSTHero 2.2%.
- Measurement fix: "AI Accountant" is also a generic phrase. The text rule flagged 18 unbranded answers; a manual read found 7 were not the brand
  (6 generic, 1 a different product "Your AI Accountant"). New table aeo_gpt_mention_reviews holds a verdict + reason per flagged answer and
  aeo_gpt_mentions_v ignores 'not_brand' rows. Raw rule gave 7.3%; reviewed figure is 4.4%. Every future run needs the same review (manual or automated).
  Not reviewed: 3 flagged answers in the competitor group (outside the headline). Google "named" matches all coincide with a citation (45 of 45).

## Dashboard speed (17 Nov 2026)
- Cause: every page view recomputed brand matching and source parsing over all raw captures (Overview 17-20 s, ChatGPT 8 s, AI Overviews 24 s).
- Fix: 10 materialized views (aeo_gpt_*_mv, aeo_aio_*_mv) hold the computed results; dashboard reads them. Refreshed by aeo_refresh_dashboard()
  when a run finishes (inside aeo_housekeeping) and when a brand-mention verdict changes (trigger). Full refresh took 30 s with 2 runs; it grows with each run.
  Live views (_v) remain the source of truth and are what the dashboard's raw-data arrows open.
- Also: page queries run in parallel; Vercel function region moved to Mumbai (bom1), next to the database. Pages now ~0.6-0.8 s.
- Overview hang (it hung on 7 of 8 requests in one check): database queries were left stuck mid-protocol on the pooled connection, and everything queued behind them.
  Fix in lib/db.js: one query at a time per server instance, a 5 s timeout per query, and on a timeout or dropped connection the client is discarded and the
  query retried once on a new connection. After the fix 10 of 10 requests returned in under 1 s. Exact trigger not proven (parallel queries and/or paused serverless instances).

## "Ask Claude" links (17 Nov 2026)
- The Supabase arrows on the dashboard are replaced by a Claude mark (hover: "Ask Claude to explain it!"). Each links to /api/ask?k=<kind>&run=<run>&id=<id>,
  which builds a short prompt (metric, definition, the numbers behind it, the SQL for the raw rows, a closing "Raw data:" line) and redirects to claude.ai/new?q=...
  Code: lib/ask.js, app/api/ask/route.js. Add &show=1 to see the prompt text instead of redirecting.
- Only aggregated figures go into the prompt. The link opens in whichever Claude account the browser is signed in to; the raw rows are only reachable if that
  account has a Supabase connector for the AI Accountant project. HubSpot contact rows keep their direct HubSpot arrow.
- Updated same day: each prompt now carries the actual source rows behind the figure (ChatGPT answer excerpts, cited pages, per-keyword results,
  GA4 rows, HubSpot contact rows by ID) and tells Claude to end with a "Source data" table of those rows plus where they come from. The dashboard link
  is no longer used as the source. Prompts are capped at 5,400 characters; when a figure has more rows than fit, the first N are included and labelled "first N of M".

## Dashboard redesign (17 Nov 2026)
- app/globals.css rewritten as a shadcn/ui-style token system (background, card, muted, border, primary, radius, shadow) in plain CSS, no new dependencies.
  Brand rules applied: white canvas, black/grey content, Helvetica Neue, accent #314DD0 used only for AiA's own data (bars, trend line). Competitor bars are neutral grey.
- Tabs-style navigation, bordered cards with soft shadow, sentence-case stat tiles, lighter tables, black buttons, thin bars (10px, rounded data end).
- Fixed: Claude mark overflowing the stat tile when the label was a long unbreakable word. Weekly GA4 chart is now one bar per week with the ChatGPT share as a label.
- Previous stylesheet kept at scratchpad/globals.before-shadcn.css (not durable).

## Chart audit after the redesign (17 Nov 2026)
- Share and rate bars (share of voice, brand mention/named rates) now use a fixed 0-100% scale, so bar length equals the percentage. Before, the largest bar filled the track.
- Zero values draw no bar (a sliver was drawn before). Each bar row has a hover title with the exact value.
- Weekly GA4 sessions: two-colour stacked bar restored (ChatGPT #10a37f, other assistants #eb6834), legend added, 2px gap between segments.
  The pair passes the dataviz palette validator (colour-blind separation, contrast >= 3:1 on white); dark-mode pair #199e70 / #d95926 also passes.
- Trend charts: with one run the 95% range is drawn as a whisker with its two values; the shaded band appears from the second run. Axis labels show one decimal on small ranges.
- AiA = accent blue in every brand chart; competitors neutral grey (#8c8c8c); context / watchlist brands are labelled in the "all tracked brands" charts.
- HubSpot weekly chart: bar = broad count, label shows broad and strict.

## n8n orchestrator live (17 Nov 2026, 23:32 IST)
- Workflow 9jZMztEJIPSHacM7 published (active). treg credential "treg AEO token (X-Treg-Token)" (id yren7AzvIcM00bMu) attached to the 3 treg nodes; header name fixed to `X-Treg-Token`.
- Verified with one free status poll from n8n (HTTP 200, cost 0, task from R20261117-M1 returned, so same treg team). Temp test workflow eo6nBwlwZp0uSdzV archived.
- First scheduled run: Sat 21 Nov 06:00 IST, then 25 and 29 Nov. Until then the 10-minute ticks find nothing to do.

## Second run via n8n + two n8n fixes (18 Nov 2026)
- Run R20261118-M1 started 10:45 IST through the n8n manual trigger (user approved, ~$1.64). First full run through n8n.
- Found: Postgres credential "GEO Project" pointed to an empty Neon DB, so every tick since publishing had failed ("function does not exist"). All 9 Postgres nodes now use "Supabase Marketing Postgres" (jT5HbtTib30mNnOa), verified read-only to hold the aeo_* objects. Yesterday's "live" status was wrong on this point; only the treg credential had been tested.
- Found: treg returns HTTP 429 money_admission_timeout ("queue busy, nothing charged") when 10 calls are sent at once. Batching lowered (submit 2, SERP 3, poll 5 at a time); new 'busy' action in aeo_gpt_apply / aeo_aio_apply requeues without using an attempt (migration aeo_apply_busy_action); Classify nodes map 429 to 'busy'.
- Temp n8n workflows archived: eo6nBwlwZp0uSdzV, GRD5stmiRLXLvp3W.

## Run R20261118-M1 result (18 Nov 2026, via n8n, 10:45–11:31 IST)
- 300/300 ChatGPT answers, 372/372 Google captures, 0 failed. Cost $1.65 (balance $8.68 -> $7.03).
- ChatGPT unbranded (248 answers): AiA named 9 = 3.6% (CI 1.9–6.8) after manual review (13 regex matches, 4 generic "AI Accountant" marked not_brand); cited 29 = 11.7%; named on 5 of 62 prompts.
- Google buyer (312 captures): AiA cited 24.0% (CI 19.5–29.0), 21 of 78 keywords; all keywords 27.6%; AI Overview shown 99.0%.
- All differences vs R20261117-M1 are inside the 95% ranges (noise).
- Open: generic-phrase review is still manual per run; scheduled runs show the uncorrected mention rate until reviewed.
- GSC Generative AI export: user uploaded Chart.csv (18/05–15/11/2026, 1,545,694 impressions). Upload route now merges duplicate pages; top-pages table uses latest Pages upload only.

## Dashboard tooltips (18 Nov 2026)
- Library: @radix-ui/react-tooltip. Components in components/info.js (Info = "i" icon, Term = dotted-underline word, Hint = tab tooltip).
- All wording lives in lib/glossary.js. Rule: "body" has no run-dependent numbers or claims; "now" is built from the page's own DB rows, so it updates every run.
- Also today: dd/mm/yyyy dates, latest week first, HubSpot "Open in HubSpot" copy-link button, GSC upload merges duplicate pages.

## "Trigger a run" button and re-run prompt (18 Nov 2026)
- Navbar button opens a popup (Radix Dialog, components/run-dialog.js) with the re-run prompt, "Open in Claude" (claude.ai/new?q=) and "Copy prompt". Figures in the popup come from /api/run-prompt (last finished run), nothing hard-coded.
- Prompt: lib/runprompt.js. It contains no numbers; Claude calls DB functions (migration aeo_run_from_prompt):
  aeo_run_trigger (guards: no second run while one is running; max 3 runs per 24 h), aeo_run_report (ChatGPT / Google / traffic results, each with source links),
  aeo_mentions_to_review + aeo_review_mentions (brand-name check, one batch insert), aeo_run_estimate, aeo_usd_per_credit (0.0004; update if treg pricing changes).
- Source links: /api/src?k=<key>&run=<run> redirects to the Supabase SQL editor with the query filled in (lib/links.js SRC).
- Not tested end to end in a fresh Claude chat (cannot be done from this session); aeo_run_trigger tested in a rolled-back transaction.

## GA4 key events and the free-trial journey (18 Nov 2026)
- GA4 key events in property 485726418 (16/08-13/11/2026): Lead_submit 297 (fires only on /thank-you-page), page_view 69 (config oddity), purchase 5. AI sources: 0.
- Tracking gap: the /free-trial form redirects to /thank-you, so Lead_submit never fires for it (356 form_submit events there site-wide). The app is not in this GA4 property, so in-app sign-ups are invisible.
- Journey of human AI sessions (same period): 545 sessions -> 43 viewed /free-trial (7.9%; site average 1.7%) -> 15 started the form -> 6 submitted. 6 = HubSpot strict AI contacts.
- Table aeo_ga4_ai_journey + view aeo_ga4_ai_journey_v (migration aeo_ga4_ai_journey). Pull script: /home/user/aeo-runner/ga4_journey.py <start> <end> prints the upsert SQL. Not automated; refresh with the GA4 sessions pull.
- Traffic tab: "Key events" column removed; "Viewed free trial / Started form / Submitted form" added per assistant.

## AEO funnel on Overview (18 Nov 2026)
- View aeo_funnel_monthly_v (Dec 2025 -> current month): Google AI impressions (GSC export), ChatGPT named / Google cited (runs), visits (GA4), leads, deals, won (HubSpot).
- New tables: aeo_ga4_ai_monthly (script aeo-runner/ga4_monthly.py, free GA4 pull, loaded 2025-11 -> 17/11/2026), aeo_hubspot_ai_leads_monthly, aeo_hubspot_ai_deals_monthly (HubSpot grouped queries, counts only, snapshot 18/11/2026; refresh is manual).
- Definitions: lead = contact with hs_analytics_source = AI_REFERRALS (strict) or utm_source containing an AI assistant (utm). Deal = AiA pipeline 106069137 deal whose original source is AI_REFERRALS or whose contact has an AI utm_source. Won = stage Payment Done or Churned.
- Totals Dec 2025-Nov 2026: 3,212 visits, 105 leads (53 strict), 75 deals, 2 won; 1,545,694 Google AI impressions since 18/05/2026. HubSpot holds 106 AI-attributed contacts all time (the Traffic tab list only covers 27 since 15/08).
- Old "Traffic & conversions from AI" tile row on Overview replaced by the funnel.
- Pending user approval: HubSpot dynamic segment "AEO | AI-sourced contacts" (filter previews 106 contacts) for the "Open in HubSpot" link (HUBSPOT_AI_SEGMENT_URL in lib/links.js).
- Not included: Ahrefs Brand Radar history (different method, API units), revenue (deal amounts mostly empty).

## Experiment E20261118-GEMINI-AIO (18 Nov 2026)
- 93 keywords x 1 on Google AIO and Gemini (India). 186/186 collected, $0.48. Table aeo_experiment_captures; views aeo_exp_citations_v, aeo_exp_brand_flags_v; runner aeo-runner/exp_gemini_aio.py.
- AiA cited: Google 25/93 (26.9%), Gemini 11/93 (11.8%). Buyer: 20/78 vs 7/78. Named (all genuine brand uses): 11 vs 9.
- Same keywords? both 6, Google only 19, Gemini only 5, neither 63 -> overlap 20% (kappa ~0.20). For reference Google vs itself (2 samples, run R20261118-M1): 93% overlap.
- Sources: Google 7.6 per answer, Gemini 3.8 (10 Gemini answers with none). Per-keyword domain overlap: avg Jaccard 0.15; 19 of 83 keywords share no domain. Google leans on youtube.com (61), reddit, linkedin; Gemini does not.
- Conclusion: not interchangeable; Gemini cannot stand in for Google AIO.

## HubSpot links on the funnel (18 Nov 2026)
- Leads: user's saved contact view https://app-na2.hubspot.com/contacts/39668252/objects/0-1/views/358103130/list (105).
- Deals: user-created deal segment "AEO | AI-sourced deals (AiA pipeline)", list 2179, dynamic, access EVERYONE, 75 members = dashboard figure. Link uses /objectLists/2179/filters.
- This session's HubSpot connection cannot create segments (missing cms.membership.access_groups.write).
- AI leads by "Which Accounting tool do you use?": tally 56, both 8, others 21, zoho 1, blank 19. Tally/both = 64 (57 of them have a deal). Proposed as a "Tally leads" stage; user has not decided.

## Overview restructured (18 Nov 2026)
- Three numbered questions: 1 Are we visible (ChatGPT / Google cards: one headline rate, change-vs-previous-run pill, two supporting facts, rank + share bars vs direct competitors); 2 Does it bring visitors and customers (Google AI impressions kept apart from the trackable chain Visits -> Leads -> Deals -> Won, HubSpot links, assistants as bars); 3 How is it trending (four small monthly column charts + collapsible table).
- Colour rules: accent blue = AiA only; grey = competitors and neutral marks; green/red only on the change pill and always with icon + words; engine cards lost their coloured top borders (Google blue clashed with AiA blue).
- Followed the dataviz skill: stat tiles instead of one-bar charts, single-hue columns, selective labels (latest month + peak), hover on every bar, table twin, proportional figures on big numbers.
- Previous Overview saved at scratchpad page.before-restructure.js.

## Traffic tab contact list aligned with the funnel (18 Nov 2026)
- Was 27 (load of 14 Nov, contacts created since 15/08 only). Now 105, created since 01/12/2025: same rule and period as the funnel's Leads.
- Loaded with HubSpot grouped queries keyed by contact ID (no names/emails/phones returned or stored); assembled from the session transcript and upserted via REST (pull_id hubspot-2026-11-18).
- View aeo_hubspot_ai_contacts_v: strict or utm rule only, latest pull only. One row from the old load (587941311180) no longer matches in HubSpot and drops out; row kept in the table.
- Lifecycle of the 105: Opportunity 39, Lead 31, Customer (AiA) 8, MQL (AiA VA) 7, MQL (GAds) 6, Discard (AIA) 6, SQL (AiA) 5, Discard (VA) 2, High Intent (AiA) 1.
- Open point: 8 leads are at lifecycle "Customer (AiA)" while the funnel's Won counts 2 (deal stage Payment Done or Churned).

## Funnel "Won" switched to lifecycle customers (18 Nov 2026, user chose option B)
- Won = AI-sourced leads with lifecycle stage Customer (AiA), by lead-created month: 8 (Jan 1, Feb 1, Mar 2, Jul 1, Aug 3). Link: user's saved view .../views/358105553/list.
- Before: 2 = deals at Payment Done or Churned.
- The 8 customers each have exactly one deal; those deals sit at Payment Done 1, Churned 1, Closed lost 2, Nurture 2, High Intent 1, CS Parked 1. So for 6 of 8 the contact says Customer while the deal is not at a paid stage. 4 of the 8 were created by the app integration. Open question for the HubSpot owner: what sets lifecycle Customer (AiA)?
- Check on the 8 customers: date entered "Customer (AiA)" is 4 to 50 days after the lead was created for 5 of them, same or next day for 3. So the stage is mostly reached through a sales process, not set at sign-up. 8 = ever became a customer; by current deal stage only 1 is at Payment Done.

## HubSpot links restyled + assistant logos (18 Nov 2026)
- HubSpot links in the funnel: accent colour, underlined, out-arrow; tooltips cut to the heading only.
- components/assistant.js: one map of assistant ids -> name + logo, used on Overview (assistant bars, funnel group labels), Traffic (assistant table, tiers, contact list), page titles of ChatGPT / Google tabs, list sections.
- Logos added: gemini.svg, perplexity.svg (from the simple-icons set). No Microsoft Copilot logo in that set, so Copilot shows a neutral "C" badge.

## Competitor read: The Prompting Company (19 Nov 2026) — input for Goal 2
- Source pages saved in scratchpad tpc/ (homepage, pricing, 3 case studies, 5 blog posts, research "How personal agents choose", Radar, benchmarks, /agents sitemap).
- Their loop = ours + a content engine: ~100 long-tail buyer prompts x 4 engines daily -> share of voice -> read cited URLs -> publish one answer page per buyer question on the brand's own domain -> re-measure twice a week.
- Scale: Magic Patterns 300+ pages in ~4 months (17.3% -> 46.0% share of voice, 9 in 10 pages cited). Their own site: 638 pages under /agents/ (May-Nov 2026), types explainer / FAQ / solution recommendation / listicle / decision guide / comparison.
- Page template: question as title, direct answer first, key takeaways, why it fits, capabilities, proof links, buyer considerations, FAQ; ~1,200 words.
- Research worth reusing: "shortlisted is not picked"; context flips the pick (Canva default, Adobe 41/41 when pro output is named); agents cite price 43%, reviews 30%, brand name <1%; Claude reads the live web, Codex relies on training memory.
- Caveats: vendor case studies without controls; mass AI pages carry quality/spam risk; personal-agent study is US consumer shopping.

## Experiment: "lost search terms = lost AEO ground?" (19 Nov 2026, team suggestion, not on dashboard)
- Data: Search Console via treg `google-search-console.performance` (free; sc-domain:aiaccountant.com), six monthly windows 17/05-16/11/2026 (W1..W6), query / page / query+page; GA4 organic by month; GSC Generative AI daily export; run R20261118-M1. Raw pulls + scripts in scratchpad gsc/, gsc_pull.py, gsc_an1-3.py, ga4_org.py.
- Site: impressions 1,452,949 (W1) -> 724,117 (W6), clicks 9,331 -> 8,630 (peak 18,726 in W3). GA4 organic sessions May 12,098, Aug 21,619, Oct 12,352.
- 72% of query-level impression loss = 3 head terms on /blog/best-accounting-software-for-small-businesses-in-india ("accounting software" 656,666 -> 18,022, 99.6% desktop, ~100 -> 27 clicks; position 8.5 -> 10.9). Page clicks 620 -> 321. Same page = 411,329 of 1,545,694 Google AI impressions.
- /blog/suvit-alternative: 45k-85k impressions and 170-224 clicks a month -> 0 since ~1 Aug; page is live, indexed, in sitemap, crawled 12/11. Cause not found.
- /blog/ai-accounting-software-india-guide-2 now 301s to the listicle; its clicks were brand searches that now land on the homepage (not a real loss).
- SEO vs AEO: weekly Google AI impressions vs search impressions r = 0.28 (0.08 without the head term). AI impressions 244,440 (W1, from 18/05) -> 196,160 (W6, to 15/11).
- Tracked Google keywords (93): search impressions down 30%+ = 17, cited 34/66 (51.5%); up 30%+ = 19, cited 37/75 (49.3%); the other 57 = 31/228 (13.6%). No AEO history before 17/11, so "lost" AEO cannot be measured.
- The 25-prompt step was not run (paid; 46 of 75 tracked ChatGPT prompts already cover the five topics).
- Search Console MCP connector: 2 free pulls left until 01/12; use the treg route instead.

## Buyer situations from HubSpot (19 Nov 2026) — input for situation prompts (not added to bank, not run)
- Grouped counts only (no PII). Customers = contacts with lifecycle "Customer (AiA)" (3190983394), 1,067. Paid = AiA pipeline deals closed won (Payment Done, Ready for Renewal, Renewal Done, Acquired), 369.
- Tool (861 answered): Tally 794 (92%), Tally+Zoho 52 (6%), Zoho Books 8, others 7.
- Who (347 answered): business owner 215 (62%), finance team 70 (20%), CA firm 55 (16%). Paid deals (61 answered): owner 45, finance team 9, CA firm 7. Discard (AIA) mix for contrast: owner 50%, CA firm 27%, finance team 19%.
- Accounting team size (759 answered): 1-3 334 (44%), 3-5 175 (23%), 5-10 127 (17%), 10+ 88 (12%), 0 35 (5%).
- Pain point on paid deals (186): manual data entry 88, ledger categorisation 35, reconciliation 29, GST/TDS 11.
- Industry is thin: 100 customers have a company industry (about a third manufacturing-type); number_of_clients is empty for customers.
- Observation: tracked ChatGPT prompts lean to CA / generic wording; none is phrased from a business owner with a small accounts team on Tally.
- 10 situation prompts drafted in chat (6 owner, 2 finance team, 2 CA firm); report them as a separate group from the baseline.

## Prompt bank change (19 Nov 2026, approved by user)
- Added 10 situation prompts to list v4 as S001-S010 (prompt_group unbranded, persona = Business owner x6 / Finance team x2 / CA firm x2, change_note says where each came from).
- v4 is now 85 active prompts (72 unbranded, 8 competitor, 5 own_brand) = 340 ChatGPT answers per run, up from 75 / 300. First run to include them: scheduled 21/11/2026.
- Consequence accepted by user: runs R20261117-M1 and R20261118-M1 used 62 unbranded prompts; later runs use 72, so the headline rate is not like-for-like across that boundary. To compare, filter out prompt_key like 'S%'.
- User may later delete the 18/11 run and the test run; nothing deleted yet.

## Gemini + Perplexity tracking added (19 Nov 2026)
- Same prompt list (v4, 85 prompts) now asked on Gemini and Perplexity in every run, 4 answers per prompt, country IN.
  - Gemini: treg cloro.ai-search.gemini.scrape (live interface, $0.0024 per answer, about 30 s each).
  - Perplexity: treg dataforseo.x.ai-optimization-perplexity-llm-responses-live, model sonar with web search, web_search_country_iso_code IN (about $0.006 per answer). This is the API model, not a capture of the perplexity.ai app.
- DB: table aeo_engines (samples, claim_per_tick, is_active per assistant), queue aeo_llm_captures (ids from 10,000,001), functions aeo_claim_llm, aeo_llm_apply_json; aeo_create_run and aeo_housekeeping cover the new rows.
- Base matviews aeo_asst_citations_mv and aeo_asst_mentions_mv hold every assistant's sources and brand mentions; aeo_asst_*_mv are the per-assistant metrics. aeo_gpt_citations_v / aeo_gpt_mentions_v now read from them (same columns, same numbers; original parsing kept as aeo_gpt_citations_raw_v). Refresh of the assistant part went from about 60-120 s to 1 s.
- Brand-name check (aeo_mentions_to_review) and the run report (key gemini_and_perplexity) cover all three; reviews table no longer has a foreign key to aeo_gpt_captures.
- Gemini text: Markdown link URLs are stripped before the brand check, so a link to our site alone does not count as "named".
- n8n workflow 9jZMztEJIPSHacM7: 8 new nodes (claim, treg call, classify, record for each assistant), published. Verified with test run T20261119-LLM (3 prompts x 1 answer x 2 assistants, 6 of 6 collected, $0.025).
- Dashboard: new /assistants page (cards per assistant = comparison and selector; compare-all view; one-assistant detail). /chatgpt redirects to it. Nav tab renamed "AI assistants". Overview card shows all three once a run has collected them. Runs tab shows Gemini and Perplexity counts and cost.
- Cost per run now about $4.53 (was $1.65), about 130 minutes. treg balance $6.52 on 19/11: enough for the 21/11 run only.
- Not done: "Ask Claude" links for Gemini and Perplexity figures; funnel table still shows ChatGPT named only.

## Answers per prompt set to 3 (19 Nov 2026, user decision)
- aeo_engines.samples = 3 for chatgpt, gemini, perplexity; aeo_create_run now reads ChatGPT's count from there too (test runs can still pass fewer). Google stays at 4 searches per keyword.
- Next run: 255 answers per assistant (85 prompts x 3), 372 Google searches, about $3.66 (ChatGPT 0.51, Gemini 0.61, Perplexity 1.49, Google 1.04), about 100 minutes.
- Runs of 17/11 and 18/11 used 4 answers per prompt, so their likely range is slightly narrower than later runs.

## Run R20261119-M1 (19 Nov 2026): first run with Gemini and Perplexity, 3 answers per prompt, 85 prompts
- Collected 255 / 255 / 255 answers (ChatGPT / Gemini / Perplexity) and 372 Google searches, 0 failed, 107 minutes, $3.70.
- Named (unbranded, 216 answers each): ChatGPT 13 (6.0%), Gemini 40 (18.5%), Perplexity 34 (15.7%). Cited: 29 (13.4%), 34 (15.7%), 44 (20.4%). Prompts naming AiA: 9, 22, 12 of 72.
- Like-for-like on the original 62 prompts: ChatGPT 9 of 186 (4.8%; 18/11 was 9 of 248 = 3.6%). Situation prompts (S001-S010): ChatGPT 4 of 30, Gemini 9 of 30, Perplexity 18 of 30.
- Google buyer keywords: 84 of 312 (26.9%), 23 of 78 keywords; within normal variation of 18/11 (23.9%).
- Brand-name check: 91 mentions read, 87 brand, 4 not (generic phrase x2, Zeni's and Pilot's "AI Accountant").
- Fixes made during this run:
  - Finalise step failed: the dashboard refresh inside aeo_housekeeping exceeded the 2 minute statement limit, so the run stayed "running". Finalised by hand. Google views now read from base matviews too (aeo_aio_citations_base_mv, aeo_aio_capture_flags_base_mv, aeo_aio_mentions_base_mv; raw parsing kept in *_raw_v). Full refresh now 3 s (was 120 s+).
  - Gemini source chips ([page title](url)) are removed from the text used for the brand check; 6 answers had been counted as "named" only because a cited page title ends in "- AI Accountant".

## North-star visibility metric chosen: "Recommends us with a link" (20 Nov 2026)
- User goal restated: one AI visibility metric that drives visits and leads, shown with HubSpot data on the Overview; then measure how changes in it move visits and leads.
- Evidence (free pulls): 
  - HubSpot, 53 strict AI leads by first page seen: homepage 23, product / demo / free-trial pages 12, blog 14, free tools 4. So 35 of 53 (66%) first landed on the homepage or a product page.
  - GA4 01/05-18/11/2026, 1,618 AI sessions, 44 viewed /free-trial. Free-trial view rate by landing page type: product / company pages 6.9% (11 of 159), free tools 4.3% (8 of 186), homepage 3.1% (13 of 414), blog / guides 1.4% (9 of 634).
  - 545 AI visits 16/08-13/11: 330 landed on a page our runs saw cited, 57 "(not set)", 158 on pages our prompts never surface.
- Metric: share of unbranded answers that name AI Accountant as a product AND link to aiaccountant.com (view aeo_asst_recommended_v). Run R20261119-M1: ChatGPT 8 of 216 (3.7%), Gemini 17 (7.9%), Perplexity 24 (11.1%). ChatGPT earlier runs: 6 of 248 on 17/11 and 18/11.
- Overview band 1: assistants card is now one table per assistant: recommends us with a link -> visits sent -> leads. Named / cited / share of voice stay on the AI assistants page.
- Not proven yet: three runs cannot show that moving the metric moves leads. Open: ChatGPT homepage visits may partly come from people who already know the brand and ask about it by name.
- Measurement plan proposed (not built): weekly GA4 visits by assistant to homepage + product pages, HubSpot leads by assistant with first page, metric pooled over the runs in each period; before / after around each Goal 3 change, per prompt group and per linked page. Needs GA4 and HubSpot refresh automated.

## Dashboard rebuilt around the one figure (20 Nov 2026, user request)
- Goal stated by user: everyone can see where the key AEO metric is today and how it relates to visits and conversions. Free hand on visualisation.
- AI assistants page (/assistants) is now one view, no per-assistant sub-pages:
  1. chain table per assistant: recommends us with a link (rate, count, likely range) -> on how many questions -> visits sent -> leads -> leads per 100 visits
  2. two line charts side by side in the same three colours: recommendation rate per run, and weekly visits per assistant (GA4)
  3. which questions get us recommended (per assistant x/n), who else gets recommended with a link, which of our pages they link to with the AI visits each page got
  4. collapsed: most-cited websites per assistant
- Colours per assistant (validated with the dataviz skill script, light and dark): ChatGPT #10a37f / #199e70, Gemini #6250d6 / #9085e9, Perplexity #eb6834 / #d95926. CSS vars --asst-*.
- New: components/multi-trend.js (multi-series line chart with legend, end labels, crosshair tooltip), views aeo_asst_our_pages_v and aeo_ga4_ai_landing_path_v.
- Google AI Overviews page: two tiles only (AI Overviews that link to us on buyer keywords; times we appeared, 28 days from the Search Console export), trend + who Google links to, keyword table; topics and cited websites collapsed. States plainly that Google reports no clicks.
- Traffic page: three tiles (visits, viewed free trial, leads); "By assistant" table now starts with the recommendation rate; weekly chart uses the same three-colour lines.
- Overview month table: "ChatGPT named" column removed.
- Removed from view (data still in the database): named rate, cited rate and share of voice tiles, per-assistant topic tables, volume-weighted / named / AIO-shown / informational tiles on the Google page.
- Not changed: the "Trigger a run" report still reports named and cited; Lists and Runs tabs.

## Why 86 ChatGPT leads but 5 form submissions (20 Nov 2026)
- Different periods: 86 leads are 02/12/2025-16/11/2026; the form steps on the Traffic page are GA4 16/08-13/11/2026 only. In those same days ChatGPT leads = 23.
- Of those 23: 5 have ChatGPT as HubSpot's first source (matches the 5 free-trial form submissions in GA4); 13 were created by a connected system ("OFFLINE / integration"), with no website form; 5 came through direct / organic / paid sessions carrying the chatgpt utm tag.
- All 46 ChatGPT "utm only" leads over the year: 30 integration-created (HubSpot integration ids 223580 x11, 33710650 x11, 601416 x7, 182676 x1), 7 direct, 5 organic, 3 paid, 1 added by hand. What those integrations are is NOT known (to ask the HubSpot owner); likely product sign-up or a booking tool.
- HubSpot first-conversion form for strict AI leads (53): "Book a demo" forms 42, free-trial form 5, Tally automation landing form 4, others 2. GA4 Aug-Nov shows no /book-a-demo page views from AI visitors, only /free-trial (43) and /thank-you (10): the sign-up page appears to have changed from book-a-demo to free-trial around August.
- Traffic page: form columns renamed "free-trial form"; new column "Leads, same days" with the split (from a website visit / without a website form).
- Open question for the user: should the 30 integration-created contacts count as AI leads at all.

## Context from user (20 Nov 2026): the sign-up page changed
- /book-a-demo was the page most organic leads came through; it was replaced by /free-trial. GA4 shows the switch on 13/08/2026 (13/08: 24 vs 10 sessions; from 14/08 only /free-trial). /book-a-demo had 1,268-2,072 sessions a month from Dec 2025 to Jul 2026.
- So before 13/08/2026 the lead form is "Book a demo"; after it, the free-trial form. This is why 42 of 53 strict AI leads show "Book a demo" as first conversion.
- ga4_journey.py and ga4_monthly.py now count either page as the sign-up page (regex /(free-trial|book-a-demo)/?, which excludes /book-a-demo-va). aeo_ga4_ai_monthly has NOT been reloaded yet, so its free_trial_sessions for months before August are still 0 until the next load.

## HubSpot "Contact Source" (property contact_source) for AI leads (20 Nov 2026)
- The 30 ChatGPT-tagged contacts created by a connected system, by Contact Source and by HubSpot "Record source detail":
  - website tool - bank statement converter 9, website tool - gstin bulk validator 2 -> all 11 via "hs-neon-pbi" (integration id 33710650, created 24/10-16/11/2026) [corrected 20/11: ids were swapped in the first note]
  - korefi-homepage 17 -> 11 via n8n.cloud (id 223580, Feb-Apr 2026), 6 via revenuehero (id 601416, Aug-Oct 2026)
  - va-book-a-demo 1 (revenuehero), brand ads 1 (jotform, id 182676)
- All ChatGPT-tagged contacts since 01/12/2025 (76): korefi-homepage 63, website tool 11, brand ads 1, va-book-a-demo 1.
- Strict AI-referral contacts (53): korefi-homepage 42, tally automation 4, wa bot - organic 4, pmax free trial 1, va-book-a-demo 1, blank 1. No website-tool contacts among them.
- So 11 of the 86 ChatGPT leads are free-tool sign-ups, not demo or free-trial requests. Open: whether to count them as leads, and whether VA-service contacts (va-book-a-demo) belong in AiA figures.

## Do "website tool" contacts reach deals? (20 Nov 2026)
- Correction to an earlier chat answer: the 11 ChatGPT website-tool leads are the newest batch (hs-neon-pbi, 24/10-16/11/2026), all still lifecycle Lead with no deal. The Feb-Apr batch (n8n.cloud, korefi-homepage) is the one with 1 customer and 2 opportunities.
- All contacts with Contact Source "website tool - ..." : 289. By tool: gst late fees 97, gstin bulk validator 78, bank statement converter 59, maharashtra pt calculator 27, mca fees calculator 12, karnataka pt calculator 6, e-invoice applicability checker 4, invoice splitter 2, image to excel 2, advance tax 1, labour welfare fund 1.
- 277 of the 289 were created in Oct (114) and Nov (163) 2026, so the capture is about a month old.
- Of those 277: 273 are Lead with no deal; 4 have a deal (stages High Intent, Demo Conducted, Nurture, Engaged; one is lifecycle Customer (AiA)).
- All 289: lifecycle Lead 273, Opportunity 4, Customer (AiA) 3, Customer 2, Discard 2, Opportunity (Meta) 2, others 3. 16 contact-deal links in total (13 in the AiA pipeline).

## Leads and deals per website tool (HubSpot contact_source, 20 Nov 2026)
tool | contacts | contacts with a deal | AiA pipeline deals | other deals
- GST late fees | 97 | 2 | 2 (No-Show 2) | 0
- GSTIN bulk validator | 78 | 4 | 2 (Discard 1, Nurture 1) | 2 (Inward Forex, closed won)
- Bank statement converter | 59 | 7 | 8 (Nurture 2, Yet to reach out 1, Closed lost 1, High Intent 1, Demo Conducted 1, Engaged 1, Renewal Done 1) | 0
- Maharashtra PT calculator | 27 | 0 | 0 | 0
- MCA fees calculator | 12 | 1 | 0 | 1 (Virtual Accounting, DNP 2)
- Karnataka PT calculator | 6 | 1 | 1 (CS Parked) | 0
- e-Invoice applicability checker 4, Invoice splitter 2, Image to Excel 2, Advance tax calculator 1, Labour welfare fund calculator 1 | no deals
Totals: 289 contacts, 15 with a deal, 16 deals (13 AiA, 2 Inward Forex, 1 Virtual Accounting). Lifecycle Customer (AiA): 3 (bank statement converter 2, Karnataka PT 1).

## Prompt bank: 5 Search Console gap prompts added (20 Nov 2026, user request)
- v4 now 90 active prompts. Added P085 "best accounting software for small business in india?", P086 "top 10 accounting software in india", P087 "is there an AI extension for tally prime?", P088 "best tally add-on tools for accountants?" (unbranded) and C011 "vyapar taxone pricing?" (competitor). change_note and source_query record the search term each came from.
- Unbranded prompts 72 -> 76; per run 270 answers per assistant (90 x 3). First run to include them: 21/11/2026.
- The two Google keyword gaps (small-business accounting software, Suvit / Vyapar TaxOne alternative) were not added.

## RULE: website-tool sign-ups are not leads (user decision, 20 Nov 2026)
- Any HubSpot contact whose Contact Source (property contact_source) starts with "Website tool" is excluded from AI leads everywhere on the dashboard.
- How it is enforced: aeo_hubspot_ai_contacts has a contact_source column; the view aeo_hubspot_ai_contacts_v drops rows matching ^\s*website tool (case-insensitive). aeo_hubspot_ai_leads_monthly is now a VIEW built from that contacts view (the hand-loaded table is kept as aeo_hubspot_ai_leads_monthly_loaded), and aeo_funnel_monthly_v reads the view. So the Overview, AI assistants and Traffic pages all follow the rule with no separate load.
- EVERY future HubSpot pull into aeo_hubspot_ai_contacts MUST include contact_source for each row, otherwise new tool sign-ups slip back in.
- Effect today: 11 rows excluded (9 bank statement converter, 2 GSTIN bulk validator, all ChatGPT-tagged, created 24/10-16/11/2026). AI leads 105 -> 94; ChatGPT 86 -> 75. Deals (75) and won (8) unchanged: none of the 11 had a deal.
- Not covered: the HubSpot saved views behind the "HubSpot" links still include them (HubSpot shows 105); aeo_hubspot_ai_deals_monthly is still loaded by hand, so a future tool sign-up with a deal would need excluding in that pull too.

## AI assistants page: tabs and question side panel (20 Nov 2026, user request)
- Tabs under the page head: All assistants | ChatGPT | Gemini | Perplexity (/assistants?engine=...). A single-assistant tab shows the same sections filtered to that assistant; "All" keeps the three-colour comparison.
- Clicking a question in "Which questions get us recommended" opens a right-side panel (components/prompt-panel.js, data from /api/prompt-sources?run=&prompt=): the question, x of n answers recommending us per assistant, then every cited page grouped as Our pages / Competitors' pages (by brand) / Other websites (top 25), with per-assistant counts. On a single-assistant tab the panel shows that assistant only.
- Side panel restructured (20 Nov 2026, user feedback "cluttered"): one section per assistant (ChatGPT, Gemini, Perplexity). In each: "Our pages" as plain links, then "Competitors' pages" (a competitor with 3+ pages gets its own labelled group showing 3 with the rest folded; others listed together), then a folded "Other websites (n)". Page titles and per-assistant counts removed.
- Side panel (20 Nov 2026): "Competitors' pages" replaced by "Cited pages" = every non-AiA page, competitors tagged "Competitor · <brand>"; assistant logos added to section headers.
- Google AI Overviews page: every tracked keyword is clickable and opens the same kind of panel (KeywordPanel in components/prompt-panel.js, data from /api/keyword-sources?run=&keyword=): x of n searches with an AI Overview linked to us, Our pages, Cited pages. YouTube results show the video title, a "Video" tag and link to the video (with its timestamp where Google gave one).
- Side panels restyled (20 Nov 2026): each cited page is a row with the site's favicon (Google favicon service, letter fallback), domain in bold with an arrow, the address underneath, and a label on the right ("Video", or the competitor's name in amber). Applies to both the assistants and the Google keyword panels.

## 20 Nov 2026: Build audit against 16 AEO vendors and independent research

Verdict: keep the build. No rebuild, no bought tool. Fix the items below; none changes what is collected.

Where the build matches or beats the vendors
- Live-interface capture for ChatGPT, Gemini and Google (Profound, Peec, Promptwatch, Gauge, Brandlight all argue API output differs from what users see).
- 3 answers per prompt per run with likely ranges. Vendors run 1 answer per prompt per day (Profound, Peec, AirOps, Promptwatch, Gauge) or weekly (AthenaHQ, Brandlight); only Evertune repeats (100 per prompt) and only it promises ranges.
- HubSpot leads and deals tied in. Most vendors stop at GA4 referral visits; none shows visibility predicting pipeline.
- "Recommends us with a link" (named and linked): no vendor ships it; AirOps research supports it (28% of answers have a brand both named and cited; those brands are 40% likelier to reappear).
- Cost about $3.85 a run (about $30 a month) against $295 to $599 a month for entry plans.

Measured on our own data today
- Unbranded prompt count changed across runs: 62 (17/11), 62 (18/11), 72 (19/11); next run 76. Trend is not like for like.
- Likely ranges are computed per answer; answers to one prompt move together. Recomputed by prompt for R20261119-M1: ChatGPT +/-3.1 pts (shown 2.5), Gemini +/-4.4 (3.6), Perplexity +/-7.3 (4.2).
- Perplexity: all 8 recommending prompts were 3 of 3, the other 64 were 0 of 3. The repeats add nothing there.
- GA4 16/08 to 13/11: ChatGPT 356 visits, Gemini 113, Perplexity 40, Claude 36 (Claude is untracked).
- robots.txt allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot; llms.txt exists; site is on Webflow (no raw server logs).
- treg has no live-interface Perplexity capture; Google AI Mode capture exists (cloro.google.serp.ai_mode, $0.0024).

Recommended fixes, in order
1. Freeze prompt bank v4 from the 21/11 run; trend from there or on common prompts only; changes only at a logged monthly review.
2. Compute likely ranges by prompt, not by answer.
3. Read the metric on a rolling 4 runs, not run to run.
4. Label Perplexity as API (not the app); consider 1 answer per prompt there.
5. Add branded search (Search Console) as a second outcome; add "How did you hear about us?" to the free-trial form.
6. Change log for Goal 3 (date, URL, target prompts) plus untouched control prompts.
7. Dashboard code into GitHub; automate GA4 and HubSpot refresh; rotate pasted keys.

Not worth copying now: Claude tracking (API only, about $6.60 a run), server-log tracking (Webflow), prompt-volume panels, position and sentiment scores, 100 answers per prompt. Google AI Mode is cheap (about $0.90 a run) but cannot be tied to visits; later.

Market note: of the 8 YC startups, Bear, Lapis, Mimos and Anvil left the category, Relixir's team moved to a new company, AthenaHQ was acquired. Tracking is a commodity; the value is in execution (steps 4 to 6).

## 20 Nov 2026: Branded search added as a second outcome

Why: many people who see a brand in an AI answer do not click a link in it; they search the name later (Similarweb: 56% arrived through search). Referral visits alone undercount.

Definition
- Source: Search Console, web search, India only, queries matching "ai ?accountant". India is used because CTR there is about 59% (people looking for us); outside India the phrase is mostly generic (CTR about 15%).
- Counted as branded: the name alone or with a word such as login, pricing, Tally, app, company. 30,476 impressions and 18,824 clicks from 20/07/2025 to 18/11/2026.
- Left out: generic uses (jobs, salary, course, certified, plural "accountants", best/top lists; 1,159 impressions) and machine-style queries (site: operators, "evaluate ai accountant on ..."; 380 impressions).
- Typical level: 500 to 680 searches a week, 250 to 390 clicks.

Build
- Table aeo_gsc_brand_daily (date, query, clicks, impressions, position); loader aeo_gsc_brand_apply_json(jsonb); views aeo_gsc_brand_daily_v (adds kind: brand, generic, machine) and aeo_gsc_brand_weekly_v.
- n8n workflow nMIdflcAIshTmYxT "AEO Baseline v1 | Branded search from Search Console (daily)": 07:30 daily, last 14 days, free via treg, published. First run loaded 154 rows.
- Dashboard: Overview band 2 "Is AI visibility moving the outcomes?" (components/chain-trend.js): three weekly charts on one shared timeline: recommends us with a link (per assistant), visits from AI assistants, searches for our name. Bands renumbered (Traffic 3, Trends 4).

Open
- GA4 daily visits are still loaded by hand (to 13/11/2026), so chart 2 lags until that is automated.
- Branded search also moves with ads, events, outreach and word of mouth; it is a sign, not proof.

## 20 Nov 2026: Branded search folded into Trends; weekly timeline moved

- Overview: the separate section "Is AI visibility moving the outcomes?" is removed. Trends (now section 3) has six monthly charts read as a chain: ChatGPT recommends us with a link, visits from AI assistants, searches for our name on Google, leads, deals, Google AI impressions. The monthly table has the two new columns.
- AI assistants page: the two side-by-side charts (rate per run, weekly visits) are replaced by one weekly timeline of three stacked charts on a shared axis: recommends us with a link, visits sent (same colour per assistant), searches for our name. Each weekly rate pools every run of that week.
- Charts draw complete weeks only. The table also shows incomplete weeks, marked "so far" (week in progress) or "part week" (data started mid-week).
- Code now lives in GitHub (10xkorefi-creator/aeo-aia, public); dashboard edits are made in the repository copy and deployed from there.

## 22 Nov 2026: Dashboard redesign around "what moved since the last run"

Critique of the old design
- No page showed change since the previous run; every figure was a snapshot.
- The same figures were repeated on several pages (visits and leads per assistant on three pages, the weekly visits chart on two, Google AI impressions on four).
- One table row mixed periods: a rate from one run next to 12 months of visits and leads.
- Jargon (tiers, strict, segment, opp/SQL) and long tables that were mostly zeros (76 questions, 78 keywords, 94 contacts).

What each page is now
- Overview: (1) one card per tracked surface (ChatGPT, Gemini, Perplexity, Google AI Overviews) with the rate, a run-by-run line, and the change since the previous run with a verdict (real rise, real drop, no real change); a "What moved" list of questions and keywords won or lost. (2) "What it brought": visits, leads, deals, customers, and four monthly charts (visits, searches for our name, leads, deals).
- AI assistants: the same cards per assistant, the weekly timeline (recommended, visited, searched for), the questions where we are recommended with new/lost markers, the gap collapsed underneath, competitors, our linked pages, most-cited websites.
- Google AI Overviews: link rate card with change, appearances in the last 28 days against the 28 before, link rate per run, appearances per week, buyer keywords that link to us with new/lost markers, the gap and informational keywords collapsed, competitors, most-cited websites, our most-shown pages.
- Visits & leads (was Traffic & conversions): three totals, one table by assistant (visits, viewed free trial, submitted form, leads), leads by assistant, landing pages, the full lead list collapsed.
- Runs & raw data: now also holds "how fresh each source is" and the Search Console upload.

Removed
- Overview: the assistant table that mixed periods, the Google competitor bars, the Google AI impressions box in the funnel, "which assistants send them", the Google AI impressions and Google cited columns.
- AI assistants: visits, leads and leads-per-100-visits columns; the question id and page type columns.
- Google: keyword id and segment columns, the by-topic table.
- Visits & leads: the recommendation column, engaged share, form-started column, the lead split, the automated-traffic row (now a footnote), the weekly visits chart (kept on AI assistants), the tier table, contacts per week.

How change is judged (lib/change.js)
- Like for like: only questions or keywords asked in both runs are compared.
- Per question, this run's rate minus the previous run's; the change is the average of those differences. It is "real" only if larger than 1.96 times its standard error (paired test by question, which also handles answers to one question moving together).
- A question counts as won or lost only when it went from 0 to at least half of the answers, or the reverse. Single-answer flips are ignored.
- Run of 21/11 against 19/11: ChatGPT +0.9 pts, Gemini -2.8, Google +0.3 (none real); Perplexity +6.5 (real rise).

Automation
- New n8n workflow pmr82SL5aFzeAV7B "AEO Baseline v1 | Google Analytics, AI visits (daily)", 07:40 daily, published: four free Google Analytics reports via treg, loaded by aeo_ga4_refresh_json (daily visits replace by day; monthly visits upsert; free-trial journey for 16/08/2026 to yesterday). First run loaded to 21/11/2026.
- Still by hand: HubSpot leads and deals (last pulled 18/11/2026) and the Google AI report upload.

## 22 Nov 2026: Why Perplexity rose 6.5 points with no AEO work

- On the 72 questions asked in both runs (19/11 and 21/11): 24 then 38 answers recommended us. 6 questions moved up, none down. Four went from 0 of 3 to 3 of 3 (P028, P083, S007, S010), two from 0 to 1 of 3 (P050, S001).
- Cause is on Perplexity's side: for those questions its search returned our pages that it had not returned two days earlier (for example three bank-reconciliation blog posts for P028; /gst-recon and the GST product page for P083). Answers linking to aiaccountant.com: 44 then 69 of 216. Model (sonar) and sources per answer (10.0) were unchanged.
- Perplexity gives the same result for all 3 answers to a question (every count is a multiple of 3), so a question moves as a block and one changed search result moves the rate by 1.4 points.
- The label "real rise" overstated it. The test shows the move is larger than re-asking noise; it cannot show that it lasts or that we caused it. With two Perplexity runs the normal day-to-day swing is unknown.
- Dashboard wording changed: "real rise" / "real drop" are now "rise, to confirm in the next run" / "drop, to confirm in the next run". Rule for reading: treat a change as lasting only if the next run stays at the new level.

## 22 Nov 2026: Likely range now worked out by question

- aeo_asst_recommended_v: the range is a Wilson interval on "effective answers" (answers divided by the design effect between questions), not on the raw answer count. New column effective_answers. With no recommended answers the number of questions is used.
- Run of 21/11: ChatGPT 5.3%, likely 2.4% to 11.3% (was 3.0 to 9.0); Gemini 5.7%, 3.2% to 10.0% (was 3.4 to 9.5); Perplexity 19.3%, 12.1% to 29.4% (was 14.7 to 24.9). Perplexity's 228 answers are worth about 78 independent ones.
- AI assistants page: each card shows the likely range; the Perplexity card says it is collected through the API, not the app. Three answers per question kept (user decision).
- Not yet done: the same correction for Google AI Overviews (its 4 searches per keyword also move together).

## 22 Nov 2026: Goal 2 delivered as a Recommendations tab

Where: https://aia-aeo-dashboard.vercel.app/recommendations (a recommendation opens with ?rec=REC-1 and so on).

How it is built
- Written analysis: docs/recommendations.py, loaded into table aeo_recommendations (title, summary, body: opportunity, evidence, winners, why, actions, change, measure, risks; plus the question keys and keyword ids behind each).
- Live evidence: the page reads the run tables for those questions and keywords, so the tables under each recommendation show the latest run, with earlier runs beside it.
- List grouped as Start here, Next, Later, Not now, Tracking fix; clicking a row opens a side panel.

Ranking rule: buyer value, then assistant (ChatGPT first: 75 of 94 AI leads), then how close we are, then effort, then stability across runs. The unit is a topic, not a single question. Changed after re-reading The Prompting Company: rank topics, let the citation mix decide own-site against outside pages, rank named-need questions above generic ones, add comparison pages.

The nine recommendations (run of 21/11/2026 unless stated)
1. REC-1 Start: "which tool for Tally" questions on ChatGPT. 0 of 30 answers recommend us on ten questions; ChatGPT cited no aiaccountant.com page on them; Docs by Ira named in 46 of 78 Tally answers; cited pages are Tally help pages, a 435-word Tally iRA tutorial (29 ChatGPT answers) and small add-on homepages. Action: one page per question.
2. REC-2 Start: ChatGPT cites our comparison pages and names other tools. Linked in 40 of 48 answers over four runs on four questions, named in 0. Its shortlist includes four tools from our own table. Action: factual verdicts on both pages, price on the GST product page, three directory listings.
3. REC-3 Next: "alternatives" questions for Docs by Ira and Vyapar TaxOne. Named in 10 of 27 answers, linked in 1; cited pages are rivals' compare pages and G2, Capterra, Slashdot alternatives pages.
4. REC-4 Next: lists quoted for "best AI accounting software in India". On 1 of the 4 most-cited lists (flickai.in yes; zoffer.in, skillopediagroup.com, appadvisor.in no). 0 of 81 answers on nine questions.
5. REC-5 Next: Google, AI tools for chartered accountants. Page one on six keywords (470 searches a month), AI Overview links to us in 0 of 24 searches.
6. REC-6 Later: six Tally searches on Google, 6,500 a month, we are not on page one.
7. REC-7 Later: Tally how-to questions, 0 of 30 ChatGPT answers name us; lower buying intent; control group for REC-1.
8. REC-8 Not now: generic invoice OCR and accounts payable questions, 0 of 72 answers; global vendors win.
9. REC-9 Tracking fix: about ten brands ChatGPT recommends (ClearTax, Masters India, KDK Spectrum, IRIS Sapphire, Winman, TallyConnects, InvoiceAI, udiMagic, Excel2Tally, Quick2Tally) are not on the competitor list.

Limits to state in the review
- Four runs over five days (two for Gemini and Perplexity).
- "Why they win" is our reading of the cited pages; the data shows who is cited and named, not why.
- Cited pages were read on 22/11/2026 by fetching them; SaaSworthy blocked the request.
- Product claims on new pages (what Docs by Ira cannot do, prices) need the product team's check.

## 22 Nov 2026: Recommendations broken into individual tasks with channel labels (user request)

- New table aeo_rec_tasks (source docs/rec_tasks.py): 38 tasks under the nine opportunities. Each task is one thing to make (a page, a video, a post, a listing), with a channel label, the tracked questions and keywords it targets, the evidence for it, the cited example to model it on, what to include, and "done when".
- Channels: Website 13, YouTube 8, Outreach 4, LinkedIn 3, Facebook 2, Directory 2, Review site 2, X 1, Reddit 1, Instagram 1, Tracking 1.
- Rule kept: a channel task exists only where the baseline shows that channel cited for those questions or keywords. Evidence found on 22/11 (run of 21/11):
  - Google AI Overviews cited a YouTube video in 238 of 369 AI Overviews (64 keywords, 123 different videos); LinkedIn in 35 (9 keywords), Reddit in 38 (10), Instagram in 25 (9), Facebook in 25 (9). None mentions AI Accountant in its title.
  - Assistants cite social far less: Perplexity cited YouTube in 27 of 270 answers (9 questions); ChatGPT cited LinkedIn in 9 answers, X profiles of vendors in 14 (9 questions), YouTube in 6.
  - So most video and social tasks are justified by Google AI Overviews, not by ChatGPT. Not every question gets every channel.
- Page: rows are tasks under each opportunity, filter chips by channel, task panel (why, what to make, model, what it should move live, done when) and opportunity panel (the reasoning, now listing its tasks). Links: ?task=T-02, ?rec=REC-1.
- Questions in REC-7 (the control group for REC-1) were kept out of REC-1 task targets.

## 22 Nov 2026: Recommendations page simplified to a flat task table (user request)

- One flat table, no groups: Task, Type, Content, Channel, Priority, Assignee. Sorted by priority (High = the two "start here" opportunities, Medium = "next", Low = "later" and tracking). Filters: channel, assignee.
- Assignee column: Unassigned, Wasif Kareem or Devansh Saini, saved from the page (aeo_rec_tasks.assignee, route /api/task-assign). The dashboard database role may update that one column only.
- Task panel cut to four short parts: Why (two points), What to make (up to four), Example to follow (one), We will know it worked when (one). The live numbers sit behind "See the data behind this"; the full reasoning for the group of tasks is one click further.
- No "estimated lift" column: we have no sound way to estimate it from four runs.
- The opportunity with no tasks (generic invoice OCR questions, left alone on purpose) no longer shows in the list; it is still at ?rec=REC-8.

## 22/11/2026: Recommendations rebuilt per question and per assistant

**Why.** Each assistant cites different sources for the same question (ChatGPT and Gemini share 6% of sites, ChatGPT and
Perplexity 8%, Gemini and Perplexity 13%). The first version grouped questions by topic and picked channels by hand.
Decision with the user: the channel must not be chosen up front; the sources each assistant cited for each question decide it.

**What changed.**
- New generator in `scripts/recs/` (export, read cited pages, build, load). It replaces the hand-written
  `docs/recommendations.py` and `docs/rec_tasks.py`, which stay in the repo as history only.
- It read 1,640 cited pages from the run of 21/11 (1,470 readable; the rest sit behind bot checks and are marked unread).
- Output: 315 tasks for 85 questions and 78 Google searches. Website 142, Outreach 80, YouTube 48, LinkedIn 13,
  Review site 11, Reddit 11, X 4, Instagram 4, Facebook 2. By priority: High 113, Medium 86, Low 116.
- New table `aeo_rec_questions` (one row per question or search, with what each assistant did and the sources it used).
  `aeo_rec_tasks` gained `assistants`, `priority`, `score`, `start_here`, `based_on_run`, `gen`. Loader function
  `aeo_recs_apply_json`. The 38 old tasks and 9 old recommendations are switched off, not deleted.
- The nine assignments made on the old tasks were carried to the new tasks on the same questions (Wasif Kareem 17 tasks,
  Devansh Saini 5).
- Page: Tasks view (Task, Type, Channel, For, Priority, Assignee) and a By question view (recommended per assistant,
  tasks, priority). Opening a question shows, per assistant, the sources it cited and the tasks that follow. Detail is
  loaded on open through `/api/rec-item`.

**Rules.** See `scripts/recs/README.md`.

**Known limits.**
- The list is rebuilt by hand after a run; the page says when a newer run exists.
- Page types come from rules (domain lists, how often a site names itself, list-style titles), so a few pages will be
  mis-typed. Unread pages are flagged in their task.
- A question and a Google search on the same subject each get their own page task; they are not merged.
- Tracked competitor names are the 11 in `aeo_competitors`; "names X" lines under-count untracked tools.

## 23/11/2026: Task panel reordered for the Goal 2 review

Asked for by the user ahead of the review meeting: the panel must explain itself under cross-questioning.

- Order is now: **Task** (one specific sentence saying what to make and where it is published, plus up to three points),
  **What's driving this recommendation** (the prompt or prompts covered with our score per assistant, what the
  assistants do today, and the competitor pages we are imitating with who cites each), **Why this should work**,
  **Check before starting** (only when the source was not cited in the previous run or could not be read), and
  **We will know it worked when**.
- The kind of page is taken from the question's wording and the kind of pages cited for it: comparison page,
  alternatives page, pricing guide, step-by-step guide or short guide on the blog, or a product page under Products.
- Outreach rules tightened: unread pages only count as lists when the title says so, and government and large vendor
  sites are excluded. Tasks went from 315 to 305 (Outreach 80 to 70).
- Loader fixed: a rebuild now switches off tasks it no longer produces (it only did so when the run changed).

## 23/11/2026: New page or update, decided against our own site and Search Console

**Why.** The first task said "new page" for "best AI tool for tally prime" although we already have
`/blog/ultimate-guide-tally-prime-automation` ("Tally Prime AI Tool"). The generator only knew about pages of ours that
an assistant had cited. The user also raised the risk that updating a page breaks the searches it already ranks for.

**Rule agreed with the user.**
1. Close page with real Google traffic (100+ clicks in 90 days), or any product, tool or landing page: add a section only.
   Keep URL, title, main heading and existing sections.
2. Close blog page with little traffic: free to rework.
3. Our nearest page is about something else: write a new page and link to it from the old one.

**How it is applied.** `scripts/recs/ours.py` reads all 445 URLs in the sitemap with their titles, plus 90 days of
Search Console clicks and the searches each page ranks for (23/08 to 20/11/2026). `build.py` scores each of our pages
against the prompt by title and by ranking searches (0.8 or more is a close match, 0.5 to 0.8 is a related page), with a
small bonus for a page an assistant already cites.

**Result for the 142 website tasks.** Add only 35, rework 49, new page linked from a related page 52, new page 6.
Each update task also says which other prompts the page is already cited for (to keep those parts), how many other tasks
touch the same page, and to watch the page's Google clicks for four weeks after the change. The panel shows "Our own
page on this" with its clicks and searches.

**Limits.** Matching is by words in titles and searches, so a few matches will be loose. The 100-click line is a starting
point. Several prompts often point at one page (ten at `/blog/best-ai-tools-for-ca-in-india`); they are separate tasks
with a note to do them in one edit, not merged.

## 23/11/2026: Website tasks now read our own pages and the full answers

**Why.** The task for "best AI accounting software for small business" told us to list AI Accountant on
`/blog/best-accounting-software-for-small-businesses-in-india`, which already lists it as number 1. The generator had
matched our pages by title and searches only, never by what is on them. The user asked for every page of the site to be
read first.

**What changed.**
- `ours.py` now reads the content of all 445 sitemap pages: headings, text, tables, last-updated date.
- `export.py` also pulls the 810 full answers of the latest run. Tools named in an answer are now found in the answer
  text (about 65 tool names), not only among the 11 tracked competitors.
- Each update task is built from the gap between our page and the cited pages: tools the assistants name that the page
  lacks, wording of the question missing from title and headings, no comparison table where the cited pages have one,
  how our name is written, length (rework only) and age. The panel shows "Missing next to the cited pages" and
  "Already on the page".
- If our page lacks nothing, no page task is made; the question view says so. 36 questions and searches are in that state.
- New evidence line per assistant: on how many of the pages it cited each named tool appears, and on how many we do.
- Where an assistant read our page, named other tools from it and skipped us, the task says so and points to the
  outreach and listing tasks as the stronger lever.

**Finding worth keeping.** On the small-business page our name is written "AIAccountant" (6 times) and "AIA" (4), never
"AI Accountant". Six pages on the site use "AIAccountant"; 398 use "AI Accountant". ChatGPT cited that page and named
Zoho Books, TallyPrime and Vyapar (numbers 2 to 4 on our list) without naming us (number 1).

**Result.** 267 tasks (was 305): Website 106 (add only 25, rework 29, new page linked from a related page 52),
Outreach 68, YouTube 48, LinkedIn 13, Review site 11, Reddit 11, X 4, Instagram 4, Facebook 2.

**Limits.** Tool names are matched by a fixed list, so a tool outside it is not seen. Why an assistant skips our name on
a page that lists us is not visible in the data; the task states the observation and the differences, not a proven cause.

## 23/11/2026: Side experiment E20261123-HIRE (the new /hire-accountant page)

Asked by the user: does the new page https://www.aiaccountant.com/hire-accountant relate to any tracked prompt? It does
not, so six "hiring an accountant" prompts were run once as a separate experiment. Nothing was added to the dashboard or
to the tracked prompt list.

- Prompts: `docs/experiments/E20261123-HIRE-prompts.json`. ChatGPT, Gemini and Perplexity, 2 answers each, India: 36 answers.
- Script: `scripts/exp_prompts.py`. Data: table `aeo_prompt_experiments` (new; the dashboard role has no access to it).
- Cost: about $0.15.
- Result: AI Accountant named in 0 of 36 answers. Our site linked in 8 of 36 (ChatGPT 4, Perplexity 4), through four older
  blog posts: best-virtual-accounting-services-india, outsourced-bookkeeping-india-complete-guide,
  ai-accountant-vs-human-accountant and accounting-automation-software. The new page is not cited (published the same day,
  not yet in the sitemap). Only 8 of 36 answers mention AI as an option at all. Gemini cited no sources on 5 of 6 prompts.
- Read: best fit for the page is the cost prompt and the outsource-or-in-house prompt. "Hire an accountant for Tally data
  entry" is answered with job boards and freelancer sites and is not worth chasing.
- Two answers per prompt and one run: treat as a first look, not a measurement.
