import json, subprocess
P="485726418"
def rep(body):
    out=subprocess.run(["treg","call","google-analytics.report","--method","POST","--query",f"property_id={P}","--data",json.dumps(body)],capture_output=True,text=True).stdout
    return [([v["value"] for v in r["dimensionValues"]],[int(float(m["value"])) for m in r["metricValues"]]) for r in json.loads(out).get("rows",[])]
rows=rep({"dateRanges":[{"startDate":"2026-05-01","endDate":"2026-11-16"}],"dimensions":[{"name":"yearMonth"},{"name":"sessionDefaultChannelGroup"}],"metrics":[{"name":"sessions"},{"name":"engagedSessions"}],"limit":500})
ch={}
for (ym,c),(s,e) in rows: ch.setdefault(c,{})[ym]=s
ms=sorted({ym for (ym,c),_ in rows})
print("month",ms)
for c,v in sorted(ch.items(), key=lambda x:-sum(x[1].values()))[:9]:
    print(f"{c:<22}",[v.get(m,0) for m in ms])
ORG={"filter":{"fieldName":"sessionDefaultChannelGroup","stringFilter":{"matchType":"EXACT","value":"Organic Search"}}}
for name,s,e in [("W1","2026-05-17","2026-06-16"),("W3","2026-07-17","2026-08-16"),("W6","2026-10-17","2026-11-16")]:
    r=rep({"dateRanges":[{"startDate":s,"endDate":e}],"dimensions":[{"name":"landingPage"}],"metrics":[{"name":"sessions"}],"dimensionFilter":ORG,"limit":14,"orderBys":[{"metric":{"metricName":"sessions"},"desc":True}]})
    print(name,[(d[0][:48],m[0]) for d,m in r])
PAGE={"filter":{"fieldName":"pagePath","stringFilter":{"matchType":"CONTAINS","value":"free-trial"}}}
r=rep({"dateRanges":[{"startDate":"2026-05-01","endDate":"2026-11-16"}],"dimensions":[{"name":"yearMonth"}],"metrics":[{"name":"sessions"}],"dimensionFilter":{"andGroup":{"expressions":[ORG,PAGE]}},"limit":50})
print("organic sessions that viewed free-trial, by month",sorted((d[0],m[0]) for d,m in r))
