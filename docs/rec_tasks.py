#!/usr/bin/env python3
"""Goal 2: the individual tasks under each recommendation, as data.

One task is one thing to make or do: a page, a video, a post, a listing. Each carries the channel it belongs to and the
tracked questions and Google keywords it is meant to move. A channel task exists only where the baseline shows that
channel being cited for those questions or keywords. All figures are from the run of 21/11/2026 unless stated.

Usage:  python3 rec_tasks.py > rec_tasks.json
Then upsert into Supabase table aeo_rec_tasks (on_conflict=task_key), the same way as recommendations.json.
"""
import json

TASKS = []
def T(key, rec, title, channel, kind, effort, prompts, keywords, why, model, include, done):
    TASKS.append({"task_key": key, "rec_key": rec, "sort": len(TASKS) + 1, "title": title, "channel": channel, "kind": kind, "effort": effort,
                  "status": "To do", "prompt_keys": prompts, "keyword_ids": keywords, "is_active": True,
                  "body": {"why": why, "model": model, "include": include, "done": done}})

YT_GOOGLE = "Google's AI Overviews cited a YouTube video in 238 of the 369 AI Overviews it showed on our keywords. None of those videos mentions AI Accountant in its title."

# ---------------------------------------------------------------- REC-1: which tool for Tally (ChatGPT)
T("T-01", "REC-1", "Publish a page: bank statement to Tally", "Website", "New page", "1 page",
  ["P010", "S002", "S003"], ["K043", "K110", "K111"],
  ["ChatGPT recommended us in 0 of 9 answers on the three bank statement questions, and has not named us on “any AI tool for bank statement to Tally entries?” in 14 answers over four runs.",
   "Perplexity recommended us in 9 of 9 answers on the same three questions, so the answer is winnable.",
   "On Google, “bank statement to tally” and “pdf bank statement to tally” (90 searches a month each) show an AI Overview that does not link to us."],
  [{"url": "https://help.tallysolutions.com/pdf-bank-statement-import/", "note": "Tally's help page, cited in 16 ChatGPT answers on Tally questions. 1,109 words: the steps, then questions and answers."},
   {"url": "https://help.tallysolutions.com/bank-statement/", "note": "Tally's help page, 685 words, cited in 18 ChatGPT answers on Tally questions."}],
  ["Title that is the buyer's question: bank statement to Tally, how to do it and which tool to use.",
   "The direct answer in the first two lines.",
   "The steps in Tally itself (the built-in import and Docs by Ira).",
   "A short section on where the built-in feature stops and what AI Accountant adds, with the price. Product team to confirm every claim.",
   "A questions-and-answers block at the end."],
  ["The page appears as a cited page when you click these questions on the AI assistants page.",
   "ChatGPT recommends us with a link in at least 2 of 3 answers on one of the three questions, held for two runs."])

T("T-02", "REC-1", "Publish a page: PDF invoice to Tally", "Website", "New page", "1 page",
  ["P007"], ["K107", "K108"],
  ["“PDF invoice to Tally software?”: no assistant recommended us in 9 answers. ChatGPT named Docs by Ira, InvoiceAI and TallyConnects.",
   "ChatGPT cited no aiaccountant.com page on this question."],
  [{"url": "https://tallykipathshala.com/blog/tally-ira-pdf-scan-feature-pdf-se-direct-tally-entry-kaise-kare", "note": "A 435-word post about Tally's PDF scan feature. Cited in 29 ChatGPT answers across the Tally topic."},
   {"url": "https://tallyconnects.com/", "note": "A small add-on whose homepage states this one job. Cited in 6 ChatGPT answers on the Tally tool questions."}],
  ["Title: PDF invoice to Tally.", "The direct answer first, then the steps with Docs by Ira.",
   "Where the built-in feature stops (to be confirmed by the product team) and what AI Accountant adds, with the price.",
   "A small comparison table of the options ChatGPT names today, with AI Accountant in it."],
  ["The page is cited for “PDF invoice to Tally software?”.", "ChatGPT names and links us in at least 2 of 3 answers on that question, held for two runs."])

