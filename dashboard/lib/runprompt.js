// The prompt behind the "Trigger a run" button. Pasted into Claude (with the Supabase connector for the project
// "AI Accountant"), it starts a run, waits for it, does the brand-name check and writes the summary.
// It contains no figures: every number in Claude's answer comes from the database functions it calls
// (aeo_run_trigger, aeo_run_report, aeo_mentions_to_review, aeo_review_mentions).
export const RUN_PROMPT = `You are running the AI Accountant AEO baseline: how visible AI Accountant (aiaccountant.com) is in ChatGPT, Gemini, Perplexity and Google AI Overviews in India. Use the Supabase connector, project "AI Accountant" (id qmaphtslnvvifkzmbrvh). Follow the steps in order and run only the SQL given here.

STEP 1 - Start the run
Run: select public.aeo_run_trigger('dashboard prompt');
- action "started": a new run was created. An automation collects the data and finishes it without further input.
- action "already_running": no new run was started. Continue with the run it returns.
- action "limit_reached": stop and tell me what it says.
Then tell me in three short lines: the run id, what is being collected and roughly how long and how much it costs (from "estimate"), and that I should reply "check" after that time. Stop and wait.

STEP 2 - When I reply "check"
Run: select public.aeo_run_report('<run id>');
If status is not "complete": tell me the percent done in one line and ask me to check again in 10 minutes. Stop and wait.

STEP 3 - Brand-name check (only if brand_mentions_awaiting_check is above 0)
Run: select * from public.aeo_mentions_to_review('<run id>');
Each row is an answer from the assistant named in the "assistant" column, containing the words "AI Accountant". Decide from the excerpts:
- "brand": it means our product (listed as a tool or company, often beside competitors, a website link, or our features such as Tally sync, bank statement and bill processing, GST reconciliation).
- "not_brand": the general phrase (a kind of AI agent, a job role, a project idea) or another product such as "Your AI Accountant".
Save every verdict in one call, then run the report again:
select public.aeo_review_mentions('[{"capture_id":123,"verdict":"brand","reason":"one short sentence"}]'::jsonb, 'Claude, dashboard prompt');

STEP 4 - Report
Write for a marketing teammate in plain English. Apply the 80/20 rule: only the results listed below, at most three lines each, no extra tables, no methodology. Use exactly this structure.

## Run <run id>, <date>
One sentence: did anything really change since the previous run, or is it within normal variation? Use the two change_vs_previous values.

## ChatGPT
One numbered result for each item in "chatgpt", in order:
1. AiA named: rate, count out of total, likely range, previous run's rate.
2. Share of voice: our share and the leading brand's.
3. Where we appear: how many prompts name us, and the top prompts.

## Gemini and Perplexity
One numbered result for each item in "gemini_and_perplexity" (skip this section if the list is empty): the assistant, rate, count out of total, likely range, how often we are also cited as a source, and its "note" if it has one.

## Google AI Overviews
One numbered result for each item in "google_ai_overviews", in order:
1. AiA cited on buyer keywords: rate, count out of total, likely range, previous run's rate.
2. Share of voice: our share and the next brand's.
3. Biggest gaps: how many buyer keywords never cite us, and the top gaps with their monthly searches.

## Traffic and conversions
One numbered result for each item in "traffic_and_conversions", with its period and its note.

## Run health
One line from "run_health": answers and searches collected, failures, minutes, approximate cost.

Directly under EVERY numbered result and under Run health, add a line starting "Sources:" with every entry of that item's "sources" as a markdown link, label and URL exactly as given.

Rules: use only numbers from the report; never estimate or invent one. Do not show names, emails or phone numbers of contacts. Write dates as dd/mm/yyyy. If any step returns an error, show it and stop.`;

export const runPromptHref = () => 'https://claude.ai/new?q=' + encodeURIComponent(RUN_PROMPT);
