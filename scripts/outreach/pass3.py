import json,re,sys
exec(open('enrich.py').read().split("tasks=json.load")[0])
for d in ['incbusiness.in','totumai.in','5minsystems.com','agentcfo.org','microblogging.co.in','indiabook.net','velotouch.com','linuxunplugged.com','finodeal.com','aiforindianca.com']:
    home=f'https://{d}/'; g=pw([home]).get(home) or {'status':0,'html':''}
    h=g['html']; cand=set()
    for m in re.finditer(r'<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>',h,re.S|re.I):
        u=urljoin(home,m.group(1)); t=(re.sub(r'<[^>]+>','',m.group(2))+' '+u).lower()
        if urlparse(u).netloc.replace('www.','')==d and re.search(r'privacy|terms|disclaimer|advertis|contact|about|team|editorial|imprint|legal',t): cand.add(u)
    cand=list(cand)[:6]; em=set(emails(h)); li=links(h,home)[1]
    got=pw(cand) if cand else {}
    for u,v in got.items():
        em|=set(emails(v['html'])); li+= [x for x in links(v['html'],u)[1] if x not in li]
    print(d,g['status'],'|',sorted(e for e in em if not re.search(r'@\d+\.\d|company\.com|^you@',e))[:6],'|',li[:3],'|',len(cand))
