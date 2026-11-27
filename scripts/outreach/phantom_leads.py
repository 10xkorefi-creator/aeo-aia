"""Build the lead sheet the PhantomBuster "LinkedIn Outreach" Phantom reads: one row per person.
Columns are filled into the locked message templates (see docs/agents/outreach-agent.md).
Left out: "Likely" matches and the three poor targets."""
import json,subprocess,re,csv,sys,collections
SKIP_SITES={'trulyinvoice.com','finifi.io','credfloat.in'}
d=json.loads(subprocess.run(['curl','-s','https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?select=task_key,sort,contact&kind=eq.Outreach&order=sort','-H','apikey: dummy','-H','Authorization: Bearer dummy'],capture_output=True).stdout)
by=collections.OrderedDict()
for x in d:
    c=x.get('contact') or {}
    if c.get('linkedin_url'): by.setdefault(c['linkedin_url'],[]).append(x)
rows=[];skipped=[]
for url,ts in by.items():
    c=ts[0]['contact']
    if (c.get('linkedin_confidence') or '').startswith('Likely') or c.get('site') in SKIP_SITES or c.get('li_stage') not in (None,'Message drafted'):
        skipped.append((c.get('site'),c.get('linkedin_confidence'))); continue
    lines=c['li_message'].split('\n'); intro=lines[2]
    rows.append(dict(profileUrl=url,greetName=re.match(r'Hi (.+),$',lines[0]).group(1),introLine=intro,
        askLine='a spot on your list' if 'list while' in intro else 'a mention in it',
        pieceWord='entry' if 'list while' in intro else 'paragraph',
        articleTitle=re.search(r'"(.+)"',intro).group(1),site=c.get('site'),taskKeys=' '.join(t['task_key'] for t in ts)))
w=csv.DictWriter(open(sys.argv[1],'w',newline=''),fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print(len(rows),'rows; skipped',len(skipped)); [print('  skip',s) for s in skipped]
