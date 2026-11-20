# AEO tracking tools: research (13 Nov 2026)
Scope: ChatGPT + Google AI Overviews only, India market. Prices come mostly from third-party reviews and need confirming with each vendor.

## How the tools work (common pattern)
1. **Prompt set**: a curated list of buyer-intent questions, grouped by topic and funnel stage.
2. **Capture**: runs the prompts through the *consumer interface* (browser), not the model API.
   Profound and Peec do this. API answers differ: in a Surfer test, the ChatGPT app cited 12.1 sources per answer versus 3.1 for the API.
   For Google AI Overviews, they scrape the Google results page for a keyword, with the location set.
3. **Repeat sampling**: answers vary between runs. Research suggests about 7 runs per prompt per day, aggregated over 2-4 weeks
   (arXiv 2604.07585). Report *mention rate*, not one answer.
4. **Metrics**: mention rate (visibility), share of voice vs competitors, citation rate (own domain cited),
   cited domains/pages (who wins and why), plus position and sentiment as secondary.
5. **Traffic/conversion**: mostly outside the trackers. GA4 has an AI Assistant channel (chatgpt.com, utm_source=chatgpt.com);
   AI Overview clicks are mixed into Organic Search, and Search Console shows AI reports only partly. CRM handles conversions.

## Pareto: the 20% that delivers 80% of the value
| Keep | Skip for now |
|---|---|
| Good India prompt set (~100) | 8+ engines |
| Interface capture, India location | Content-generation agents |
| Repeat runs and mention rate | Crawler/bot analytics |
| Competitor share of voice + cited domains/URLs | Detailed sentiment analysis |
| Raw data export/API (traceability) | Prompt-volume estimates (nice to have) |
| GA4 AI channel + Search Console + HubSpot for traffic and conversions | |

## Landscape
| Tool | Type | ChatGPT + AIO | API / raw export | Price (indicative) | Fit |
|---|---|---|---|---|---|
| Profound | Enterprise platform, interface capture, daily | Yes | Enterprise only | Brand plans now trial + custom Enterprise (Starter/Growth removed ~Sep 2026) | Strong method, slow and expensive to buy |
| AEO Engine | **Agency / managed service** | Yes | Not a tool you own | $1,597-$10k/mo | Fails "someone else re-runs it" |
| Peec AI | Mid-market tracker, interface capture | Yes (3 engines on Starter) | API on Pro/Advanced (yearly) | ~$95+/mo, Enterprise $499 | Good, but API needs annual plan |
| Otterly | Budget tracker | ChatGPT + AIO included | API/MCP from Standard | $29 (15 prompts) / $189 (100) / $489 (400) | Best value with API; India location unconfirmed |
| Trakkr | Tracker | Yes | REST API + MCP (tier unclear, maybe $500 agency) | $100 Growth (50 prompts) | Possible |
| Semrush AI Toolkit | SEO-suite add-on | Yes | API unclear | $99 (25 prompts) | Few prompts |
| Ahrefs Brand Radar (have) | SEO-suite add-on | Custom prompts working now; Ahrefs prompt DB needs add-on | API (0 units) | $199 per index (ChatGPT; Google AIO+AI Mode); $699 all | Already in place; ChatGPT only refreshes weekly with 1 run |
| DataForSEO | Raw data API | ChatGPT via LLM Scraper; AIO via SERP API | Full raw | LLM Scraper $0.0012-0.004/result | Cheap, own the raw data |
| Bright Data | Raw data API | ChatGPT scraper + SERP API with AIO | Full raw | ~$1.50/1k records (indicative) | Alternative to DataForSEO |
| SerpApi | Raw data API | AIO / AI Mode | Full raw | From $25/mo | AIO only |
| treg.to | **Agent tool gateway** (2,600+ APIs, one key) | Indirect | Through underlying APIs | n/a | Not a tracker; a way to reach APIs |
| Treg AEO toolkit (open source, Oct 2026) | Citation mapping + finds people behind cited sources | n/a | n/a | Free | Useful for Goal 2/3 (outreach), not tracking |

## treg.to check (13 Nov)
- Pay-per-call gateway (Superdesign Dev Pty Ltd). One token (`X-Treg-Token`), REST `POST https://treg.to/call/<endpoint-id>`, also CLI + MCP.
  Provider rate with 0% markup, prepaid balance, $1 free credit, can bring your own provider keys. Raw provider response relayed unchanged; every call logged.
- Relevant endpoints (AI Visibility / AEO category):
| Need | Endpoint | Price |
|---|---|---|
| ChatGPT app answer + citations + entities, by country | cloro.ai-search.chatgpt.scrape | $0.0028/success |
| Same, queued (cheaper) | cloro.ai-search.chatgpt.scrape.task | $0.002/success |
| ChatGPT logged-out answer + sources | crawl4ai.ai-search.chatgpt.scrape | $0.0032/success |
| ChatGPT via API model (no citations listed) | dataforseo ...chat-gpt-llm-responses-live | $0.0292/call |
| Google SERP incl. AI Overview | cloro.google.serp.organic (+ aioverview = 2 extra credits, $ not stated) | $0.002/success + surcharge |
| Google AI Mode | cloro.google.serp.ai_mode / serpapi.x.google-ai-mode | $0.0024 / $0.015 |
- Not found: SerpApi Google AI Overview endpoint, Bright Data ChatGPT scraper, OpenAI direct.
- Unverified: **India country support** (cloro says "chosen country"; check cloro.account.coverage.countries). n8n compatibility is inferred (plain REST).
- Risks: early access, no SLA/support, liability cap US$100; upstream provider terms apply.
- Rough cost: 100 prompts x 7 ChatGPT runs/week ~ 3,000/mo ~ $6-8; 100 keywords AIO daily ~ 3,000/mo ~ $6 + AIO surcharge. Under ~$30/mo total, vs Ahrefs Growth $100.
- Not covered: traffic/conversion (GA4, Search Console, HubSpot stay direct).

## Recommended direction (to discuss, not yet approved)
- **Base:** Ahrefs Brand Radar (already in place; fix config, ~100 India prompts). Gives ChatGPT weekly + AIO daily, raw answers + citations.
- **Fill the sampling gap:** DataForSEO (or Bright Data) to run ChatGPT repeatedly (e.g. 5-7x per prompt per week) and AIO by keyword in India.
  Raw data goes to our database. Rough cost: 100 prompts x 7 runs x 4 weeks = 2,800 results/mo, about $3-11/mo plus AIO SERP calls.
- **Optional:** Ahrefs ChatGPT index add-on ($199/mo) if Goal 2 needs market-wide prompt demand beyond our own prompts.
- **Alternative if buying a tool rather than building:** Otterly Standard ($189, 100 prompts, API) or Peec Pro. First confirm India location + raw export.
- **Not recommended:** Profound (enterprise procurement won't fit the timeline), AEO Engine (service, not a measurement system).
