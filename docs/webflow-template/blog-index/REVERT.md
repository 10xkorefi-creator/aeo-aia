# Blog index restyle: how to revert

Changed: the custom HEAD code of the Blog index page only
(Webflow site `67ed19ac5d8a1253defd2450`, page `67ed19ac5d8a1253defd24d9`, served at `/blog`).
Published to staging only (`korefi-new-ad79e3da626e3af649279f0df167.webflow.io`). No element, CMS item,
other page, site-wide code or footer code was changed.

- `head.before.html`, `footer.before.html`: both were empty before the change.
- `head.after.html`: the head code now: the Inter font link, one `<style data-blog-index-v2>` and one small
  `<script data-blog-index-v2>` (it only marks square covers so they are shown whole on a blurred copy).

The code changes looks only. The two words it draws with CSS ("Blog" chip in the hero, "Read article →" in each card)
are not in the page's HTML.

## Revert

1. Webflow Designer > Pages > Blog > settings > Custom code > "Inside head tag": delete everything.
   Through the connector: `data_scripts_tool` > `set_page_freeform_code`, page `67ed19ac5d8a1253defd24d9`,
   location `head`, content = empty string.
2. Publish. The page returns to the earlier layout.

## Screenshots

- `before-desktop.png`: the live page before (1366px).
- `after-desktop.png`, `after-phone.png`: staging after.
