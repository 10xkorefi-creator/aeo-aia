"""Record LinkedIn outreach progress for one person on every task that shares their profile.
usage: set_stage.py <linkedin_url> <stage> [--at ISO_DATE] [--reply "text"]
stage: Left out | Message drafted | Request sent | Connected | Message sent | Followed up | Replied | Listed | Declined | No response
Stages only move forward (a later sync never undoes Replied), and each step keeps the first date it was seen."""
import json,subprocess,sys,argparse,datetime,urllib.parse
ORDER=['Message drafted','Left out','Request sent','Connected','Message sent','Followed up','No response','Declined','Replied','Listed']
KEY={'Request sent':'requested_at','Connected':'connected_at','Message sent':'messaged_at','Followed up':'followed_up_at','Replied':'replied_at'}
BASE='https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks'; H=['-H','apikey: dummy','-H','Authorization: Bearer dummy']
def norm(u): return u.split('?')[0].rstrip('/').split('/in/')[-1].lower()
a=argparse.ArgumentParser(); a.add_argument('url'); a.add_argument('stage',choices=ORDER); a.add_argument('--at'); a.add_argument('--reply'); a.add_argument('--sender',default='Wasif'); x=a.parse_args()
now=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'); at=x.at or now
d=json.loads(subprocess.run(['curl','-s',BASE+'?select=task_key,contact&kind=eq.Outreach&contact->>linkedin_url=not.is.null']+H,capture_output=True).stdout)
hit=[t for t in d if norm(t['contact']['linkedin_url'])==norm(x.url)]
if not hit: sys.exit('no task has this profile: '+x.url)
for t in hit:
    c=t['contact']; log=c.get('li_log') or {}; cur=c.get('li_stage') or 'Message drafted'
    if x.stage in KEY: log.setdefault(KEY[x.stage],at)
    # a later step implies the earlier ones happened; fill any that were never seen with the same date
    if x.stage in KEY:
        steps=list(KEY.values()); upto=steps.index(KEY[x.stage])
        for k in steps[:upto]:
            if k!='followed_up_at': log.setdefault(k,at)
    if ORDER.index(x.stage)>=ORDER.index(cur): c['li_stage']=x.stage
    if x.reply: c['li_reply']=x.reply[:2000]
    c.update(li_log=log,li_sender=x.sender,li_synced=now)
    r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','PATCH',f"{BASE}?task_key=eq.{t['task_key']}"]+H+['-H','Content-Type: application/json','-d',json.dumps({'contact':c})],capture_output=True,text=True)
    print(t['task_key'],c['li_stage'],r.stdout)
