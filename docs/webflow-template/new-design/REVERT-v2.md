# Blog post "New design" switch (v2, 24 Nov 2026): what it is and how to undo it

Site `67ed19ac5d8a1253defd2450`, page "Blog Posts Template" `67ed19ac5d8a1253defd24d6`,
collection "Blog Posts" `67ed19ac5d8a1253defd24e1`.
Everything below was published to the staging subdomain only
(`korefi-new-ad79e3da626e3af649279f0df167.webflow.io`). Custom domains were not published.

All paths are under
`/tmp/claude-0/-home-user-aeo-aia/2293ad78-3960-5c36-8fa6-21acb490eef2/scratchpad/blog/webflow-template/`.
This file replaces `REVERT.md` (the earlier all-posts redesign): its head block and footer script are gone,
and its byline element now belongs to the switch.

## Turn the new look on or off for one post

- Designer or Editor: open the post in CMS > Blog Posts, set the switch **New design** on or off, save, publish.
- Connector: `data_cms_tool > update_collection_items`, collection `67ed19ac5d8a1253defd24e1`,
  `items: [{ id: "<item id>", fieldData: { "new-design": true } }]` (or `false`). Do not send `isDraft`.
  Then publish the site.
- A post with the switch off (or never set) gets none of the new code: the embed element and the byline
  element are not output at all, so the page is the classic design.
- Posts with the switch on today: `6b0566d499a121803e39d9c0` (`/blog/accounts-payable-automation-cost`) only.

## What exists now (five things)

| # | Where | State now | State before this run |
|---|-------|-----------|-----------------------|
| 1 | Collection field | Switch **New design**, slug `new-design`, id `b3d95b9b1396f27f4b1610625e1c2913`, not required | did not exist (`v2-before/fields.json`) |
| 2 | Embed element | HtmlEmbed `08fc191d-2a6c-72d6-93c1-6bf862f92b29`, first child of Body (before the navigation component). Code = `v2-after/embed.html` (one font link, one `<style data-blog-v2>`, one `<script data-blog-v2>`). Visibility bound to field 1 | did not exist |
| 3 | Byline element | `600da01f-441d-2705-049b-696d064d542f` (`data-blog-byline`, in Div Block 123): visibility bound to field 1 | visibility static `true` (`v2-before/element-settings.json`) |
| 4 | Page head code | `v2-after/head.html` = `head.final2.html` (the two JSON-LD scripts, 2,556 chars) | `v2-before/head.html` (same plus `<style data-blog-redesign>`, 8,252 chars) |
| 5 | Page footer code | `v2-after/footer.html` = `footer.final.html` (16,803 chars) | `v2-before/footer.html` (same plus `<script data-blog-redesign>`, 17,731 chars) |

Also changed: CMS item `6b0566d499a121803e39d9c0` has `new-design: true`. No other item was written to.
Not changed: shared components (navigation, footer), every existing class style, site-level code, page settings,
all other elements. The full tree before this run is `v2-before/element-tree.json`.

## Undo everything (back to the classic design for all posts, no switch)

Do the steps in this order, so that no half state can be published by accident.

1. **Delete the embed element**: `data_element_tool > remove_element`, id
   `{"component":"67ed19ac5d8a1253defd24d6","element":"08fc191d-2a6c-72d6-93c1-6bf862f92b29"}`.
   This alone removes the whole new look from every post.
2. **Delete the byline element** (its three children go with it): `remove_element`, id
   `{"component":"67ed19ac5d8a1253defd24d6","element":"600da01f-441d-2705-049b-696d064d542f"}`.
   Div Block 123 (`83cbd71b-4964-f204-a7d1-5f60ab8584a1`) must then have three children again:
   `c3bca2df-...` (Text Block 95), `609334e9-...` (Text Block 72), `aaf41323-...` (Text Block 73).
   (To keep the element but stop using the field, use `data_element_settings_tool > set_visibility`
   with `static_value: false` instead. Do not set it to `true`: unstyled, it prints "By" and the author
   name as plain text in the date line of every post.)
3. **Delete the field** (only after steps 1 and 2, because both elements are bound to it):
   `data_cms_tool > delete_collection_field`, collection `67ed19ac5d8a1253defd24e1`,
   field `b3d95b9b1396f27f4b1610625e1c2913`. The value stored on the test item goes with it.
   If you keep the field, set the test item back with `fieldData: { "new-design": false }`.
4. **Head and footer**: nothing to do. They already hold the pre-redesign text. To check:
   `data_scripts_tool > get_page_freeform_code` must return exactly `head.final2.html` and `footer.final.html`.
   If they ever need to be written again: `set_page_freeform_code`, page `67ed19ac5d8a1253defd24d6`,
   location `head` or `footer`, content = the whole file (a write replaces the whole block; keep the `\}`
   inside the `{{wf ...}}` tokens as they are).
5. Publish to staging only (`data_sites_tool > publish_site`, `publishToWebflowSubdomain: true`,
   `customDomains: []`, no pageId) and check that a post page contains neither `data-blog-v2` nor
   `data-blog-byline`, and contains `footer.final.html` verbatim.

## Go back to the earlier all-posts redesign instead (not recommended)

Write `v2-before/head.html` to the head and `v2-before/footer.html` to the footer, set the byline element's
visibility to static `true`, and delete the embed element. See `REVERT.md` for what those blocks did.

## Change the new look

- Edit `v2-after/embed.source.css` (selectors start with `T`, which the build turns into
  `html[data-wf-page='67ed19ac5d8a1253defd24d6']`, so every rule only matches on this template) and
  `v2-after/embed.source.js`, run `python3 build.py` from a folder laid out like `v2-run/src/`, then write the
  result with `data_element_settings_tool > set_settings`, element `08fc191d-...`, key `code`, `static_text.value`
  = whole embed text. The embed holds no double quotes, so it needs no escaping beyond the three regex
  backslashes in the script. In the Designer the same code is in the Embed element at the top of the Body.
- The embed is 28,185 characters. Webflow caps the size of an embed (50,000 characters as far as I know; not tested here), so keep an eye on it if the CSS grows.
- CMS tokens (`{{wf ...}}`) do not render inside embed code, so the embed holds none.

## How the new look hooks in (for whoever edits the template later)

- The embed sits before the navigation so its styles apply before the header paints. It adds no box of its own.
- The script sets the reading time in `.text-block-73` (words in `.blog-text` / 220, minimum 1) and marks it
  `data-v2`; adds class `blog-source` to paragraphs that are one `<em>` starting "Source"; and adds `bv2-faq`
  to an H2 that starts "FAQ", "FAQs", "Frequently asked questions" or "Questions" and `bv2-q` to the H3s after it.
- The cover image (`.blog-hero-img`) is hidden with CSS on new-look posts only. Main Image is untouched, so
  listings, Open Graph and the Article JSON-LD keep using it.
- The first blockquote, if it is among the first three blocks of the body, gets the label "Quick answer".
- The black header starts below the floating navigation (76px down on desktop, 68px on phones), so the
  navigation sits on white when the page opens and floats over the black band while scrolling.

## Evidence

- Old posts, live against staging: `v2-run/shots/final-old-vs-live/` (`*_live.png` and `*_staging.png`,
  1440 and 390 wide; `report.json`), HTML in `v2-run/html/final/`.
- Test post on staging: `v2-run/shots/final-new/` and, with a sample quick-answer box and source line
  injected in the browser only, `v2-run/shots/final-new-samples/`.
- Custom domains `lastPublished` before and after: `v2-before/site-before.json`, `v2-after/site-after.json`
  (all three stayed at `2026-11-24T13:24:45.373Z`).
