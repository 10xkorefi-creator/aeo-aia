// Plain-language explanations shown in the dashboard tooltips.
//
// Rule for this file: the "body" text explains what a figure MEANS and must not contain numbers or
// claims that depend on a particular run ("higher than", "most", a percentage). Anything that depends on the
// data goes in "now", which is built from the same database rows the page shows, so it updates by itself
// on every run. To change the wording of a tooltip, edit it here once; every tab picks it up.
import { pct, num, date } from '@/lib/format';

const has = (v) => v !== null && v !== undefined;
const range = (lo, hi) => (has(lo) && has(hi) ? `${pct(lo)} to ${pct(hi)}` : null);

// ---------- shared terms ----------
export const term = {
  ci: (rate, lo, hi) => ({
    title: '95% CI (confidence interval)',
    body: 'AI answers change from one ask to the next, so the measured rate would shift a little if we ran the same questions again. This is the range the true rate very likely sits in. A change between two runs only counts as real when it lands outside this range.',
    now: has(rate) && range(lo, hi) ? `This run: measured ${pct(rate)}, likely between ${range(lo, hi)}.` : null,
  }),
  samples: (n, what) => ({
    title: `Asked ${has(n) ? n : 'several'} times`,
    body: `Each ${what} is run several times in the same run, because the answer is not identical every time. Rates are counted over all of those answers together.`,
  }),
  volumeIn: {
    title: 'Volume (IN)',
    body: 'Roughly how many times people in India search this keyword on Google in a month, according to Ahrefs. It is an estimate, used here to tell popular keywords from rare ones.',
  },
  segment: {
    title: 'Segment',
    body: 'Buyer keywords are searches by someone looking for a product like ours. Informational keywords are how-to and lookup searches, the kind a blog post or free tool answers. Buyer keywords feed the headline numbers.',
  },
  organicRank: {
    title: 'AiA organic rank',
    body: 'The best position of an aiaccountant.com page in the normal Google results (the blue links) for this keyword. Blank means we were not in the results that were captured. It is separate from being cited in the AI Overview.',
  },
  citedSamples: {
    title: 'AiA cited (x/y)',
    body: 'In how many of this keyword\'s searches aiaccountant.com was a source link in the AI Overview. For example 2/4 means cited in two of the four searches.',
  },
  aioShownCol: {
    title: 'AIO shown',
    body: 'In what share of this keyword\'s searches Google showed an AI Overview at all.',
  },
  tier: {
    title: 'Tier',
    body: '1_original_source_ai: HubSpot itself recorded an AI assistant as where this contact first came from (the strict count). 2_utm_ai: the sign-up link carried an AI assistant tag, so the contact is added in the broad count only.',
  },
  lifecycle: {
    title: 'Lifecycle stage',
    body: 'Where the contact currently stands in the HubSpot sales process, for example Lead or Opportunity.',
  },
  reachedOpp: {
    title: 'Reached opp/SQL',
    body: 'The contact progressed far enough to be marked as a sales-qualified lead or an opportunity in HubSpot, which is the first sign of real buying interest.',
  },
  promptGroup: {
    title: 'Group',
    body: 'Unbranded prompts do not name any product and feed the headline numbers. Competitor prompts compare named products. Own-brand prompts ask about AI Accountant directly. The last two are collected but reported separately, because naming a brand in the question changes the answer.',
  },
  role: {
    title: 'Role',
    body: 'own = AI Accountant. sov = a direct competitor counted in share of voice. context and watchlist = tracked and shown, but left out of share of voice.',
  },
  samplesCol: {
    title: 'Samples',
    body: 'How many answers were collected for this prompt in this run.',
  },
  mentionedSamples: {
    title: 'AiA mentioned',
    body: 'In how many of this prompt\'s answers the assistant named AI Accountant as a brand.',
  },
  citedGptSamples: {
    title: 'AiA cited',
    body: 'In how many of this prompt\'s answers a page from aiaccountant.com was listed as a source.',
  },
  engaged: {
    title: 'Engaged',
    body: 'The share of visits that Google Analytics counts as engaged: the visit lasted more than 10 seconds, viewed two or more pages, or completed a key action.',
  },
  ftViewed: {
    title: 'Viewed free trial',
    body: 'Sessions from this assistant in which the visitor opened the free-trial page. It is the clearest sign on the website that a visitor is considering the product.',
  },
  ftStarted: {
    title: 'Started form',
    body: 'Sessions in which the visitor began filling in the form on the free-trial page (Google Analytics records this automatically when someone first types in a form).',
  },
  ftSubmitted: {
    title: 'Submitted form',
    body: 'Sessions in which the visitor submitted the form on the free-trial page. Sign-ups made inside the app are not included: the app is not tracked in this Analytics property, so use the HubSpot contact counts for the full conversion picture.',
  },
  top10: {
    title: 'AiA top-10 organic',
    body: 'How many keywords in this topic have an aiaccountant.com page in the first ten normal Google results.',
  },
};

