import re,json,subprocess,html,concurrent.futures as cf
from urllib.parse import urljoin,urlparse
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
def curl(u):
    try:
        r=subprocess.run(['curl','-sL','-m','25','-A',UA,'-w','\n%{http_code}',u],capture_output=True,timeout=40)
        t=r.stdout.decode('utf-8','ignore'); i=t.rfind('\n'); return t[i+1:],t[:i]
    except Exception: return '0',''
def pw(urls):
    try:
        r=subprocess.run(['node','pw_get.js']+urls,capture_output=True,timeout=60+45*len(urls)); return json.loads(r.stdout.decode('utf-8','ignore') or '{}')
    except Exception: return {}
def get(u):
    c,h=curl(u)
    if c!='200' or len(h)<6000 or 'Just a moment' in h[:3000]:
        d=pw([u]).get(u)
        if d and d['html'] and len(d['html'])>len(h): return str(d['status'])+'*',d['html']
    return c,h
EM=re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+')
BAD=re.compile(r'\.(png|jpg|jpeg|gif|webp|svg|css|js)$|sentry|wixpress|example\.|your@|name@|email@|user@|john@|jane@|@2x|schema\.org|w3\.org|domain\.com|yourname|@email\.com|test@',re.I)
def emails(h):
    h=html.unescape(h); h=re.sub(r'\s*\[at\]\s*|\s+\(at\)\s+','@',h); h=re.sub(r'\s*\[dot\]\s*','.',h)
    # cloudflare protected
    for m in re.findall(r'data-cfemail="([0-9a-f]+)"',h):
        try:
            k=int(m[:2],16); h+=' '+''.join(chr(int(m[i:i+2],16)^k) for i in range(2,len(m),2))
        except Exception: pass
    return sorted({e.lower().rstrip('.') for e in EM.findall(h) if not BAD.search(e)})
def author(h):
    out=[]
    for j in re.findall(r'<script[^>]+ld\+json[^>]*>(.*?)</script>',h,re.S):
        for a in re.findall(r'"author"\s*:\s*(\{.*?\}|\[.*?\])',j,re.S):
            n=re.findall(r'"name"\s*:\s*"([^"]+)"',a); u=re.findall(r'"url"\s*:\s*"([^"]+)"',a)
            if n: out.append({'name':html.unescape(n[0]),'url':u[0].replace('\\/','/') if u else None})
    m=re.search(r'<meta[^>]+name=["\']author["\'][^>]+content=["\']([^"\']+)',h,re.I)
    if m: out.append({'name':html.unescape(m.group(1)),'url':None})
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']*/author/[^"\']*)["\'][^>]*>(.*?)</a>',h,re.S|re.I):
        t=re.sub(r'<[^>]+>','',m.group(2)).strip()
        if 1<len(t)<40: out.append({'name':html.unescape(t),'url':m.group(1)})
    seen=[];r=[]
    for a in out:
        if a['name'].lower() not in seen: seen.append(a['name'].lower()); r.append(a)
    return r[:3]
def links(h,base):
    out={}; li=[]
    host=urlparse(base).netloc.replace('www.','')
    for m in re.finditer(r'<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>',h,re.S|re.I):
        t=re.sub(r'<[^>]+>','',m.group(2)).strip().lower(); u=urljoin(base,m.group(1))
        if urlparse(u).netloc.replace('www.','')!=host:
            if re.search(r'linkedin\.com/(in|company)/',u) and u not in li: li.append(u.split('?')[0])
            continue
        for k in ['contact','about','advertis','write for us','submit','editorial','partner','author']:
            if k in t or k.replace(' ','-') in u.lower(): out.setdefault(k,u)
    return out,li[:4]
def work(t):
    key,prio,title,u=t; host=urlparse(u).netloc.replace('www.','')
    c,h=get(u); r={'task_key':key,'priority':prio,'url':u,'domain':host,'status':c,'authors':author(h),'emails':{}, 'forms':[], 'linkedin':[]}
    for e in emails(h): r['emails'].setdefault(e,'cited page')
    L,li=links(h,u); r['linkedin']=li
    tm=re.search(r'<title[^>]*>(.*?)</title>',h,re.S); r['page_title']=html.unescape(tm.group(1).strip())[:120] if tm else None
    if not L and c.startswith('200') is False:
        for p in ['/contact','/contact-us','/about','/about-us']: L[p.strip('/')]=f'https://{urlparse(u).netloc}{p}'
    if 'contact' not in L: L['contact']=f'https://{urlparse(u).netloc}/contact'
    if r['authors'] and r['authors'][0].get('url'): L['authorpage']=urljoin(u,r['authors'][0]['url'])
    for k,v in list(L.items())[:7]:
        c2,h2=curl(v)
        if c2!='200': continue
        for e in emails(h2): r['emails'].setdefault(e,k+' page')
        if k in('submit','contact','write for us','advertis') and '<form' in h2.lower(): r['forms'].append({'kind':k,'url':v})
        _,li2=links(h2,v)
        for x in li2:
            if x not in r['linkedin']: r['linkedin'].append(x)
    r['linkedin']=r['linkedin'][:5]
    return r
tasks=json.load(open('urls.json'))
with cf.ThreadPoolExecutor(6) as ex: res=list(ex.map(work,tasks))
json.dump(res,open('enrich1.json','w'),indent=1,ensure_ascii=False)
ok=sum(1 for r in res if r['emails']); print('tasks',len(res),'with email',ok,'with author',sum(1 for r in res if r['authors']),'unreached',sum(1 for r in res if not r['status'].startswith('200')))
for r in res: print(r['task_key'],r['status'],r['domain'],'|',[a['name'] for a in r['authors']][:2],'|',list(r['emails'])[:3],'|forms',len(r['forms']),'|li',len(r['linkedin']))
