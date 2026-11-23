# Recommendations generator

Builds the tasks on the dashboard's Recommendations page from the latest run. Nothing is chosen up front: for each
tracked question and each assistant, the sources that assistant cited decide the task and its channel.

Run from the repo root, with a working folder outside the repo (the page cache is large):

```bash
W=/tmp/recs && mkdir -p $W
python3 scripts/recs/export.py $W          # run data from Supabase into $W/data
(cd $W && python3 /path/to/repo/scripts/recs/urls.py && python3 /path/to/repo/scripts/recs/read_pages.py urls.txt)   # read the cited pages
(cd $W && python3 /path/to/repo/scripts/recs/ours.py)   # our own pages: sitemap, titles, Search Console clicks and searches
python3 scripts/recs/build.py $W           # questions.json and tasks.json
python3 scripts/recs/load.py $W            # into aeo_rec_questions and aeo_rec_tasks
```

Rules, in `build.py`:

- A question has a gap on an assistant when it recommends us (names us and links to us) in fewer than half its answers.
  For Google the measure is the AI Overview linking to our site.
- Only sources cited in most of that assistant's answers count (2 of 3). Gemini cites few pages, so its top three are kept.
- Source type decides the task: a comparison list that leaves us out becomes outreach; a review site becomes a listing;
  YouTube, LinkedIn, X, Facebook and Instagram become a video or post; Reddit and Quora become a thread answer;
  product pages, articles and official pages become a page on our site (new, or an update when we already have a page cited).
- Priority: High is a buying question where ChatGPT has a gap. Medium is a how-to question, a question about a named
  competitor, or a Google search where we rank on page one. The rest is Low. "Start here" is the ten High questions
  where ChatGPT already links to or names us.
- For a page on our site, the kind of page comes from the question's wording and the kind of pages cited: comparison,
  alternatives, pricing guide, step-by-step guide or short guide on the blog, or a product page under Products.
- New page or update: a close page of ours with 100+ Google clicks in 90 days, or any product page, is only added to;
  a close blog page with little traffic can be reworked; if our nearest page is about something else, the task is a new
  page linked from it.
- An update task lists only what our page lacks next to the cited pages (tools named, question wording, table,
  name spelling, length, age). If it lacks nothing, no page task is made.
- Task keys are stable (`W-P001`, `O-<page>`, `R-<site>`, `Y-K042`), so assignees survive a rebuild.

`urls.py` and `read_pages.py` expect to run inside the working folder. Reading is plain HTTP; pages behind a bot
check are marked unread and their tasks say so.
