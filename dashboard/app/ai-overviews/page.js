import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { pct, num, date } from '@/lib/format';
import { Section, Bars, Trend, Table, RunPicker, TestBanner } from '@/components/ui';
import { MultiTrend } from '@/components/multi-trend';
import { aio as A, term, overview as O } from '@/lib/glossary';
import { Info } from '@/components/info';
import { AssistantIcon } from '@/components/assistant';
import { KeywordPanel } from '@/components/prompt-panel';
import { ScoreTile, Moved } from '@/components/score';
import { googleChange } from '@/lib/change';

export const dynamic = 'force-dynamic';

// Google's equivalent of "recommends us with a link": the AI Overview links to aiaccountant.com on a keyword buyers search.
// Google does not report clicks from AI Overviews, so the outcome shown beside it is how often we appeared, not visits.
export default async function AIOverviews({ searchParams }) {
  const sp = await searchParams;
  const runs = await listRuns();
  const run = await pickRun(runs, sp?.run);
  const runId = run?.run_id ?? '';
  const g = await googleChange(runId);
  const [rows, trend, sov, domains, kws, seenRows, seenWeekly, topPages] = await Promise.all([
    q`select * from public.aeo_aio_run_metrics_mv where run_id = ${runId}`,
    q`select run_id, run_date, aia_cited_rate y, aia_cited_rate_ci_low lo, aia_cited_rate_ci_high hi
    from public.aeo_aio_run_metrics_mv where segment = 'buyer' and (run_type <> 'test' or run_id = ${runId}) order by run_date, run_id`,
    q`select * from public.aeo_aio_sov_mv where run_id = ${runId} order by role = 'own' desc, role, citation_rate desc`,
    q`select * from public.aeo_aio_cited_domains_mv where run_id = ${runId} order by captures_citing desc limit 12`,
    q`select * from public.aeo_aio_keyword_metrics_mv where run_id = ${runId} order by aia_cited_samples desc, volume desc nulls last`,
    q`with mx as (select max(date) d from public.aeo_gsc_ai_daily where source = 'gsc_genai_export_dates')
      select mx.d d1, coalesce(sum(g.impressions) filter (where g.date > mx.d - 28), 0) last28,
        coalesce(sum(g.impressions) filter (where g.date <= mx.d - 28 and g.date > mx.d - 56), 0) prev28
      from public.aeo_gsc_ai_daily g, mx where g.source = 'gsc_genai_export_dates' group by mx.d`,
    // complete weeks only, so a week still filling in never looks like a drop
    q`select to_char(date_trunc('week', date), 'YYYY-MM-DD') wk, to_char(date_trunc('week', date), 'DD/MM') label, to_char(date_trunc('week', date), 'DD/MM/YYYY') as day, sum(impressions) v
      from public.aeo_gsc_ai_daily where source = 'gsc_genai_export_dates' group by 1, 2, 3 having count(*) = 7 order by 1`,
    q`select page, max(period_label) period_label, sum(impressions) impressions from public.aeo_gsc_ai_daily
      where page <> '' and date = (select max(date) from public.aeo_gsc_ai_daily where page <> '') group by 1 order by 3 desc limit 10`,
  ]);
  const by = Object.fromEntries(rows.map((r) => [r.segment, r]));
  const b = by.buyer, a = by.all;
  const seen = seenRows[0];
  const seenChange = seen && Number(seen.prev28) > 0 ? (Number(seen.last28) - Number(seen.prev28)) / Number(seen.prev28) : null;
  const seenTip = { title: 'Times we appeared in Google\'s AI answers',
    body: 'How often a page from aiaccountant.com was shown inside a Google AI answer, from the Search Console Generative AI report. It counts appearances, not visits: Google does not say how many people clicked. Most of these appearances are on informational pages (how-to guides, calculators), not on buyer keywords. The figure is only as recent as the last export uploaded on the Runs & raw data page.',
    now: seen ? `28 days to ${date(seen.d1)}: ${num(seen.last28)}. The 28 days before: ${num(seen.prev28)}.` : null };
  const weeks = seenWeekly.slice(-26);
  const weekXs = weeks.map((w) => ({ key: w.wk, label: w.label, tip: `Week of ${w.day}` }));
  const weekSeries = [{ id: 'seen', name: 'Appearances', color: 'var(--accent)', points: Object.fromEntries(weeks.map((w) => [w.wk, { y: Number(w.v) }])) }];

  // Keywords: what links to us (plus anything won or lost since the previous run), then the gap, then informational
  const moved = (r) => g.status.get(r.keyword_id);
  const buyer = kws.filter((r) => r.segment === 'buyer');
  const linkedRows = buyer.filter((r) => Number(r.aia_cited_samples) > 0 || moved(r));
  const gapRows = buyer.filter((r) => !(Number(r.aia_cited_samples) > 0 || moved(r))).sort((x, y) => Number(y.volume || 0) - Number(x.volume || 0));
  const infoRows = kws.filter((r) => r.segment !== 'buyer');
  const linkedCell = (r) => (Number(r.aio_samples) > 0
    ? <><Moved status={moved(r)} /><span className={Number(r.aia_cited_samples) > 0 ? 'hit' : 'miss'}>{r.aia_cited_samples}/{r.aio_samples}</span></>
    : <><Moved status={moved(r)} /><span className="miss">no AI Overview</span></>);
  const kwCols = [{ key: 'keyword', label: 'Keyword', render: (r) => <KeywordPanel run={runId} keywordId={r.keyword_id} text={r.keyword} /> },
    { key: 'volume', label: 'Searches a month (India)', num: true, info: term.volumeIn, render: (r) => num(r.volume) },
    { key: 'aia_cited_samples', label: 'Linked to us', num: true, info: term.citedSamples, render: linkedCell },
    { key: 'aia_best_organic_rank', label: 'Our normal Google rank', num: true, info: term.organicRank, render: (r) => r.aia_best_organic_rank ?? '–' }];

  return (
    <>
      <div className="pagehead">
        <div><h1 className="with-logo"><img src="/logos/google.svg" alt="" />Google AI Overviews</h1><p className="hint">Google search results in India with their AI Overview, {a?.aio_samples ?? '–'} searches per keyword · {num(a?.captures_ok)} searches collected</p></div>
        <RunPicker runs={runs} current={runId} path="/ai-overviews" />
      </div>
      <TestBanner run={run} />
      <div className="scores two">
        <ScoreTile icon={<AssistantIcon id="google" size={18} />} name="AI Overviews that link to us, on buyer keywords"
          rate={g.cur ? Number(g.cur.rate) : null} history={g.history.map((h) => ({ rate: Number(h.rate) }))}
          sub={g.cur ? <>{num(g.cur.hit)} of {num(g.cur.n)} searches that showed an AI Overview · on {num(g.cur.kw_hit)} of {num(g.cur.kw)} keywords</> : 'Not collected in this run'}
          change={g} prev={g.prev} changeInfo={O.change} />
        <div className="score">
          <div className="score-head"><AssistantIcon id="google" size={18} /><span>Times we appeared in Google&apos;s AI answers, 28 days<Info tip={seenTip} /></span></div>
          <div className="score-main"><div className="score-value">{seen ? num(seen.last28) : '–'}</div></div>
          <div className="score-sub">{seen ? `Search Console, 28 days to ${date(seen.d1)}` : 'Upload a Search Console export on the Runs & raw data page'}</div>
          {seenChange === null ? null : (
            <div className="chg same"><span className="chg-pill">{seenChange >= 0 ? '▲' : '▼'} {Math.abs(seenChange * 100).toFixed(0)}%</span>
              <span className="chg-text">against the 28 days before ({num(seen.prev28)})</span></div>
          )}
        </div>
      </div>
      <p className="score-key">For Google, the figure to move is how often its AI Overview <b>links to our site on a keyword buyers search</b>.<Info tip={A.citedBuyer(b)} />{' '}
        Google does not report clicks from AI Overviews, so this page cannot be tied to visits and leads; the closest outcome is how often we appeared.</p>

      <div className="grid2">
        <Section title="Link rate on buyer keywords, run by run" info={A.trend(trend)} hint="The shaded band is the likely range. A change that stays inside it is normal variation.">
          <Trend points={trend.map((t) => ({ x: date(t.run_date).slice(0, 5), y: t.y, lo: t.lo, hi: t.hi }))} />
        </Section>
        <Section title="Times we appeared, week by week" info={seenTip} hint={`Search Console, complete weeks${seen ? `, loaded to ${date(seen.d1)}` : ''}. All our pages, not only buyer keywords.`}>
          <MultiTrend xs={weekXs} series={weekSeries} kind="num" empty="Upload a Search Console export on the Runs & raw data page." />
        </Section>
      </div>

      <Section title="Which buyer keywords link to us" info={A.keywords}
        hint={`Searches whose AI Overview linked to our site, out of searches that showed one, on the ${num(buyer.filter((r) => Number(r.aia_cited_samples) > 0).length)} of ${num(buyer.length)} buyer keywords where at least one did.${g.prev ? ` "New" and "lost" compare with the run of ${date(g.prev.run_date)}.` : ''} Click a keyword to see every page Google cited.`}>
        <Table columns={kwCols} rows={linkedRows} empty="Google's AI Overview does not link to us on any buyer keyword in this run." />
        <details className="tableview">
          <summary>The gap: {num(gapRows.length)} buyer keywords where the AI Overview does not link to us (most searched first)</summary>
          <Table columns={kwCols} rows={gapRows} />
        </details>
        <details className="tableview">
          <summary>Informational keywords ({num(infoRows.length)}), tracked for context</summary>
          <Table columns={kwCols} rows={infoRows} />
        </details>
      </Section>

      <div className="grid2">
        <Section title="Who Google links to instead" info={A.sov(sov)} hint="Each brand's share of the links Google's AI Overviews gave to AiA and its direct competitors.">
          <Bars rows={sov.filter((r) => ['own', 'sov'].includes(r.role))} labelKey="display_name" valueKey="citation_sov" max={1} highlight={(r) => r.brand_key === 'aia'} />
        </Section>
        <Section title="Most-cited websites in AI Overviews" info={A.domains} hint="Share of Google's AI Overviews that list the site as a source. These are the places to get AI Accountant mentioned for Google.">
          <Table columns={[{ key: 'domain', label: 'Website', render: (r) => (/(^|\.)aiaccountant\.com$/.test(r.domain) ? <b className="own-text">{r.domain}</b> : r.domain) },
            { key: 'share_of_aio_captures', label: 'Share of AI Overviews', num: true, render: (r) => pct(r.share_of_aio_captures) }]} rows={domains} />
        </Section>
      </div>

      {topPages.length ? (
        <Section title="Which of our pages Google shows most" hint={`Appearances in Google's AI answers per page, from the latest Search Console Pages export${topPages[0].period_label ? ` (${topPages[0].period_label})` : ''}. Mostly guides and calculators: they bring visibility, not buyers.`}>
          <Table columns={[{ key: 'page', label: 'Page', render: (r) => <span className="path">{String(r.page).replace(/^https?:\/\/(www\.)?aiaccountant\.com/, '') || '/'}</span> },
            { key: 'impressions', label: 'Appearances', num: true, render: (r) => num(r.impressions) }]} rows={topPages} />
        </Section>
      ) : null}
    </>
  );
}
