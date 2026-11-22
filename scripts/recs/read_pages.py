# reads each cited page once and keeps a few facts about it (title, headings, length, which products it names)
import re, sys, json, subprocess, html, os, tempfile, urllib.parse
from concurrent.futures import ThreadPoolExecutor
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
NOFETCH = re.compile(r'(^|\.)(linkedin\.com|x\.com|twitter\.com|facebook\.com|instagram\.com|reddit\.com|quora\.com)$')
YT = re.compile(r'(^|\.)(youtube\.com|youtu\.be)$')
CTA = [r'(book|request|get|schedule|watch) (a |your |free )?demo', r'free trial|start free|try (it |now )?(for )?free', r'\bpricing\b', r'sign ?up|get started|create (an )?account']
def dom(u): return urllib.parse.urlparse(u).netloc.lower().replace('www.', '')
def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
def read(u):
    d = dom(u)
    if NOFETCH.search(d): return {'url': u, 'code': 'skip'}
    if YT.search(d):
        r = subprocess.run(['curl', '-sS', '-m', '20', 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote(u, safe='')], capture_output=True, text=True)
        try: j = json.loads(r.stdout); return {'url': u, 'code': '200', 'title': j.get('title', '')[:200], 'author': j.get('author_name', '')}
        except Exception: return {'url': u, 'code': 'err'}
    fd, fn = tempfile.mkstemp(dir='tmp'); os.close(fd)
    try:
        r = subprocess.run(['curl', '-sS', '-L', '--compressed', '-m', '30', '--max-filesize', '6000000', '-A', UA, '-H', 'Accept-Language: en-IN,en;q=0.9', '-o', fn, '-w', '%{http_code} %{content_type}', u], capture_output=True, text=True)
        code = (r.stdout.split() or ['err'])[0]; ctype = ' '.join(r.stdout.split()[1:])
        raw = open(fn, 'rb').read().decode('utf-8', 'ignore')
    finally:
        try: os.remove(fn)
        except OSError: pass
    if 'pdf' in ctype or raw[:5] == '%PDF-': return {'url': u, 'code': code, 'pdf': True}
    title = clean((re.search(r'(?is)<title[^>]*>(.*?)</title>', raw) or [None, ''])[1])[:200]
    links_us = bool(re.search(r'href=["\'][^"\']*aiaccountant\.com', raw, re.I))
    anchors = ' | '.join(clean(a)[:60] for a in re.findall(r'(?is)<(?:a|button)\b[^>]*>(.*?)</(?:a|button)>', raw)[:600]).lower()
    cta = sum(1 for p in CTA if re.search(p, anchors))
    body = re.sub(r'(?is)<(script|style|noscript|svg|nav|footer|header|form|aside)\b[^>]*>.*?</\1>', ' ', raw)
    h1 = [clean(h)[:140] for h in re.findall(r'(?is)<h1[^>]*>(.*?)</h1>', body)]
    h2 = [clean(h)[:110] for h in re.findall(r'(?is)<h2[^>]*>(.*?)</h2>', body)]
    text = clean(body)
    return {'url': u, 'code': code, 'title': title, 'h1': [h for h in h1 if h][:2], 'h2': [h for h in h2 if h][:16], 'words': len(text.split()),
            'tables': len(re.findall(r'(?i)<table', body)), 'faq': bool(re.search(r'(?i)frequently asked|\bFAQs?\b', text)), 'links_us': links_us, 'cta': cta,
            'text': text[:60000]}
os.makedirs('tmp', exist_ok=True)
urls = [l.strip() for l in open(sys.argv[1]) if l.strip()]
done = set()
if os.path.exists('pages.jsonl'): done = {json.loads(l)['url'] for l in open('pages.jsonl')}
todo = [u for u in urls if u not in done]
print('to read', len(todo), flush=True)
with ThreadPoolExecutor(16) as ex, open('pages.jsonl', 'a') as out:
    for i, o in enumerate(ex.map(read, todo)):
        out.write(json.dumps(o, ensure_ascii=False) + '\n'); out.flush()
        if i % 200 == 0: print(i, flush=True)
print('done', flush=True)
