// "Ask Claude" links: /api/ask?k=<kind>&run=<run>&id=<id> builds a short prompt with the actual source rows behind a
// dashboard figure and redirects to claude.ai with that prompt pre-filled. Claude explains the figure and ends by showing
// those source rows as a table. No names, emails or secrets go into the prompt.
import { q } from '@/lib/db';
import { pct, num, date } from '@/lib/format';

const MAX = 5400; // keeps the claude.ai link a safe length
const esc = (v) => String(v ?? '').replace(/'/g, "''");
const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const cell = (v) => one(v === null || v === undefined ? '' : v === true ? 'yes' : v === false ? 'no' : v).replace(/\|/g, '/');
const path = (u) => String(u || '').replace(/^https?:\/\/(www\.)?/, '').slice(0, 70);

function build({ metric, value, where, what, facts = [], cols, rows = [], source, sql }) {
  const head = [
    'Explain this number from the AI Accountant AEO dashboard to a marketing teammate.',
    'Keep it short: what it means in one sentence, then 3-5 plain-English bullets on what is behind it and what stands out. No jargon.',
    '',
    `Metric: ${metric} = ${value}`,
    `Where: ${where}`,
    `What it measures: ${what}`,
    facts.length ? `Key numbers:\n${facts.map((f) => `- ${f}`).join('\n')}` : '',
  ].filter((x) => x !== '').join('\n');
  const tail = [
    '',
    'End your answer with a section titled "Source data": show the rows below as a table, exactly as given, without dropping or changing any. Under the table add one line saying where they come from. Then offer to go deeper.',
    sql ? `If you have a Supabase connector for the project "AI Accountant", you can pull every row with: ${one(sql)}` : '',
  ].filter((x) => x !== '').join('\n');
  const lines = rows.map((r) => r.map(cell).join(' | '));
  const label = (shown) => `\nSource rows (${shown < lines.length ? `first ${shown} of ${lines.length}` : lines.length}; from ${source}):\n${cols.join(' | ')}\n`;
  let n = lines.length;
  const size = (k) => head.length + label(k).length + lines.slice(0, k).join('\n').length + tail.length + 2;
  while (n > 3 && size(n) > MAX) n -= 1;
  return [head, label(n) + lines.slice(0, n).join('\n'), tail].join('\n');
}

export async function askPrompt(k, run, id) {
  const R = esc(run);
  if (k.startsWith('gpt_')) {
    const [m] = await q`select * from public.aeo_gpt_run_metrics_mv where run_id = ${run}`;
    if (!m) return null;
    const where = `ChatGPT, India, run ${m.run_id} (${date(m.run_date)}), ${num(m.answers_ok)} answers to unbranded prompts, each prompt asked ${m.gpt_samples} times`;
    if (k === 'gpt_mention') {
      const rows = await q`select m.prompt_key, p.prompt_text, m.sample_no,
          regexp_replace(substring(c.response_text from greatest(position('AI Accountant' in c.response_text) - 45, 1) for 125), '\\s+', ' ', 'g') excerpt
        from public.aeo_gpt_mentions_v m join public.aeo_gpt_captures c on c.id = m.capture_id join public.aeo_runs r on r.run_id = m.run_id
        join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = m.prompt_key
        where m.run_id = ${run} and m.brand_key = 'aia' and m.prompt_group = 'unbranded' and m.mentioned order by m.prompt_key, m.sample_no`;
      const [rej] = await q`select count(*) n from public.aeo_gpt_mention_reviews rv join public.aeo_gpt_captures c on c.id = rv.capture_id where c.run_id = ${run} and rv.brand_key = 'aia' and rv.verdict = 'not_brand'`;
      return build({ metric: 'AiA mentioned', value: pct(m.aia_mention_rate), where,
        what: 'Share of ChatGPT answers that name AI Accountant as a product. "AI accountant" is also a generic phrase, so every match is reviewed and generic uses are not counted.',
        facts: [`${num(m.aia_mentions)} of ${num(m.answers_ok)} answers; 95% range ${pct(m.aia_mention_rate_ci_low)} to ${pct(m.aia_mention_rate_ci_high)}`,
          `Named on ${num(m.prompts_with_aia_mention)} of ${num(m.prompts_answered)} prompts`, `${rej?.n ?? 0} other matches were the generic phrase and are excluded`,
          `For comparison, aiaccountant.com is cited as a source in ${pct(m.aia_citation_rate)} of answers`],
        cols: ['prompt', 'prompt text', 'answer no.', 'excerpt from the ChatGPT answer'], rows: rows.map((r) => [r.prompt_key, r.prompt_text, r.sample_no, `…${r.excerpt}…`]),
        source: 'Supabase tables aeo_gpt_captures (raw ChatGPT answers) and aeo_gpt_mention_reviews',
        sql: `select m.prompt_key, m.sample_no, c.response_text from aeo_gpt_mentions_v m join aeo_gpt_captures c on c.id = m.capture_id where m.run_id = '${R}' and m.brand_key = 'aia' and m.prompt_group = 'unbranded' and m.mentioned;` });
    }
    if (k === 'gpt_citation') {
      const rows = await q`select ct.prompt_key, p.prompt_text, ct.sample_no, min(ct.url) url, count(*) n
        from public.aeo_gpt_citations_v ct join public.aeo_runs r on r.run_id = ct.run_id
        join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = ct.prompt_key
        where ct.run_id = ${run} and ct.url ~* 'aiaccountant\\.com' and p.prompt_group = 'unbranded' group by 1, 2, 3 order by 1, 3`;
      return build({ metric: 'aiaccountant.com cited', value: pct(m.aia_citation_rate), where,
        what: 'Share of ChatGPT answers that list a page from aiaccountant.com among their sources, whether or not the answer names the product.',
        facts: [`${num(m.aia_citations)} of ${num(m.answers_ok)} answers; 95% range ${pct(m.aia_citation_rate_ci_low)} to ${pct(m.aia_citation_rate_ci_high)}`,
          `AiA is named in only ${pct(m.aia_mention_rate)} of answers, so it is often a source without being recommended`],
        cols: ['prompt', 'prompt text', 'answer no.', 'aiaccountant.com page cited', 'AiA links in that answer'], rows: rows.map((r) => [r.prompt_key, r.prompt_text, r.sample_no, path(r.url), r.n]),
        source: 'Supabase table aeo_gpt_captures (source links ChatGPT returned with each answer)',
        sql: `select prompt_key, sample_no, url, label from aeo_gpt_citations_v where run_id = '${R}' and url ~* 'aiaccountant\\.com' order by 1, 2;` });
    }
    if (k === 'gpt_coverage') {
      const rows = await q`select pm.prompt_key, pm.prompt_text, pm.topic, pm.samples_ok, pm.aia_mentioned_samples m, pm.aia_cited_samples c
        from public.aeo_gpt_prompt_metrics_mv pm join public.aeo_runs r on r.run_id = pm.run_id
        join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = pm.prompt_key
        where pm.run_id = ${run} and p.prompt_group = 'unbranded' order by pm.aia_mentioned_samples desc, pm.aia_cited_samples desc, pm.prompt_key`;
      return build({ metric: 'Prompts where AiA appears', value: pct(m.prompt_coverage), where,
        what: 'Share of tracked unbranded prompts where at least one answer names AI Accountant.',
        facts: [`${num(m.prompts_with_aia_mention)} of ${num(m.prompts_answered)} prompts`, `${rows.filter((r) => Number(r.m) === 0 && Number(r.c) > 0).length} more prompts cite aiaccountant.com without naming it`],
        cols: ['prompt', 'prompt text', 'theme', 'answers', 'AiA named in', 'AiA cited in'], rows: rows.map((r) => [r.prompt_key, r.prompt_text, r.topic, r.samples_ok, r.m, r.c]),
        source: 'Supabase table aeo_gpt_captures, summarised per prompt (rows sorted with AiA prompts first)',
        sql: `select * from aeo_gpt_prompt_metrics_v where run_id = '${R}' order by aia_mentioned_samples desc, prompt_key;` });
    }
    if (k === 'gpt_sources') {
      const rows = await q`select domain, answers_citing, share_of_answers from public.aeo_gpt_cited_domains_mv where run_id = ${run} order by answers_citing desc limit 25`;
      return build({ metric: 'Average sources per answer', value: String(m.avg_sources_per_answer), where,
        what: 'How many web sources ChatGPT lists per answer on average. More sources means more chances to be cited.',
        facts: [`${num(m.answers_ok)} answers in the run`],
        cols: ['website', 'answers citing it', 'share of answers'], rows: rows.map((r) => [r.domain, r.answers_citing, pct(r.share_of_answers)]),
        source: 'Supabase table aeo_gpt_captures (source links ChatGPT returned), top 25 websites',
        sql: `select domain, answers_citing, share_of_answers from aeo_gpt_cited_domains_v where run_id = '${R}' order by answers_citing desc;` });
    }
    if (k === 'gpt_prompt') {
      const [p] = await q`select * from public.aeo_gpt_prompt_metrics_mv where run_id = ${run} and prompt_key = ${id}`;
      if (!p) return null;
      const rows = await q`select c.sample_no, left(regexp_replace(c.response_text, '\\s+', ' ', 'g'), 150) opening,
          (select string_agg(m.display_name, ', ') from public.aeo_gpt_mentions_v m where m.capture_id = c.id and m.mentioned) brands,
          (select string_agg(d, ', ') from (select ct.domain d from public.aeo_gpt_citations_v ct where ct.capture_id = c.id group by 1 order by min(ct.pos) limit 4) x) sources
        from public.aeo_gpt_captures c where c.run_id = ${run} and c.prompt_key = ${id} and c.status = 'ok' order by c.sample_no`;
      return build({ metric: `Prompt ${p.prompt_key}: "${p.prompt_text}"`, value: `AiA named in ${p.aia_mentioned_samples} of ${p.samples_ok} answers, cited in ${p.aia_cited_samples}`,
        where: `ChatGPT, India, run ${run} (${date(m.run_date)}), theme ${p.topic}`,
        what: 'How ChatGPT answered one tracked prompt, asked several times. Say which tools it recommends and whether AI Accountant is named or cited.',
        cols: ['answer no.', 'tracked brands named', 'first sources cited', 'how the answer opens'], rows: rows.map((r) => [r.sample_no, r.brands || 'none', r.sources || 'none', `${r.opening}…`]),
        source: 'Supabase table aeo_gpt_captures (raw ChatGPT answers for this prompt)',
        sql: `select sample_no, response_text from aeo_gpt_captures where run_id = '${R}' and prompt_key = '${esc(id)}' order by sample_no;` });
    }
    if (k === 'gpt_domain') {
      const [d] = await q`select * from public.aeo_gpt_cited_domains_mv where run_id = ${run} and domain = ${id}`;
      if (!d) return null;
      const rows = await q`select prompt_key, sample_no, url from public.aeo_gpt_citations_v where run_id = ${run} and domain = ${id} order by prompt_key, sample_no limit 60`;
      return build({ metric: `Source ${d.domain}`, value: `cited in ${num(d.answers_citing)} answers (${pct(d.share_of_answers)})`, where,
        what: 'How often ChatGPT used this website as a source in the run. Say which prompts it shows up on and what kind of pages get cited.',
        cols: ['prompt', 'answer no.', 'page cited'], rows: rows.map((r) => [r.prompt_key, r.sample_no, path(r.url)]),
        source: 'Supabase table aeo_gpt_captures (source links ChatGPT returned)',
        sql: `select prompt_key, sample_no, url, label from aeo_gpt_citations_v where run_id = '${R}' and domain = '${esc(id)}' order by 1, 2;` });
    }
  }
  if (k.startsWith('aio_')) {
    const all = await q`select * from public.aeo_aio_run_metrics_mv where run_id = ${run}`;
    if (!all.length) return null;
    const seg = ['buyer', 'informational', 'all'].includes(id) ? id : 'buyer';
    const m = all.find((r) => r.segment === seg) || all[0];
    const where = `Google AI Overviews, India, run ${m.run_id} (${date(m.run_date)}), ${num(m.keywords)} ${seg === 'all' ? '' : seg + ' '}keywords, each searched ${m.aio_samples} times`;
    if (['aio_cited', 'aio_weighted', 'aio_named', 'aio_shown'].includes(k)) {
      const kws = await q`select keyword, segment, volume, samples_ok, aio_samples, aio_shown_rate, aia_cited_samples c, aia_named_samples n
        from public.aeo_aio_keyword_metrics_mv where run_id = ${run} order by volume desc nulls last, keyword`;
      let rows = kws.filter((x) => seg === 'all' || x.segment === seg);
      if (k === 'aio_cited') rows = [...rows].sort((a, b) => b.c - a.c || (b.volume || 0) - (a.volume || 0));
      if (k === 'aio_named') rows = [...rows].sort((a, b) => b.n - a.n || b.c - a.c);
      if (k === 'aio_shown') rows = [...rows].sort((a, b) => Number(a.aio_shown_rate) - Number(b.aio_shown_rate));
      const spec = {
        aio_cited: [`AiA cited (${seg} keywords)`, pct(m.aia_cited_rate), 'Share of Google AI Overviews that list a page from aiaccountant.com in their source list (the source cards beside the answer).',
          [`${num(m.aia_cited_captures)} of ${num(m.captures_with_aio)} AI Overviews cite AiA; 95% range ${pct(m.aia_cited_rate_ci_low)} to ${pct(m.aia_cited_rate_ci_high)}`, `Cited at least once on ${num(m.keywords_aia_cited_any)} of ${num(m.keywords)} keywords`]],
        aio_weighted: [`AiA cited, weighted by search volume (${seg} keywords)`, pct(m.aia_cited_rate_volume_weighted), 'The same citation measure, but each keyword counts in proportion to its monthly searches in India (Ahrefs estimate): the share of actual searches where AiA is a source.',
          [`Unweighted rate is ${pct(m.aia_cited_rate)}`, 'Rows are sorted by search volume, so the top rows carry the most weight']],
        aio_named: [`AiA named in the AI Overview text (${seg} keywords)`, pct(m.aia_named_rate), 'Share of AI Overviews whose text contains "AI Accountant". The phrase is also generic (e.g. "featuring an AI Accountant") and these matches are not yet reviewed on the Google side, so this can be slightly overstated.',
          [`Cited rate for the same keywords is ${pct(m.aia_cited_rate)}`]],
        aio_shown: ['AI Overview shown', pct(m.aio_trigger_rate), 'Share of Google searches in the run where Google showed an AI Overview at all. AiA can only be cited when one is shown.',
          [`${num(m.captures_with_aio)} of ${num(m.captures_ok)} searches`]],
      }[k];
      return build({ metric: spec[0], value: spec[1], where, what: spec[2], facts: spec[3],
        cols: ['keyword', 'searches per month (India)', 'searches captured', 'AI Overview shown', 'AiA cited in', 'AiA named in'],
        rows: rows.map((x) => [x.keyword, x.volume ?? 'n/a', x.samples_ok, pct(x.aio_shown_rate, 0), x.c, x.n]),
        source: 'Supabase table aeo_aio_captures (raw Google results), summarised per keyword',
        sql: `select * from aeo_aio_keyword_metrics_v where run_id = '${R}'${seg === 'all' ? '' : ` and segment = '${seg}'`} order by volume desc nulls last;` });
    }
    if (k === 'aio_keyword') {
      const [kw] = await q`select * from public.aeo_aio_keyword_metrics_mv where run_id = ${run} and keyword_id = ${id}`;
      if (!kw) return null;
      const rows = await q`select f.sample_no, f.aio_shown, f.aia_organic_rank,
          (select bool_or(ct.url ~* 'aiaccountant\\.com') from public.aeo_aio_citations_v ct where ct.capture_id = f.capture_id) aia,
          (select string_agg(d, ', ') from (select distinct ct.domain d from public.aeo_aio_citations_v ct where ct.capture_id = f.capture_id limit 8) x) sources
        from public.aeo_aio_capture_flags_v f where f.run_id = ${run} and f.keyword_id = ${id} order by f.sample_no`;
      return build({ metric: `Keyword "${kw.keyword}"`, value: `AiA cited in ${kw.aia_cited_samples} of ${kw.aio_samples} AI Overviews`,
        where: `Google India, run ${run}, ${kw.segment} keyword, theme ${kw.topic}, ${num(kw.volume ?? 0)} searches a month`,
        what: 'What Google showed for one tracked keyword, searched several times. Say who Google cites instead and what kind of sites they are.',
        cols: ['search no.', 'AI Overview shown', 'AiA cited', 'AiA organic rank', 'websites in the AI Overview source list'],
        rows: rows.map((r) => [r.sample_no, r.aio_shown, !!r.aia, r.aia_organic_rank ?? 'not in top results', r.sources || 'none']),
        source: 'Supabase table aeo_aio_captures (raw Google results for this keyword)',
        sql: `select sample_no, domain, url, label from aeo_aio_citations_v where run_id = '${R}' and keyword_id = '${esc(id)}' order by sample_no;` });
    }
    if (k === 'aio_domain') {
      const [d] = await q`select * from public.aeo_aio_cited_domains_mv where run_id = ${run} and domain = ${id}`;
      if (!d) return null;
      const rows = await q`select kw.keyword, ct.sample_no, ct.url from public.aeo_aio_citations_v ct join public.aeo_runs r on r.run_id = ct.run_id
        join public.aeo_keywords kw on kw.list_version = r.keyword_list_version and kw.keyword_id = ct.keyword_id
        where ct.run_id = ${run} and ct.domain = ${id} order by kw.keyword, ct.sample_no limit 60`;
      return build({ metric: `Source ${d.domain}`, value: `cited on ${num(d.keywords_citing)} keywords (${pct(d.share_of_aio_captures)} of AI Overviews)`, where,
        what: 'How often Google AI Overviews used this website as a source. Say which keywords it wins and what kind of pages get cited.',
        cols: ['keyword', 'search no.', 'page cited'], rows: rows.map((r) => [r.keyword, r.sample_no, path(r.url)]),
        source: 'Supabase table aeo_aio_captures (source lists of the AI Overviews)',
        sql: `select keyword_id, sample_no, url, label from aeo_aio_citations_v where run_id = '${R}' and domain = '${esc(id)}' order by 1, 2;` });
    }
  }
  if (k === 'ga4') {
    const one_ = id && id !== 'all';
    const src = await q`select ai_source, sum(sessions) sessions, sum(engaged_sessions) engaged, sum(key_events) key_events, min(date) d0, max(date) d1, bool_and(counts_as_human_aeo_traffic) human
      from public.aeo_ga4_ai_traffic_v group by 1 order by 2 desc`;
    const pick = one_ ? src.filter((s) => s.ai_source === id) : src.filter((s) => s.human);
    const rows = one_
      ? await q`select date_trunc('week', date)::date wk, landing_page, sum(sessions) sessions, sum(engaged_sessions) engaged, sum(key_events) key_events from public.aeo_ga4_ai_traffic_v where ai_source = ${id} group by 1, 2 order by 3 desc limit 40`
      : src;
    return build({ metric: one_ ? `Website sessions from ${id}` : 'Website sessions from all AI assistants', value: num(pick.reduce((s, r) => s + Number(r.sessions), 0)),
      where: `Google Analytics 4 for aiaccountant.com, ${date(src[0]?.d0)} to ${date(src[0]?.d1)}`,
      what: 'Visits that GA4 attributes to an AI assistant. Clicks from Google AI Overviews cannot be separated from normal Google traffic, so they are not included.',
      facts: one_ ? pick.map((s) => `${num(s.sessions)} sessions, ${pct(Number(s.sessions) ? Number(s.engaged) / Number(s.sessions) : null, 0)} engaged, ${num(s.key_events)} key events`) : ['Sources marked "excluded" look automated and are left out of the total'],
      cols: one_ ? ['week starting', 'landing page', 'sessions', 'engaged sessions', 'key events'] : ['AI source', 'sessions', 'engaged sessions', 'key events', 'counted'],
      rows: one_ ? rows.map((r) => [date(r.wk), r.landing_page, r.sessions, r.engaged, r.key_events]) : src.map((s) => [s.ai_source, s.sessions, s.engaged, s.key_events, s.human ? 'yes' : 'excluded']),
      source: 'Google Analytics 4 (property for aiaccountant.com), stored in Supabase table aeo_ga4_daily',
      sql: `select date, session_source, session_medium, landing_page, sessions, engaged_sessions, key_events from aeo_ga4_ai_traffic_v ${one_ ? `where ai_source = '${esc(id)}'` : 'where counts_as_human_aeo_traffic'} order by date desc;` });
  }
  if (k === 'hubspot') {
    const strict = id === 'strict';
    const rows = await q`select hubspot_contact_id, created_date, ai_channel, attribution_tier, original_source, utm_source, lifecycle_stage, reached_opportunity
      from public.aeo_hubspot_ai_contacts_v order by created_date desc`;
    const pick = strict ? rows.filter((x) => x.attribution_tier === '1_original_source_ai') : rows;
    return build({ metric: `HubSpot contacts from AI assistants (${strict ? 'strict' : 'broad'})`, value: num(pick.length),
      where: `HubSpot, contacts created ${date(rows.at(-1)?.created_date)} to ${date(rows[0]?.created_date)}`,
      what: strict ? 'Contacts whose HubSpot original source is an AI referral: the stricter, more defensible count.' : 'Strict contacts plus contacts that carry an AI assistant in utm_source (often in-app signups): a wider, looser count.',
      facts: [`${pick.filter((x) => x.reached_opportunity).length} of ${pick.length} reached opportunity stage`],
      cols: ['HubSpot contact ID', 'created', 'assistant', 'attribution', 'original source', 'utm_source', 'lifecycle stage', 'reached opportunity'],
      rows: pick.map((x) => [x.hubspot_contact_id, date(x.created_date), x.ai_channel, x.attribution_tier === '1_original_source_ai' ? 'strict' : 'utm only', x.original_source, x.utm_source, x.lifecycle_stage, x.reached_opportunity]),
      source: 'HubSpot contacts (IDs only, no names or emails), stored in Supabase table aeo_hubspot_ai_contacts',
      sql: `select * from aeo_hubspot_ai_contacts_v${strict ? " where attribution_tier = '1_original_source_ai'" : ''} order by created_date desc;` });
  }
  return null;
}

export const askHref = (k, run, id) => `/api/ask?k=${k}${run ? `&run=${encodeURIComponent(run)}` : ''}${id !== undefined && id !== null ? `&id=${encodeURIComponent(id)}` : ''}`;