T("T-03", "REC-1", "Publish a page: Excel to Tally", "Website", "New page", "1 page",
  ["P011"], ["K042"],
  ["“Best Excel to Tally software?”: no assistant named us in 9 answers. ChatGPT named udiMagic, Excel2Tally and Quick2Tally.",
   "“Excel to tally” has 1,100 searches a month on Google. Its AI Overview does not link to us and we are not on page one."],
  [{"url": "https://tallysolutions.com/tally/import-data-from-excel-to-tallyprime/", "note": "Tally's own page. Cited in 8 of 24 Google searches across the Tally keywords."}],
  ["Title: Excel to Tally.", "The built-in import steps first.", "Where a tool is needed (bulk, messy sheets) and what AI Accountant does, with the price.",
   "A comparison table of the Excel-to-Tally tools ChatGPT names today, with AI Accountant in it."],
  ["The page ranks on page one for “excel to tally” (today: not on page one).", "An assistant names us on “best Excel to Tally software?” (today: 0 of 9 answers)."])

T("T-04", "REC-1", "Publish a page: best Tally automation software in India", "Website", "New page", "1 page",
  ["P002", "P001", "P072", "P076"], [],
  ["“Best Tally automation software in India”: ChatGPT recommended us in 1 of 4 answers in each of the first two runs and in 0 of 3 in the last two. Its list now starts with Docs by Ira and Vyapar TaxOne.",
   "ChatGPT names us without a link on “best AI tool for Tally Prime?” (2 of 3 answers) and “AI agent for Tally Prime?” (1 of 3)."],
  [{"url": "https://flickai.in/resources/best-ai-accounting-software-india-startups/", "note": "The list post the assistants quote most (30 answers). It opens with a quick answer, then says which tool fits which situation, then a comparison table with prices."}],
  ["A fair list of the real options, Docs by Ira and Vyapar TaxOne included, with one factual line each: who it suits, what it automates, starting price.",
   "A “which one fits your situation” section near the top.", "The year in the title, and the update date shown."],
  ["ChatGPT recommends us with a link on “best Tally automation software in India” again, in at least 2 of 3 answers for two runs.",
   "The answers that already name us on the two AI tool questions start to link to us."])

T("T-05", "REC-1", "Publish a page: bank reconciliation in Tally for a small business", "Website", "New page", "1 page",
  ["S004"], ["K057"],
  ["“Best tool to automate bank reconciliation in Tally Prime for a small business with one or two accountants?”: recommended in 0 of 9 answers.",
   "ChatGPT answers the bank reconciliation questions from Tally's auto bank reconciliation help page, cited in 11 of 30 answers on the Tally tool questions."],
  [{"url": "https://help.tallysolutions.com/auto-bank-reconciliation/", "note": "Tally's help page for automatic bank reconciliation."}],
  ["Written for the situation in the question: a small business, one or two accountants, Tally Prime.", "Tally's built-in reconciliation first, then what AI Accountant adds, with the price.",
   "One worked example with real numbers."],
  ["An assistant recommends us with a link on this question (today: 0 of 9 answers)."])

T("T-06", "REC-1", "Record a video: bank statement PDF to Tally", "YouTube", "Video, 3 to 5 minutes", "1 video",
  ["P010"], ["K043", "K110"],
  [YT_GOOGLE,
   "For “bank statement to tally”, Google cited the video “Import Bank Statement PDF directly to Tally” in 4 of 4 searches.",
   "Perplexity cited a YouTube video in 3 of 3 answers on “how to import PDF bank statement in Tally Prime”, and Gemini in 1 of 3."],
  [{"url": "https://www.youtube.com/watch?v=gUBC1iz1zc8", "note": "“Import Bank Statement PDF directly to Tally”: the video Google cites for this search."}],
  ["A screen recording of a real bank statement going into Tally through AI Accountant, start to finish.", "The search phrase in the title: bank statement PDF to Tally.",
   "A description that repeats the steps in text and links to the T-01 page."],
  ["Google's AI Overview for “bank statement to tally” cites our video (today: cites one video, not ours)."])

