import json, subprocess
def call(site, body):
    r=subprocess.run(["treg","call","google-search-console.performance","--method","POST","--query","siteUrl="+site,"--data",json.dumps(body)],capture_output=True,text=True)
    try: return json.loads(r.stdout).get("rows",[])
    except Exception: return [{"error":(r.stdout+r.stderr)[:200]}]
DOM="sc-domain:aiaccountant.com"; WWW="https://www.aiaccountant.com/"
A=("2026-05-17","2026-06-16"); B=("2026-10-17","2026-11-16")
def one(site, win, filt=None, state="final"):
    b={"startDate":win[0],"endDate":win[1],"dataState":state}
    if filt: b["dimensionFilterGroups"]=[{"filters":filt}]
    r=call(site,b)
    if not r: return (0,0,None)
    r=r[0]
    if "error" in r: return r["error"]
    return (r["impressions"], r["clicks"], round(r["position"],1))
def q(x): return [{"dimension":"query","operator":"equals","expression":x}]
def p(x): return [{"dimension":"page","operator":"equals","expression":"https://www.aiaccountant.com"+x}]
def qp(x,y): return q(x)+p(y)
checks=[("SITE total",None),
 ("query: accounting software",q("accounting software")),
 ("page: listicle",p("/blog/best-accounting-software-for-small-businesses-in-india")),
 ("page: suvit-alternative",p("/blog/suvit-alternative")),
 ("query: best ai accounting software",q("best ai accounting software")),
 ("query+homepage: best ai accounting software",qp("best ai accounting software","/")),
 ("query: ai tools for chartered accountants",q("ai tools for chartered accountants")),
 ("page: best-ai-tools-for-ca-in-india",p("/blog/best-ai-tools-for-ca-in-india")),
 ("query: tally ai extension",q("tally ai extension")),
 ("query: tally extension for ai",q("tally extension for ai")),
 ("page: homepage all queries",p("/")),
]
print("format: (impressions, clicks, position)")
for name,f in checks:
    a=one(DOM,A,f); b=one(DOM,B,f); b2=one(DOM,B,f,"all"); wa=one(WWW,A,f); wb=one(WWW,B,f)
    print(f"{name}\n   domain property  first {a}  last {b}  last incl. fresh data {b2}\n   www property     first {wa}  last {wb}")
