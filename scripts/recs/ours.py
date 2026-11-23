#!/usr/bin/env python3
"""Our own pages: every URL in the sitemap with its title, plus 90 days of Search Console clicks and the searches each
page ranks for. build.py uses it to decide between a new page and an update, and how carefully to update.
Run inside the working folder. Writes ours.json."""
import json, re, subprocess, html, datetime, urllib.parse
from concurrent.futures import ThreadPoolExecutor
SITE = 'sc-domain:aiaccountant.com'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
def norm(u):
    p = urllib.parse.urlparse(u.split('#')[0]); return (p.netloc.lower().replace('www.', '') + p.path.rstrip('/')).lower()
def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
def gsc(body):
    for _ in range(3):
        r = subprocess.run(['treg', 'call', 'google-search-console.performance', '--method', 'POST', '--query', 'siteUrl=' + SITE, '--data', json.dumps(body)], capture_output=True, text=True)
        try: return json.loads(r.stdout).get('rows', [])
        except Exception: err = (r.stdout + r.stderr)[:300]
    raise SystemExit('Search Console pull failed: ' + err)
end = datetime.date.today() - datetime.timedelta(days=3); start = end - datetime.timedelta(days=89)
win = {'startDate': str(start), 'endDate': str(end)}
pages = {}
for r in gsc({**win, 'dimensions': ['page'], 'rowLimit': 25000}):
    k = norm(r['keys'][0]); p = pages.setdefault(k, {'clicks': 0, 'impressions': 0, 'queries': {}})
    p['clicks'] += r['clicks']; p['impressions'] += r['impressions']
off = 0
while True:
    rows = gsc({**win, 'dimensions': ['page', 'query'], 'rowLimit': 25000, 'startRow': off})
    for r in rows:
        k = norm(r['keys'][0]); q = pages.setdefault(k, {'clicks': 0, 'impressions': 0, 'queries': {}})['queries'].setdefault(r['keys'][1], [0, 0, 0.0])
        q[2] = (q[2] * q[1] + r['position'] * r['impressions']) / max(1, q[1] + r['impressions']); q[0] += r['clicks']; q[1] += r['impressions']
    if len(rows) < 25000: break
    off += 25000
sm = subprocess.run(['curl', '-sS', '-m', '40', '-A', UA, 'https://www.aiaccountant.com/sitemap.xml'], capture_output=True, text=True).stdout
urls = sorted(set(re.findall(r'<loc>([^<]+)</loc>', sm)))
def head(u):
    raw = subprocess.run(['curl', '-sS', '-L', '--compressed', '-m', '30', '-A', UA, u], capture_output=True, text=True).stdout
    return u, clean((re.search(r'(?is)<title[^>]*>(.*?)</title>', raw) or [None, ''])[1])[:200], clean((re.search(r'(?is)<h1[^>]*>(.*?)</h1>', raw) or [None, ''])[1])[:200]
out = {}
with ThreadPoolExecutor(12) as ex:
    for u, title, h1 in ex.map(head, urls):
        k = norm(u); g = pages.get(k, {'clicks': 0, 'impressions': 0, 'queries': {}})
        qs = sorted(g['queries'].items(), key=lambda kv: (-kv[1][0], -kv[1][1]))[:25]
        out[k] = {'url': u, 'title': title, 'h1': h1, 'clicks': g['clicks'], 'impressions': g['impressions'], 'queries': [[q, v[0], v[1], round(v[2], 1)] for q, v in qs]}
json.dump({'from': str(start), 'to': str(end), 'pages': out}, open('ours.json', 'w'), ensure_ascii=False)
print('sitemap', len(urls), 'with clicks', sum(1 for p in out.values() if p['clicks']), 'window', start, end, 'total clicks', sum(p['clicks'] for p in out.values()))
