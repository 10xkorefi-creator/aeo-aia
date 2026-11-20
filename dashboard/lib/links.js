// Deep links from dashboard numbers to the raw data behind them (experiment).
// Supabase links need a Supabase login with access to the project; HubSpot links need a HubSpot login.
import { q } from '@/lib/db';

const BASE = 'https://supabase.com/dashboard/project/qmaphtslnvvifkzmbrvh';
const HUB = '39668252';
const esc = (v) => String(v ?? '').replace(/'/g, "''");

let ids = null;
export async function tableIds() {
  if (!ids) {
    const rows = await q`select relname, oid::text id from pg_class where relnamespace = 'public'::regnamespace and relname like 'aeo_%'`;
    ids = Object.fromEntries(rows.map((r) => [r.relname, r.id]));
  }
  return ids;
}

// Table editor, pre-filtered: filters = [[column, value], ...]
export const rowsLink = (t, table, filters = []) => (t?.[table]
  ? `${BASE}/editor/${t[table]}?schema=public${filters.map(([c, v]) => `&filter=${encodeURIComponent(`${c}:eq:${v}`)}`).join('')}`
  : null);
// SQL editor with the query pre-filled (press Run)
export const sqlLink = (sql) => `${BASE}/sql/new?content=${encodeURIComponent(sql.trim())}`;
export const hubspotContact = (id) => `https://app.hubspot.com/contacts/${HUB}/record/0-1/${id}`;

export const SQL = {
  gptAnswers: (run, order = 'mentioned') => sqlLink(`
-- Every ChatGPT answer in run ${esc(run)} (unbranded prompts) with AiA flags and the raw answer
select m.prompt_key, m.sample_no, m.mentioned as aia_mentioned, m.cited as aia_cited, c.response_text
from aeo_gpt_mentions_v m join aeo_gpt_captures c on c.id = m.capture_id
where m.run_id = '${esc(run)}' and m.brand_key = 'aia' and m.prompt_group = 'unbranded'
order by m.${order} desc, m.prompt_key, m.sample_no;`),
  gptPrompts: (run) => sqlLink(`
-- Per-prompt results in run ${esc(run)}
select * from aeo_gpt_prompt_metrics_v where run_id = '${esc(run)}' order by aia_mentioned_samples desc, prompt_key;`),
  gptSources: (run) => sqlLink(`
-- Every source ChatGPT cited in run ${esc(run)}
select prompt_key, sample_no, pos, domain, url, label from aeo_gpt_citations_v where run_id = '${esc(run)}' order by prompt_key, sample_no, pos;`),
  gptDomain: (run, domain) => sqlLink(`
-- ChatGPT answers in run ${esc(run)} citing ${esc(domain)}
select prompt_key, sample_no, pos, url, label from aeo_gpt_citations_v where run_id = '${esc(run)}' and domain = '${esc(domain)}' order by prompt_key, sample_no;`),
  asstAnswers: (run, engine) => sqlLink(`
-- Every ${esc(engine)} answer in run ${esc(run)} (unbranded prompts) with AiA flags and the raw answer
select m.prompt_key, m.sample_no, m.mentioned as aia_mentioned, m.cited as aia_cited, c.response_text, c.sources
from aeo_asst_mentions_v m join aeo_llm_captures c on c.id = m.capture_id
where m.run_id = '${esc(run)}' and m.engine = '${esc(engine)}' and m.brand_key = 'aia' and m.prompt_group = 'unbranded'
order by m.mentioned desc, m.prompt_key, m.sample_no;`),
  aioCaptures: (run, segment, order = 'cited') => sqlLink(`
-- Every Google capture in run ${esc(run)}${segment ? ` (${segment} keywords)` : ''} with AiA flags
select k.keyword_id, k.keyword, k.segment, m.sample_no, f.aio_shown, m.named as aia_named, m.cited as aia_cited, f.aia_organic_rank
from aeo_aio_mentions_v m
join aeo_aio_capture_flags_v f on f.capture_id = m.capture_id
join aeo_runs r on r.run_id = m.run_id
join aeo_keywords k on k.list_version = r.keyword_list_version and k.keyword_id = m.keyword_id
where m.run_id = '${esc(run)}' and m.brand_key = 'aia'${segment ? ` and k.segment = '${esc(segment)}'` : ''}
order by ${order === 'shown' ? 'f.aio_shown' : `m.${order}`} desc, k.keyword_id, m.sample_no;`),
  aioDomain: (run, domain) => sqlLink(`
-- AI Overviews in run ${esc(run)} citing ${esc(domain)}
select keyword_id, sample_no, url, label from aeo_aio_citations_v where run_id = '${esc(run)}' and domain = '${esc(domain)}' order by keyword_id, sample_no;`),
  ga4: (source) => sqlLink(`
-- GA4 sessions from AI assistants${source ? ` (${source})` : ' (human traffic only)'}, one row per day / source / landing page
select date, session_source, session_medium, landing_page, sessions, engaged_sessions, key_events, ai_source
from aeo_ga4_ai_traffic_v where ${source ? `ai_source = '${esc(source)}'` : 'counts_as_human_aeo_traffic'} order by date desc, sessions desc;`),
  gptSov: (run) => sqlLink(`
-- Mentions and citations per brand in run ${esc(run)} (ChatGPT, unbranded prompts)
select display_name, role, answers, answers_mentioning, mention_rate, mention_sov, answers_citing, citation_rate
from aeo_gpt_sov_v where run_id = '${esc(run)}' order by role = 'own' desc, role, answers_mentioning desc;`),
  aioSov: (run) => sqlLink(`
-- Citations and mentions per brand in run ${esc(run)} (Google AI Overviews)
select display_name, role, aio_captures, captures_citing, citation_rate, citation_sov, captures_naming, named_rate
from aeo_aio_sov_v where run_id = '${esc(run)}' order by role = 'own' desc, role, captures_citing desc;`),
  aioKeywords: (run) => sqlLink(`
-- Per-keyword results in run ${esc(run)} (Google AI Overviews)
select keyword_id, keyword, segment, topic, volume, aio_shown_rate, aia_cited_samples, aio_samples, aia_best_organic_rank
from aeo_aio_keyword_metrics_v where run_id = '${esc(run)}' order by segment, aia_cited_samples desc, volume desc nulls last;`),
  gsc: () => sqlLink(`
-- Search Console "Generative AI" export: impressions per day (an impression is an appearance, not a visit)
select date, impressions, period_label, pulled_at from aeo_gsc_ai_daily where source = 'gsc_genai_export_dates' order by date desc;`),
  run: (run) => sqlLink(`
-- Run record, counts and log for ${esc(run)}
select * from aeo_run_progress_v where run_id = '${esc(run)}';
select event_at, level, event, detail from aeo_run_events where run_id = '${esc(run)}' order by event_at;`),
  hubspot: (strict) => sqlLink(`
-- HubSpot contacts attributed to AI assistants${strict ? ' (strict: original source = AI)' : ' (broad)'}; no names or emails are stored
select hubspot_contact_id, created_date, ai_channel, attribution_tier, original_source, original_source_drill_1, utm_source, lifecycle_stage, reached_opportunity
from aeo_hubspot_ai_contacts_v${strict ? " where attribution_tier = '1_original_source_ai'" : ''} order by created_date desc;`),
};

// Short, stable links used in the "Trigger a run" report: /api/src?k=<key>&run=<run> redirects to the matching query above.
// Saved HubSpot view (shared) listing the funnel's leads: original source AI Referrals OR utm_source with an AI assistant, created after 30/11/2025.
export const HUBSPOT_AI_SEGMENT_URL = 'https://app-na2.hubspot.com/contacts/39668252/objects/0-1/views/358103130/list';
// HubSpot deal segment "AEO | AI-sourced deals (AiA pipeline)" (list 2179, auto-updating, shared with everyone): the funnel's deals.
// Saved HubSpot contact view: the funnel's leads whose lifecycle stage is Customer (AiA).
export const HUBSPOT_AI_WON_URL = 'https://app-na2.hubspot.com/contacts/39668252/objects/0-1/views/358105553/list';
export const HUBSPOT_AI_DEALS_URL = 'https://app-na2.hubspot.com/contacts/39668252/objectLists/2179/filters';

export const SRC = {
  funnel: () => sqlLink(`
-- Month-by-month AEO funnel (one row per month). Stage sources: Search Console export, baseline runs, GA4, HubSpot.
select * from aeo_funnel_monthly_v;
-- Leads behind it, per assistant and tier:   select * from aeo_hubspot_ai_leads_monthly order by month desc;
-- Deals behind it, per current stage:        select * from aeo_hubspot_ai_deals_monthly order by month desc;
-- Visits behind it, per source:              select * from aeo_ga4_ai_monthly order by month desc, sessions desc;`),
  gpt_answers: (run) => SQL.gptAnswers(run),
  asst_answers_gemini: (run) => SQL.asstAnswers(run, 'gemini'),
  asst_answers_perplexity: (run) => SQL.asstAnswers(run, 'perplexity'),
  gpt_sov: (run) => SQL.gptSov(run),
  gpt_prompts: (run) => SQL.gptPrompts(run),
  gpt_sources: (run) => SQL.gptSources(run),
  aio_buyer: (run) => SQL.aioCaptures(run, 'buyer'),
  aio_all: (run) => SQL.aioCaptures(run),
  aio_sov: (run) => SQL.aioSov(run),
  aio_keywords: (run) => SQL.aioKeywords(run),
  ga4: () => SQL.ga4(),
  hubspot: () => SQL.hubspot(false),
  gsc: () => SQL.gsc(),
  run: (run) => SQL.run(run),
};
export const SRC_NEEDS_RUN = new Set(['gpt_answers', 'asst_answers_gemini', 'asst_answers_perplexity', 'gpt_sov', 'gpt_prompts', 'gpt_sources', 'aio_buyer', 'aio_all', 'aio_sov', 'aio_keywords', 'run']);
