#!/usr/bin/env python3
"""Run inside an empty working folder. Finds active Outreach tasks with no contact, reuses a known contact for the same
site where there is one (saved straight away), and writes urls.json for the rest so enrich.py can look them up."""
import json, subprocess
from urllib.parse import urlparse
r = subprocess.run(['curl', '-s', 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?select=task_key,title,priority,body,contact,is_active&kind=eq.Outreach',
                    '-H', 'apikey: dummy', '-H', 'Authorization: Bearer dummy'], capture_output=True)
d = json.loads(r.stdout)
known = {}
for x in d:
    c = x.get('contact')
    if c and c.get('status') == 'Ready': known.setdefault(c['site'], c)
todo, reuse = [], {}
for x in d:
    if not x['is_active'] or x['contact']: continue
    u = x['body']['model'][0]['url']; site = urlparse(u).netloc.replace('www.', '')
    if site in known:
        c = dict(known[site]); c['page'] = u; c['note'] = 'Contact carried over from another page on the same site.'; reuse[x['task_key']] = c
    else: todo.append((x['task_key'], x['priority'], x['title'][:70], u))
json.dump(reuse, open('reuse.json', 'w'), ensure_ascii=False); json.dump(todo, open('urls.json', 'w'))
print('reuse', len(reuse), 'to look up', len(todo))
