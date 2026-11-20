import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { pct, num, ci, date } from '@/lib/format';
import { Kpi, Section, Bars, Trend, Table, RunPicker, TestBanner } from '@/components/ui';
import { aio as A, term } from '@/lib/glossary';
import { Term } from '@/components/info';
import { KeywordPanel } from '@/components/prompt-panel';

export const dynamic = 'force-dynamic';

// Google's equivalent of "recommends us with a link": the AI Overview links to aiaccountant.com on a keyword buyers search.
// Google does not report clicks from AI Overviews, so the outcome shown beside it is how often we appeared, not visits.
export default async function AIOverviews({ searchParams }) {
  const sp = await searchParams;
  const runs = await listRuns();
  const run = await pickRun(runs, sp?.run);
  const runId = run?.run_id ?? '';
  const [rows, trend, sov, topics, domains, kws, seenRows] = await Promise.all([
    q`select * from public.aeo_aio_run_metrics_mv where run_id = ${runId}`,
    q`select run_id, run_date, aia_cited_rate y, aia_cited_rate_ci_low lo, aia_cited_rate_ci_high hi
    from public.aeo_aio_run_metrics_mv where segment = 'buyer' and (run_type <> 'test' or run_id = ${runId}) order by run_date, run_id`,
    q`select * from public.aeo_aio_sov_mv where run_id = ${runId} order by role = 'own' desc, role, citation_rate desc`,
    q`select * from public.aeo_aio_topic_metrics_mv where run_id = ${runId} order by segment, aia_cited_rate desc nulls last`,
    q`select * from public.aeo_aio_cited_domains_mv where run_id = ${runId} order by captures_citing desc limit 20`,
    q`select * from public.aeo_aio_keyword_metrics_mv where run_id = ${runId} order by segment, aia_cited_samples desc, volume desc nulls last`,
    q`with mx as (select max(date) d from public.aeo_gsc_ai_daily where source = 'gsc_genai_export_dates')
      select mx.d d1, coalesce(sum(g.impressions) filter (where g.date > mx.d - 28), 0) last28,
        coalesce(sum(g.impressions) filter (where g.date <= mx.d - 28 and g.date > mx.d - 56), 0) prev28
      from public.aeo_gsc_ai_daily g, mx where g.source = 'gsc_genai_export_dates' group by mx.d`,
  ]);
  const by = Object.fromEntries(rows.map((r) => [r.segment, r]));
  const b = by.buyer, a = by.all;
  const seen = seenRows[0];
  const seenTip = { title: 'Times we appeared in Google\'s AI answers',
    body: 'How often a page from aiaccountant.com was shown inside a Google AI answer, from the Search Console Generative AI report. It counts appearances, not visits: Google does not say how many people clicked. The figure is only as recent as the last export uploaded on the Traffic page.',
    now: seen ? `28 days to ${date(seen.d1)}: ${num(seen.last28)}. The 28 days before: ${num(seen.prev28)}.` : null };

  return (
    <>
      <div className="pagehead">
        <div><h1 className="with-logo"><img src="/logos/google.svg" alt="" />Google AI Overviews</h1><p className="hint">Google search results with their AI Overview, India, <Term tip={term.samples(a?.aio_samples, 'keyword')}>{a?.aio_samples ?? '–'} searches per keyword</Term> · {num(a?.captures_ok)} searches collected</p></div>
        <RunPicker runs={runs} current={runId} path="/ai-overviews" />
      </div>
      <TestBanner run={run} />
      <p className="hint page-note">For Google, the figure that matters is how often its AI Overview <b>links to our site on a keyword buyers search</b>. Google does not report clicks from AI Overviews, so this page cannot be tied to visits and leads the way the AI assistants page is; the closest outcome we can see is how often we appeared.</p>
      <div className="kpis two">
        <Kpi label="AI Overviews that link to us (buyer keywords)" info={A.citedBuyer(b)} value={pct(b?.aia_cited_rate)}
          sub={<>{num(b?.aia_cited_captures)} of {num(b?.captures_with_aio)} searches · on {num(b?.keywords_aia_cited_any)} of {num(b?.keywords)} keywords · <Term tip={term.ci(b?.aia_cited_rate, b?.aia_cited_rate_ci_low, b?.aia_cited_rate_ci_high)}>likely</Term> {ci(b?.aia_cited_rate_ci_low, b?.aia_cited_rate_ci_high)}</>} />
        <Kpi label="Times we appeared in Google's AI answers (28 days)" info={seenTip} value={seen ? num(seen.last28) : '–'}
          sub={seen ? `to ${date(seen.d1)} · the 28 days before: ${num(seen.prev28)}` : 'Upload a Search Console export on the Traffic page'} />
      </div>
      <div className="grid2">
        <Section title="Link rate on buyer keywords, run by run" info={A.trend(trend)} hint="The shaded band is the likely range. A change that stays inside it is noise.">
          <Trend points={trend.map((t) => ({ x: date(t.run_date).slice(0, 5), y: t.y, lo: t.lo, hi: t.hi }))} />
        </Section>
        <Section title="Who Google links to instead" info={A.sov(sov)} hint="Each brand's share of the links Google's AI Overviews gave to AiA and its direct competitors.">
          <Bars rows={sov.filter((r) => ['own', 'sov'].includes(r.role))} labelKey="display_name" valueKey="citation_sov" max={1} highlight={(r) => r.brand_key === 'aia'} />
        </Section>
      </div>
      <Section title="Which keywords link to us" info={A.keywords} hint="One row per tracked keyword. 0 of 4 on a buyer keyword with many searches is a gap worth closing. Click a keyword to see every page Google cited for it.">
        <Table columns={[{ key: 'keyword_id', label: '#' }, { key: 'keyword', label: 'Keyword', render: (r) => <KeywordPanel run={runId} keywordId={r.keyword_id} text={r.keyword} /> },
          { key: 'segment', label: 'Segment', info: term.segment },
          { key: 'volume', label: 'Searches a month (India)', num: true, info: term.volumeIn, render: (r) => num(r.volume) },
          { key: 'aia_cited_samples', label: 'Linked to us', num: true, info: term.citedSamples, render: (r) => <span className={Number(r.aia_cited_samples) > 0 ? 'hit' : 'miss'}>{r.aia_cited_samples}/{r.aio_samples}</span> },
          { key: 'aia_best_organic_rank', label: 'Our normal Google rank', num: true, info: term.organicRank }]} rows={kws} />
      </Section>
      <Section title="Most-cited websites in AI Overviews" info={A.domains} hint="Share of Google's AI Overviews that list the site as a source. These are the places to get AI Accountant mentioned for Google.">
        <Table columns={[{ key: 'domain', label: 'Website' }, { key: 'keywords_citing', label: 'Keywords', num: true },
          { key: 'share_of_aio_captures', label: 'Share', num: true, render: (r) => pct(r.share_of_aio_captures) }]} rows={domains} />
      </Section>
      <details className="more-block">
        <summary>More detail: by topic</summary>
        <Section title="By topic" info={A.topics}>
          <Table columns={[{ key: 'topic', label: 'Topic' }, { key: 'segment', label: 'Segment', info: term.segment }, { key: 'keywords', label: 'Keywords', num: true },
            { key: 'aia_cited_rate', label: 'Linked to us', num: true, render: (r) => pct(r.aia_cited_rate) }]} rows={topics} />
        </Section>
      </details>
    </>
  );
}
