import json, subprocess
P="485726418"
AI={"orGroup":{"expressions":[
 {"filter":{"fieldName":"sessionDefaultChannelGroup","stringFilter":{"matchType":"EXACT","value":"AI Assistant"}}},
 {"filter":{"fieldName":"sessionSource","stringFilter":{"matchType":"FULL_REGEXP","value":".*(chatgpt|perplexity|gemini|copilot|claude\\.ai).*","caseSensitive":False}}}]}}
def rep(dims, filt, metrics=("sessions","eventCount")):
    body={"dateRanges":[{"startDate":"2026-08-16","endDate":"2026-11-13"}],"dimensions":[{"name":d} for d in dims],"metrics":[{"name":m} for m in metrics],"dimensionFilter":filt,"limit":2000}
    out=subprocess.run(["treg","call","google-analytics.report","--method","POST","--query",f"property_id={P}","--data",json.dumps(body)],capture_output=True,text=True).stdout
    return [([v["value"] for v in r["dimensionValues"]],[int(float(m["value"])) for m in r["metricValues"]]) for r in json.loads(out).get("rows",[])]
EV=lambda names:{"filter":{"fieldName":"eventName","inListFilter":{"values":names}}}
rows=rep(["eventName","pagePath"],{"andGroup":{"expressions":[AI,EV(["form_start","form_submit","Lead_submit","generate_lead"])]}})
print("AI sessions 16/08-13/11: form events by page (sessions, events)")
for d,m in sorted(rows,key=lambda x:(x[0][0],-x[1][0])): print("  ",d[0].ljust(12),d[1][:60].ljust(60),m)
pv=rep(["pagePath"],{"andGroup":{"expressions":[AI,{"filter":{"fieldName":"pagePath","stringFilter":{"matchType":"FULL_REGEXP","value":".*(book-a-demo|free-trial|thank-you).*"}}}]}},("sessions",))
print("AI sessions that viewed sign-up or thank-you pages:")
for d,m in sorted(pv,key=lambda x:-x[1][0]): print("  ",d[0][:70].ljust(70),m)
by=rep(["sessionSource","eventName"],{"andGroup":{"expressions":[AI,EV(["form_submit"])]}},("sessions",))
print("form_submit sessions by source:",sorted([(d[0],m[0]) for d,m in by],key=lambda x:-x[1]))
