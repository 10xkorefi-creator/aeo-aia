import json, subprocess, sys
SITE = "sc-domain:aiaccountant.com"
start, end, out = sys.argv[1], sys.argv[2], sys.argv[3]
FILT = [{"dimension": "country", "operator": "equals", "expression": "ind"},
        {"dimension": "query", "operator": "includingRegex", "expression": "ai ?accountant"}]
def call(body):
    err = ""
    for _ in range(3):
        r = subprocess.run(["treg", "call", "google-search-console.performance", "--method", "POST", "--query", "siteUrl=" + SITE,
                            "--data", json.dumps(body)], capture_output=True, text=True)
        try:
            return json.loads(r.stdout)
        except Exception:
            err = (r.stdout + r.stderr)[:300]
    raise SystemExit("failed: " + err)
rows, off = [], 0
while True:
    got = call({"startDate": start, "endDate": end, "dimensions": ["date", "query"], "rowLimit": 25000, "startRow": off,
                "dimensionFilterGroups": [{"filters": FILT}]}).get("rows", [])
    rows += got
    if len(got) < 25000: break
    off += 25000
json.dump(rows, open(out, "w"))
tot = call({"startDate": start, "endDate": end, "dimensions": ["date"], "rowLimit": 25000, "dimensionFilterGroups": [{"filters": FILT}]}).get("rows", [])
json.dump(tot, open(out.replace(".json", "_totals.json"), "w"))
print("rows", len(rows), "days", len({r["keys"][0] for r in rows}), "first", min(r["keys"][0] for r in rows), "last", max(r["keys"][0] for r in rows),
      "impr", sum(r["impressions"] for r in rows), "clicks", sum(r["clicks"] for r in rows))
print("date-only totals: impr", sum(r["impressions"] for r in tot), "clicks", sum(r["clicks"] for r in tot))
