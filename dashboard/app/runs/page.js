import { q } from '@/lib/db';
import { num, date, dateTime } from '@/lib/format';
import { Section, Table } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Runs({ searchParams }) {
  const sp = await searchParams;
  const runs = await q`select * from public.aeo_run_progress_v order by created_at desc`;
  const events = await q`select run_id, event_at, level, event, detail from public.aeo_run_events order by event_at desc limit 50`;
  const lists = await q`select 'prompts' list, list_version, count(*) n from public.aeo_prompts group by 2
    union all select 'keywords', list_version, count(*) from public.aeo_keywords group by 2
    union all select 'competitors', list_version, count(*) from public.aeo_competitors group by 2 order by 1, 2`;
  // A Pages export is stored under its upload day; only the most recent one is shown
  const gsc = await q`select source, period_label, count(*) rows, sum(impressions) impressions, min(date) filter (where page = '') d0, max(date) filter (where page = '') d1, max(pulled_at) loaded
    from public.aeo_gsc_ai_daily where page = '' or date = (select max(date) from public.aeo_gsc_ai_daily where page <> '') group by 1, 2 order by loaded desc`;
  const fresh = await q`select 'Google Analytics, visits from AI assistants' src, max(date)::text through, 'every day, automatic' how from public.aeo_ga4_ai_traffic_v
    union all select 'Search Console, searches for our name', max(date)::text, 'every day, automatic' from public.aeo_gsc_brand_daily
    union all select 'Search Console, Google AI appearances', max(date)::text, 'uploaded by hand, below' from public.aeo_gsc_ai_daily where source = 'gsc_genai_export_dates'
    union all select 'HubSpot, leads', max(created_date)::date::text, 'loaded by hand' from public.aeo_hubspot_ai_contacts_v`;
  return (
    <>
      <div className="pagehead"><div><h1>Runs & raw data</h1><p className="hint">Every metric is computed from raw captures in aeo_gpt_captures (ChatGPT), aeo_llm_captures (Gemini, Perplexity) and aeo_aio_captures (Google), keyed by run_id.</p></div></div>
      {sp?.uploaded ? <div className="banner">Search Console export loaded: {sp.uploaded} rows.</div> : null}
      {sp?.error ? <div className="banner">Upload failed: {sp.error}</div> : null}
      <Section title="Runs">
        <Table columns={[{ key: 'run_id', label: 'Run' }, { key: 'run_date', label: 'Date', render: (r) => date(r.run_date) }, { key: 'run_type', label: 'Type' },
          { key: 'status', label: 'Status', render: (r) => <span className="pill">{r.status}</span> }, { key: 'triggered_by', label: 'Triggered by' },
          { key: 'gpt', label: 'ChatGPT ok / expected (failed)', num: true, render: (r) => `${num(r.gpt_ok)} / ${num(r.gpt_expected)} (${num(r.gpt_failed)})` },
          { key: 'gem', label: 'Gemini ok / expected (failed)', num: true, render: (r) => (Number(r.gemini_expected) ? `${num(r.gemini_ok)} / ${num(r.gemini_expected)} (${num(r.gemini_failed)})` : '–') },
          { key: 'pplx', label: 'Perplexity ok / expected (failed)', num: true, render: (r) => (Number(r.perplexity_expected) ? `${num(r.perplexity_ok)} / ${num(r.perplexity_expected)} (${num(r.perplexity_failed)})` : '–') },
          { key: 'aio', label: 'AIO ok / expected (failed)', num: true, render: (r) => `${num(r.aio_ok)} / ${num(r.aio_expected)} (${num(r.aio_failed)})` },
          { key: 'v', label: 'Lists', render: (r) => `P ${r.prompt_list_version} · K ${r.keyword_list_version} · C ${r.competitor_list_version}` },
          { key: 'credits', label: 'Credits (gpt / aio)', num: true, render: (r) => `${num(r.gpt_credits)} / ${num(r.aio_credits)}` },
          { key: 'llm', label: 'Gemini + Perplexity cost', num: true, render: (r) => (Number(r.llm_cost_usd) ? `$${Number(r.llm_cost_usd).toFixed(2)}` : '–') }]} rows={runs} />
      </Section>
      <div className="grid2">
        <Section title="List versions">
          <Table columns={[{ key: 'list', label: 'List' }, { key: 'list_version', label: 'Version' }, { key: 'n', label: 'Items', num: true }]} rows={lists} />
        </Section>
        <Section title="Recent run events">
          <Table columns={[{ key: 'event_at', label: 'When', render: (r) => dateTime(r.event_at) },
            { key: 'run_id', label: 'Run' }, { key: 'level', label: 'Level' }, { key: 'event', label: 'Event' },
            { key: 'detail', label: 'Detail', render: (r) => <code>{JSON.stringify(r.detail)}</code> }]} rows={events} />
        </Section>
      </div>
      <div className="grid2">
        <Section title="How fresh each source is" hint="The answers from the assistants and Google are collected by the runs above. Everything else comes from these sources.">
          <Table columns={[{ key: 'src', label: 'Source' }, { key: 'through', label: 'Data up to', render: (r) => date(r.through) }, { key: 'how', label: 'Updated' }]} rows={fresh} />
        </Section>
        <Section title="Upload the Google AI report" hint="Search Console has no way to send this report automatically. Export it (Performance → Generative AI features → Export → CSV) and upload Chart.csv and Pages.csv here, one file at a time. Uploading a longer period replaces the days it overlaps.">
          <form action="/api/gsc-upload" method="post" encType="multipart/form-data" className="runpicker">
            <input type="file" name="file" accept=".csv,text/csv" required />
            <input type="text" name="period" placeholder="Period, e.g. 12 months" />
            <input type="password" name="key" placeholder="Upload password" required />
            <button type="submit">Upload</button>
          </form>
          <div style={{ marginTop: 12 }}>
            <Table columns={[{ key: 'source', label: 'File', render: (r) => (r.source === 'gsc_genai_export_dates' ? 'Chart.csv (by day)' : 'Pages.csv (by page)') }, { key: 'rows', label: 'Rows', num: true, render: (r) => num(r.rows) },
              { key: 'impressions', label: 'Appearances', num: true, render: (r) => num(r.impressions) }, { key: 'loaded', label: 'Uploaded', render: (r) => date(r.loaded) }]}
              rows={gsc} empty="Awaiting the first upload." />
          </div>
        </Section>
      </div>
      <Section title="How to trace a number to raw data" hint="Use the Supabase SQL editor (project AI Accountant).">
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{`-- ChatGPT: every answer for a run, with AiA flags
select c.prompt_key, c.sample_no, m.mentioned, m.cited, c.response_text
from aeo_gpt_captures c join aeo_gpt_mentions_v m on m.capture_id = c.id and m.brand_key = 'aia'
where c.run_id = '<RUN_ID>';

-- AI Overviews: every capture for a run, with citations
select keyword_id, sample_no, url, domain from aeo_aio_citations_v where run_id = '<RUN_ID>';`}</pre>
      </Section>
    </>
  );
}
