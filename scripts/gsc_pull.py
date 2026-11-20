import json, subprocess, sys, os
OUT = sys.argv[1]
SITE = "sc-domain:aiaccountant.com"
WIN = [("W1","2026-05-17","2026-06-16"),("W2","2026-06-17","2026-07-16"),("W3","2026-07-17","2026-08-16"),
       ("W4","2026-08-17","2026-09-16"),("W5","2026-09-17","2026-10-16"),("W6","2026-10-17","2026-11-16")]
def call(body):
    for attempt in range(3):
        r = subprocess.run(["treg","call","google-search-console.performance","--method","POST","--query","siteUrl="+SITE,"--data",json.dumps(body)],capture_output=True,text=True)
        try:
            return json.loads(r.stdout)
        except Exception:
            err = (r.stdout+r.stderr)[:300]
    raise SystemExit("failed: "+err)
def pull(name, start, end, dims, filt=None):
    rows, off = [], 0
    while True:
        b = {"startDate":start,"endDate":end,"dimensions":dims,"rowLimit":25000,"startRow":off}
        if filt: b["dimensionFilterGroups"]=[{"filters":filt}]
        got = call(b).get("rows",[])
        rows += got
        if len(got) < 25000: break
        off += 25000
    json.dump(rows, open(os.path.join(OUT,name+".json"),"w"))
    print(name, len(rows), sum(r["impressions"] for r in rows), sum(r["clicks"] for r in rows), flush=True)
IND=[{"dimension":"country","operator":"equals","expression":"ind"}]
for w,s,e in WIN:
    tot = call({"startDate":s,"endDate":e})["rows"][0]
    toti = call({"startDate":s,"endDate":e,"dimensionFilterGroups":[{"filters":IND}]})["rows"][0]
    print(w,s,e,"ALL impr",tot["impressions"],"clicks",tot["clicks"],"pos",round(tot["position"],1),"| IND impr",toti["impressions"],"clicks",toti["clicks"],"pos",round(toti["position"],1), flush=True)
    pull(f"q_{w}", s, e, ["query"])
    pull(f"p_{w}", s, e, ["page"])
    pull(f"qp_{w}", s, e, ["query","page"])
pull("country_W1","2026-05-17","2026-06-16",["country"])
pull("country_W6","2026-10-17","2026-11-16",["country"])
pull("device_W1","2026-05-17","2026-06-16",["device"])
pull("device_W6","2026-10-17","2026-11-16",["device"])
pull("appear_W1","2026-05-17","2026-06-16",["searchAppearance"])
pull("appear_W6","2026-10-17","2026-11-16",["searchAppearance"])
