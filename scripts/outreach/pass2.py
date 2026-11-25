import json,subprocess,re,sys
sys.argv=['x']; exec(open('enrich.py').read().split("tasks=json.load")[0])
res=json.load(open('enrich1.json'))
need=sorted({r['domain'] for r in res if not r['emails']})
print(len(need),need)
out={}
for d in need:
    urls=[f'https://{d}/contact',f'https://{d}/contact-us',f'https://{d}/about',f'https://{d}/about-us',f'https://{d}/']
    if d.startswith('blogs.'): urls+= [f'https://{d[6:]}/contact',f'https://{d[6:]}/contact-us']
    got=pw(urls); em={}; li=[]; forms=[]
    for u,v in got.items():
        if v['status']!=200: continue
        for e in emails(v['html']): em.setdefault(e,u)
        _,l=links(v['html'],u); li+= [x for x in l if x not in li]
        if '<form' in v['html'].lower() and ('contact' in u): forms.append(u)
    out[d]={'emails':em,'linkedin':li[:5],'forms':forms,'status':{u:v['status'] for u,v in got.items()}}
    print(d,'|',list(em)[:4],'|',li[:2],'|forms',forms[:1],'|',list(out[d]['status'].values()))
json.dump(out,open('pass2.json','w'),indent=1)
