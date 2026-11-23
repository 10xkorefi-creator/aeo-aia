#!/usr/bin/env python3
"""Builds the Recommendations page from the latest run.

For every tracked question and every assistant it looks at two things: does the assistant recommend us, and which
sources did it cite. Each cited source is put into a type (our page, a competitor's page, a comparison list, a review
site, a YouTube video, a LinkedIn post, a forum thread ...) and the type decides the task and its channel. Nothing is
chosen up front: a channel only appears when an assistant cited it for that question.

Input:  data/*.json (export.py) and pages.jsonl (read_pages.py), in the working folder given as argv[1].
Output: questions.json and tasks.json in the same folder, ready to load into aeo_rec_questions and aeo_rec_tasks.
"""
import json, re, sys, hashlib, statistics, collections as C, urllib.parse

W = sys.argv[1].rstrip('/')
L = lambda f: json.load(open('%s/data/%s.json' % (W, f)))
ENGINES = ['chatgpt', 'gemini', 'perplexity']
NAME = {'chatgpt': 'ChatGPT', 'gemini': 'Gemini', 'perplexity': 'Perplexity', 'google': 'Google AI Overviews'}

# ---------- the run
runs = [r for r in L('runs') if r['run_type'] != 'test' and r['status'] in ('complete', 'partial')]
RUN, PREV = runs[-1]['run_id'], runs[-2]['run_id']
day = lambda rid: '/'.join(reversed(next(r for r in runs if r['run_id'] == rid)['run_date'].split('-')[1:]))
prompts = {p['prompt_key']: p for p in L('prompts') if p['list_version'] == runs[-1]['prompt_list_version'] and p['prompt_group'] != 'own_brand'}
kws = {k['keyword_id']: k for k in L('keywords') if k['list_version'] == runs[-1]['keyword_list_version'] and k['segment'] == 'buyer'}
km = {k['keyword_id']: k for k in L('kw_metrics') if k['run_id'] == RUN}
leads = C.Counter(l['ai_channel'] for l in L('leads') if not l['is_internal'])
LEADS = {e: leads.get(e, 0) for e in ENGINES}; LEAD_TOTAL = sum(leads.values())
WEIGHT = {e: LEADS[e] / max(1, sum(LEADS.values())) for e in ENGINES}
STAGE = {'decision': 1.0, 'consideration': 0.8, 'problem (how-to)': 0.5, 'awareness': 0.3}
SHORT = {  # short names for the long scenario questions, only used in task titles
    'S001': 'AI tool to automate purchase and sales entry in Tally Prime',
    'S002': 'tool that enters bank statement lines into Tally automatically',
    'S003': 'software that puts bank transactions into the right Tally ledgers',
    'S004': 'tool to automate bank reconciliation in Tally Prime for a small business',
    'S005': 'AI accounting tool that works on top of Tally Prime',
    'S006': 'AI accounting software for a manufacturing company on Tally',
    'S007': 'AI software to automate vendor bill entry in Tally Prime',
    'S008': 'tool to automate GSTR-2B and TDS reconciliation on Tally',
    'S009': 'AI tool to automate bookkeeping across a CA firm\'s Tally clients',
    'S010': 'software for CA firms to convert bank statements and invoices to Tally in bulk',
}
def label(key):
    if key in kws: return kws[key]['keyword']
    return SHORT.get(key) or prompts[key]['prompt_text'].strip().rstrip('?').strip()

# ---------- what each cited page is
def dom(u): return urllib.parse.urlparse(u).netloc.lower().replace('www.', '')
def root_of(d): return d.split('.')[-3] if d.endswith(('.co.in', '.org.in', '.net.in', '.co.uk')) and d.count('.') >= 2 else d.split('.')[-2] if '.' in d else d
def hid(u): return hashlib.md5(u.encode()).hexdigest()[:8]
def norm(u):
    p = urllib.parse.urlparse(u)
    qs = '&'.join(x for x in p.query.split('&') if x and not re.match(r'(utm_|ref=|source=|srsltid=|fbclid=|gclid=)', x))
    return (p.netloc.lower().replace('www.', '') + p.path.rstrip('/') + ('?' + qs if qs else '')).lower()
BLOCKED = re.compile(r'just a moment|attention required|bot verification|checking your browser|access denied|are you a robot|captcha|403 forbidden|security check|page not found|^404|not acceptable', re.I)
def slug_title(u):
    path = urllib.parse.urlparse(u).path.rstrip('/').split('/')[-1]
    t = re.sub(r'\.(html?|php|aspx?)$', '', path); t = re.sub(r'[-_]+', ' ', t).strip()
    return t[:1].upper() + t[1:] if len(t) > 8 else ''
OURS = re.compile(r'(^|\.)aiaccountant\.com$')
PLATFORM = [('YouTube', r'(^|\.)(youtube\.com|youtu\.be)$'), ('LinkedIn', r'(^|\.)linkedin\.com$'), ('Facebook', r'(^|\.)facebook\.com$'), ('Instagram', r'(^|\.)instagram\.com$'),
            ('X', r'(^|\.)(x|twitter)\.com$'), ('Reddit', r'(^|\.)reddit\.com$'), ('Quora', r'(^|\.)quora\.com$')]
REVIEW = re.compile(r'(^|\.)(g2\.com|capterra\.[a-z.]+|getapp\.[a-z.]+|softwaresuggest\.com|techjockey\.com|saasworthy\.com|softwareadvice\.[a-z.]+|trustpilot\.com|producthunt\.com|sourceforge\.net|'
                    r'slashdot\.org|crozdesk\.com|trustradius\.com|goodfirms\.co|clutch\.co|technologycounter\.com|selecthub\.com|financesonline\.com|tekpon\.com|alternativeto\.net|softwareworld\.co|'
                    r'saashub\.com|gartner\.com)$')
