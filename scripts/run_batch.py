#!/usr/bin/env python3
"""Fallback runner for an AEO batch: does exactly what the n8n workflow 9jZMztEJIPSHacM7 does
(same Supabase queue functions, same cloro request bodies), but from a shell with the treg CLI logged in.
Usage: run_batch.py [--create "note"] [--gpt-limit N] [--aio-limit N] [--until-done] [--max-minutes M]
No secrets in this file: treg CLI holds its own login; Supabase calls go through the session proxy."""
import json, subprocess, sys, time, re, urllib.request, urllib.error, argparse
from concurrent.futures import ThreadPoolExecutor
B = 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/rpc/'
H = {'apikey': 'dummy', 'Authorization': 'Bearer dummy', 'Content-Type': 'application/json'}
BAL = re.compile(r'insufficient|balance|top.?up|payment required|\b402\b', re.I)

def rpc(fn, body=None, tries=4):
    for i in range(tries):
        try:
            r = urllib.request.urlopen(urllib.request.Request(B + fn, data=json.dumps(body or {}).encode(), headers=H, method='POST'), timeout=90)
            t = r.read().decode(); return json.loads(t) if t else None
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if i == tries - 1: raise RuntimeError(f'{fn} HTTP {e.code}: {msg}')
        except Exception as e:
            if i == tries - 1: raise
        time.sleep(2 * (i + 1))

def treg(endpoint, data=None, query=None, timeout=150):
    cmd = ['treg', 'call', endpoint]
    if data is not None: cmd += ['--method', 'POST', '--data', json.dumps(data)]
    for k, v in (query or {}).items(): cmd += ['--query', f'{k}={v}']
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, 'request timed out'
    out = p.stdout.strip()
    try: body = json.loads(out) if out else None
    except Exception: body = None
    if p.returncode != 0 or body is None:
        return body, ('exit %s: %s %s' % (p.returncode, p.stderr.strip()[:400], out[:400])).strip()
    return body, None

def submit_gpt(c):
    body, err = treg('cloro.ai-search.chatgpt.scrape.task', {'taskType': 'CHATGPT', 'payload': {'prompt': c['prompt_text'], 'country': c['country'], 'include': {'markdown': True}}}, timeout=60)
    task = (body or {}).get('task') or {}
    if not err and task.get('id'): p = {'capture_id': c['capture_id'], 'action': 'submitted', 'task_id': task['id'], 'error': None, 'call_id': None}
    else:
        e = err or ('no task id: ' + json.dumps(body)[:600])
        p = {'capture_id': c['capture_id'], 'action': 'balance' if BAL.search(e) else 'error', 'task_id': None, 'error': e, 'call_id': None}
    rpc('aeo_gpt_apply_json', {'p': p}); return p['action']

def poll_gpt(d):
    body, err = treg('cloro.ai-search.task.status', query={'taskId': d['task_id']}, timeout=60)
    st = ((body or {}).get('task') or {}).get('status')
    p = {'capture_id': d['capture_id'], 'action': 'still_running', 'error': None, 'raw': None, 'credits': None}
    if st == 'COMPLETED':
        p.update(action='completed', raw=body, credits=((body.get('credits') or {}).get('creditsCharged')))
    elif st == 'FAILED':
        p.update(action='error', error='task FAILED', raw=body)
    elif err and re.search(r'not_owned|not_found|not found|\b404\b', err, re.I):
        p.update(action='error', error=err[:500])
    rpc('aeo_gpt_apply_json', {'p': p}); return p['action']

def run_aio(c):
    body, err = treg('cloro.google.serp.organic', {'query': c['keyword'], 'gl': c['country'], 'hl': 'en', 'device': 'desktop', 'pages': 1, 'include': {'aioverview': True}}, timeout=150)
    p = {'capture_id': c['capture_id'], 'action': 'error', 'error': None, 'raw': None, 'credits': None, 'call_id': None}
    if not err and body and body.get('success') is not False and body.get('result'): p.update(action='completed', raw=body)
    else:
        e = err or ('bad body: ' + json.dumps(body)[:800]); p.update(action='balance' if BAL.search(e) else 'error', error=e)
    rpc('aeo_aio_apply_json', {'p': p}); return p['action']

def count(xs):
    d = {}
    for x in xs: d[x] = d.get(x, 0) + 1
    return d

ap = argparse.ArgumentParser(); ap.add_argument('--create'); ap.add_argument('--gpt-limit', type=int, default=60); ap.add_argument('--aio-limit', type=int, default=48)
ap.add_argument('--until-done', action='store_true'); ap.add_argument('--max-minutes', type=float, default=100); ap.add_argument('--once-claim', action='store_true')
a = ap.parse_args()
if a.create:
    print('created run', rpc('aeo_create_run', {'p_run_type': 'manual', 'p_triggered_by': a.create}), flush=True)
t0 = time.time(); first = True; balance_hits = 0
with ThreadPoolExecutor(8) as ex:
    while True:
        res = {}
        if first or not a.once_claim:
            g = rpc('aeo_claim_gpt', {'p_limit': a.gpt_limit}) or []
            if g: res['gpt_submit'] = count(ex.map(submit_gpt, g))
            k = rpc('aeo_claim_aio', {'p_limit': a.aio_limit}) or []
            if k: res['aio'] = count(ex.map(run_aio, k))
        first = False
        d = rpc('aeo_gpt_due_polls', {'p_limit': 300}) or []
        if d: res['gpt_poll'] = count(ex.map(poll_gpt, d))
        hk = rpc('aeo_housekeeping') or []
        print(time.strftime('%H:%M:%S'), json.dumps(res), 'open runs:', json.dumps([{x: r[x] for x in ('run_id', 'open', 'failed', 'gpt', 'aio')} for r in hk]), flush=True)
        balance_hits += sum(v.get('balance', 0) for v in res.values())
        if balance_hits > 20: print('STOP: treg balance errors'); break
        if not hk: print('DONE: no running runs'); break
        if a.once_claim and all(not (r.get('gpt') or {}).get('submitted') and not (r.get('gpt') or {}).get('claimed') and not (r.get('aio') or {}).get('claimed') for r in hk): print('DONE: smoke batch finished'); break
        if not a.until_done and not a.once_claim: break
        if time.time() - t0 > a.max_minutes * 60: print('STOP: time limit'); break
        time.sleep(15)
