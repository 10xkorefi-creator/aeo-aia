#!/usr/bin/env python3
"""Experiment runner: asks every pending row of an experiment in its engine and stores the raw answer.
  google_aio -> cloro.google.serp.organic   (Google India, desktop, AI Overview included; same request as the baseline runs)
  gemini     -> cloro.ai-search.gemini.scrape (live Gemini interface, India, the keyword used as the prompt, unchanged)
Usage: exp_gemini_aio.py <experiment_id> [workers]
Rows live in Supabase table aeo_experiment_captures. No secrets here: treg CLI holds its login; Supabase goes through the session proxy."""
import json, subprocess, sys, time, urllib.request, urllib.error, urllib.parse
from concurrent.futures import ThreadPoolExecutor

EXP = sys.argv[1]
WORKERS = int(sys.argv[2]) if len(sys.argv) > 2 else 4
B = 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_experiment_captures'
H = {'apikey': 'dummy', 'Authorization': 'Bearer dummy', 'Content-Type': 'application/json'}

def rest(method, qs, body=None, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(B + '?' + qs, data=json.dumps(body).encode() if body is not None else None, headers={**H, 'Prefer': 'return=minimal'}, method=method)
            t = urllib.request.urlopen(req, timeout=90).read().decode()
            return json.loads(t) if t else None
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if i == tries - 1: raise RuntimeError(f'{method} HTTP {e.code}: {msg}')
        except Exception:
            if i == tries - 1: raise
        time.sleep(2 * (i + 1))

def treg(endpoint, data, timeout):
    try:
        p = subprocess.run(['treg', 'call', endpoint, '--method', 'POST', '--data', json.dumps(data)], capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, 'request timed out'
    try: body = json.loads(p.stdout) if p.stdout.strip() else None
    except Exception: body = None
    if p.returncode != 0 or body is None or body.get('success') is False or not body.get('result'):
        return body, ('exit %s: %s %s' % (p.returncode, p.stderr.strip()[:300], p.stdout.strip()[:300])).strip()
    return body, None

def work(row):
    if row['engine'] == 'gemini':
        body, err = treg('cloro.ai-search.gemini.scrape', {'prompt': row['keyword'], 'country': 'IN', 'include': {'markdown': True}}, 240)
        text = ((body or {}).get('result') or {}).get('text')
    else:
        body, err = treg('cloro.google.serp.organic', {'query': row['keyword'], 'gl': 'IN', 'hl': 'en', 'device': 'desktop', 'pages': 1, 'include': {'aioverview': True}}, 150)
        text = (((body or {}).get('result') or {}).get('aioverview') or {}).get('text')
    if err:
        rest('PATCH', f"id=eq.{row['id']}", {'attempts': row['attempts'] + 1, 'last_error': err[:1500]})
        return 'retry' if '429' in err or 'timed out' in err or 'money_admission' in err else 'error'
    rest('PATCH', f"id=eq.{row['id']}", {'status': 'ok', 'attempts': row['attempts'] + 1, 'last_error': None, 'raw': body, 'answer_text': text,
                                        'captured_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})
    return 'ok'

for rnd in range(1, 5):
    rows = rest('GET', f"experiment_id=eq.{urllib.parse.quote(EXP)}&status=eq.pending&attempts=lt.4&select=id,engine,keyword,attempts&order=keyword_id,engine")
    if not rows: break
    print(f'round {rnd}: {len(rows)} pending', flush=True)
    res = {}
    with ThreadPoolExecutor(WORKERS) as ex:
        for i, r in enumerate(ex.map(work, rows), 1):
            res[r] = res.get(r, 0) + 1
            if i % 20 == 0: print(f'  {i}/{len(rows)} {res}', flush=True)
    print(f'round {rnd} done: {res}', flush=True)
    time.sleep(20)
left = rest('GET', f"experiment_id=eq.{urllib.parse.quote(EXP)}&status=eq.pending&select=id")
print('finished; still pending:', len(left or []), flush=True)
