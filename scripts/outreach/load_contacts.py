import json,subprocess,sys
c=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'contacts.json')); ok=0
for k,v in c.items():
    r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','PATCH',f'https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?task_key=eq.{k}','-H','apikey: dummy','-H','Authorization: Bearer dummy','-H','Content-Type: application/json','-d',json.dumps({'contact':v})],capture_output=True)
    ok+= r.stdout.decode()=='204'
print('updated',ok,'of',len(c))
