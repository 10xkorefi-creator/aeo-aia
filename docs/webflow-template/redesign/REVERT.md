# Undo the blog post template redesign (24 Nov 2026)

Site `67ed19ac5d8a1253defd2450`, page "Blog Posts Template" `67ed19ac5d8a1253defd24d6`.
Everything below was published to the staging subdomain only
(`korefi-new-ad79e3da626e3af649279f0df167.webflow.io`). Custom domains were not published.

All paths are under
`/tmp/claude-0/-home-user-aeo-aia/2293ad78-3960-5c36-8fa6-21acb490eef2/scratchpad/blog/webflow-template/`.

## What was changed (three things, nothing else)

| # | Where | Change | State before | State after |
|---|-------|--------|--------------|-------------|
| 1 | Page head custom code | One block appended: `<!-- Blog redesign styles ... -->` + `<style data-blog-redesign> ... </style>`. The two JSON-LD scripts above it are untouched. | `redesign-before/head.html` (2,556 chars) | `redesign-after/head.html` (8,252 chars) |
| 2 | Page footer custom code | One block appended: `<!-- Blog redesign: reading time and source lines ... -->` + `<script data-blog-redesign> ... </script>`. The first 16,803 characters are identical to before. | `redesign-before/footer.html` (16,803 chars) | `redesign-after/footer.html` (17,731 chars) |
| 3 | Element tree | One new element (with three children) added as the first child of `Div Block 123` (`83cbd71b-4964-f204-a7d1-5f60ab8584a1`). | `redesign-before/element-tree.json` | `redesign-after/new-elements.json` |

Not changed: no existing element was moved, deleted, hidden or had a setting changed
(`redesign-before/element-settings.json` holds their settings for reference, nothing to restore);
no Webflow class or style was created or edited; no CMS item, component, page setting or
site-level code was touched.

## Full undo, in this order

1. **Delete the byline element** (its three children go with it):
   `data_element_tool > remove_element`, id
   `{"component":"67ed19ac5d8a1253defd24d6","element":"600da01f-441d-2705-049b-696d064d542f"}`.
   Children, for reference: image `14059516-4f30-3092-2327-60579e3909a4`,
   "By" text `4850274b-64b3-b19c-7360-d75343dceaa3`,
   author name text `f9c439aa-a0ad-0217-5365-976e24eb8dc2`.
   Afterwards `Div Block 123` must have exactly three children again:
   `c3bca2df-...` (Text Block 95), `609334e9-...` (Text Block 72), `aaf41323-...` (Text Block 73).
2. **Write the head back**: `data_scripts_tool > set_page_freeform_code`, page
   `67ed19ac5d8a1253defd24d6`, location `head`, content = exact text of `redesign-before/head.html`.
   (Equivalent: delete from the comment `<!-- Blog redesign styles` to the closing `</style>`,
   plus the two newlines before the comment.) Keep the `\}` inside the `{{wf ...}}` tokens as they are.
3. **Write the footer back**: same action, location `footer`, content = exact text of
   `redesign-before/footer.html`. (Equivalent: delete from the comment
   `<!-- Blog redesign: reading time` to the closing `</script>`, plus the two newlines before it.)
4. Publish to staging only (`publish_site`, `publishToWebflowSubdomain: true`, `customDomains: []`, no pageId)
   and check that a post page contains neither `data-blog-redesign` nor `data-blog-byline`,
   and that it contains the text of `redesign-before/footer.html` verbatim.

Writes to head or footer code replace the whole block, so always send the full file text.

## Partial undo

- **Visual changes only** (tables, callout, figures, phone header, smaller gap): do step 2 only.
  The byline element then renders unstyled: "By" and the author name as plain text beside the date
  (the photo stays hidden, because its `hidden` attribute is only overridden by the style block).
  Do step 1 too if the byline should go.
- **Reading time only**: do step 3 only. The line returns to the fixed text "3 min read"
  (the element `aaf41323-ea69-dca5-d724-b662d67fa714` was never edited; the script only
  overwrites its text in the browser). Source lines then show as ordinary italic paragraphs.
- **Byline only**: do step 1 only. The style rules that mention `[data-blog-byline]` become inert.

## Notes for whoever edits these blocks later

- Footer: the stored script holds a real non-breaking space character in `' | <nbsp>'`
  (the connector turned the ` ` escape into the character). `redesign-after/footer.html`
  has it that way and matches the published page byte for byte.
- CMS tokens (`{{wf ...}}`) written into HtmlEmbed code through the connector are NOT rendered
  (tested in four formats; they come out as literal text). They do render in page head code.
- A link setting cannot be bound to the Author reference through the connector
  ("Incompatible binding"), so the byline name is plain text, not a link.
- Screenshots: `redesign-run/shots/before/`, `redesign-run/shots/after/` (same views),
  `redesign-run/shots/after-samples/` (with a sample callout, figure and source line injected
  in the browser only), `redesign-run/shots/widths2/` (1024, 820, 360, 320 px).
