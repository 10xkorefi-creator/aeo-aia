#!/usr/bin/env python3
"""Loads tasks.json and questions.json (from build.py) into Supabase. People already assigned to a task stay assigned."""
import json, subprocess, sys
W = sys.argv[1].rstrip('/')
URL = 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/rpc/aeo_recs_apply_json'
def call(payload):
    open(W + '/_load.json', 'w').write(json.dumps({'p': payload}))
    r = subprocess.run(['curl', '-sS', '-X', 'POST', URL, '-H', 'apikey: dummy', '-H', 'Authorization: Bearer dummy', '-H', 'Content-Type: application/json', '--data-binary', '@' + W + '/_load.json'], capture_output=True, text=True)
    print(r.stdout[:200] or r.stderr[:200])
    if '"tasks"' not in r.stdout: sys.exit(1)
T = json.load(open(W + '/tasks.json')); Q = json.load(open(W + '/questions.json')); run = json.load(open(W + '/meta.json'))['run']
if len(T) < 20:
    sys.exit(f'Refusing to load: only {len(T)} tasks were built for {run}. The run data is probably not refreshed (run select public.aeo_refresh_dashboard()).')
for i in range(0, len(Q), 40): call({'run': run, 'tasks': [], 'questions': Q[i:i + 40]})
for i in range(0, len(T), 80): call({'run': run, 'tasks': T[i:i + 80]})
call({'run': run, 'tasks': [], 'keys': [t['task_key'] for t in T]})   # switches off tasks this build no longer produces
