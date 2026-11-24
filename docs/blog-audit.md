# Blog audit for AI visibility, 24/11/2026

Scope: the 224 live posts in the Webflow blog category "Ai Accountant" (Virtual Accounting posts left out), the old n8n
workflow that wrote them (`qlzAVpY2BMmyiZgv`, inactive since 29/09/2026), and the blog page template.
Sources: Search Console, 90 days to 20/11/2026; our AI citation data, run of 21/11/2026 and the three before it; the page
HTML of all 374 blog pages; a close read of 14 of our posts and 3 competitor pages (`docs/blog-audit-notes.md`).

## 1. How the posts perform

| | |
|---|---|
| Google clicks, 90 days | 14,968 |
| Posts with no clicks | 48 (21%) |
| Posts with under 10 clicks | 148 (66%) |
| Posts with 100 or more clicks | 18 (8%) |
| Share of clicks from the top 5 posts | 68% |
| Share of clicks from the top 20 posts | 88% |
| Posts cited by any AI assistant, latest run | 37 (16%): ChatGPT 22, Perplexity 20, Gemini 10, Google 5 |
| Posts cited in any of the four runs | 52 (23%) |

- Traffic and AI citations are different posts. The top traffic posts are reference pages: CA GPT (4,479 clicks, 4 citing
  answers), Tally Prime shortcut keys (1,614, none), HSN code list (1,402, none). The most cited are close to the product:
  Tally integration (35), GSTR-2B reconciliation software (25), accounting software for manufacturing (22), purchase bill
  entry in Tally (22).
- 197 of the 216 citing answers go to the 78 posts that match a buyer prompt or search we track. 89 posts match none.
- By title type, share of posts cited: "best / top" lists 41%, "how to" 29%, guides 14%, questions 12%, "vs / alternative" 6%.
  All posts: 16%.
- Our posts run long: median 2,636 words. The pages assistants cite for our buyer prompts have a median of 1,739. 19% of our
  posts have a table; 43% of cited pages do. Among our own posts, those cited have a table twice as often (32% against 16%).
- 210 of 227 posts have no image in the body. Our name is written as something other than "AI Accountant" in every post
  somewhere; 34 posts never use the correct spelling.
- 97 posts were created in one month (December 2025). 157 of 227 carry one author.

## 2. What the old workflow did

One post every Monday, Wednesday and Friday from a keyword list (`aia_keyword_ahrefs`), written in one pass and published
live with no review.

| Step | What it did | Problem |
|---|---|---|
| Topic | Next unused Ahrefs keyword | Chosen for search volume, not for what buyers ask assistants. No check against posts we already had. |
| Research | A web search on 10 to 14 questions | Never read the pages that rank or get cited. Competitor sites were banned as sources, so comparisons were written without reading the competitor. |
| Our facts | One fixed paragraph | No customer results, screenshots or data of our own. |
| Writing | One model pass to a fixed skeleton | Same sections in every post. Length set by a table (for example 1,800 words, 5 sections, 8 questions). |
| Brand | "ZERO product mentions" in the body of reference and how-to posts; "max 1 mention" per section elsewhere | The posts that get traffic never say what we do. |
| Sources | "Max 3 external links", all nofollow, reference lists deleted | Claims go unsourced. The link check tests that a link loads, not that it supports the claim. |
| Tables | Writer told to include one; the HTML step told "NEVER output table tags" | Tables were flattened into bullets. |
| Review | A cliche checker that never received the draft | Nothing was checked. No fact check. |
| Publish | Live at once. No publish date, no tags, no image alt text, one hard-coded author | |

Worth keeping from it: the product guardrails (roadmap items are never presented as live), the list of primary sources,
the answer-first paragraph rule, the dead-link check and the Indian English rules.

An ImgBB API key sits in plain text inside the workflow and should be replaced.

## 3. What the close read found

Recurring faults, each seen across the sample:

1. **No answer at the top.** 12 of 14 posts open with benefit bullets.
2. **Our product bolted on as an advert.** In one post all 15 FAQ answers end with a line about AI Accountant. It has 21
   mentions and no citations.
3. **Our name spelt five ways**, and our own list entry is weak: on the small-business list we are number 1 as
   "AIAccountant (AIA)", described as sitting "on top of existing systems like Tally", with no price and no limits. ChatGPT
   names numbers 2 to 4 from that page and skips us.