// ---------- ChatGPT (m = row of aeo_gpt_run_metrics_mv) ----------
export const gpt = {
  mention: (m) => ({
    title: 'AiA mentioned (named)',
    body: 'How often ChatGPT writes the name AI Accountant, as our brand, in the text of its answer. Plain text counts; it does not have to be a link. Answers that only use "AI accountant" as a general phrase are removed when the run is reviewed. This is the figure closest to ChatGPT recommending us.',
    now: m && has(m.aia_mentions) ? `This run: ${num(m.aia_mentions)} of ${num(m.answers_ok)} answers.` : null,
  }),
  citation: (m) => ({
    title: 'aiaccountant.com cited',
    body: 'How often a page from aiaccountant.com appears in the list of sources ChatGPT attaches to its answer, whether or not the answer says our name. ChatGPT can use our page as reference material without naming us, so this figure and the mention rate move separately. Sources shown only in the collapsed "more sources" list are included.',
    now: m && has(m.aia_citations) ? `This run: ${num(m.aia_citations)} of ${num(m.answers_ok)} answers cited us; ${num(m.aia_mentions)} named us.` : null,
  }),
  coverage: (m) => ({
    title: 'Prompt coverage',
    body: 'The share of our tracked prompts where ChatGPT named AI Accountant in at least one of its answers. The mention rate says how often we appear; coverage says across how many different questions.',
    now: m && has(m.prompts_with_aia_mention) ? `This run: ${num(m.prompts_with_aia_mention)} of ${num(m.prompts_answered)} prompts.` : null,
  }),
  sources: (m) => ({
    title: 'Average sources per answer',
    body: 'How many web pages ChatGPT lists as sources in a typical answer. Each one is a place a brand can be cited.',
    now: m && has(m.avg_sources_per_answer) ? `This run: ${m.avg_sources_per_answer} sources per answer on average.` : null,
  }),
  trend: (points) => {
    const p = points?.[points.length - 1];
    return {
      title: 'How to read this chart',
      body: 'Each dot is one run: the share of answers that named AI Accountant. The stick through a dot (or the shaded band once there are several runs) is the 95% range, where the true rate very likely sits. If a new dot stays inside the earlier range, treat the change as noise.',
      now: p && has(p.y) ? `Latest run shown: ${pct(p.y)}${range(p.lo, p.hi) ? `, range ${range(p.lo, p.hi)}` : ''}. ${points.length} run${points.length === 1 ? '' : 's'} on the chart.` : null,
    };
  },
  sov: (rows) => {
    const own = rows?.find((r) => r.brand_key === 'aia');
    const lead = rows?.filter((r) => ['own', 'sov'].includes(r.role)).sort((x, y) => Number(y.mention_sov || 0) - Number(x.mention_sov || 0))[0];
    return {
      title: 'Share of voice (mentions)',
      body: 'Take every time ChatGPT named AI Accountant or one of its direct competitors in this run. Share of voice is each brand\'s slice of that total, so the bars add up to 100%. Tally is counted only when the answer is about Tally\'s own AI features.',
      now: own && has(own.mention_sov) ? `This run: AiA ${pct(own.mention_sov)}${lead && lead.brand_key !== 'aia' ? `; largest share ${lead.display_name} ${pct(lead.mention_sov)}` : '; the largest share'}.` : null,
    };
  },
  brands: (rows) => {
    const own = rows?.find((r) => r.brand_key === 'aia');
    return {
      title: 'Mention rate by brand',
      body: 'The share of answers that name each brand. These do not add up to 100%, because one answer can name several brands. Brands marked context or watchlist are tracked for reference and are not part of share of voice.',
      now: own && has(own.mention_rate) ? `This run: AiA is named in ${pct(own.mention_rate)} of answers.` : null,
    };
  },
  topics: { title: 'By topic', body: 'The mention and citation rates split by what the prompt is about, to show where we are visible and where we are absent.' },
  domains: { title: 'Most-cited domains', body: 'The websites ChatGPT lists as sources most often across this run. It shows which sites ChatGPT relies on for these subjects, and so where being featured would help.' },
  prompts: { title: 'By prompt', body: 'One row per tracked prompt, with how many of its answers named or cited AI Accountant and which other brands appeared.' },
};

