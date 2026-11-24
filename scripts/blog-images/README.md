# Blog images

Cover images and in-post figures in the AI Accountant look, drawn from templates. No image model is involved, so the
words, the logo and the numbers are exact, and every post looks like the same brand.

```bash
node scripts/blog-images/render.js spec.json out          # writes out/<id>.png and out/images.json
python3 scripts/blog-images/upload.py out <post-slug>     # hosts them in the public Supabase bucket blog-images, prints the addresses
```

`spec.json`:

```json
{ "post": { "title": "...", "kicker": "Accounts payable", "date": "24 Nov 2026",
            "author": { "name": "...", "role": "...", "photo": "https://..." } },
  "images": [ { "id": "cover", "type": "cover", "variant": "dark" },
              { "id": "fig-1", "type": "range_bars", "title": "...", "unit": "$", "max": 100000,
                "rows": [ { "label": "...", "min": 2000, "max": 10000, "text": "$2,000 to $10,000" } ], "source": "..." } ] }
```

| Type | For | Main fields |
|---|---|---|
| `cover` | the post's main image, 1200 x 630 | `variant` dark or light; title, kicker, author and date come from `post` |
| `range_bars`, `bars` | numbers by category | `rows` (`label`, `min`/`max` or `value`, `text`), `unit`, `max`, `source` |
| `cards` | two to four things side by side | `cards` (`head`, `value`, `unit`, `text`, `us`) |
| `checklist` | a list to act on | `items` |
| `table` | a comparison | `columns`, `rows`, `highlight` (row index for our row) |
| `steps` | a process | `steps` (`head`, `text`) |

Every figure also takes `kicker`, `title`, `sub`, `source` and `alt`.

Theme, from the brand guide: white, black, grey `#666666` and the single accent `#314DD0`; Helvetica Neue with tight
tracking (Inter where Helvetica Neue is not installed, which the guide allows); the A-Star mark always beside the
wordmark, on a plain field. The logo files in `assets/` are the official ones; do not redraw them.