SITE = {'g2': 'G2', 'capterra': 'Capterra', 'getapp': 'GetApp', 'softwaresuggest': 'SoftwareSuggest', 'techjockey': 'Techjockey', 'saasworthy': 'SaaSworthy', 'softwareadvice': 'Software Advice', 'trustpilot': 'Trustpilot',
        'producthunt': 'Product Hunt', 'sourceforge': 'SourceForge', 'slashdot': 'Slashdot', 'crozdesk': 'Crozdesk', 'trustradius': 'TrustRadius', 'goodfirms': 'GoodFirms', 'clutch': 'Clutch', 'technologycounter': 'Technology Counter',
        'selecthub': 'SelectHub', 'financesonline': 'FinancesOnline', 'tekpon': 'Tekpon', 'alternativeto': 'AlternativeTo', 'softwareworld': 'SoftwareWorld', 'saashub': 'SaaSHub', 'gartner': 'Gartner Peer Insights'}
def site_of(d): return next((k for k in SITE if re.search(r'(^|\.)' + k + r'\.', d)), d)
REFERENCE = re.compile(r'(\.gov|\.gov\.in|\.nic\.in|(^|\.)icai\.org|icai[a-z]*\.(org|com)|wikipedia\.org|github\.com|scribd\.com|rbi\.org\.in|\.edu|\.ac\.in|arxiv\.org|microsoft\.com|google\.com|openai\.com)$')
VENDOR = re.compile(r'tallysolutions|vyapar|suvit|hisabkitab|gsthero|vouchrit|nanonets|cashflo|zoho|cleartax|clear\.in|mastersindia|xero\.com|intuit|quickbooks|sage\.com|netsuite|razorpay|bill\.com|highradius|'
                    r'refrens|busy\.in|rippling|paylocity|ivalua|gusto\.com|brex\.com|ramp\.com|rho\.co|margerp|mybillbook|khatabook|giddh|docsumo|rossum|dext\.com|tipalti|stampli|rillion|medius|basware|coupa|oracle\.com|sap\.com|freshbooks|wave(apps)?\.com')
LISTY = re.compile(r'\b(best|top|alternatives?|vs\.?|versus|compar\w+|reviews?|ranked|leading|tools for|software for|add-?ons?)\b', re.I)
BRANDS = [('Vyapar TaxOne / Suvit', r'\btax ?one\b|\bsuvit\b'), ('Docs by Ira', r'docs by ira|tally ?prime(\'s)? ai\b'), ('Hisabkitab', r'\bhisab ?kitab\b'), ('GSTHero', r'\bgst ?hero\b'), ('VouchrIt', r'\bvouchr?it\b'),
          ('Nanonets', r'\bnanonets\b'), ('Cashflo', r'\bcashflo\b'), ('Provi AI', r'\bprovi ai\b'), ('Qosh AI', r'\bqosh\b'), ('Zoho Books', r'\bzoho (books|invoice|expense)\b'), ('ClearTax', r'\bclear ?tax\b'),
          ('Masters India', r'\bmasters ?india\b'), ('KDK Spectrum', r'\bkdk\b'), ('IRIS Sapphire', r'\biris (sapphire|gst|business)\b'), ('Winman', r'\bwinman\b'), ('TallyConnects', r'\btally ?connects?\b'),
          ('udiMagic', r'\budi ?magic\b'), ('Excel2Tally', r'\bexcel ?(2|to) ?tally\b'), ('Quick2Tally', r'\bquick2tally\b'), ('QuickBooks', r'\bquickbooks\b'), ('Xero', r'\bxero\b'), ('Busy', r'\bbusy (accounting|software|21)\b'),
          ('Marg ERP', r'\bmarg( erp)?\b'), ('myBillBook', r'\bmy ?bill ?book\b'), ('Khatabook', r'\bkhatabook\b'), ('Giddh', r'\bgiddh\b'), ('RealBooks', r'\breal ?books\b'), ('ProfitBooks', r'\bprofitbooks\b'),
          ('Refrens', r'\brefrens\b'), ('Saral', r'\bsaral (gst|accounts|tds)\b'), ('GSTZen', r'\bgstzen\b'), ('Optotax', r'\boptotax\b'), ('Docsumo', r'\bdocsumo\b'), ('Rossum', r'\brossum\b'), ('Vic.ai', r'\bvic\.ai\b'),
          ('Dext', r'\bdext\b'), ('Botkeeper', r'\bbotkeeper\b'), ('Truewind', r'\btruewind\b'), ('Booke AI', r'\bbooke\b'), ('HelloBooks', r'\bhello ?books\b'), ('TrulyInvoice', r'\btruly ?invoice\b'),
          ('Sage', r'\bsage (intacct|50|accounting|300)\b'), ('NetSuite', r'\bnetsuite\b'), ('FreshBooks', r'\bfreshbooks\b'), ('Wave', r'\bwave accounting\b'), ('Tipalti', r'\btipalti\b'), ('Stampli', r'\bstampli\b'),
          ('Bill.com', r'\bbill\.com\b'), ('RazorpayX', r'\brazorpay ?x\b'), ('Open', r'\bopen money\b'), ('Biz Analyst', r'\bbiz ?analyst\b'), ('Tally on Mobile', r'\btally on mobile\b'), ('Vyapar', r'\bvyapar\b(?! tax)'),
          ('ChatGPT', r'\bchatgpt\b'), ('Microsoft Copilot', r'\bcopilot\b'), ('Kolossus', r'\bkolossus\b'), ('Coraa', r'\bcoraa\b'), ('Accuraik', r'\baccuraik\b'), ('Finexo', r'\bfinexo\b'), ('Turia', r'\bturia\b'),
          ('EasemyGST', r'\bease ?my ?gst\b'), ('Gen GST', r'\bgen gst\b'), ('Octa GST', r'\bocta ?gst\b'), ('CompuTax', r'\bcomputax\b'), ('Taxmann', r'\btaxmann\b'), ('Zoho', r'\bzoho\b(?! (books|invoice|expense))')]
