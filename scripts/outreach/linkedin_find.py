import json,subprocess,re,concurrent.futures as cf
def search(q):
    p=subprocess.run(['treg','call','serper.web.search','--method','POST','--data',json.dumps({'q':q,'gl':'in'})],capture_output=True,text=True,timeout=90)
    try: j=json.loads(p.stdout)
    except Exception: return []
    j=j.get('result',j) if isinstance(j,dict) else {}
    return [(o.get('link',''),o.get('title',''),o.get('snippet','')) for o in j.get('organic',[])]
d=json.load(open('tasks.json'))
NOTP=re.compile(r'team|editor|admin|pvt|ltd|software|suite|reports|ventures|^recoup$|infoghar|classes|sir$|_',re.I)
keys={}
for x in d:
    c=x['contact'] or {}; site=c.get('site') or re.sub(r'^www\.','',re.findall(r'//([^/]+)',x['body']['model'][0]['url'])[0])
    name=(c.get('name') or '').strip(); name=re.sub(r'^(CA|CS|Dr\.?)\s+','',name)
    person = bool(name) and not NOTP.search(name) and len(name.split())>=2
    brand=site.split('.')[0] if not site.startswith('blogs.') else site.split('.')[1]
    keys.setdefault((site,name if person else ''),[]).append(x['task_key'])
def work(k):
    site,name=k; brand=site.split('.')[0] if not site.startswith('blogs.') else site.split('.')[1]
    out={'site':site,'name':name,'tasks':keys[k],'q':[],'hits':[]}
    qs=[f'"{name}" "{brand}" site:linkedin.com/in', f'"{name}" {site} linkedin'] if name else [f'"{site}" (founder OR "co-founder" OR editor OR owner) site:linkedin.com/in', f'"{brand}" site:linkedin.com/company']
    for q in qs:
        r=search(q); out['q'].append(q)
        for link,title,snip in r[:6]:
            if 'linkedin.com/' in link: out['hits'].append({'q':qs.index(q),'link':link.split('?')[0],'title':title,'snippet':snip[:220]})
    return out
with cf.ThreadPoolExecutor(5) as ex: res=list(ex.map(work,list(keys)))
json.dump(res,open('found.json','w'),indent=1,ensure_ascii=False)
print('keys',len(res),'calls',sum(len(r['q']) for r in res))
for r in res:
    print('##',r['site'],'|',r['name'] or '-','|',len(r['tasks']))
    for h in r['hits'][:5]: print('   ',h['q'],h['link'],'|',h['title'][:70],'|',h['snippet'][:110].replace('\n',' '))
