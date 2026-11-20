# n8n AEO workflows: audit (13 Nov 2026)

## Workflows found
| ID | Name | Status | Notes |
|---|---|---|---|
| UTqllrsC3mNHrRx7 | AEO Fan-Out & Citation Tracker (ChatGPT + Gemini) | Active, Mon 06:00 weekly | 100 prompts x 3 samples -> Supabase |
| 3xwPG7U4ZJ534WKE | AEO Gap Analyzer (ChatGPT + Gemini, Google rank) | Active, Tue 06:00 weekly | Fan-out queries -> SerpApi rank -> WRITE/FIX/BRAND -> blog queue + HTML report |
| hX4ti9dPucRsDEC6 | AEO, Multi-LLM Cited Sources Tracker | Inactive (Sep) | Sheets-based, 4 LLMs |
| WYYiBILrL1BHVeqS / nwOIscOu9OF5Owz7 / TfIpD1494quluT16 | AEO Pipeline (SERP API / Claude-Gemini-Perplexity / GPT) | Inactive (Jun) | Older prototypes, "Shyam's Workspace" tag |

n8n returned no execution history for either active workflow, so the Supabase rows are the only run record.

## Data in Supabase (project "AI Accountant", qmaphtslnvvifkzmbrvh)
- prompts: 424 total, 100 tracked
- chatgpt_runs: chatgpt 3,827 rows (22 Jul -> 9 Nov, 16 dates), gemini 2,704 rows (20 Aug -> 9 Nov)
- chatgpt_citations: 2,482 rows; chatgpt_gaps: 149 open / 21 closed; chatgpt_gap_reports: 16 (to 10 Nov)

## Run health since September
| Week | ChatGPT errors | Web search used | AiA mentioned | Gemini errors |
|---|---|---|---|---|
| 9 Nov | 0/300 | 35 (12%) | 4 | 300/300 |
| 2 Nov | 66/300 | 30 | 4 | 300/300 |
| 26 Oct | 0/300 | 33 | 2 | 300/300 |
| 19 Oct | 0/300 | 37 | 3 | 300/300 |
| 12 Oct | 0/300 | 24 | 5 | 300/300 |
| 5 Oct, 28 Sep, 21 Sep | 300/300 each | 0 | 0 | 300/300 |
Errors: "too many requests" / "You have no..." (OpenAI quota or credits), "You exceeded" (Gemini quota).

## Problems compared with the Goal 1 bar
1. **ChatGPT is measured through the API, not the ChatGPT app.** Web search ran in only ~12% of runs, so most answers come from model memory,
   which is not what users see in ChatGPT.
2. **No Google AI Overviews data.** Gemini grounded search is not AIO, and it has failed 100% since at least 14 Sep.
3. **Reliability:** 3 weeks of complete ChatGPT failure, with no alerting.
4. **Traceability:** upsert on (prompt, date, sample, surface) overwrites same-day re-runs, and errored rows sit in the same table.
5. **Mention detection:** regex brand list (no Refrens; ClearTax only, not "Clear"); "AI Accountant" match is case-sensitive.
6. **Sampling:** 3 samples a week is below the ~7 runs research suggests.

## Worth reusing
- Supabase schema (prompts / runs / fanout / citations / gaps / reports) + 100 tracked ICP prompts + history since July.
- Gap Analyzer logic (fan-out query -> Google rank -> WRITE/FIX) is directly useful for Goal 2.
- SerpApi is already in use; it also returns Google AI Overviews, so it could replace Gemini as the AIO source (check plan quota).
