#!/usr/bin/env python3
"""Side experiment: ask a handful of prompts on ChatGPT, Gemini and Perplexity, outside the tracked list and outside the dashboard.
Uses the same requests as the baseline runs. Rows go to aeo_prompt_experiments under their own experiment id; the dashboard does not read that table.
Usage: exp_prompts.py <experiment_id> <prompts.json> [answers_per_prompt]     prompts.json = [{"id": "H01", "prompt": "..."}]
No secrets here: the treg CLI holds its own login; Supabase goes through the session proxy."""
import json, subprocess, sys, time, urllib.request, urllib.error, urllib.parse
from concurrent.futures import ThreadPoolExecutor
EXP, PROMPTS, N = sys.argv[1], json.load(open(sys.argv[2])), int(sys.argv[3]) if len(sys.argv) > 3 else 2
B = 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_prompt_experiments'
H = {'apikey': 'dummy', 'Authorization': 'Bearer dummy', 'Content-Type': 'application/json'}
def rest(method, qs, body=None, prefer='return=minimal'):
    for i in range(4):
        try:
            req = urllib.request.Request(B + ('?' + qs if qs else ''), data=json.dumps(body).encode() if body is not None else None, headers={**H, 'Prefer': prefer}, method=method)
            t = urllib.request.urlopen(req, timeout=90).read().decode(); return json.loads(t) if t else None
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if i == 3: raise RuntimeError('%s HTTP %s: %s' % (method, e.code, msg))
        except Exception:
            if i == 3: raise
        time.sleep(2 * (i + 1))
def treg(endpoint, data=None, query=None, timeout=240):
    cmd = ['treg', 'call', endpoint]
    if data is not None: cmd += ['--method', 'POST', '--data', json.dumps(data)]
    for k, v in (query or {}).items(): cmd += ['--query', '%s=%s' % (k, v)]
    try: p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired: return None, 'timed out'
    try: return json.loads(p.stdout), None
    except Exception: return None, (p.stderr + p.stdout)[:400]
def ask(row):
    e, prompt = row['engine'], row['prompt']
    if e == 'chatgpt':
        body, err = treg('cloro.ai-search.chatgpt.scrape.task', {'taskType': 'CHATGPT', 'payload': {'prompt': prompt, 'country': 'IN', 'include': {'markdown': True}}}, timeout=60)
        tid = ((body or {}).get('task') or {}).get('id')
        if not tid: return row, None, None, err or json.dumps(body)[:300]
        for _ in range(60):
            time.sleep(10)
            body, err = treg('cloro.ai-search.task.status', query={'taskId': tid}, timeout=60)
            st = ((body or {}).get('task') or {}).get('status')
            if st == 'COMPLETED':
                res = body.get('response') or {}
                return row, body, res.get('markdown') or res.get('text'), None
            if st == 'FAILED': return row, body, None, 'task FAILED'
        return row, None, None, 'still running after 10 minutes'
    if e == 'gemini':
        body, err = treg('cloro.ai-search.gemini.scrape', {'prompt': prompt, 'country': 'IN', 'include': {'markdown': True}})
        res = (body or {}).get('result') or {}
        return row, body, res.get('markdown') or res.get('text'), err if not res else None
    body, err = treg('dataforseo.x.ai-optimization-perplexity-llm-responses-live', [{'user_prompt': prompt, 'model_name': 'sonar', 'web_search': True, 'web_search_country_iso_code': 'IN'}])
    try: text = ' '.join(s.get('text') or '' for it in body['tasks'][0]['result'][0]['items'] for s in it.get('sections') or [])
    except Exception: text = None
    return row, body, text, None if text else (err or json.dumps(body)[:300])

have = rest('GET', 'experiment_id=eq.%s&select=id,engine,prompt_id,sample_no,prompt,status,attempts' % urllib.parse.quote(EXP), prefer='') or []
if not have:
    rows = [{'experiment_id': EXP, 'engine': e, 'prompt_id': p['id'], 'sample_no': n, 'prompt': p['prompt']}
            for p in PROMPTS for e in ('chatgpt', 'gemini', 'perplexity') for n in range(1, N + 1)]
    rest('POST', '', rows)
    have = rest('GET', 'experiment_id=eq.%s&select=id,engine,prompt_id,sample_no,prompt,status,attempts' % urllib.parse.quote(EXP), prefer='')
todo = [r for r in have if r['status'] != 'ok' and r['attempts'] < 3]
print('rows', len(have), 'to ask', len(todo), flush=True)
out = {}
with ThreadPoolExecutor(6) as ex:
    for row, body, text, err in ex.map(ask, todo):
        ok = bool(text) and not err
        rest('PATCH', 'id=eq.%s' % row['id'], {'status': 'ok' if ok else 'pending', 'attempts': row['attempts'] + 1, 'last_error': None if ok else (err or 'empty answer')[:1500], 'raw': body if ok else None,
                                              'answer_text': text if ok else None, 'captured_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()) if ok else None})
        out[(row['engine'], ok)] = out.get((row['engine'], ok), 0) + 1
        print(row['engine'], row['prompt_id'], row['sample_no'], 'ok' if ok else 'FAILED: ' + str(err)[:120], flush=True)
print('done', out)