T("T-07", "REC-1", "Record a video: PDF and handwritten invoices to Tally", "YouTube", "Video, 3 to 5 minutes", "1 video",
  ["P007"], ["K107"],
  ["Perplexity cited a YouTube video in 3 of 3 answers on “PDF invoice to Tally software?” (“OCR Tool for Tally | Auto Import Invoices from Photos, PDFs & Scanned Docs”).",
   "It also cited one in 3 of 3 answers on “how to import purchase invoice from PDF in Tally Prime”.",
   "For “tally automation software”, Google cited “Automate Your Tally Entry with AI | Handwritten Invoice to Tally Prime” in 1 of 4 searches."],
  [{"url": "https://www.youtube.com/watch?v=QIv-pSK-vPQ", "note": "“Automate Your Tally Entry with AI | Handwritten Invoice to Tally Prime”: a demo video that Google cites for “tally automation software”."}],
  ["A real PDF invoice and a handwritten bill, each entered into Tally through AI Accountant.", "Title with the phrase PDF invoice to Tally.", "Description with the steps in text and a link to the T-02 page."],
  ["Perplexity or Google cites our video on these questions (today: they cite other vendors' videos)."])

T("T-08", "REC-1", "Record a short: Excel to Tally in a minute", "YouTube", "Short, under 60 seconds", "1 short",
  ["P011"], ["K042"],
  ["For “excel to tally” (1,100 searches a month), Google cited two YouTube videos in 4 of 4 searches. Both are Tally's own.", YT_GOOGLE],
  [{"url": "https://www.youtube.com/watch?v=_dBQBJowJXU", "note": "“Import Data from Excel to TallyPrime”: cited in 4 of 4 searches."}],
  ["One Excel sheet turned into Tally entries, shown in under a minute.", "Title: Excel to Tally.", "Link to the T-03 page in the description."],
  ["Google's AI Overview for “excel to tally” cites our video."])

T("T-09", "REC-1", "Post the Tally videos on our Facebook page", "Facebook", "Video post", "2 posts",
  [], ["K037", "K040"],
  ["Google cited a Facebook video in 3 of 4 searches for “tally ai” (500 searches a month) and in 3 of 4 for “tally automation software”.",
   "All of those are Tally Solutions' own Facebook videos about its built-in AI."],
  [{"url": "https://www.facebook.com/tallysolutions", "note": "Tally Solutions' page. Its videos “Tally Prime AI for SMEs: Cut Data Entry and Make Work Smarter” and “TallyPrime 7.2: AI Invoice Creation…” are the ones cited."}],
  ["Upload the T-06 and T-07 videos directly to Facebook (not as YouTube links).", "A title that states the job: AI for Tally data entry.", "Two or three lines of text that say what the video shows."],
  ["Google's AI Overview for “tally ai” or “tally automation software” cites one of our Facebook videos."])

# ---------------------------------------------------------------- REC-2: named where ChatGPT already cites us
T("T-10", "REC-2", "Edit our GSTR-2B comparison page", "Website", "Edit a page", "1 page",
  ["P039", "P040", "S008", "P083"], ["K051", "K050"],
  ["ChatGPT cited this page in 30 of 34 answers on three GST questions over four runs and named AI Accountant in none.",
   "Four of the tools ChatGPT recommends (ClearTax, Winman, KDK Spectrum, IRIS Sapphire) are rows in this page's own table.",
   "The page's key takeaways describe us with praise (“sets a new standard with advanced matching algorithms”) and the other tools with facts."],
  [{"url": "https://www.aiaccountant.com/blog/gstr-2b-reconciliation-tools-guide", "note": "The page to edit. 2,456 words, last updated 21/07/2026."},
   {"url": "https://themunim.com/blog/best-gstr-2b-reconciliation-software-in-depth-comparison/", "note": "A rival comparison ChatGPT also cites (6 answers): 1,524 words, the comparison table near the top."}],
  ["A one-line verdict for each tool right under the title, ours included, as fact: who it suits, how it gets the data, starting price.",
   "Replace the praise in the key takeaways with the same facts given for the other tools.", "Show the new update date."],
  ["ChatGPT names and links us in at least 2 of 3 answers on two of the four questions, held for two runs (today: 0 of 12)."])

T("T-11", "REC-2", "Edit our manufacturing accounting software page", "Website", "Edit a page", "1 page",
  ["P067", "S006"], ["K017"],
  ["“Best accounting software for manufacturing business in India”: ChatGPT cited this page in 10 of 14 answers over four runs and named us in none.",
   "On Google, “manufacturing accounting software” (90 searches a month): we rank 8th and the AI Overview does not link to us."],
  [{"url": "https://www.aiaccountant.com/blog/manufacturing-accounting-software", "note": "The page to edit. 4,297 words. It already opens by naming AI Accountant first, which alone has not been enough."}],
  ["State what AI Accountant is in one factual line: an automation layer on top of Tally, not a replacement accounting system.",
   "Say which manufacturer it suits and which it does not, the way the page does for Tally and Zoho.", "Add the starting price to its row."],
  ["ChatGPT names us on the manufacturing question (today: 0 of 3 answers, with the page cited in 3).", "Google's AI Overview for “manufacturing accounting software” links to us."])