// ---------- Google AI Overviews (rows of aeo_aio_run_metrics_mv per segment) ----------

// ---------- AI assistants tab (ChatGPT, Gemini, Perplexity share one set of metrics) ----------
// The ChatGPT wording with the assistant's name swapped in. Figures in "now" still come from the rows passed in.
const named = (tip, name) => (!tip || name === 'ChatGPT' ? tip : Object.fromEntries(Object.entries(tip).map(([k, v]) => [k, typeof v === 'string' ? v.replaceAll('ChatGPT', name) : v])));
export const asst = (name = 'ChatGPT') => ({
  mention: (m) => named(gpt.mention(m), name),
  citation: (m) => (name === 'ChatGPT' ? gpt.citation(m) : {
    title: 'aiaccountant.com cited',
    body: `How often a page from aiaccountant.com appears among the sources ${name} attaches to its answer, whether or not the answer says our name. An assistant can use our page as reference material without naming us, so this figure and the mention rate move separately.`,
    now: m && has(m.aia_citations) ? `This run: ${num(m.aia_citations)} of ${num(m.answers_ok)} answers cited us; ${num(m.aia_mentions)} named us.` : null,
  }),
  trend: (points) => named(gpt.trend(points), name),
  sov: (rows) => named(gpt.sov(rows), name),
  brands: (rows) => named(gpt.brands(rows), name),
  topics: gpt.topics,
  domains: named(gpt.domains, name),
  prompts: gpt.prompts,
});
export const compare = {
  cards: { title: 'One card per assistant', body: 'The same prompts are asked on each assistant, several times each. The large figure is the share of answers that name AI Accountant as a brand. Click a card to see that assistant in detail.' },
  byPrompt: { title: 'By prompt, across assistants', body: 'One row per tracked prompt. Each cell shows in how many of that assistant\'s answers AI Accountant was named, out of the answers collected. A dash means the assistant was not asked in this run.' },
  sov: { title: 'Share of voice by assistant', body: 'For each assistant, take every time it named AI Accountant or a direct competitor in this run. Each brand\'s figure is its slice of that total, so every column adds up to 100%.' },
  domains: { title: 'Most-cited domains by assistant', body: 'The share of each assistant\'s answers that list a page from the domain as a source. It shows which websites each assistant relies on, and where they differ.' },
  perplexityNote: { title: 'How Perplexity is measured', body: 'Perplexity answers are collected through its API model (sonar, with web search, India). This is the same engine as the app, but answers in the Perplexity app can differ slightly. ChatGPT and Gemini are collected from their live web interfaces.' },
};