BRANDS = [(n, re.compile(p, re.I)) for n, p in BRANDS]
US = re.compile(r'aiaccountant\.com|AI Accountant(?!s)(?! (tools?|software|apps?|agents?)\b)')
JUNK = re.compile(r'^(related|recent|popular|latest|more|other) |table of contents|conclusion|faq|frequently asked|leave a (reply|comment)|share this|about (the )?author|categories|tags|subscribe|newsletter|'
                  r'comments?$|contact us|follow us|quick links|you may also|read more|top stories|sign up|get started|ready to|book a demo|key takeaways|summary$|final thoughts|introduction$|overview$|references$', re.I)

pages = {}
try:
    for l in open(W + '/pages.jsonl'):
        p = json.loads(l)
        if BLOCKED.search(p.get('title') or ''): p['code'] = 'blocked'; p['title'] = ''
        k = norm(p['url'])
        if k not in pages or (p.get('code') == '200' and pages[k].get('code') != '200'): pages[k] = p
except FileNotFoundError: pass

_cache = {}
def source(url, lab=''):
    """Type of a cited page and the few facts we keep about it."""
    if url in _cache: return _cache[url]
    d = dom(url); p = pages.get(norm(url)) or {}
    s = {'url': url, 'domain': d, 'title': (p.get('title') or (lab if lab and lab.lower().replace('www.', '') != d else '') or slug_title(url) or '').strip()[:160], 'read': p.get('code') == '200' and ('words' in p or 'author' in p)}
    plat = next((n for n, rx in PLATFORM if re.search(rx, d)), None)
    if OURS.search(d): s['type'] = 'ours'
    elif plat:
        s['type'] = plat
        if lab and not s['title']: s['title'] = lab[:160]
        if p.get('author'): s['author'] = p['author']; s['ours_video'] = bool(re.search(r'ai ?accountant', p['author'], re.I))
    elif REVIEW.search(d): s['type'] = 'review'
    else:
        text = p.get('text') or ''
        if s['read'] and p.get('words', 0) >= 150:
            head = ' '.join([p.get('title') or ''] + (p.get('h1') or []))
            s['words'] = p['words']; s['tables'] = p.get('tables', 0) > 0; s['faq'] = bool(p.get('faq'))
            s['brands'] = [n for n, rx in BRANDS if rx.search(text)]
            s['names_us'] = bool(p.get('links_us') or US.search(text))
            s['h2'] = [re.sub(r'\s*[:?]$', '', h) for h in (p.get('h2') or []) if 2 <= len(h.split()) <= 12 and not JUNK.search(h) and not re.match(r'\s*(#|step )?\d+[.):]?\s', h, re.I) and not any(rx.search(h) for _, rx in BRANDS) and root_of(d) not in re.sub(r'[^a-z0-9]', '', h.lower())][:8]
            root = root_of(d)
            rx_root = re.compile(r'\b' + re.escape(root) + r'\b', re.I)
            self_listed = len(root) >= 3 and (any(rx_root.search(h) for h in (p.get('h2') or [])) or len(rx_root.findall(text)) >= 6)
            vendor = bool(VENDOR.search(d)) or p.get('cta', 0) >= 2 or self_listed
            products = [b for b in s['brands'] if b not in ('ChatGPT', 'Microsoft Copilot')]
            listy = (bool(LISTY.search(head)) and len(products) >= 3) or len(products) >= 7
            s['type'] = 'reference' if REFERENCE.search(d) else 'vendor_list' if listy and vendor else 'list' if listy else 'vendor' if vendor else 'article'
        else:
            s['read'] = False
            deep = len(urllib.parse.urlparse(url).path.strip('/')) > 8
            s['type'] = 'reference' if REFERENCE.search(d) else 'vendor' if VENDOR.search(d) else 'list_unread' if deep and re.search(r'\b(best|top|alternatives)\b', s['title'] or '', re.I) and re.search(r'\b(software|tools?|apps?|alternatives|agents?|add-?ons?|ocr)\b', s['title'] or '', re.I) else 'unread'
    _cache[url] = s
    return s

TAG = {'ours': 'Our page', 'vendor': 'Product site', 'vendor_list': 'List on a product site', 'list': 'Comparison list', 'list_unread': 'Comparison list', 'review': 'Review site', 'reference': 'Official or reference',
       'article': 'Article', 'unread': 'Web page', 'YouTube': 'YouTube video', 'LinkedIn': 'LinkedIn post', 'Facebook': 'Facebook post', 'Instagram': 'Instagram post', 'X': 'X post', 'Reddit': 'Reddit thread', 'Quora': 'Quora thread'}

# ---------- what happened on each question, per assistant
ans = C.defaultdict(lambda: C.defaultdict(dict))   # (engine, q) -> capture -> brand -> (mentioned, cited)
brand_name = {}
for m in L('asst_mentions'):
    if m['run_id'] == RUN and m['prompt_key'] in prompts:
        ans[(m['engine'], m['prompt_key'])][m['capture_id']][m['brand_key']] = (m['mentioned'], m['cited']); brand_name[m['brand_key']] = m['display_name']
