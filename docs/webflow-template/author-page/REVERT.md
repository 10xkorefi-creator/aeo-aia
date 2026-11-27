# Author page redesign: how to revert

Changed: the custom HEAD code of the Authors template page only
(Webflow site `67ed19ac5d8a1253defd2450`, page `67ed19ac5d8a1253defd24d4`, served at `/author/<slug>`).
Published to staging only (`korefi-new-ad79e3da626e3af649279f0df167.webflow.io`). No element, CMS item,
other page, site-wide code or footer code was changed.

- `head.before.html`: the head code before the change (the Person JSON-LD only).
- `footer.before.html`: the footer code before the change (empty; not touched).
- `head.after.html`: the head code now. The Person JSON-LD is unchanged at the top; everything from the comment
  `<!-- Author page design (v2)` to the end is new: three meta tags, the Inter font link, one `<style data-author-v2>`
  and one `<script data-author-v2>`.

## Revert

1. Webflow Designer > Pages > Authors Template > settings > Custom code > "Inside head tag":
   delete everything from `<!-- Author page design (v2)` to the end, or paste the content of `head.before.html`.
   Through the connector: `data_scripts_tool` > `set_page_freeform_code`, page `67ed19ac5d8a1253defd24d4`,
   location `head`, content = `head.before.html` (the write replaces the whole block).
2. Publish. The page returns to the earlier layout; nothing else depends on this code.

The article feeds in the Supabase bucket (`blog-images/authors/<slug>.json`) are only read by this script.
They can stay, or be deleted from the bucket. See `scripts/authors/README.md`.

## Screenshots

- `before-desktop-harsh.png`: the live page before (1366px).
- `after-desktop-harsh.png`, `after-phone-harsh.png`, `after-desktop-rohan.png`: staging after.
