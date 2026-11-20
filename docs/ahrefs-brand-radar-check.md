# Ahrefs Brand Radar API check (13 Nov 2026)

Plan: Standard (monthly). API units 29,270 / 800,000 used, reset 7 Dec 2026.
Every Brand Radar call tested cost 0 units.
Report: "AI accountant - GEO" (report_id 019c65bb-cdac-750f-87a7-79bbc3fbb38b, project 8209265)

## Works (custom prompts only)
| Data | Status |
|---|---|
| ChatGPT custom prompts | Yes, weekly (last run 7 Nov) |
| Google AI Overviews custom prompts | Yes, daily (last run 12-13 Nov) |
| Gemini custom prompts | Yes, weekly |
| Full response text, cited links, brand sentiment/snippets | Yes |
| SoV / mentions / cited domains / cited pages | Yes |
| History | Daily SoV points from 21 May 2026; `date` param returns past snapshots |

## Blocked by plan (no add-on)
| Call | Error |
|---|---|
| `prompts=ahrefs` on chatgpt | Missing addon: Brand Radar ["Chatgpt"] |
| `prompts=ahrefs` on google_ai_overviews | Missing addon: Brand Radar ["GoogleAIOverviews"] |
| `google_ai_overviews_keywords` | Missing addon: Brand Radar ["GoogleAIOverviews_Keywords"] |
| `google_ai_mode` | Frequency is "off" in the report |

So there is no market-wide visibility: we only see the prompts we track ourselves.

## Report config issues (these distort the numbers)
1. **Competitors are entered as URLs in the name field** ("https://cleartax.in/") with empty url_groups.
   Responses say "Clear (ClearTax)", "Refrens", "Vyapar TaxOne", but none are matched,
   so ChatGPT SoV shows AI Accountant = 100%, competitors = 0%. **The SoV is wrong.**
2. **30 of 37 prompts are set to country US** even though they are India-focused. The report country is IN,
   so they are left out of the default report numbers.
3. Wingman Accounting (South Africa) is not a relevant competitor. ChatGPT actually recommends
   Zoho Books, TallyPrime, Vyapar, Refrens, BUSY, Clear and Odoo.
4. Only 37 prompts, a small sample. The custom prompt quota on the Standard plan is not shown by the API.
5. 1 Oct snapshot for ChatGPT returned data last updated 7 Sep. Explained by the check allowance below.

## Custom prompt allowance (the real limit)
Source: Ahrefs help "How to set up custom prompts..." (updated ~3 weeks ago).
- Standard plan = **300 checks/month**. 1 check = 1 prompt run x 1 AI platform x 1 location. Billing resets on the 7th.
- When checks run out (and pay-as-you-go is off), nothing more is checked until the next billing month.
- Current setup uses about 1,430 checks/month: 37 prompts x (ChatGPT weekly ~159 + Gemini weekly ~159 + AIO daily ~1,110).
- **Observed:** as of 6 Nov, the latest ChatGPT data was from 7 Oct, and the latest AIO data (as of 25 Oct and 6 Nov) was from 12-13 Oct.
  So each month the allowance runs out about 6 days after the reset: ChatGPT gets 1 snapshot a month, AIO about 6 days.
  This month: reset 7 Nov, so it should run out around 13 Nov. **No new Ahrefs data until 7 Dec** unless we buy a package.
- API unit usage (29k/800k) is irrelevant; Brand Radar API pulls are free.

### Packages (per month, on top of the 300)
| Package | Included checks | Overage |
|---|---|---|
| Basic $50 | 2,500 | $0.020 |
| Growth $100 | 7,000 | $0.015 |
| Scale $250 | 25,000 | $0.010 |

### Capacity, ChatGPT + AIO only (Gemini off), India only
| Setup | Checks/month | Fits |
|---|---|---|
| 35 prompts weekly | ~300 | Current plan |
| 100 prompts weekly | ~860 | Basic $50 |
| 100 prompts, 3x/week | ~2,600 | Basic $50 (+ ~$2 overage) |
| 100 prompts daily | ~6,000 | Growth $100 |
| 150 prompts daily | ~9,000 | Growth $100 + ~$30 overage |