cit = C.defaultdict(lambda: C.defaultdict(lambda: {'caps': set(), 'pos': 99, 'label': ''}))
prev = set()
for c in L('asst_cites'):
    if c['prompt_key'] not in prompts: continue
    if c['run_id'] == PREV: prev.add((c['engine'], c['prompt_key'], norm(c['url'])))
    if c['run_id'] == RUN:
        x = cit[(c['engine'], c['prompt_key'])][norm(c['url'])]; x['caps'].add(c['capture_id']); x['pos'] = min(x['pos'], c['pos'] or 99); x['label'] = x['label'] or (c['label'] or ''); x.setdefault('url', c['url'].split('?utm_')[0])
for m in L('aio_mentions'):
    if m['run_id'] == RUN and m['keyword_id'] in kws:
        ans[('google', m['keyword_id'])][m['capture_id']][m['brand_key']] = (m['named'], m['cited']); brand_name[m['brand_key']] = m['display_name']
for c in L('aio_cites'):
    if c['keyword_id'] not in kws: continue
    if c['run_id'] == PREV: prev.add(('google', c['keyword_id'], norm(c['url'])))
    if c['run_id'] == RUN:
        x = cit[('google', c['keyword_id'])][norm(c['url'])]; x['caps'].add(c['capture_id']); x['label'] = x['label'] or (c['label'] or ''); x.setdefault('url', c['url'].split('?utm_')[0])
SHORTB = {'taxone': 'Vyapar TaxOne / Suvit', 'tally_ai': 'Docs by Ira', 'zoho_books': 'Zoho Books'}

def cell(engine, q):
    """One assistant on one question: are we recommended, who is named, which sources were used consistently."""
    caps = ans.get((engine, q)) or {}
    n = len(caps)
    if engine == 'google': n = (km.get(q) or {}).get('aio_samples') or 0
    if not n: return None
    us = [c.get('aia', (False, False)) for c in caps.values()]
    rec, named, linked = sum(1 for a, b in us if a and b), sum(1 for a, b in us if a), sum(1 for a, b in us if b)
    if engine == 'google': rec = linked     # for Google the measure is the link in the AI Overview
    names = C.Counter(b for c in caps.values() for b, (m, _) in c.items() if m and b not in ('aia', 'tally'))
    need = 2 if n >= 2 else 1
    rows = sorted(cit.get((engine, q), {}).items(), key=lambda kv: (-len(kv[1]['caps']), kv[1]['pos']))
    strong = [(u, x) for u, x in rows if len(x['caps']) >= need and len(x['caps']) * 2 >= n]
    if engine == 'gemini' and len(strong) < 3: strong += [(u, x) for u, x in rows if (u, x) not in strong][:3 - len(strong)]
    srcs = []
    for u, x in strong:
        s = dict(source(x['url'], x['label'])); s['answers'] = len(x['caps']); s['n'] = n; s['prev'] = (engine, q, u) in prev
        srcs.append(s)
    return {'n': n, 'rec': rec, 'named': named, 'linked': linked, 'gap': rec * 2 < n, 'names': [[SHORTB.get(b, brand_name[b]), k] for b, k in names.most_common(4)],
            'sources': srcs, 'all_ours': [x['url'] for u, x in rows if OURS.search(dom(x['url']))], 'cited_pages': len(rows)}

questions = {}
for q, p in prompts.items():
    cells = {e: cell(e, q) for e in ENGINES}
    gap = {e: (1 - c['rec'] / c['n']) if c else 0 for e, c in cells.items()}
    score = STAGE.get(p['stage'], 0.5) * sum(WEIGHT[e] * gap[e] for e in ENGINES)
    cg = cells['chatgpt']
    close = bool(cg and (cg['linked'] or cg['named']))
    buying = p['stage'] in ('decision', 'consideration')
    if not any(c and c['gap'] for c in cells.values()): pr = 'Done'
    elif p['prompt_group'] == 'competitor': pr = 'Medium' if buying else 'Low'      # the answer is mostly about the competitor asked for
    elif cg and cg['gap'] and buying: pr = 'High'
    elif (cg and cg['gap'] and p['stage'] == 'problem (how-to)') or (p['stage'] in ('decision', 'consideration')): pr = 'Medium'
    else: pr = 'Low'
    questions[q] = {'key': q, 'kind': 'question', 'text': p['prompt_text'].strip(), 'label': label(q), 'stage': p['stage'], 'topic': p['topic'], 'group': p['prompt_group'], 'cells': cells, 'score': round(score, 4),
                    'close': close, 'priority': pr, 'volume': None, 'rank': None, 'evidence': p.get('evidence_score') or 0}
for k, kw in kws.items():
    c = cell('google', k); m = km.get(k) or {}
    if not c: continue
    rank = m.get('aia_best_organic_rank'); vol = m.get('volume') or kw.get('ahrefs_volume_in') or 0
    pr = 'Done' if not c['gap'] else 'Medium' if rank and rank <= 10 else 'Low'
    questions[k] = {'key': k, 'kind': 'keyword', 'text': kw['keyword'], 'label': kw['keyword'], 'stage': 'Google search', 'topic': kw['topic'], 'group': 'keyword', 'cells': {'google': c}, 'score': round(min(vol, 5000) / 5000 * 0.3, 4),
                    'close': bool(rank and rank <= 10), 'priority': pr, 'volume': vol, 'rank': rank, 'evidence': 0}
PR = {'High': 0, 'Medium': 1, 'Low': 2, 'Done': 3}
# where to start: high-priority questions where ChatGPT already reads or names us, so the step to a recommendation is smallest
START = [x['key'] for x in sorted((x for x in questions.values() if x['priority'] == 'High'), key=lambda x: (not x['close'], -x['score'], -x['evidence'], x['key']))][:10]
order = sorted(questions.values(), key=lambda x: (PR[x['priority']], x['key'] not in START, x['kind'] != 'question', not x['close'], -x['score'], -x['evidence'], x['key']))
for i, x in enumerate(order): x['pos'] = i + 1

