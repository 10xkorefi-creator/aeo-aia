#!/usr/bin/env python3
"""Month-by-month GA4 figures for AI-assistant visitors (free, read-only, via treg). Prints the SQL that loads
Supabase table aeo_ga4_ai_monthly. Usage: python3 ga4_monthly.py 2025-11-01 2026-11-17 > monthly.sql
Per month and session source/medium: sessions, engaged sessions, sessions that viewed the free-trial page,
sessions that submitted the form on it."""
import json, subprocess, sys
PROPERTY = "485726418"
start, end = sys.argv[1], sys.argv[2]
AI = {"orGroup": {"expressions": [
    {"filter": {"fieldName": "sessionDefaultChannelGroup", "stringFilter": {"matchType": "EXACT", "value": "AI Assistant"}}},
    {"filter": {"fieldName": "sessionSource", "stringFilter": {"matchType": "FULL_REGEXP",
        "value": ".*(chatgpt|openai|perplexity|gemini|copilot|claude\\.ai|deepseek|meta\\.ai).*", "caseSensitive": False}}}]}}
PAGE = {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "FULL_REGEXP", "value": "/(free-trial|book-a-demo)/?"}}}
SUBMIT = {"filter": {"fieldName": "eventName", "stringFilter": {"matchType": "EXACT", "value": "form_submit"}}}

def report(filters, metrics):
    body = {"dateRanges": [{"startDate": start, "endDate": end}],
            "dimensions": [{"name": "yearMonth"}, {"name": "sessionSource"}, {"name": "sessionMedium"}],
            "metrics": [{"name": m} for m in metrics],
            "dimensionFilter": {"andGroup": {"expressions": filters}} if len(filters) > 1 else filters[0], "limit": 10000}
    out = subprocess.run(["treg", "call", "google-analytics.report", "--method", "POST", "--query", f"property_id={PROPERTY}",
                          "--data", json.dumps(body)], capture_output=True, text=True, check=True).stdout
    return [(tuple(v["value"] for v in r["dimensionValues"]), [int(float(m["value"])) for m in r["metricValues"]]) for r in json.loads(out).get("rows", [])]

rows = {}
for k, (s, e) in report([AI], ["sessions", "engagedSessions"]): rows[k] = [s, e, 0, 0]
for k, (s,) in report([AI, PAGE], ["sessions"]): rows.setdefault(k, [0, 0, 0, 0])[2] = s
for k, (s,) in report([AI, PAGE, SUBMIT], ["sessions"]): rows.setdefault(k, [0, 0, 0, 0])[3] = s
q = lambda s: "'" + s.replace("'", "''") + "'"
vals = ",\n".join(f"('{ym[:4]}-{ym[4:]}-01', {q(src)}, {q(med)}, {v[0]}, {v[1]}, {v[2]}, {v[3]}, {q('monthly-' + end)}, {q(end)})"
                  for (ym, src, med), v in sorted(rows.items()))
print("insert into public.aeo_ga4_ai_monthly (month, session_source, session_medium, sessions, engaged_sessions, free_trial_sessions, free_trial_form_submits, pull_id, data_through) values\n" + vals +
      "\non conflict (month, session_source, session_medium) do update set sessions = excluded.sessions, engaged_sessions = excluded.engaged_sessions, free_trial_sessions = excluded.free_trial_sessions,"
      " free_trial_form_submits = excluded.free_trial_form_submits, pull_id = excluded.pull_id, data_through = excluded.data_through, pulled_at = now();")
