# Author page article feeds

The author page (`/author/<slug>`) shows "Articles by this author". Webflow cannot filter a collection list
to "posts by this author" through the connector, so the page loads a small JSON file per author instead:

    https://qmaphtslnvvifkzmbrvh.supabase.co/storage/v1/object/public/blog-images/authors/<author-slug>.json

Each file holds the author's published, non-draft blog posts, newest first:
`name`, `slug`, `summary`, `thumb` (thumbnail image, else the main image), `category`, `minutes`, `published`.

- `minutes` is the CMS "time to read" when it is filled in, otherwise worked out from the article length (220 words a minute).
- `published` is the date the post was created in the CMS. Webflow's "last published" date changes on every republish, so it is not used for ordering.

The files are a snapshot. A new or unpublished post shows on the author page only after a refresh.

## Refresh (after new posts are published)

Scripts here cannot call the Webflow API, so the export is made with the Webflow connector in a Claude session.

1. Ask Claude to export the Blog Posts collection with the Webflow connector: `data_cms_tool` > `list_collection_items`,
   collection `67ed19ac5d8a1253defd24e1`, `limit: 100`, `sort: {"slug": "asc"}`, offsets 0, 100, 200, ... until all items are read.
   The results are too large to show in the chat, so Claude Code saves each one to a file and prints its path.
2. Build and upload, passing those files:

       python3 scripts/authors/build_author_feeds.py --posts <page0.txt> <page1.txt> ... \
           --slim scripts/authors/export/blog-posts.json --upload

   `--slim` rewrites `export/blog-posts.json`, the same export without the article bodies, so the repo keeps a small copy.
   To rebuild from that copy later: `python3 scripts/authors/build_author_feeds.py --posts scripts/authors/export/blog-posts.json --upload`
3. If an author or a blog category was added, also update `export/authors.json` and `export/blog-categories.json`
   (id, name and slug of each item, from `list_collection_items` on collections `67ed19ac5d8a1253defd249c` and `6964b6b2cac56ac501495fe7`).

Without `--upload` the script only writes the files to `scripts/authors/feeds/`. The upload replaces the files in place;
browsers may keep the old copy for up to 5 minutes. No Webflow publish is needed for a refresh.

## Files

- `build_author_feeds.py`: the generator.
- `export/`: the CMS export the feeds were last built from (posts without bodies, authors, categories).
- `feeds/`: the feed files as uploaded.
