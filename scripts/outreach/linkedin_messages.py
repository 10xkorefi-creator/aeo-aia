import json,subprocess,re,collections
r=subprocess.run(['curl','-s','https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?select=task_key,priority,sort,body,contact&is_active=eq.true&kind=eq.Outreach&order=sort','-H','apikey: dummy','-H','Authorization: Bearer dummy'],capture_output=True); d=json.loads(r.stdout)
ENTRY_IN="AI Accountant (aiaccountant.com): accounting automation that works on top of Tally. It reads bank statements and purchase bills, suggests the ledger, matches payments to bills, reconciles GSTR-2B, and posts to Tally only after a person approves."
ENTRY_GL="AI Accountant (aiaccountant.com): accounting automation for businesses in India that keep their books in Tally. It reads bank statements and purchase bills, suggests the ledger, reconciles GST returns, and posts to Tally only after a person approves."
def clean(t):
    t=re.sub(r'\s*[\|–—-]\s*[^|–—-]{2,30}$','',t).strip() if len(t)>60 else t
    return t.strip(' "')
def firstname(n):
    n=re.sub(r'^(CA|CS|Dr\.?)\s+','',n or '').strip(); f=n.split(' ')[0]
    return f if f and f[0].isalpha() and '(' not in n and len(f)>1 else None
by=collections.defaultdict(list)
for x in d:
    if x['contact'].get('linkedin_url'): by[x['contact']['linkedin_url']].append(x)
n=0; samples=[]
for url,ts in by.items():
    c=ts[0]['contact']; rel=c.get('relationship') or 'Author'; fn=firstname(c.get('linkedin_name')); site=c.get('site')
    titles=[clean(t['body']['model'][0].get('title') or 'your article') for t in ts]
    note=ts[0]['body']['model'][0].get('note',''); m=re.search(r'Names ([^.]+)\.',note); tools=m.group(1) if m else None
    indian = site.endswith('.in') or any(re.search(r'india|tally|\bCAs?\b|gst',t,re.I) for t in titles)
    hi=f"Hi {fn}," if fn else "Hello,"
    if len(titles)==1: ref=f"\"{titles[0]}\""
    else: ref="these pages on "+site+": "+"; ".join(f"\"{t}\"" for t in titles)
    if rel in('Author','Owner and author','Marketing or content, and author'): open_=f"thanks for connecting. I read your piece {ref}." if len(titles)==1 else f"thanks for connecting. I read {ref}."
    elif rel=='Owner or founder': open_=f"thanks for connecting. I'm writing to you because you run {site}, and I've been reading {ref}." if len(titles)==1 else f"thanks for connecting. I'm writing to you because you run {site}, and I've been reading {ref}."
    elif rel in('Marketing or content','Editor'): open_=f"thanks for connecting. I'm getting in touch about {ref} on {site}."
    else: open_=f"thanks for connecting. I'm getting in touch about {ref}."
    covers=f" It covers {tools}." if tools and len(titles)==1 else ""
    gap=("I work on AI Accountant, which automates bookkeeping on top of Tally for Indian businesses and CA firms. It isn't on the list, and I think your readers who run Tally would want to know about it." if indian
         else "I work on AI Accountant, which automates bookkeeping for businesses in India that run on Tally. The list has no option for that group yet.")
    ask={'Author':"Would you be open to adding it? Here is an entry you could paste in:",'Owner and author':"Would you be open to adding it? Here is an entry you could paste in:",'Marketing or content, and author':"Would you be open to adding it? Here is an entry you could paste in:",
         'Owner or founder':"Could you add it, or point me to whoever edits the page? Here is an entry that could go straight in:",'Marketing or content':"Could it be added in the next update, or could you point me to the right person? Here is a ready entry:",'Editor':"Could it be added as an update to the article? Here is a ready entry:"}.get(rel,"Would you consider adding it? Here is a ready entry:")
    msg=f"{hi} {open_}{covers}\n\n{gap}\n\n{ask}\n\n{ENTRY_IN if indian else ENTRY_GL}\n\nI can send screenshots, customer stories or set up a demo if that helps. Thanks either way for the work on the page.\n\n[sender's first name]"
    fu=f"{hi} just checking you saw my note about adding AI Accountant to {('the page' if len(titles)==1 else 'those pages')}. If it isn't a fit, no problem at all; a one-word reply is enough and I won't follow up again.\n\n[sender's first name]"
    for t in ts:
        cc=t['contact']; cc.update(li_message=msg,li_followup=fu,li_stage='Message drafted',li_group=len(ts))
        subprocess.run(['curl','-s','-o','/dev/null','-X','PATCH',f"https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?task_key=eq.{t['task_key']}",'-H','apikey: dummy','-H','Authorization: Bearer dummy','-H','Content-Type: application/json','-d',json.dumps({'contact':cc})]); n+=1
    samples.append((rel,site,len(msg),msg))
print('people',len(by),'tasks',n,'max len',max(s[2] for s in samples))
for s in samples[:1]+[x for x in samples if x[0]=='Owner or founder'][:1]: print('-----',s[0],s[1]); print(s[3])
