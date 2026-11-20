# Pilot 1: cloro via treg, India (13 Nov 2026)
Raw JSON: /tmp/claude-0/-home-user/2293ad78-3960-5c36-8fa6-21acb490eef2/scratchpad/pilot/ (gpt_p*_r*.json, aio_k*_r*.json)

Setup: 3 prompts x 2 runs on ChatGPT (`cloro.ai-search.chatgpt.scrape`, country IN, markdown + searchQueries),
3 keywords x 2 runs on Google (`cloro.google.serp.organic`, gl IN, hl en, desktop, include.aioverview).
Calls: 12/12 succeeded (1 network reset on first attempt, not charged, retried). Cost about $0.04.
Prices: ChatGPT $0.0028 ($0.0036 with searchQueries); Google + AI Overview $0.0028.

## ChatGPT (web interface)
| Prompt | Run | Sources | AiA mentioned | AiA cited | Competitors mentioned |
|---|---|---|---|---|---|
| Top accounting automation tools that work with Tally | 1 | 13 | No | No | Tally AI (Docs by Ira) |
| same | 2 | 18 | **Yes** | No | Tally AI, Vyapar TaxOne |
| How to automate GSTR-2B reconciliation with purchase register | 1 | 11 | No | No | (Tally, Zoho as context) |
| same | 2 | 19 | No | No | (Tally, Zoho as context) |
| Cheaper alternative to hiring a second accountant in India | 1 | 19 | No | No | (Tally, Zoho as context) |
| same | 2 | 12 | No | No | (Tally as context) |

## Google AI Overviews
| Keyword | AIO shown | AiA cited in AIO | AiA named in AIO | AiA organic rank |
|---|---|---|---|---|
| tally automation software | Yes (2/2) | Yes (2/2) | No | 3-4 |
| gstr 2b reconciliation software | Yes (2/2) | No | No | not in top 10 |
| ai accounting software india | Yes (2/2) | Yes (2/2) | Yes | 1 |

## Findings
1. Pipeline works end to end for India; responses carry text, sources, citation pills; ChatGPT also returns brand `entities` (sometimes empty, so keep our own name matching).
2. Web ChatGPT cites 11-19 sources per answer (API tracker: far fewer). Confirms capturing from the web interface.
3. Run-to-run variance is real: same prompt, AiA absent in run 1, present in run 2. Supports 10 runs.
4. `searchQueries` came back empty on all 6 ChatGPT runs but costs +$0.0008. Drop it. ChatGPT's searches are not available from the web interface,
   so the Gap Analyzer keeps using the API tracker's searches (or AIO keywords) as its input.
5. AIO back-to-back runs were almost identical: less variable than ChatGPT. 5 runs spread over several days is enough.
6. Tally's Docs by Ira appeared in both runs of the Tally-automation prompt, confirming Tally AI as a direct competitor.
7. Directional only (3 prompts): AiA is cited in AIO where it ranks organically, and was cited in 0 of 6 ChatGPT answers.
