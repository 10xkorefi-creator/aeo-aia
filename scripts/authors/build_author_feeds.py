#!/usr/bin/env python3
"""Builds the "Articles by this author" feeds that the Webflow author page (/author/<slug>) loads.

One small JSON file per author goes to the public Supabase bucket `blog-images` as authors/<author-slug>.json.
The author page script fetches that file by the author's slug and draws the article cards from it.

Scripts in this environment cannot call the Webflow API themselves, so this script reads a JSON export of the
CMS items. See README.md in this folder for how to make the export with the Webflow connector.

Usage:
  build_author_feeds.py --posts export/blog-posts.json [more.json ...] \
      [--authors export/authors.json] [--categories export/blog-categories.json] \
      [--out feeds] [--slim export/blog-posts.json] [--upload]

  --posts       one or more exports of Blog Posts items. Each file may be the raw connector result
                ({"result": {"items": [...]}}), {"items": [...]} or a plain list of items.
  --authors     export of Authors items (same shapes). Default: export/authors.json next to this script.
  --categories  export of Blog Categories items. Default: export/blog-categories.json next to this script.
  --out         folder for the feed files. Default: feeds/ next to this script.
  --slim        also write the posts back as one small export without the article bodies (keeps the repo light).
  --upload      upload the feed files to the bucket. Without it the script only writes them locally.

No secrets here: the session proxy signs the Supabase calls.
"""
import argparse, html, json, math, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
BUCKET = 'https://qmaphtslnvvifkzmbrvh.supabase.co/storage/v1'
WORDS_PER_MINUTE = 220


def load_items(path):
    d = json.load(open(path, encoding='utf-8'))
    if isinstance(d, dict) and 'result' in d: d = d['result']
    if isinstance(d, dict): d = d.get('items', [])
    return d


def minutes_for(fd):
    """Reading time in minutes: the CMS value when set, else worked out from the article length (or a stored word count)."""
    m = re.search(r'\d+', str(fd.get('time-to-read') or ''))
    if m: return int(m.group(0))
    words = fd.get('_words')
    if words is None and fd.get('post-body'):
        words = len(re.sub(r'<[^>]+>', ' ', fd['post-body']).split())
    return max(1, math.ceil(words / WORDS_PER_MINUTE)) if words else None


def slim(item):
    """The same item without the heavy fields, with the word count kept so reading time can still be worked out."""
    fd = dict(item.get('fieldData') or {})
    body = fd.pop('post-body', None)
    fd.pop('faq-schema', None)
    if body and '_words' not in fd: fd['_words'] = len(re.sub(r'<[^>]+>', ' ', body).split())
    return {k: item.get(k) for k in ('id', 'lastPublished', 'lastUpdated', 'createdOn', 'isArchived', 'isDraft')} | {'fieldData': fd}


def is_live(item):
    return not item.get('isDraft') and not item.get('isArchived') and bool(item.get('lastPublished'))


def clean(text):
    return re.sub(r'\s+', ' ', html.unescape(text or '')).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--posts', nargs='+', required=True)
    ap.add_argument('--authors', default=os.path.join(HERE, 'export', 'authors.json'))
    ap.add_argument('--categories', default=os.path.join(HERE, 'export', 'blog-categories.json'))
    ap.add_argument('--out', default=os.path.join(HERE, 'feeds'))
    ap.add_argument('--slim')
    ap.add_argument('--upload', action='store_true')
    a = ap.parse_args()

    posts, seen = [], set()
    for p in a.posts:
        for it in load_items(p):
            if it['id'] not in seen: seen.add(it['id']); posts.append(it)
    authors = load_items(a.authors)
    cats = {c['id']: c['fieldData']['name'] for c in load_items(a.categories)} if os.path.exists(a.categories) else {}

    if a.slim:
        json.dump({'items': [slim(p) for p in sorted(posts, key=lambda i: i['fieldData']['slug'])]},
                  open(a.slim, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        print('slim export: %s (%d items)' % (a.slim, len(posts)))

    os.makedirs(a.out, exist_ok=True)
    live = [p for p in posts if is_live(p)]
    print('%d Blog Posts items read, %d published and not draft' % (len(posts), len(live)))
    failed = 0
    for au in sorted(authors, key=lambda x: x['fieldData']['slug']):
        slug = au['fieldData']['slug']
        mine = sorted((p for p in live if p['fieldData'].get('author') == au['id']),
                      key=lambda p: (p.get('createdOn') or '', p['fieldData']['slug']), reverse=True)
        rows = []
        for p in mine:
            fd = p['fieldData']
            img = fd.get('thumbnail-image') or fd.get('main-image') or {}
            rows.append({'name': clean(fd.get('name')), 'slug': fd['slug'], 'summary': clean(fd.get('post-summary')),
                         'thumb': img.get('url') or '', 'category': cats.get(fd.get('blog-category')) or '',
                         'minutes': minutes_for(fd), 'published': (p.get('createdOn') or '')[:10]})
        feed = {'author': slug, 'generated': time.strftime('%Y-%m-%d'), 'count': len(rows), 'posts': rows}
        path = os.path.join(a.out, slug + '.json')
        json.dump(feed, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        line = '%-22s %4d posts  %6d bytes' % (slug, len(rows), os.path.getsize(path))
        if a.upload:
            key = 'authors/%s.json' % slug
            r = subprocess.run(['curl', '-sS', '-X', 'POST', '%s/object/blog-images/%s' % (BUCKET, key),
                                '-H', 'apikey: dummy', '-H', 'Authorization: Bearer dummy',
                                '-H', 'Content-Type: application/json; charset=utf-8', '-H', 'cache-control: max-age=300',
                                '-H', 'x-upsert: true', '--data-binary', '@' + path, '-w', '\n%{http_code}'],
                               capture_output=True, text=True)
            ok = r.stdout.strip().endswith('200')
            failed += 0 if ok else 1
            line += '  ' + ('%s/object/public/blog-images/%s' % (BUCKET, key) if ok else 'UPLOAD FAILED ' + (r.stdout + r.stderr)[-200:])
        print(line)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