const aioNow = (r) => (r && has(r.aia_cited_captures) ? `${num(r.aia_cited_captures)} of ${num(r.captures_with_aio)} searches with an AI Overview; ${num(r.keywords_aia_cited_any)} of ${num(r.keywords)} keywords cited us at least once` : null);
export const aio = {
  citedBuyer: (b) => ({
    title: 'AiA cited (buyer keywords)',
    body: 'How often aiaccountant.com is one of the source links Google shows with its AI Overview, counted on buyer keywords only: searches by someone looking for a product like ours. This is the headline Google figure.',
    now: aioNow(b) ? `This run: ${aioNow(b)}.` : null,
  }),
  citedAll: (a, b, inf) => ({
    title: 'AiA cited (all keywords)',
    body: 'The same measure over every tracked keyword: the buyer keywords plus the informational (how-to and lookup) ones. Any gap between this and the buyer figure comes from the informational keywords.',
    now: a && has(a.aia_cited_rate) ? `This run: buyer ${pct(b?.aia_cited_rate)} (${num(b?.keywords)} keywords) · informational ${pct(inf?.aia_cited_rate)} (${num(inf?.keywords)}) · all ${pct(a.aia_cited_rate)} (${num(a.keywords)}).` : null,
  }),
  citedInfo: (inf) => ({
    title: 'AiA cited (informational)',
    body: 'The citation rate on how-to and lookup searches, the kind our blog posts and free tools answer. Good for reach, but these searchers are less likely to be looking for a product.',
    now: aioNow(inf) ? `This run: ${aioNow(inf)}.` : null,
  }),
  weighted: (b) => ({
    title: 'Volume-weighted citation rate',
    body: 'The same citation rate, but each keyword counts in proportion to how many people search it in India each month (Ahrefs estimate). A keyword searched 1,000 times a month counts ten times as much as one searched 100 times. Comparing it with the plain rate shows whether we are cited on the popular keywords or mostly on the rare ones.',
    now: b && has(b.aia_cited_rate_volume_weighted) ? `This run: plain ${pct(b.aia_cited_rate)} · weighted by search volume ${pct(b.aia_cited_rate_volume_weighted)}.` : null,
  }),
  named: (b) => ({
    title: 'AiA named in the AI Overview text',
    body: '"Cited" is about the source links beside the AI Overview. "Named" is about its wording: how often the words AI Accountant appear in the overview text itself. A page can be cited without the brand being named. This count is an automatic text match, so a few cases may be the general phrase "AI accountant" rather than our brand.',
    now: b && has(b.aia_named_rate) ? `This run: named ${pct(b.aia_named_rate)} · cited ${pct(b.aia_cited_rate)} (buyer keywords).` : null,
  }),
  shown: (a) => ({
    title: 'AI Overview shown',
    body: 'The share of our searches where Google showed an AI Overview at all. When none is shown there is nothing to be cited in, so those searches are left out of the citation rates.',
    now: a && has(a.captures_with_aio) ? `This run: ${num(a.captures_with_aio)} of ${num(a.captures_ok)} searches.` : null,
  }),
  trend: (points) => {
    const p = points?.[points.length - 1];
    return {
      title: 'How to read this chart',
      body: 'Each dot is one run: the share of buyer-keyword searches where aiaccountant.com was cited. The stick through a dot (or the shaded band once there are several runs) is the 95% range, where the true rate very likely sits. If a new dot stays inside the earlier range, treat the change as noise.',
      now: p && has(p.y) ? `Latest run shown: ${pct(p.y)}${range(p.lo, p.hi) ? `, range ${range(p.lo, p.hi)}` : ''}. ${points.length} run${points.length === 1 ? '' : 's'} on the chart.` : null,
    };
  },
  sov: (rows) => {
    const own = rows?.find((r) => r.brand_key === 'aia');
    const lead = rows?.filter((r) => ['own', 'sov'].includes(r.role)).sort((x, y) => Number(y.citation_sov || 0) - Number(x.citation_sov || 0))[0];
    return {
      title: 'Share of voice (citations)',
      body: 'Take every time Google\'s AI Overview cited AI Accountant or one of its direct competitors in this run. Share of voice is each brand\'s slice of that total, so the bars add up to 100%. It compares us with direct competitors only, not with every site Google cites.',
      now: own && has(own.citation_sov) ? `This run: AiA ${pct(own.citation_sov)}${lead && lead.brand_key !== 'aia' ? `; largest share ${lead.display_name} ${pct(lead.citation_sov)}` : '; the largest share'}.` : null,
    };
  },
  brands: (rows) => {
    const own = rows?.find((r) => r.brand_key === 'aia');
    return {
      title: 'Named in the AI Overview, by brand',
      body: 'The share of AI Overviews whose text names each brand. These do not add up to 100%, because one overview can name several brands. The match is automatic, so general phrases that look like a brand name can be counted.',
      now: own && has(own.named_rate) ? `This run: AiA is named in ${pct(own.named_rate)} of AI Overviews (all keywords).` : null,
    };
  },
  topics: { title: 'By topic', body: 'The citation rate split by what the keyword is about, with how many of those keywords have our page in the normal top ten results.' },
  domains: { title: 'Most-cited domains', body: 'The websites Google\'s AI Overviews cite most often for our keywords. It shows who Google trusts on these subjects.' },
  keywords: { title: 'By keyword', body: 'One row per tracked keyword: how popular it is, how often an AI Overview appeared, and in how many of its searches we were cited.' },
};

