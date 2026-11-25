import json,re
res=json.load(open('enrich1.json')); p2=json.load(open('pass2.json'))
JUNK=re.compile(r'company\.com|^you@|@\d+\.\d|^privacy@|pgsupport|rbi\.org|chupurnov|@xglobalgroup\.com$|^support@dev\.to|^partners@dev\.to|founder\.in|startup\.com|firm\.com|yourbusiness|ahmedabad@|bangalore@|chennai@',re.I)
GENERIC=['partnerships','partners','editor','editorial','corrections','hello','contact','info','queries','support','sales']
NOTPERSON=re.compile(r'team|editorial|admin|see more|view full|^mcp$|pvt|ltd|classes|rankings|advisor|systems$|^rebota$|^lekhakar$|trulyinvoice|startupstash|toolstackscout|app advisor|aidukan',re.I)
out={}
for r in res:
    d=r['domain']; em=dict(r['emails']); forms=list(r['forms']); li=list(r['linkedin'])
    if d in p2:
        for e,u in p2[d]['emails'].items(): em.setdefault(e,'contact or about page')
        for f in p2[d]['forms']: forms.append({'kind':'contact','url':f})
        li+= [x for x in p2[d]['linkedin'] if x not in li]
    em={e:s for e,s in em.items() if not JUNK.search(e)}
    authors=[a for a in r['authors'] if not NOTPERSON.search(a['name']) and len(a['name'])>2]
    name=authors[0]['name'] if authors else None
    if name: name=re.sub(r',\s*CPA$','',name)
    author_url=authors[0].get('url') if authors else None
    first=(name or '').split(' ')[0].lower()
    email=None; conf=None
    for e in em:
        if first and len(first)>2 and e.split('@')[0].startswith(first): email=e; conf="Author's own address"; break
    if not email:
        pers=[e for e in em if e.split('@')[0] not in GENERIC and not re.match(r'(queries|info|contact|hello|support|sales)',e) and 'gmail' not in e]
        gen=sorted([e for e in em if e not in pers], key=lambda e: next((i for i,g in enumerate(GENERIC) if e.startswith(g)),50))
        if pers and not name: email=pers[0]; conf='Named person at the site'; name=None
        elif gen: email=gen[0]; conf='Site inbox'
        elif pers: email=pers[0]; conf='Named person at the site'
    others=[e for e in em if e!=email][:3]
    li_person=[x for x in li if '/in/' in x][:2]; li_co=[x for x in li if '/company/' in x and '/jobs' not in x][:1]
    status='Ready' if email else ('Form only' if forms else 'Not found')
    c={'status':status,'name':name,'role':('Author of the page' if name else None),'email':email,'confidence':conf,
       'source':(em.get(email) if email else None),'other_emails':others,'author_page':author_url,
       'linkedin':li_person or li_co,'form':(forms[0]['url'] if forms else None),'site':d,'page':r['url'],
       'method':'Read from the site','checked':'25/11/2026','note':None}
    out[r['task_key']]=c
# manual notes
for k,c in out.items():
    if c['site']=='dev.to': c.update(status='Form only',email=None,confidence=None,other_emails=[],note='Written by a dev.to user (ToolStackScout). Reach them through their dev.to profile or a comment on the post.',form=c['page'])
    if c['site']=='mileseducation.com': c['note']='Large training company; only branch inboxes are published. Needs a marketing contact.'; c.update(status='Not found',email=None,confidence=None)
    if c['site']=='skillopediagroup.com': c['note']='Byline is "umang"; roshni@ is the address the site shows on this page.'
json.dump(out,open('contacts.json','w'),indent=1,ensure_ascii=False)
import collections
print(collections.Counter(c['status'] for c in out.values()), collections.Counter(c['confidence'] for c in out.values()))
for k,c in out.items(): print(k,c['site'],'|',c['status'],'|',c['name'],'|',c['email'],'|',c['confidence'],'|',c['other_emails'][:2])