# ---------- the tasks the sources call for
tasks = {}
def of(k, n): return '%d of %d' % (k, n)
def cited_line(s, e): return '%s cited it in %s answers%s' % (NAME[e], of(s['answers'], s['n']), ' and also on %s' % day(PREV) if s['prev'] else '')
def page_note(s, cited):
    bits = ['Cited by ' + cited]
    if s.get('words'): bits.append('{:,} words'.format(s['words']))
    if s.get('brands'): bits.append('Names ' + ', '.join(s['brands'][:4]))
    if s.get('author'): bits.append('Channel: ' + s['author'])
    return '. '.join(bits) + '.'
def task(key, **kw):
    t = tasks.get(key)
    if not t: t = tasks[key] = dict(key=key, targets=[], models={}, **kw)
    return t
def use(t, q, e, s=None):
    if (q, e) not in t['targets']: t['targets'].append((q, e))
    if s:
        m = t['models'].setdefault(s['url'], {'s': s, 'uses': [], 'prev': False}); m['uses'].append((e, s['answers'], s['n'], q)); m['prev'] = m['prev'] or s['prev']

for x in order:
    q = x['key']; isq = x['kind'] == 'question'
    if x['priority'] == 'Done': continue
    quoted = '“%s”' % x['label']
    for e, c in x['cells'].items():
        if not c or not c['gap']: continue
        web = False
        for s in c['sources']:
            ty = s['type']
            if ty in ('vendor', 'vendor_list', 'article', 'reference', 'unread', 'ours'):
                web = True
                if ty != 'ours': use(task('W-' + q, channel='Website', q=q), q, e, s)
            elif ty in ('list', 'list_unread'):
                web = True
                use(task('W-' + q, channel='Website', q=q), q, e, s)
                if not s.get('names_us'): use(task('O-' + hid(s['url']), channel='Outreach', kind='Outreach', url=s['url'], q=q), q, e, s)
            elif ty == 'review':
                use(task('R-' + site_of(s['domain']), channel='Review site', kind='Listing', url=s['url'], q=q), q, e, s)
            elif ty in ('Reddit', 'Quora'):
                use(task('F-' + hid(s['url']), channel=ty, kind='Thread answer', url=s['url'], q=q), q, e, s)
            elif ty == 'YouTube':
                if not s.get('ours_video'): use(task('Y-' + q, channel='YouTube', kind='Video', q=q), q, e, s)
            else:
                use(task('S-%s-%s' % (ty.lower(), q), channel=ty, kind='Post', q=q), q, e, s)
        if web or not c['sources']: use(task('W-' + q, channel='Website', q=q), q, e)

def why_lines(x, engines):
    out = []
    for e in engines:
        c = x['cells'].get(e)
        if not c: continue
        if e == 'google':
            line = 'Google showed an AI Overview on %s searches for this keyword and linked to our site in %d.' % (of(c['n'], (km.get(x['key']) or {}).get('samples_ok') or c['n']), c['linked'])
            if x['rank']: line += ' We rank number %d in the normal results.' % x['rank']
        else:
            line = '%s recommends us in %s answers.' % (NAME[e], of(c['rec'], c['n']))
            if c['linked'] > c['rec']: line += ' It links to our site in %d of them without naming us.' % c['linked'] if c['named'] == 0 else ' It links to our site in %d.' % c['linked']
            elif c['named'] > c['rec']: line += ' It names us in %d but does not link to us.' % c['named']
        if c['names']: line += ' It names %s.' % ', '.join(n for n, _ in c['names'][:3])
        out.append(line)
    return out

def andj(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]
LISTS = ('list', 'vendor_list', 'list_unread')
MIXNAME = [('comparison list', LISTS), ('product page', ('vendor',)), ('article', ('article', 'unread')), ('official or reference page', ('reference',)), ('review-site page', ('review',)), ('page of ours', ('ours',)),
           ('YouTube video', ('YouTube',)), ('LinkedIn post', ('LinkedIn',)), ('Reddit or Quora thread', ('Reddit', 'Quora')), ('social post', ('X', 'Facebook', 'Instagram'))]
def page_format(x, srcs):
    """Which kind of page to write: taken from how the question is worded and from what kind of pages are cited for it."""
    ql = x['label'].lower()
    typed = [s for s in srcs if s['type'] in LISTS + ('vendor', 'article', 'reference', 'unread')]
    lists = [s for s in typed if s['type'] in LISTS]; vendors = [s for s in typed if s['type'] == 'vendor']
    if 'alternative' in ql: return 'alternatives'
    if re.search(r'\bpric|\bcost|free or paid', ql): return 'pricing'
    if re.search(r'^how |how to', ql): return 'howto'
    if typed and len(lists) * 5 >= len(typed) * 2: return 'compare'
    if re.search(r'^(can|does|is|what|are)\b', ql): return 'explainer'
    if re.search(r'\b(best|top|which)\b', ql): return 'compare'
    return 'product' if typed and len(vendors) * 2 >= len(typed) else 'explainer'
FORMAT = {'compare': ('Write a comparison page for %s and publish it on the aiaccountant.com blog.', 'List AI Accountant in it, next to the tools the assistants name today%s.'),
          'alternatives': ('Write an alternatives page for %s and publish it on the aiaccountant.com blog.', 'Put AI Accountant first among the alternatives%s.'),
          'pricing': ('Write a pricing guide for %s and publish it on the aiaccountant.com blog.', 'Give the prices the question asks about, with AI Accountant\'s price beside them%s.'),
          'howto': ('Write a step-by-step guide for %s and publish it on the aiaccountant.com blog.', 'Show the manual steps first, then how AI Accountant does the same job automatically%s.'),
          'explainer': ('Write a short guide that answers %s in its first paragraph and publish it on the aiaccountant.com blog.', 'After the answer, show how AI Accountant does this%s.'),
          'product': ('Create a product page for %s under Products on aiaccountant.com.', 'Say what AI Accountant does for this job, who it is for and what it costs%s.')}

