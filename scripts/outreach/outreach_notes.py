import json,subprocess,re,collections
r=subprocess.run(['curl','-s','https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?select=task_key,priority,body,contact&is_active=eq.true&kind=eq.Outreach','-H','apikey: dummy','-H','Authorization: Bearer dummy'],capture_output=True); d=json.loads(r.stdout)
per_site=collections.Counter(x['contact'].get('site') for x in d)
def rel(c):
    conf=(c.get('linkedin_confidence') or '').lower(); role=(c.get('linkedin_role') or '').lower()
    if not c.get('linkedin_url'): return None
    if 'author' in role and 'not the page author' not in conf and 'founder' not in role and 'owner' not in role and 'ceo' not in role: return 'author'
    if 'not the page author' in conf or 'not marketing' in conf:
        if 'marketing' in role or 'marketing' in conf: return 'marketing'
        if 'editor' in role or 'editor' in conf: return 'editor'
        return 'owner'
    if any(k in role for k in ('founder','owner','ceo','chief executive','director')) and 'content' not in role and 'seo' not in role: return 'owner_author' if 'author' in role else 'owner'
    if 'marketing' in role or 'content' in role or 'seo' in role: return 'marketing_author' if 'author' in role else 'marketing'
    if "site's own profile" in conf: return 'site_profile'
    return 'author'
out=collections.Counter()
for x in d:
    c=x['contact']; b=x['body']; m=b['model'][0]; title=m.get('title') or 'the page'; note=m.get('note','')
    tools=re.search(r'Names ([^.]+)\.',note); tools=tools.group(1) if tools else None
    cites=re.search(r'Cited by ([^.]+?)\s*\(',note) or re.search(r'Cited by ([^.]+)\.',note); cites=cites.group(1) if cites else None
    k=rel(c); who=c.get('linkedin_name') or c.get('name'); first=(who or '').replace('CA ','').split(' ')[0]
    parts=[]
    if k=='author': parts.append(f"{who} wrote this page, so they can add us themselves. Refer to the article by name and ask for AI Accountant to be added to the list.")
    elif k=='owner_author': parts.append(f"{who} runs the site and wrote this page. They decide what goes on the list; ask directly for AI Accountant to be added.")
    elif k=='owner': parts.append(f"{who} runs or owns the site but did not write this page. Mention the article, say what is missing, and ask them to add us or pass it to whoever edits it.")
    elif k in('marketing','marketing_author'): parts.append(f"{who} handles marketing or content at the company"+(" and wrote this page" if k=='marketing_author' else ", not this page specifically")+". Frame it as a content update: the list is missing a Tally-based option.")
    elif k=='editor': parts.append(f"{who} is an editor at the site, not this page's author. Ask for a correction or addition to the article and name the author if known ({c.get('name') or 'not named'}).")
    elif k=='site_profile': parts.append("This is the site's own LinkedIn profile, with no person named. Write to it as the site, short and plain.")
    else:
        if c.get('linkedin_company'): parts.append("No person found on LinkedIn; only the company page. Use the email or form instead, or message the company page.")
        else: parts.append("No LinkedIn profile could be tied to this site. Use the email or contact form if there is one; otherwise skip.")
    if 'likely' in (c.get('linkedin_confidence') or '').lower() and c.get('linkedin_url'): parts.append("The match is likely, not confirmed: open the profile and check it mentions the site before sending.")
    page=f"Page: \"{title}\""
    if tools: page+=f", which lists {tools}"
    page+=" and leaves us out."
    parts.append(page)
    if cites: parts.append(f"Why it matters: {cites.strip()} cite this page.")
    if per_site[c.get('site')]>1 and k: parts.append(f"The same person covers {per_site[c.get('site')]} of our tasks on this site: send one message that names all the pages, not one per page.")
    site=c.get('site') or ''
    if site.endswith('.in') or 'india' in title.lower() or 'tally' in title.lower() or re.search(r'\bCAs?\b', title): parts.append("Indian audience: lead with Tally, GST and bill-wise entries.")
    else: parts.append("Global audience: say we are the option for businesses in India on Tally, which the list lacks.")
    if (c.get('linkedin_role') or '').lower().find('ceo')>=0 or k=='owner': parts.append("Keep it to three or four lines; offer a ready-to-paste entry.")
    c['outreach_note']=' '.join(parts); c['relationship']={'author':'Author','owner_author':'Owner and author','owner':'Owner or founder','marketing':'Marketing or content','marketing_author':'Marketing or content, and author','editor':'Editor','site_profile':"Site's own profile"}.get(k)
    out[c['relationship']]+=1
    subprocess.run(['curl','-s','-o','/dev/null','-X','PATCH',f"https://qmaphtslnvvifkzmbrvh.supabase.co/rest/v1/aeo_rec_tasks?task_key=eq.{x['task_key']}",'-H','apikey: dummy','-H','Authorization: Bearer dummy','-H','Content-Type: application/json','-d',json.dumps({'contact':c})])
print(out)
for x in d[:60:9]: print('-',x['contact'].get('site'),'|',x['contact']['outreach_note'][:600])