T("T-12", "REC-2", "Add price and plain facts to the GST reconciliation product page", "Website", "Edit a page", "1 page",
  ["P039", "P040"], ["K049"],
  ["The product page shows no price. Our own comparison table says “from ₹500 a month”.",
   "The answers we read quote a price for the tools they recommend (for example Zoho Books “from around ₹749 a month”).",
   "ChatGPT did not cite this product page on the GST questions; it cited the blog post instead."],
  [{"url": "https://www.aiaccountant.com/products/gst-reconciliation", "note": "The page to edit. 714 words, no price."},
   {"url": "https://cleartax.in/gst", "note": "ClearTax's product page, cited in 9 ChatGPT answers on GST questions."}],
  ["The starting price.", "What it matches (GSTR-2B against the purchase register), and how it gets the data.", "That it works with Tally, and multi-GSTIN support, stated as facts."],
  ["ChatGPT cites the product page on a GST question.", "An answer that names us also states our price."])

T("T-13", "REC-2", "List AI Accountant on SaaSworthy in the GST software category", "Directory", "Listing", "1 listing",
  ["P039", "P040"], [],
  ["ChatGPT cited SaaSworthy's ClearTax listing in 5 answers on GST questions.", "AI Accountant appears only on our own site for these questions, so nothing independent confirms it."],
  [{"url": "https://www.saasworthy.com/product/cleartax-gst-software", "note": "The ClearTax listing ChatGPT cites. We could not open it to read it (the site blocked the request)."}],
  ["Category: GST software.", "The same factual description and starting price as on our product page.", "Screenshots and the Tally integration."],
  ["The listing is live.", "ChatGPT cites it, or names us, on a GST question."])

T("T-14", "REC-2", "List AI Accountant on SoftwareSuggest and Techjockey", "Directory", "Listing", "2 listings",
  ["P039", "P040", "P030"], [],
  ["ChatGPT cited techjockey.com in 8.5% of its answers and softwaresuggest.com in 8.2% in the latest run.",
   "On broad questions it cited SoftwareSuggest's pricing page for Vyapar in 12 answers."],
  [{"url": "https://www.softwaresuggest.com/vyapar/pricing", "note": "A directory pricing page, cited in 12 ChatGPT answers on broad accounting questions."}],
  ["Listings in the accounting and GST categories.", "A public starting price, because the pricing pages are what get cited."],
  ["Both listings are live with a price shown."])

T("T-15", "REC-2", "Set up or complete the AI Accountant profile on X", "X", "Profile", "1 hour",
  ["P039", "P083", "P001", "P030"], [],
  ["ChatGPT cited a vendor's X profile in 14 answers across 9 questions: ClearTax, Winman, Marg ERP and RealBooks.",
   "That includes “best GSTR 2B reconciliation software?” and “best AI tool for GSTR 2B reconciliation?”."],
  [{"url": "https://x.com/gst_clear", "note": "“Clear GST by ClearTax” on X, one of the profiles ChatGPT cited."}],
  ["Name, one-line description that says what the product does and for whom, and the website link.", "A pinned post with the same factual description."],
  ["The profile exists and is complete. This is cheap and its effect is uncertain: treat any change as a bonus."])

T("T-16", "REC-2", "Record a video: GSTR-2B and ITC reconciliation, step by step", "YouTube", "Video, 5 minutes", "1 video",
  [], ["K053", "K052"],
  ["For “itc reconciliation” (150 searches a month), Google cited a YouTube video in 4 of 4 searches; for “gstr 2a reconciliation” (150), in 3 of 3.", YT_GOOGLE],
  [],
  ["Reconciling one month of GSTR-2B against the purchase register in AI Accountant, on screen.", "Title with the search phrase: ITC reconciliation, GSTR-2B.", "Link to the comparison page (T-10)."],
  ["Google's AI Overview for either keyword cites our video."])

