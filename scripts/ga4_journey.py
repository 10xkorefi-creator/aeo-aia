#!/usr/bin/env python3
"""Pull the free-trial journey of AI-assistant visitors from GA4 (free, read-only, via treg) and print the SQL
that loads it into Supabase table aeo_ga4_ai_journey.

Usage:  python3 ga4_journey.py 2026-08-16 2026-11-13 > journey.sql
Use the same date range as the GA4 sessions already loaded in aeo_ga4_daily, so the steps and the session totals line up.

Steps (sessions in which the step happened at least once), per session source / medium:
  free_trial_page_view    viewed the sign-up page: /free-trial, or /book-a-demo which it replaced on 13/08/2026 (not /book-a-demo-va)
  free_trial_form_start   started the form on that page  (GA4 automatic event form_start)
  free_trial_form_submit  submitted the form on that page (GA4 automatic event form_submit)
"""
import json, subprocess, sys

PROPERTY = "485726418"
start, end = sys.argv[1], sys.argv[2]
AI = {"orGroup": {"expressions": [
    {"filter": {"fieldName": "sessionDefaultChannelGroup", "stringFilter": {"matchType": "EXACT", "value": "AI Assistant"}}},
    {"filter": {"fieldName": "sessionSource", "stringFilter": {"matchType": "FULL_REGEXP",
        "value": ".*(chatgpt|openai|perplexity|gemini|copilot|claude\\.ai|deepseek|meta\\.ai).*", "caseSensitive": False}}}]}}
PAGE = {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "FULL_REGEXP", "value": "/(free-trial|book-a-demo)/?"}}}

def report(extra_filter, dims):
    body = {"dateRanges": [{"startDate": start, "endDate": end}],
            "dimensions": [{"name": d} for d in dims], "metrics": [{"name": "sessions"}],
            "dimensionFilter": {"andGroup": {"expressions": [AI] + extra_filter}}, "limit": 10000}
    out = subprocess.run(["treg", "call", "google-analytics.report", "--method", "POST", "--query", f"property_id={PROPERTY}",
                          "--data", json.dumps(body)], capture_output=True, text=True, check=True).stdout
    return [([v["value"] for v in r["dimensionValues"]], int(r["metricValues"][0]["value"])) for r in json.loads(out).get("rows", [])]

rows = {}
for (src, med), n in report([PAGE], ["sessionSource", "sessionMedium"]):
    rows[(src, med, "free_trial_page_view")] = n
ev = {"filter": {"fieldName": "eventName", "inListFilter": {"values": ["form_start", "form_submit"]}}}
for (src, med, name), n in report([PAGE, ev], ["sessionSource", "sessionMedium", "eventName"]):
    rows[(src, med, "free_trial_" + name)] = n

q = lambda s: "'" + s.replace("'", "''") + "'"
vals = ",\n".join(f"({q(start)}, {q(end)}, {q(s)}, {q(m)}, {q(step)}, {n}, {q('journey-' + end)})" for (s, m, step), n in sorted(rows.items()))
print("insert into public.aeo_ga4_ai_journey (period_start, period_end, session_source, session_medium, step, sessions, pull_id) values\n" + vals +
      "\non conflict (period_start, period_end, session_source, session_medium, step) do update set sessions = excluded.sessions, pull_id = excluded.pull_id, pulled_at = now();")
