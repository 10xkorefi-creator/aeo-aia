import json, os, subprocess, sys, urllib.parse
os.chdir(sys.argv[1]); os.makedirs('data', exist_ok=True)
BASE = 'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/'
def get(table, params, out):
    rows, off = [], 0
    while True:
        qs = urllib.parse.urlencode({**params, 'limit': 1000, 'offset': off})
        r = subprocess.run(['curl', '-sS', BASE + table + '?' + qs, '-H', 'apikey: dummy', '-H', 'Authorization: Bearer dummy'], capture_output=True, text=True)
        try: page = json.loads(r.stdout)
        except Exception: print('ERR', table, r.stdout[:300], r.stderr[:300]); sys.exit(1)
        if isinstance(page, dict): print('ERR', table, page); sys.exit(1)
        rows += page; off += 1000
        if len(page) < 1000: break
    json.dump(rows, open('data/' + out + '.json', 'w'))
    print(out, len(rows))
RUNS = 'in.(R20261117-M1,R20261118-M1,R20261119-M1,R20261121-S1)'
get('aeo_runs', {'select': 'run_id,run_date,run_type,status,prompt_list_version,keyword_list_version,created_at', 'order': 'created_at'}, 'runs')
get('aeo_prompts', {'select': 'list_version,prompt_key,prompt_text,topic,stage,persona,segment,theme,prompt_group,evidence_score', 'order': 'prompt_key'}, 'prompts')
get('aeo_keywords', {'select': 'list_version,keyword_id,keyword,topic,segment,ahrefs_volume_in', 'order': 'keyword_id'}, 'keywords')
get('aeo_competitors', {'select': '*'}, 'competitors')
get('aeo_competitor_patterns', {'select': '*'}, 'patterns')
get('aeo_asst_citations_mv', {'select': 'engine,capture_id,run_id,prompt_key,pos,url,label,domain', 'run_id': RUNS, 'order': 'run_id,engine,capture_id,pos'}, 'asst_cites')
get('aeo_asst_mentions_mv', {'select': 'engine,capture_id,run_id,prompt_key,brand_key,display_name,role,mentioned,cited,prompt_group', 'run_id': RUNS, 'order': 'run_id,engine,capture_id,brand_key'}, 'asst_mentions')
get('aeo_aio_citations_base_mv', {'select': 'capture_id,run_id,keyword_id,url,label,domain', 'run_id': RUNS, 'order': 'run_id,capture_id'}, 'aio_cites')
get('aeo_aio_mentions_base_mv', {'select': 'capture_id,run_id,keyword_id,brand_key,display_name,role,named,cited', 'run_id': RUNS, 'order': 'run_id,capture_id,brand_key'}, 'aio_mentions')
get('aeo_aio_keyword_metrics_mv', {'select': '*', 'run_id': RUNS}, 'kw_metrics')
get('aeo_hubspot_ai_contacts_v', {'select': 'ai_channel,is_internal,attribution_tier,reached_opportunity'}, 'leads')