T("T-17", "REC-2", "Publish a LinkedIn article: how to reconcile GSTR-2B with your books", "LinkedIn", "Article", "1 article",
  ["P037"], ["K054"],
  ["For “how to do gst reconciliation” (100 searches a month), Google cited a LinkedIn article in 4 of 4 searches.",
   "Perplexity cited the LinkedIn article “How to Reconcile GST Returns: A Step-by-Step Guide” in 3 of 3 answers on “how to do GST reconciliation for small business”."],
  [],
  ["A numbered, step-by-step article, published by a named person at AI Accountant.", "Plain steps first; one mention of the product, with a link, where automation helps."],
  ["Google or Perplexity cites the article on these two questions."])

# ---------------------------------------------------------------- REC-3: alternatives
T("T-18", "REC-3", "Rework our Docs by Ira page as “Docs by Ira alternatives”", "Website", "Edit a page", "1 page",
  ["C007"], ["K113", "K114"],
  ["“Docs by Ira alternatives for Tally Prime?”: we were named in 7 of 9 answers and linked in 1. Our own Docs by Ira page was not cited.",
   "Docs by Ira was named in 46 of 78 ChatGPT answers on Tally questions.", "“Tally ira” has 1,000 searches a month on Google; the AI Overview does not link to us."],
  [{"url": "https://potionlabs.ai/blog/docs-by-ira-ai-accountant-alternatives/", "note": "A rival's alternatives post, cited in 7 of 9 answers by all three assistants. Its address names both Docs by Ira and AI Accountant."},
   {"url": "https://orderdak.com/vs/docs-by-ira", "note": "Another rival's “vs” page, cited in 4 of 9 answers."}],
  ["Title and address that say “Docs by Ira alternatives”.", "Several real options listed fairly, AI Accountant among them, in a comparison table with prices.",
   "What Docs by Ira does well, stated honestly. Product team to confirm."],
  ["The page is cited on the Docs by Ira alternatives question.", "Answers that name us also link to us: at least 3 of 9, held for two runs (today: 1 of 9)."])

T("T-19", "REC-3", "Rework our Suvit page as “Vyapar TaxOne (Suvit) alternatives”", "Website", "Edit a page", "1 page",
  ["C001", "C002", "C009"], [],
  ["“Best Suvit alternatives?”: named in 1 of 9 answers, linked in none. “Vyapar TaxOne alternatives?”: ChatGPT named us in 2 of 3 with no link.",
   "Our comparison page (a blog post titled “Vyapar TaxOne (Suvit) vs AI Accountant”, updated 14/07/2026) was not cited on either question."],
  [{"url": "https://hellobooks.ai/compare/suvit", "note": "A rival's compare page, cited in 4 of 9 answers on the Suvit question."},
   {"url": "https://greenote.app/compare/suvit-alternative", "note": "Another, also cited in 4 of 9."}],
  ["Title that uses both names and the word alternatives.", "A fair list of alternatives with a comparison table and prices, not only us against them.", "The new update date."],
  ["The page is cited on the Suvit and Vyapar TaxOne questions.", "We are linked in at least 3 of 9 answers on one of them, held for two runs."])

T("T-20", "REC-3", "Create or complete our G2 profile", "Review site", "Profile", "1 profile",
  ["C002", "C001"], [],
  ["G2's “Vyapar TaxOne alternatives” page was cited in 5 of 9 answers on the Vyapar TaxOne question.", "G2's Vyapar TaxOne pricing page was cited in 3 more."],
  [{"url": "https://www.g2.com/products/vyapar-taxone/competitors/alternatives", "note": "The page the assistants cite. Products with a G2 profile in the same category are listed on it."}],
  ["Same category as Vyapar TaxOne.", "Factual description, pricing, screenshots.", "Ask five to ten customers for reviews: profiles without reviews rank low on alternatives pages."],
  ["AI Accountant appears on G2's Vyapar TaxOne alternatives page."])

T("T-21", "REC-3", "Create profiles on Capterra and Slashdot", "Review site", "Profile", "2 profiles",
  ["C002", "C001"], [],
  ["Capterra's Suvit page was cited in 3 of 9 answers on the Vyapar TaxOne question. Slashdot's Suvit alternatives page was cited in 3 of 9 on the Suvit question."],
  [{"url": "https://slashdot.org/software/p/Suvit/alternatives", "note": "Slashdot's alternatives page for Suvit."}],
  ["The same description, category and price as on G2."],
  ["Both profiles are live and AI Accountant shows on the Suvit alternatives pages."])

