#!/usr/bin/env python3
"""Puts rendered blog images where a web page can load them: the public Supabase storage bucket `blog-images`.
Usage: upload.py <out-dir from render.js> <post-slug>      prints one line per image: id, public address
No secrets here: the session proxy signs the Supabase calls."""
import json, subprocess, sys, time
out, slug = sys.argv[1].rstrip('/'), sys.argv[2]
B = 'https://qmaphtslnvvifkzmbrvh.supabase.co/storage/v1'
stamp = time.strftime('%Y%m%d')
res = []
for im in json.load(open(out + '/images.json')):
    key = '%s/%s-%s.png' % (slug, im['id'], stamp)        # dated name, so a re-made image never hides behind a cached one
    r = subprocess.run(['curl', '-sS', '-X', 'POST', '%s/object/blog-images/%s' % (B, key), '-H', 'apikey: dummy', '-H', 'Authorization: Bearer dummy',
                        '-H', 'Content-Type: image/png', '-H', 'x-upsert: true', '--data-binary', '@' + im['file'], '-w', '\n%{http_code}'], capture_output=True, text=True)
    if not r.stdout.strip().endswith('200'): print('FAILED', im['id'], r.stdout[-200:]); continue
    im['url'] = '%s/object/public/blog-images/%s' % (B, key); res.append(im)
    print(im['id'], im['url'])
json.dump(res, open(out + '/images.json', 'w'), indent=1)
