"""Fill the locked LinkedIn sequence (locked by the user, 27 Nov 2026) into every outreach task that has a LinkedIn profile.
The wording lives in docs/agents/outreach-agent.md; keep the two in step. [sender] is filled by the agent at send time."""
import json,subprocess,re,collections
BASE='https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks'
H=['-H','apikey: dummy','-H','Authorization: Bearer dummy']
FIRST='''Hi {name},

I came across your "{title}" list while researching our space, and it's one of the more useful roundups out there.
I'm [sender] from AI Accountant. We automate bookkeeping for businesses on Tally, and we'd love a spot on your list.

I think it works well for both of us: your readers get one of the best AI tools in Indian accounting, already used by 500+ businesses, and you get a link to your site from one of our articles on aiaccountant.com (DR 53). I'll write the entry for you too, so it's a two-minute job.

If someone else handles the blog, I'm happy to reach out to them instead.
Would you be up for it?'''
FIRST_ART=FIRST.replace('your "{title}" list while','your article "{title}" while').replace('useful roundups','useful pieces').replace("we'd love a spot on your list","we'd love a mention in it").replace("write the entry","write the paragraph")
def is_list(title,site):
    if ' vs ' in title.lower() or site=='credfloat.in': return False
    return bool(re.search(r'\b(best|top|compared?|picks|alternatives?|must have|tools)\b|\d+\s',title,re.I))
FOLLOW='''Hey {name},
I'd dropped you a note a few days back about "{title}", in case it got lost in the inbox.
We'd love for AI Accountant to be part of it someday, and we'd be glad to link back to you from our blog in return.
No pressure at all. Happy to share more if it sounds interesting.'''
def clean(t):
    t=re.sub(r'\s+[|–—-]\s+[^|–—]{2,30}$','',t or '').strip()
    t=re.sub(r'\s+[\u00b7:]\s+[^\u00b7:]{2,30}$','',t).strip()
    return t.strip(' "?')
def firstname(n):
    n=re.sub(r'^(CA|CS|Dr\.?)\s+','',n or '').strip(); f=n.split(' ')[0]
    return f if f and f.isalpha() and f.lower() not in ('director','team','admin','editor') and '(' not in n and len(f)>1 else None
d=json.loads(subprocess.run(['curl','-s',BASE+'?select=task_key,sort,body,contact&kind=eq.Outreach&order=sort']+H,capture_output=True).stdout)
by=collections.defaultdict(list)
for x in d:
    if (x.get('contact') or {}).get('linkedin_url'): by[x['contact']['linkedin_url']].append(x)
n=0; out=[]
for url,ts in by.items():
    c=ts[0]['contact']; name=firstname(c.get('linkedin_name')) or 'there'
    title=clean(ts[0]['body']['model'][0].get('title')) or 'best tools'
    msg=(FIRST if is_list(title,c.get('site') or '') else FIRST_ART).format(name=name,title=title); fu=FOLLOW.format(name=name,title=title)
    for t in ts:
        cc=t['contact']; cc.update(li_message=msg,li_followup=fu,li_group=len(ts)); cc.setdefault('li_stage','Message drafted')
        r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','PATCH',f"{BASE}?task_key=eq.{t['task_key']}"]+H+['-H','Content-Type: application/json','-d',json.dumps({'contact':cc})],capture_output=True,text=True)
        assert r.stdout.startswith('2'),(t['task_key'],r.stdout); n+=1
    out.append(('LIST' if is_list(title,c.get('site') or '') else 'ARTICLE',name,title,c.get('site')))
print('people',len(by),'tasks',n)
for o in out: print(o)