T("T-22", "REC-3", "Check how the Potion Labs post describes us and ask for corrections", "Outreach", "Review and email", "Half a day",
  ["C007"], [],
  ["potionlabs.ai/blog/docs-by-ira-ai-accountant-alternatives is cited in 7 of 9 answers on the Docs by Ira question, by all three assistants.", "Its address names AI Accountant, so what it says about us reaches the buyer."],
  [{"url": "https://potionlabs.ai/blog/docs-by-ira-ai-accountant-alternatives/", "note": "The post to read. We have not read its text yet."}],
  ["Read the post and note anything inaccurate about AI Accountant.", "Email the author with corrections and sources."],
  ["We know what the post says about us, and any error is corrected or disputed."])

T("T-23", "REC-3", "Record a short: Docs by Ira and AI Accountant, what each does", "YouTube", "Short, under 60 seconds", "1 short",
  ["C007"], ["K114", "K037", "K113"],
  ["For “tally ira” (1,000 searches a month), Google cited the short “How to Get Tally IRA Feature & Pricing Explained” in 4 of 4 searches.",
   "For “tally ai” (500), it cited the short “TallyPrime 7.2 + AI: Automate Invoice Entry with Docs by Ira!” in 3 of 4.", "For “docs by ira”, it cited two videos in 4 of 4 searches."],
  [{"url": "https://www.youtube.com/shorts/je8zxvIrR9s", "note": "“How to Get Tally IRA Feature & Pricing Explained”: the short Google cites for “tally ira”."}],
  ["Side by side: what Docs by Ira does, what AI Accountant adds. Product team to confirm.", "“Docs by Ira” and “Tally Ira” in the title.", "Link to the T-18 page."],
  ["Google's AI Overview for “tally ira”, “tally ai” or “docs by ira” cites our short."])

T("T-24", "REC-3", "Record a video: Vyapar TaxOne (Suvit) and AI Accountant compared", "YouTube", "Video, 3 to 5 minutes", "1 video",
  ["C009", "C001"], [],
  ["Perplexity cited the video “TallyPrime VS Suvit – Which One is Better?” in 3 of 3 answers on “is Suvit good for Tally automation?”."],
  [],
  ["An honest comparison on the same sample data.", "Both product names in the title.", "Link to the T-19 page."],
  ["Perplexity cites our video on the Suvit question."])

# ---------------------------------------------------------------- REC-4: the lists
T("T-25", "REC-4", "Ask Zoffer to add AI Accountant to its list", "Outreach", "Email", "1 email",
  ["P030", "P029", "P079", "P081"], [],
  ["zoffer.in's “8 Best AI Accounting Software for Indian Businesses” is cited in 19 answers across 8 questions. It does not mention AI Accountant.", "It lists Suvit (Vyapar TaxOne), our closest rival on Tally."],
  [{"url": "https://zoffer.in/guides/best-ai-accounting-software-india/", "note": "The list. Each tool has: best for, what the AI does, GST filing, starting price."}],
  ["A ready entry in their own format: best for, what the AI does, GST, starting price.", "One sentence on why their readers who use Tally would want it listed."],
  ["AI Accountant appears on the page. Zoffer sells its own product, so a refusal is possible."])

T("T-26", "REC-4", "Ask Skillopedia to add AI Accountant to its top 10", "Outreach", "Email", "1 email",
  ["P033", "P027", "P030"], [],
  ["skillopediagroup.com's “Best AI Tools for Accountants and CAs in India” is cited in 13 ChatGPT answers across 8 questions. It does not mention AI Accountant.", "It lists Vyapar TaxOne and ClearTax."],
  [{"url": "https://skillopediagroup.com/best-ai-tools-for-accountants/", "note": "The list. It says it describes each tool's AI “according to the vendor's own pages”, so our pages must state the features plainly."}],
  ["A ready entry: what the AI does, which accounting jobs it helps with, published price and data handling.", "Links to the pages on our site that document each claim."],
  ["AI Accountant appears on the page."])