// ---------- Traffic & conversions ----------
export const traffic = {
  chatgptSessions: (g) => ({
    title: 'ChatGPT sessions',
    body: 'Visits to aiaccountant.com that started from a link clicked inside ChatGPT, as counted by Google Analytics (GA4). "Engaged" means the visit lasted more than 10 seconds, viewed two or more pages, or completed a key action.',
    now: g && has(g.sessions) ? `Loaded so far: ${num(g.sessions)} sessions${g.d0 ? `, ${date(g.d0)} to ${date(g.d1)}` : ''}.` : null,
  }),
  aiSessions: (g) => ({
    title: 'All AI-assistant sessions',
    body: 'Visits from ChatGPT, Gemini, Claude, Perplexity and Copilot added together. Visits tagged "openai" are left out because they look automated, not human. Clicks from Google AI Overviews are not in this number: Analytics cannot tell them apart from ordinary Google clicks.',
    now: g && has(g.sessions) ? `Loaded so far: ${num(g.sessions)} sessions.` : null,
  }),
  strict: (h) => ({
    title: 'AI-sourced contacts (strict)',
    body: 'HubSpot contacts where HubSpot itself recorded an AI assistant as the place the person first came from. This is the cautious count.',
    now: h && has(h.n) ? `So far: ${num(h.n)} contacts, ${num(h.opp)} reached opportunity.` : null,
  }),
  broad: (h) => ({
    title: 'AI-sourced contacts (broad)',
    body: 'The strict contacts plus contacts whose sign-up link carried an AI assistant tag. It catches people who signed up inside the app after arriving from an assistant, at the cost of being a little less certain.',
    now: h && has(h.n) ? `So far: ${num(h.n)} contacts, ${num(h.opp)} reached opportunity.` : null,
  }),
  weekly: { title: 'Weekly AI-assistant sessions', body: 'Visits from AI assistants per week, latest week on top. Green is ChatGPT, orange is the other assistants together. The current week is incomplete until it ends.' },
  bySource: (j) => ({
    title: 'Sessions by assistant',
    body: 'Visits split by which assistant sent them, the share that were engaged, and how far they got on the free-trial page: opened it, started the form, submitted it. The row marked likely automated is tagged traffic that behaves like a bot and is left out of the totals.',
    now: j && j.loaded ? `Human AI visits${j.d0 ? `, ${date(j.d0)} to ${date(j.d1)}` : ''}: ${num(j.sessions)} sessions, ${num(j.viewed)} viewed the free-trial page, ${num(j.started)} started the form, ${num(j.submitted)} submitted it.` : null,
  }),
  landing: { title: 'Top landing pages', body: 'The pages people arrive on when they click through from an AI assistant. These are the pages assistants are sending readers to.' },
  hsTiers: { title: 'HubSpot AI-sourced contacts', body: 'Contacts grouped by how sure we are that an AI assistant sent them (tier 1 strict, tier 2 added in the broad count) and by which assistant.' },
  hsWeekly: { title: 'AI contacts per week', body: 'New AI-sourced contacts created each week, latest week on top. The main figure is the broad count; the strict count is shown beside it.' },
  contacts: { title: 'AI-sourced contacts', body: 'One row per HubSpot contact in the broad count. No names or emails are stored here; the button copies a link to the contact in HubSpot.' },
  gsc: (rows) => {
    const d = rows?.find((r) => r.source === 'gsc_genai_export_dates');
    return {
      title: 'Google AI impressions (Search Console)',
      body: 'How many times one of our pages appeared as a link inside a Google AI feature, taken from the Search Console export. An impression is an appearance, not a visit: it does not mean anyone clicked. That is why it is shown here on its own and never added to the session totals.',
      now: d && has(d.impressions) ? `Loaded: ${num(d.impressions)} impressions${d.period_label ? ` (${d.period_label})` : ''}.` : null,
    };
  },
};