4. **Wrong competitor set.** Posts compare us with QuickBooks, Xero, FreshBooks and Sage. Buyers and assistants name Docs by
   Ira, Vyapar TaxOne / Suvit, Zoho Books, ClearTax and Hisabkitab.
5. **Unsourced statistics**, or a homepage given as the source.
6. **Nothing first-hand.** No named customer or product screenshot in 14 posts.
7. **Titles and questions nobody types.**

What our four most-cited posts do that the uncited ones do not: the title is a search with a named object; the first sentence
answers and names tools; three of four have a table (none of the seven uncited do); real Indian tools with prices; one ranks
us second, describes us accurately and lists five things we do not do. Length, number of brand mentions and number of
external links did not differ. This is four posts against seven, so read it as a pattern, not proof.

What cited competitor pages do that ours do not: a labelled quick-answer block naming several tools; a stated source, check
date and method ("checked October 2026", "no paid placements"); their own product kept out of the ranking with its limits
admitted; a "choose this if" guide that names rivals; their own prices beside rivals'.

Flagged as wrong or risky, to verify before anything else is built on them: an e-invoicing threshold given as Rs 1 crore
(elsewhere Rs 5 crore); plan and limit details on the CA GPT page; an HSN code and a port code that do not look real;
unsourced criticism of a competitor's support; three different setup times for our own product across posts; product
features credited to us that may not exist.

## 4. The page template

Checked on all 374 blog pages.

| Item | State |
|---|---|
| Article schema | Present on 370, but the **author name is empty on all 370**, with no author link and no "date modified" |
| FAQ schema | On 1 page, although nearly every post has a questions section |
| Author page | **None.** The author name is plain text; `/author/...` returns not found |
| Author social link | The LinkedIn icon links to `#`. In the CMS only two of the four active authors have a LinkedIn address, and the author of 157 posts has none |
| Open Graph tags (title and image for sharing) | Missing on all pages |
| Meta description, canonical tag, breadcrumb schema | Present |
| "Updated on" date, table of contents | Present on 370 |
| AI crawlers in robots.txt | Allowed (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Google-Extended) |
| llms.txt | Present. It says "no free trial; a 100% money-back guarantee", while the site's buttons say "Book a Free Trial" |

## 5. What needs to change

### Content
1. **Topic comes from a tracked buyer prompt**, not a keyword list. One post per prompt, checked against existing posts first.
2. **Read what is cited before writing.** The brief already lists the pages each assistant cites.
3. **Answer first**, in a labelled block of two to four sentences that names the tools, AI Accountant among them.
4. **Describe our product accurately in one fixed form**: the same name, what it does for that job, price terms, and what it
   does not do. From one fact sheet.
5. **Compare with the tools buyers actually name**, in a table, with each tool's source and the date checked.
6. **Every number has a source that says it**, or it is left out. No invented examples.
7. **Add what only we have**: a named customer result, a screenshot, a figure from our own data.
8. **Shorter.** Aim near the cited pages' length, not 2,600 words. One questions section, with questions people ask.
9. **No fixed skeleton.** Structure follows the question type: list, comparison, how-to, pricing, explainer.
10. **Review before live.** Drafts, with a person publishing.

### Structure (the Webflow template and CMS)
1. Fill the author name in the Article schema, add the author's page address and profiles, and add "date modified".
2. Build author pages: photo, role, credentials, bio, working LinkedIn link, list of posts. Link the author name to it.
3. Fix the LinkedIn icon and fill each author's LinkedIn address in the CMS.
4. Add FAQ schema from the post's questions section.
5. Add Open Graph tags.
6. Use the CMS fields that exist but are empty: updated date (0 of 227), thumbnail (7), time to read (4).
7. Make llms.txt and the site agree on trial and pricing, and use it as the fact sheet.

### How sure we are
- Backed by our own data: topic choice (197 of 216 citations go to buyer-prompt posts), tables, shorter length, naming real
  competitors, list and how-to formats, our name and entry being skipped.
- Backed by the close read of a small sample: answer-first, sources, first-hand material.
- Standard practice we could not test in our data: schema, author pages, social links, Open Graph. They are cheap and the
  author schema is plainly broken, so they are worth fixing, but we cannot yet show they move citations.