T("T-27", "REC-4", "Ask AppAdvisor to add AI Accountant to its comparison", "Outreach", "Email", "1 email",
  ["P031", "P029"], [],
  ["appadvisor.in's price comparison is cited in 10 ChatGPT answers across 6 questions. It does not mention AI Accountant.", "AppAdvisor's GST software comparison was also cited on the Vyapar TaxOne alternatives question."],
  [{"url": "https://appadvisor.in/blogs/best-accounting-software-india-prices-compared", "note": "A software marketplace's comparison, built around what each tool costs over three years."}],
  ["A listing on the marketplace itself, with pricing.", "A request to be included under “other options worth a look”."],
  ["AI Accountant is listed on AppAdvisor with a price."])

T("T-28", "REC-4", "Publish a clear starting price on our pricing and product pages", "Website", "Edit pages", "Half a day",
  ["P079", "P030"], [],
  ["All four of the most-cited lists show a price for every tool, and the assistants repeat those prices in their answers.", "“AI accounting software price in India?”: no assistant named us in 9 answers.",
   "Our GST product page shows no price."],
  [],
  ["One starting price, in rupees, visible without a form.", "The same figure on every page that mentions price."],
  ["An assistant quotes our price, or names us on the price question."])

T("T-29", "REC-4", "Record a video: best AI accounting software in India, compared", "YouTube", "Video, 6 to 8 minutes", "1 video",
  ["P030"], ["K120", "K021"],
  ["For “ai accounting software india” (90 searches a month), Google cited a YouTube video in 4 of 4 searches and did not link to us.",
   "For “ai accounting software” (400), where the AI Overview already links to our site, it also cited two YouTube videos in 4 of 4."],
  [{"url": "https://www.youtube.com/shorts/YfhwDGKi7z4", "note": "“11 Best AI Tools for Accountants & Finance Professionals”: cited in 4 of 4 searches on two keywords."}],
  ["A fair comparison of the tools on the lists above, with prices on screen.", "“India” and the year in the title."],
  ["Google's AI Overview for “ai accounting software india” cites our video."])

T("T-30", "REC-4", "Answer in the Reddit threads Google cites", "Reddit", "Comment", "1 hour",
  [], ["K024", "K027", "K032", "K033"],
  ["Google cited a Reddit thread in 4 of 4 searches on four of our keywords, including “accounting ai tools” and “accounting automation”.",
   "The thread cited for “accounting ai tools” is r/Accounting's “Making a list of AI tools in accounting… what are you seeing or using?”."],
  [{"url": "https://www.reddit.com/r/Accounting/comments/1ktrrtt/", "note": "The thread Google cites for “accounting ai tools”."}],
  ["A useful answer from a named person at AI Accountant, saying who they work for.", "What the product does for Tally users, in two lines. No link dumping."],
  ["The comment is live and not removed. Reddit communities remove promotion, so this needs care."])

# ---------------------------------------------------------------- REC-5: CA firms on Google
T("T-31", "REC-5", "Update our “AI tools for chartered accountants” page", "Website", "Edit a page", "1 page",
  ["P054"], ["K024", "K072", "K122", "K074", "K123", "K125"],
  ["We rank on page one for six CA searches (470 a month). Google showed an AI Overview in all 24 searches and linked to us in none.",
   "The list posts Google cites carry 2026 in the title. Ours has no year in its title and a section headed “(2025)”."],
  [{"url": "https://coraa.ai/blog/best-free-tools-for-ca-firms-2026", "note": "Cited in 8 of 24 searches. Each heading is the searcher's question; one master table."},
   {"url": "https://www.aiaccountant.com/blog/best-ai-tools-for-ca-in-india", "note": "The page to edit. Last updated 18/08/2026."}],
  ["2026 in the title and headings.", "An at-a-glance table at the top.", "A section on free tools.", "Headings written as the questions people search."],
  ["The AI Overview links to us on at least three of the six keywords, held for two runs (today: 0 of 24 searches)."])

T("T-32", "REC-5", "Record a video: AI tools every Indian CA should know in 2026", "YouTube", "Video, 6 to 10 minutes", "1 video",
  [], ["K122", "K072", "K024"],
  ["For “ai tools for chartered accountants”, Google cited “AI Tools Every Chartered Accountant Must Use in 2026” in 4 of 4 searches and “AI in Accounting: Top 10 tools for Indian CAs in 2026” in 3 of 4.",
   "For “ai for chartered accountants”, it cited two YouTube videos in 4 of 4 searches."],
  [{"url": "https://www.youtube.com/watch?v=VMUDr_HxHiU", "note": "“AI Tools Every Chartered Accountant Must Use in 2026”: cited in 4 of 4 searches."}],
  ["Presented by a chartered accountant if possible: the cited videos are by CAs.", "The tools from our page, with AI Accountant shown working on a real client file.", "2026 and “chartered accountants” in the title."],
  ["Google's AI Overview for one of the three keywords cites our video."])

