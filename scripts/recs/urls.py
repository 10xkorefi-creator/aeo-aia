# which cited pages to read: sources an assistant used consistently for a question in the latest run
import json, collections as C
L = lambda f: json.load(open('data/%s.json' % f))
RUN = [r['run_id'] for r in json.load(open('data/runs.json')) if r['status'] == 'complete' and r['run_type'] in ('scheduled', 'manual')][-1]
runs = {r['run_id']: r for r in L('runs')}
prompts = {p['prompt_key']: p for p in L('prompts') if p['list_version'] == runs[RUN]['prompt_list_version']}
kws = {k['keyword_id']: k for k in L('keywords') if k['list_version'] == runs[RUN]['keyword_list_version']}
km = {k['keyword_id']: k for k in L('kw_metrics') if k['run_id'] == RUN}
st = C.defaultdict(set)
for c in L('asst_cites'):
    if c['run_id'] == RUN and prompts[c['prompt_key']]['prompt_group'] != 'own_brand': st[(c['engine'], c['prompt_key'], c['url'])].add(c['capture_id'])
eng = C.defaultdict(set)
for (e, p, u) in st: eng[(p, u)].add(e)
urls = set()
for (e, p, u), v in st.items():
    if len(v) >= 2 or e == 'gemini' or len(eng[(p, u)]) >= 2: urls.add(u)
ks = C.defaultdict(set)
for c in L('aio_cites'):
    if c['run_id'] == RUN and kws[c['keyword_id']]['segment'] == 'buyer': ks[(c['keyword_id'], c['url'])].add(c['capture_id'])
for (k, u), v in ks.items():
    if len(v) * 2 >= km[k]['aio_samples'] and len(v) >= 2: urls.add(u)
open('urls.txt', 'w').write('\n'.join(sorted(urls)))
print(len(urls))
