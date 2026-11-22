#!/usr/bin/env python3
"""Refresh the Google Analytics figures for AI-assistant visitors (free, read-only, via treg) and load them into Supabase
with the function aeo_ga4_refresh_json. The n8n workflow "AEO Baseline v1 | Google Analytics, AI visits (daily)" does the
same thing every day; this script is the by-hand version.

Usage:  python3 ga4_refresh.py 2026-11-21 payload.json     (the date is the last complete day)
It writes the payload to the file; load it with:
  curl -X POST https://<project>.supabase.co/rest/v1/rpc/aeo_ga4_refresh_json -H "Content-Type: application/json" --data-binary @payload.json
"""
import datetime, json, subprocess, sys

PROPERTY = "485726418"
JOURNEY_START = "2026-08-16"
end = datetime.date.fromisoformat(sys.argv[1])
day = lambda d: d.isoformat()
AI = {"orGroup": {"expressions": [
    {"filter": {"fieldName": "sessionDefaultChannelGroup", "stringFilter": {"matchType": "EXACT", "value": "AI Assistant"}}},
    {"filter": {"fieldName": "sessionSource", "stringFilter": {"matchType": "FULL_REGEXP",
        "value": ".*(chatgpt|openai|perplexity|gemini|copilot|claude\\.ai|deepseek|meta\\.ai).*", "caseSensitive": False}}}]}}
PAGE = {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "FULL_REGEXP", "value": "/(free-trial|book-a-demo)/?"}}}
FORM = {"filter": {"fieldName": "eventName", "inListFilter": {"values": ["form_start", "form_submit"]}}}

def report(start, dims, metrics, filters):
    body = {"dateRanges": [{"startDate": start, "endDate": day(end)}], "dimensions": [{"name": d} for d in dims], "metrics": [{"name": m} for m in metrics],
            "dimensionFilter": filters[0] if len(filters) == 1 else {"andGroup": {"expressions": filters}}, "limit": 10000}
    out = subprocess.run(["treg", "call", "google-analytics.report", "--method", "POST", "--query", f"property_id={PROPERTY}", "--data", json.dumps(body)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)

month_start = (end.replace(day=1) - datetime.timedelta(days=1)).replace(day=1)
payload = {"p": {
    "end": day(end), "journey_start": JOURNEY_START,
    "daily": report(day(end - datetime.timedelta(days=13)), ["date", "sessionSource", "sessionMedium", "sessionDefaultChannelGroup", "landingPage"], ["sessions", "engagedSessions", "keyEvents", "totalUsers"], [AI]),
    "monthly": report(day(month_start), ["yearMonth", "sessionSource", "sessionMedium"], ["sessions", "engagedSessions"], [AI]),
    "journey_view": report(JOURNEY_START, ["sessionSource", "sessionMedium"], ["sessions"], [AI, PAGE]),
    "journey_events": report(JOURNEY_START, ["sessionSource", "sessionMedium", "eventName"], ["sessions"], [AI, PAGE, FORM]),
}}
json.dump(payload, open(sys.argv[2], "w"))
print({k: len(v.get("rows", [])) for k, v in payload["p"].items() if isinstance(v, dict)})