T("T-33", "REC-5", "Publish a LinkedIn post: AI tools for chartered accountants", "LinkedIn", "Post", "1 post",
  [], ["K122", "K072", "K024"],
  ["Google cited two LinkedIn posts in 4 of 4 searches for “ai tools for chartered accountants”, and two more in 4 of 4 for “ai for chartered accountants”.",
   "For “accounting ai tools”, it cited the LinkedIn post “5 FREE AI tools every finance professional needs in 2026” in 4 of 4."],
  [{"url": "https://www.linkedin.com/posts/aiwithsanchit_5-free-ai-tools-every-finan", "note": "The post Google cites for “accounting ai tools”: a numbered list from an individual, not a company page."}],
  ["Posted by a named person, ideally a CA, not only the company page: the cited posts are from individuals and firms.", "A numbered list of tools with one line each.", "The search phrase in the first line."],
  ["Google's AI Overview for one of the three keywords cites our post."])

T("T-34", "REC-5", "Record an Instagram reel: AI tools for a CA practice", "Instagram", "Reel", "1 reel",
  [], ["K072", "K122", "K073"],
  ["Google cited an Instagram reel in 4 of 4 searches for “ai for chartered accountants” and “ai ca”, and in 4 of 4 for “ai tools for chartered accountants”.",
   "The reel cited most is “Scale Your CA Practice Using AI Systems”."],
  [{"url": "https://www.instagram.com/reel/DXtd9x2Enne/", "note": "The reel Google cites on two of these keywords."}],
  ["Thirty to sixty seconds, one idea: a CA practice job done with AI.", "A caption that starts with the search phrase."],
  ["Google's AI Overview for one of the three keywords cites our reel."])

T("T-35", "REC-5", "Post the CA video on Facebook", "Facebook", "Video post", "1 post",
  [], ["K072"],
  ["Google cited a Facebook post in 4 of 4 searches for “ai for chartered accountants” (150 searches a month)."],
  [],
  ["Upload the T-32 video directly to Facebook.", "A title with the search phrase."],
  ["Google's AI Overview for “ai for chartered accountants” cites our Facebook post."])

# ---------------------------------------------------------------- REC-6, REC-7, REC-9
T("T-36", "REC-6", "Update our purchase entry page for “purchase entry in tally”", "Website", "Edit a page", "1 page",
  ["P006"], ["K046"],
  ["“Purchase entry in tally” has 900 searches a month. The AI Overview does not link to us and we are not on page one.", "We already have a blog post on purchase bill entry in Tally."],
  [],
  ["The manual steps first, in the searcher's words.", "Then how to automate it, with AI Accountant shown."],
  ["The page reaches page one for “purchase entry in tally”."])

T("T-37", "REC-7", "Publish a LinkedIn post: automating purchase entry in Tally", "LinkedIn", "Post", "1 post",
  ["P006", "P074"], [],
  ["Perplexity cited an individual's LinkedIn post in 3 of 3 answers on “how to automate purchase entry in Tally Prime” and in 3 of 3 on “how to do bulk purchase entry in Tally Prime”."],
  [],
  ["A short walkthrough from a named person, with a screen recording.", "Do this after REC-1 has been measured, because these questions are its control group."],
  ["Perplexity cites our post on one of the two questions."])

T("T-38", "REC-9", "Add the ten winning brands to the competitor list", "Tracking", "Data change", "Half a day",
  ["P039", "P040", "P007", "P011"], [],
  ["ChatGPT's picks on GST and Tally questions (ClearTax, Masters India, KDK Spectrum, IRIS Sapphire, Winman, TallyConnects, InvoiceAI, udiMagic, Excel2Tally, Quick2Tally) are not on our competitor list."],
  [],
  ["Add them as a watchlist, so past figures for the five direct competitors do not change.", "Note the date of the change on the dashboard."],
  ["The “who else gets recommended” table shows the new brands."])

print(json.dumps(TASKS, ensure_ascii=False, indent=1))