// ---------- AEO funnel (Overview). t = totals over the months shown ----------
export const funnel = {
  section: (t) => ({
    title: 'Traffic & Conversions',
    body: 'The whole path in one place: how often we are seen in AI answers, how many people then visit the site from an AI assistant, how many become leads in HubSpot, how many get a deal, and how many pay. Each stage is counted by a different system, so read it as a trend over time, not as the same people moving step by step.',
    now: t ? `${t.months} months shown: ${num(t.visits)} visits, ${num(t.leads)} leads, ${num(t.deals)} deals, ${num(t.won)} customers.` : null,
  }),
  seen: (t) => ({
    title: 'Seen in Google AI',
    body: 'How many times one of our pages appeared as a link inside a Google AI feature, from Search Console. It counts appearances, not visits. ChatGPT and the other assistants do not report this, so for them the only visibility figures are the named and cited rates from our runs, shown in the table.',
    now: t && has(t.impressions) ? `${num(t.impressions)} impressions${t.gscFrom ? ` since ${date(t.gscFrom)}` : ''}${t.gscThrough ? `, loaded to ${date(t.gscThrough)}` : ''}.` : null,
  }),
  visits: (t) => ({
    title: 'Visits from AI assistants',
    body: 'Website visits that started from a link clicked inside ChatGPT, Gemini, Perplexity, Claude or Copilot, counted by Google Analytics. Automated traffic is left out. Clicks from Google AI Overviews are not in this number, because Analytics cannot tell them apart from normal Google clicks.',
    now: t ? `${num(t.visits)} visits in the months shown${t.ga4Through ? `, loaded to ${date(t.ga4Through)}` : ''}.` : null,
  }),
  leads: (t) => ({
    title: 'Leads',
    body: 'New HubSpot contacts attributed to an AI assistant, by the month they were created. Strict means HubSpot itself recorded an AI assistant as where the person first came from. The total also includes contacts whose sign-up link carried an AI assistant tag, which catches sign-ups made inside the app.',
    now: t ? `${num(t.leads)} leads in the months shown, ${num(t.leadsStrict)} of them strict${t.visits ? `. That is ${(100 * t.leads / t.visits).toFixed(1)} leads per 100 visits` : ''}.` : null,
  }),
  deals: (t) => ({
    title: 'Deals',
    body: 'Deals in the AiA product pipeline linked to those leads, by the month the deal was created. Deals in the Virtual Accounting pipeline are left out. A lead can have more than one deal, and a deal can be created in a later month than its lead, so a month can show more deals than leads.',
    now: t ? `${num(t.deals)} deals in the months shown.` : null,
  }),
  won: (t) => ({
    title: 'Won',
    body: 'Leads that HubSpot now marks as a customer: their lifecycle stage is Customer (AiA). HubSpot does not move this stage backwards, so a lead stays counted even if it later churns: it means "became a customer", not "is paying today". They are counted in the month the lead was created, not the month they became a customer. This is a count of people, so it is compared with leads, not with deals. Revenue is not shown because deal amounts are mostly not filled in.',
    now: t ? `${num(t.won)} of ${num(t.leads)} leads in the months shown are marked as customers.` : null,
  }),
  hubspotWonLink: { title: 'Open these customers in HubSpot' },
  hubspotLink: { title: 'Open these leads in HubSpot' },
  hubspotDealsLink: { title: 'Open these deals in HubSpot' },
  named: { title: 'ChatGPT named', body: 'Share of ChatGPT answers in that month\'s runs that named AI Accountant as a brand. Blank for months before the baseline runs began.' },
  cited: { title: 'Google cited', body: 'Share of Google searches on buyer keywords in that month\'s runs where aiaccountant.com was a source in the AI Overview. Blank for months before the baseline runs began.' },
  byAssistant: { title: 'By assistant', body: 'Visits and leads split by the assistant that sent them, over the months shown. Deals are not split by assistant.' },
};

