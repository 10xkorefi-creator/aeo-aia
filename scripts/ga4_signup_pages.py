import json, subprocess
P="485726418"
def rep(body):
    out=subprocess.run(["treg","call","google-analytics.report","--method","POST","--query",f"property_id={P}","--data",json.dumps(body)],capture_output=True,text=True).stdout
    return [([v["value"] for v in r["dimensionValues"]],[int(float(m["value"])) for m in r["metricValues"]]) for r in json.loads(out).get("rows",[])]
PG={"filter":{"fieldName":"pagePath","stringFilter":{"matchType":"FULL_REGEXP","value":"^/(book-a-demo|free-trial)/?$"}}}
rows=rep({"dateRanges":[{"startDate":"2025-12-01","endDate":"2026-11-18"}],"dimensions":[{"name":"yearMonth"},{"name":"pagePath"}],"metrics":[{"name":"sessions"}],"dimensionFilter":PG,"limit":500})
t={}
for (ym,p),(n,) in rows: t.setdefault(ym,{})[p.rstrip('/')]=t.setdefault(ym,{}).get(p.rstrip('/'),0)+n
print("sessions viewing each page, all traffic, by month")
for ym in sorted(t): print(" ",ym,"book-a-demo",t[ym].get('/book-a-demo',0),"| free-trial",t[ym].get('/free-trial',0))
d=rep({"dateRanges":[{"startDate":"2026-07-15","endDate":"2026-08-31"}],"dimensions":[{"name":"date"},{"name":"pagePath"}],"metrics":[{"name":"sessions"}],"dimensionFilter":PG,"limit":500})
dd={}
for (dt,p),(n,) in d: dd.setdefault(dt,{})[p.rstrip('/')]=n
print("daily around the switch (book-a-demo | free-trial):")
print(" ",[(k[4:],v.get('/book-a-demo',0),v.get('/free-trial',0)) for k,v in sorted(dd.items()) if '0720'<=k[4:]<='0815'])
