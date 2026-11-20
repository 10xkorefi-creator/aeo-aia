import json, subprocess, re
P="485726418"
AI={"orGroup":{"expressions":[
 {"filter":{"fieldName":"sessionDefaultChannelGroup","stringFilter":{"matchType":"EXACT","value":"AI Assistant"}}},
 {"filter":{"fieldName":"sessionSource","stringFilter":{"matchType":"FULL_REGEXP","value":".*(chatgpt|perplexity|gemini|copilot|claude\\.ai).*","caseSensitive":False}}}]}}
FT={"filter":{"fieldName":"pagePath","stringFilter":{"matchType":"CONTAINS","value":"free-trial"}}}
def rep(filt):
    body={"dateRanges":[{"startDate":"2026-05-01","endDate":"2026-11-18"}],"dimensions":[{"name":"landingPage"},{"name":"sessionSource"}],"metrics":[{"name":"sessions"}],"dimensionFilter":filt,"limit":5000}
    out=subprocess.run(["treg","call","google-analytics.report","--method","POST","--query",f"property_id={P}","--data",json.dumps(body)],capture_output=True,text=True).stdout
    return [(r["dimensionValues"][0]["value"],r["dimensionValues"][1]["value"],int(r["metricValues"][0]["value"])) for r in json.loads(out).get("rows",[])]
def norm(p):
    p=re.sub(r"[?#].*$","",p).rstrip("/"); return p or "/"
def src(s):
    s=s.lower()
    for k in ["chatgpt","perplexity","gemini","copilot","claude"]:
        if k in s: return k
    return "other"
allr=rep(AI); ftr=rep({"andGroup":{"expressions":[AI,FT]}})
A={}; F={}; S={}; SF={}
for lp,s,n in allr:
    A[norm(lp)]=A.get(norm(lp),0)+n; S[src(s)]=S.get(src(s),0)+n
for lp,s,n in ftr:
    F[norm(lp)]=F.get(norm(lp),0)+n; SF[src(s)]=SF.get(src(s),0)+n
print("period 01/05-18/11/2026 | AI sessions",sum(A.values()),"| of which viewed free-trial",sum(F.values()))
print("by assistant sessions",S,"| free-trial",SF)
def typ(p):
    if p=="/": return "homepage"
    if p.startswith("/products") or p in("/pricing","/about-us","/testimonials","/free-trial") or p.startswith("/product-hub") or p.startswith("/accounting-bookkeeping") or p.startswith("/gst-recon"): return "product / company pages"
    if p.startswith("/resources"): return "free tools (/resources)"
    if p.startswith("/blog") or p.startswith("/guides"): return "blog / guides"
    if p=="(not set)": return "(not set)"
    return "other"
T={}; TF={}
for p,n in A.items(): T[typ(p)]=T.get(typ(p),0)+n
for p,n in F.items(): TF[typ(p)]=TF.get(typ(p),0)+n
print("\nBY PAGE TYPE: sessions | viewed free-trial | rate")
for t,n in sorted(T.items(), key=lambda x:-x[1]): print(f"  {t:<26} {n:>5} | {TF.get(t,0):>4} | {100*TF.get(t,0)/n:.1f}%")
print("\nTOP landing pages by free-trial views: page | sessions | free-trial")
for p,n in sorted(F.items(), key=lambda x:-x[1])[:12]: print(f"  {p[:60]:<60} {A.get(p,0):>4} | {n}")