rows = []
for key, t in tasks.items():
    engines = [e for e in ENGINES + ['google'] if any(te == e for _, te in t['targets'])]
    qs = list(dict.fromkeys(tq for tq, _ in t['targets']))
    best = min((questions[k] for k in qs), key=lambda v: v['pos'])
    isq = best['kind'] == 'question'; what = 'question' if isq else 'search'
    thin = lambda m: bool(re.search(r'/(contact|pricing|login|signup|sign-up|about|careers|demo)[^/]*/?$', m['s']['url'])) or not urllib.parse.urlparse(m['s']['url']).path.strip('/') or (m['s'].get('words') or 0) < 400
    models = sorted(t['models'].values(), key=lambda m: (thin(m) if t['channel'] == 'Website' else False, -sum(WEIGHT.get(e, 0.1) * k / n for e, k, n, _ in m['uses'])))
    quoted = '“%s”' % best['label']
    who = andj(NAME[e] for e in engines)
    body = {'task': {'lead': '', 'points': []}, 'today': [], 'mix': None, 'model': [], 'model_title': '', 'works': [], 'check': [], 'done': []}
    for m in models[:4]:
        uses = sorted({(e, k, n) for e, k, n, tq in m['uses']}, key=lambda u: (ENGINES + ['google']).index(u[0]))
        body['model'].append({'url': m['s']['url'], 'title': m['s']['title'], 'tag': TAG[m['s']['type']], 'note': ''})
    def cites(m):
        out = []
        for e in ENGINES + ['google']:
            u = [(k, n, tq) for te, k, n, tq in m['uses'] if te == e]
            if not u: continue
            k, n, _ = max(u, key=lambda x: x[0] / x[1]); nq = len({tq for _, _, tq in u}); unit = 'AI Overviews' if e == 'google' else 'answers'
            out.append('%s in %s %s' % (NAME[e], of(k, n), unit) if nq == 1 else '%s for %d prompts (in up to %s %s)' % (NAME[e], nq, of(k, n), unit))
        return '; '.join(out)
    one = len(engines) == 1 and engines != ['google']
    for i, m in enumerate(models[:4]): body['model'][i]['note'] = page_note(m['s'], cites(m))
    if models and not any(m.get('prev') for m in models[:1]) and t['channel'] != 'Website':
        body['check'].append('This source was not cited in the previous run (%s), so it may not be a steady source. Check the next run before spending much on it.' % day(PREV))
    if t['channel'] == 'Website':
        srcs = [s for e in engines for s in best['cells'][e]['sources']]
        uniq = list({norm(s['url']): s for s in srcs}.values())
        ours = [u for c in best['cells'].values() if c for u in c['all_ours'] if urllib.parse.urlparse(u).path.strip('/')]
        ours = [u for u, _ in C.Counter(ours).most_common(2)]
        kind = 'Update page' if ours or (not isq and best['close']) else 'New page'
        title = ('Update our page for %s' if kind == 'Update page' else 'New page for %s') % quoted
        fmt = page_format(best, uniq)
        names = C.Counter(n for e in engines for n, k in best['cells'][e]['names'])
        named = (': ' + andj(n for n, _ in names.most_common(3))) if names and fmt in ('compare', 'alternatives') else ''
        lead, point = FORMAT[fmt]
        if ours:
            path = ours[0].replace('https://', '').replace('www.', '').rstrip('/')
            body['task']['lead'] = 'Update %s so that it answers %s.' % (path, quoted)
        elif kind == 'Update page':
            body['task']['lead'] = 'Update the page of ours that ranks number %d on Google for %s.' % (best['rank'], quoted)
        else:
            body['task']['lead'] = lead % quoted
        body['task']['points'].append(point % named)
        lnn = [NAME[e] for e in engines if e != 'google' and best['cells'][e]['linked'] > best['cells'][e]['rec'] and best['cells'][e]['named'] < best['cells'][e]['linked']]
        if lnn and ours: body['task']['points'].append('Say near the top, in plain words, what AI Accountant does for this job. %s already %s this page but %s other tools from it.' % (andj(lnn), 'reads' if len(lnn) == 1 else 'read', 'names' if len(lnn) == 1 else 'name'))
        ms = [m['s'] for m in models if m['s'].get('words')]
        if ms:
            med = int(statistics.median(m['words'] for m in ms[:6]) // 50 * 50)
            extra = [n for n, f in (('a comparison table', 'tables'), ('a questions-and-answers section', 'faq')) if sum(1 for m in ms[:6] if m.get(f)) * 2 >= len(ms[:6])]
            body['task']['points'].append('About {:,} words{}, which is what the cited pages run to.'.format(max(med, 300), (', with ' + ' and '.join(extra)) if extra else ''))
        body['today'] = why_lines(best, engines)
        mix = [(sum(1 for s in uniq if s['type'] in ty), nm) for nm, ty in MIXNAME]
        mix = ['%d %s%s' % (k, nm, '' if k == 1 else 's') if nm != 'page of ours' else '%d of our own pages' % k if k > 1 else '1 of our own pages' for k, nm in mix if k]
        if uniq: body['mix'] = 'Sources cited in most answers for this %s: %s.' % (what, ', '.join(mix))
        body['model_title'] = 'Competitor pages we are imitating'
        lists = [s for s in uniq if s['type'] in LISTS]; lists_us = [s for s in lists if s.get('names_us')]
        no_page = [NAME[e] for e in engines if e != 'google' and best['cells'][e]['named'] > best['cells'][e]['rec'] and best['cells'][e]['linked'] == 0]
        if ours and lnn: body['works'].append('%s already %s our page for this %s, so we are in what %s. The gap is that the page does not present AI Accountant as the answer.' % (andj(lnn), 'cites' if len(lnn) == 1 else 'cite', what, 'it reads' if len(lnn) == 1 else 'they read'))
        elif no_page: body['works'].append('%s already %s AI Accountant here but %s no page of ours to link to. A page that matches the question gives %s the link.' % (andj(no_page), 'names' if len(no_page) == 1 else 'name', 'has' if len(no_page) == 1 else 'have', 'it' if len(no_page) == 1 else 'them'))
        vend = [s for s in uniq if s['type'] == 'vendor']
        if lists and len(lists) * 5 >= len(uniq) * 2:
            body['works'].append('%s of the %d sources cited are comparison lists, and %s. The assistants repeat the tools those lists name, so a list that includes us gives them a source that does.' % (
                len(lists), len(uniq), 'none of them names AI Accountant' if not lists_us else '%d of them %s AI Accountant' % (len(lists_us), 'names' if len(lists_us) == 1 else 'name')))
        elif len(vend) * 2 >= len(uniq) and uniq:
            body['works'].append('%d of the %d sources cited are the product pages of the tools the assistants name. They name the tools whose own pages answer the %s, and none of those pages is ours.' % (len(vend), len(uniq), what))
        elif not body['works']:
            body['works'].append('%s of the sources cited for this %s %s ours. The assistants can only recommend us with a link when a page of ours answers it.' % ('None' if not ours else 'Only %d' % len(ours), what, 'is' if len(ours) <= 1 else 'are'))
        body['done'] = ['%s %s AI Accountant with a link in at least half the answers to this question, two runs in a row.' % (who, 'recommends' if one else 'recommend')]
        if engines == ['google']: body['done'] = ['Google\'s AI Overview links to our site on at least half the searches for this keyword, two runs in a row.']
    elif t['channel'] == 'Outreach':
        s = models[0]['s']; kind = 'Outreach'
        nm = re.split(r' [|\-–—:] (?=[^|\-–—:]*$)', s['title'])[0] if s['title'] else ''
        nm = nm if len(nm) <= 72 else nm[:72].rsplit(' ', 1)[0] + '…'
        title = ('Get added to %s: “%s”' % (s['domain'], nm)) if nm else 'Get added to the list on %s' % s['domain']
        body['task']['lead'] = ('Ask %s to add AI Accountant to its list “%s”.' % (s['domain'], nm)) if nm else 'Ask %s to add AI Accountant to its list.' % s['domain']
        body['task']['points'] = ['Email the author or editor with two lines on what AI Accountant does, its price and a link to our matching page.']
        if s.get('brands'): body['task']['points'].append('Send the same details the list shows for %s, so adding us takes them little work.' % andj(s['brands'][:3]))
        body['today'] = ['This list is cited for %d of our tracked questions and searches: %s.' % (len(qs), cites(models[0]))]
        if s.get('brands'): body['today'].append('It names %s. AI Accountant is not on it.' % ', '.join(s['brands'][:6]))
        else: body['check'].append('We could not read this page automatically. Open it first and check whether AI Accountant is already on it.')
        body['today'] += why_lines(best, engines)[:1]
        body['model_title'] = 'The list we want to be on'
        body['works'] = ['%s %s this list when answering, and %s the tools it names. Once the list names AI Accountant, those answers have a source that does.' % (who, 'reads' if one else 'read', 'repeats' if one else 'repeat')]
        body['done'] = ['The list names AI Accountant, and %s %s us on the questions that cite it.' % (who, 'names' if one else 'name')]
    elif t['channel'] == 'Review site':
        s = models[0]['s']; kind = 'Listing'
        site = SITE.get(site_of(s['domain']), s['domain'])
        title = 'Get AI Accountant listed on %s' % site
        body['task']['lead'] = 'Create or complete the AI Accountant profile on %s, in the same categories as the tools cited.' % site
        body['task']['points'] = ['Fill in price, features and screenshots.', 'Ask a few customers to leave reviews; these pages rank tools by reviews.']
        body['today'] = ['%s pages are cited for %d of our tracked questions and searches by %s.' % (site, len(qs), who),
                         'The pages cited are about other tools. There is no AI Accountant page there for the assistants to pick up.']
        body['model_title'] = 'Pages cited on %s' % site
        body['works'] = ['%s already %s %s as a source. A profile for AI Accountant puts us on a site it reads.' % (who, 'uses' if one else 'use', site)]
        body['done'] = ['AI Accountant has a profile on %s, and %s %s us on the questions that cite it.' % (site, who, 'names' if one else 'name')]
    elif t['channel'] in ('Reddit', 'Quora'):
        s = models[0]['s']; kind = 'Thread answer'
        title = 'Answer the %s thread “%s”' % (t['channel'], (s['title'] or best['label'])[:70])
        body['task']['lead'] = 'Reply in the %s thread “%s” with a useful answer that mentions AI Accountant as one option.' % (t['channel'], (s['title'] or best['label'])[:90])
        body['task']['points'] = ['Post from a real, named account and answer the question first. Promotional replies get removed.']
        body['today'] = ['The thread is cited for %s: %s.' % (quoted, cites(models[0]))] + why_lines(best, engines)[:1]
        body['model_title'] = 'The thread'
        body['works'] = ['%s %s this thread for its answer. A reply that mentions AI Accountant puts our name in a source it already uses.' % (who, 'reads' if one else 'read')]
        body['done'] = ['The thread mentions AI Accountant, and %s %s us for this %s.' % (who, 'names' if one else 'name', what)]
    else:
        ch = t['channel']; kind = 'Video' if ch == 'YouTube' else 'Post'
        thing = {'YouTube': 'YouTube video', 'LinkedIn': 'LinkedIn post', 'Facebook': 'Facebook post', 'Instagram': 'Instagram post', 'X': 'X post'}[ch]
        title = '%s for %s' % (thing, quoted)
        top = {}
        for m in models:
            for e, k, n, _ in m['uses']:
                if e not in top or k / n > top[e][0] / top[e][1]: top[e] = (k, n)
        if ch == 'YouTube':
            body['task']['lead'] = 'Record a YouTube video that answers %s and publish it on the AI Accountant YouTube channel.' % quoted
            body['task']['points'] = ['Show AI Accountant doing the job on screen.']
        else:
            body['task']['lead'] = 'Publish %s from the AI Accountant account that answers %s.' % ('an ' + thing if thing[0] in 'XI' else 'a ' + thing, quoted)
            body['task']['points'] = ['Show AI Accountant doing the job, in a short clip or screenshots.']
        titles = [m['s']['title'] for m in models[:2] if m['s']['title']]
        if titles: body['task']['points'].append(('Word the title like the ones cited: ' if ch == 'YouTube' else 'Open it the way the cited ones do: ') + '; '.join('“%s”' % x[:80] for x in titles) + '.')
        body['task']['points'].append('Link to our page for this %s in the %s.' % (what, 'description' if ch == 'YouTube' else 'post'))
        body['today'] = ['%s for this %s.' % ('; '.join('%s cited %s in %s %s' % ('Google' if e == 'google' else NAME[e], ('%d %ss' % (len(models), thing)) if len(models) > 1 and one else ('an ' if thing[0] in 'XI' else 'a ') + thing, of(*top[e]), 'AI Overviews' if e == 'google' else 'answers') for e in engines if e in top), 'question' if isq else 'keyword')]
        body['today'] += why_lines(best, engines)[:1]
        body['model_title'] = '%ss cited today' % thing
        body['works'] = ['%s %s %s for this %s, and none of the ones cited is ours. One of our own gives %s a source that shows AI Accountant.' % (who, 'uses' if one else 'use', thing + 's', what, 'it' if one else 'them')]
        body['done'] = ['%s %s our %s for this %s.' % (who, 'cites' if one else 'cite', thing, what)]
    score = sum(questions[tq]['score'] * (WEIGHT.get(e, 0.1)) for tq, e in t['targets'])
    rows.append({'task_key': key, 'title': title, 'channel': t['channel'], 'kind': kind, 'priority': best['priority'], 'assistants': engines, 'score': round(score, 4),
                 'prompt_keys': [k for k in qs if questions[k]['kind'] == 'question'], 'keyword_ids': [k for k in qs if questions[k]['kind'] == 'keyword'], 'body': body, 'qpos': best['pos'], 'q': best['key']})

CH = ['Website', 'Outreach', 'Review site', 'YouTube', 'LinkedIn', 'Reddit', 'Quora', 'X', 'Facebook', 'Instagram']
rows.sort(key=lambda r: (r['qpos'], CH.index(r['channel']), -r['score']))
for i, r in enumerate(rows): r['sort'] = i + 1

# ---------- the per-question plan shown when a question is opened
qrows = []
for x in order:
    cells = {}
    for e, c in x['cells'].items():
        if not c: continue
        cells[e] = {'n': c['n'], 'rec': c['rec'], 'named': c['named'], 'linked': c['linked'], 'gap': c['gap'], 'names': c['names'], 'cited_pages': c['cited_pages'],
                    'sources': [{'url': s['url'], 'domain': s['domain'], 'title': s['title'], 'tag': TAG[s['type']], 'answers': s['answers'], 'prev': s['prev'], 'names_us': bool(s.get('names_us')),
                                 'words': s.get('words'), 'brands': (s.get('brands') or [])[:4]} for s in c['sources'][:8]]}
    mine = [r['task_key'] for r in rows if x['key'] in r['prompt_keys'] + r['keyword_ids']]
    qrows.append({'q_key': x['key'], 'kind': x['kind'], 'text': x['text'], 'label': x['label'], 'stage': x['stage'], 'topic': x['topic'], 'priority': x['priority'], 'score': x['score'], 'pos': x['pos'],
                  'start_here': x['key'] in START, 'volume': x['volume'], 'organic_rank': x['rank'], 'body': {'cells': cells, 'tasks': mine}, 'based_on_run': RUN})
for r in rows: r['start_here'] = r['q'] in START; r['based_on_run'] = RUN; del r['qpos'], r['q']
json.dump(qrows, open(W + '/questions.json', 'w'), ensure_ascii=False)
json.dump(rows, open(W + '/tasks.json', 'w'), ensure_ascii=False)
json.dump({'run': RUN, 'prev': PREV, 'weights': WEIGHT, 'leads': LEADS, 'lead_total': LEAD_TOTAL, 'pages_read': sum(1 for p in pages.values() if p.get('code') == '200'), 'pages_tried': len(pages)}, open(W + '/meta.json', 'w'))

print('run', RUN, 'prev', PREV, 'weights', {k: round(v, 2) for k, v in WEIGHT.items()})
print('questions', C.Counter((x['kind'], x['priority']) for x in order))
print('tasks', len(rows), C.Counter(r['channel'] for r in rows).most_common())
print('by priority', C.Counter(r['priority'] for r in rows), 'by kind', C.Counter(r['kind'] for r in rows))
print('by assistant', C.Counter(e for r in rows for e in r['assistants']))
print('source types (strong, gaps incl.)', C.Counter(s['type'] for x in order for c in x['cells'].values() if c for s in c['sources']).most_common())