// ---------- Overview bands ----------
export const overview = {
  recommended: {
    title: 'Recommends us with a link',
    body: 'The share of answers to our tracked buyer questions where the assistant both names AI Accountant as a product and includes a link to aiaccountant.com. A link is what lets a reader reach our site, and being named is what makes them want to. Two in three AI-sourced leads first landed on our homepage or a product page, which is where these links point. Visits and leads are counted over a longer period than the run, so read the columns as a chain, not as one period.',
  },
  visible: {
    title: 'AI visibility',
    body: 'The baseline. For ChatGPT we count how often the answer names AI Accountant. For Google we count how often aiaccountant.com is one of the sources shown with the AI Overview. Each card also shows how we compare with our five direct competitors.',
  },
  change: {
    title: 'Real change or normal variation?',
    body: 'AI answers differ a little every time they are asked, so two runs never give exactly the same rate. A change counts as real only when the new rate falls outside the range the previous run could plausibly have produced. Inside that range it is treated as no change.',
  },
  chain: {
    title: 'Is AI visibility moving the outcomes?',
    body: 'Three weekly charts on one timeline, so a rise in the first can be followed into the other two. Each chart has its own scale because they count different things. Expect a delay: visits can follow within days, searches for our name over a few weeks. Other things also move the lower two charts, such as ads, events, sales outreach and word of mouth, so a rise there is a sign and not proof.',
  },
  chainRec: {
    title: 'AI assistants recommend us with a link',
    body: 'The share of answers to our tracked buyer questions where the assistant names AI Accountant as a product and links to aiaccountant.com. One point per week, pooling every run of that week. This is the figure the work is meant to move.',
  },
  chainVisits: {
    title: 'Visits from AI assistants',
    body: 'Website visits that Google Analytics can see arriving from ChatGPT, Gemini, Perplexity, Claude and Copilot, per full week. It is a minimum: visits from the mobile apps, and people who copy the address, often arrive with no source.',
  },
  chainBrand: {
    title: 'Searches for our name on Google',
    body: 'How many times people in India searched Google for AI Accountant by name ("ai accountant", "aiaccountant", or the name with a word such as login, pricing or Tally) and saw our site, from Search Console. It catches the people an AI answer sends who never click a link in it. Searches that use the phrase for the job or the idea (jobs, salary, courses, "best" and "top" lists) are left out. Search Console runs about two days behind.',
  },
  trend: {
    title: 'Trends',
    body: 'The same business figures month by month, so a rise or fall is visible at a glance. The number above each chart is the latest complete month, and the small label marks the highest month. Open the table underneath for every figure.',
  },
};

// ---------- Navigation tabs (no figures) ----------
export const tabs = {
  '/': 'The headline numbers for the latest run: AI assistants and Google side by side.',
  '/assistants': 'How often ChatGPT, Gemini and Perplexity recommend AI Accountant with a link, and the visits and leads that follow.',
  '/ai-overviews': 'How often Google\'s AI Overview links to aiaccountant.com for the keywords buyers search.',
  '/traffic': 'Website visits and HubSpot contacts that came from AI assistants.',
  '/lists': 'The exact questions and keywords we track, and the brands we compare against.',
  '/runs': 'Every data collection run, its status and its log.',
};

// ---------- AI assistants page: one figure, and what follows from it ----------
export const assistants = {
  recommended: {
    title: 'Recommends us with a link',
    body: 'The share of answers to our tracked buyer questions where the assistant both names AI Accountant as a product and includes a link to aiaccountant.com. Being named makes a reader want to look; the link is what lets them reach us. Two in three AI-sourced leads first landed on our homepage or a product page, which is where these links point.',
  },
  rate: { title: 'How the rate is counted', body: 'Answers that name AI Accountant and link to our site, divided by all answers collected from that assistant in this run. "Likely" is the range the true rate very probably sits in; with a few hundred answers it is wide, so small moves between runs are noise.' },
  questions: { title: 'On how many questions', body: 'The number of different tracked questions where the assistant recommended us with a link in at least one of its answers.' },
  visits: { title: 'Visits sent', body: 'Visits to aiaccountant.com that Google Analytics traced to this assistant, over the months stated under the table. This is a longer period than one run.' },
  leads: { title: 'Leads', body: 'HubSpot contacts whose source is this assistant, over the same months as the visits. Counted with the same rule as the Leads figure on the Overview.' },
  rateTrend: { title: 'How to read this chart', body: 'Each point is one run. A line shows whether that assistant is recommending us more or less often over time. Point at a run to see the count behind each figure. Compare each line with its own past, not with the other lines.' },
  visitsTrend: { title: 'How to read this chart', body: 'Visits per week that Google Analytics traced to each assistant. If the recommendation rate for an assistant rises and stays up, its line here should rise in the following weeks. This data is loaded by hand, so it can be a few days behind.' },
  byPrompt: { title: 'Which questions get us recommended', body: 'One row per tracked question. Each cell shows in how many of that assistant\'s answers we were recommended with a link, out of the answers collected. Questions showing 0 everywhere are where content work would add the most.' },
  brands: { title: 'Who else gets recommended with a link', body: 'The same figure for each direct competitor: the share of answers that name the brand and link to its own website. It shows who the assistants send buyers to when it is not us.' },
  pages: { title: 'Which of our pages they link to', body: 'Our pages that the assistants linked to in this run, with the visits AI assistants sent to each page in Google Analytics. Links to the homepage and product pages bring the visitors most likely to become leads; links to blog posts bring readers.' },
  domains: { title: 'Most-cited websites', body: 'The websites each assistant lists as sources most often for our questions. Being mentioned on these sites is one way to get recommended more.' },
};
