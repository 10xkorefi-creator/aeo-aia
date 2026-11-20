import Link from 'next/link';
import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { pct, num, date, monthLabel } from '@/lib/format';
import { Bars, Table, TestBanner, Ask } from '@/components/ui';
import { Minis } from '@/components/minis';
import { ChainTrend } from '@/components/chain-trend';
import { AssistantIcon, assistantName } from '@/components/assistant';
import { askHref } from '@/lib/ask';
import { gpt as G, aio as A, funnel as F, overview as O } from '@/lib/glossary';
import { HUBSPOT_AI_SEGMENT_URL, HUBSPOT_AI_DEALS_URL, HUBSPOT_AI_WON_URL } from '@/lib/links';
import { Info, Hint } from '@/components/info';

export const dynamic = 'force-dynamic';

// One numbered question per band: the page reads top to bottom as three questions.
function Band({ n, title, lead, info, children }) {
  return (
    <section className="band">
      <div className="band-head"><span className="band-n">{n}</span><h2>{title}<Info tip={info} /></h2></div>
      {lead ? <p className="band-lead">{lead}</p> : null}
      {children}
    </section>
  );
}

function Engine({ logo, title, href, children }) {
  return (
    <section className="channel">
      <div className="channel-head">
        <img src={logo} alt="" />
        <div><h3 className="channel-title">{title}</h3></div>
        <Link href={href}>Details <span className="arrow">→</span></Link>
      </div>
      <div className="channel-body">{children}</div>
    </section>
  );
}

function HubSpotLink({ href, tip, label }) {
  if (!href) return null;
  return (
    <Hint tip={tip} side="top" align="start" delay={250}>
      <a className="hs-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <img src="/logos/hubspot.svg" alt="" width="13" height="13" /><span>HubSpot</span><i aria-hidden="true">↗</i></a>
    </Hint>
  );
}

export default async function Overview({ searchParams }) {
  const sp = await searchParams;
  const runs = await listRuns();
  const run = await pickRun(runs, sp?.run);
  const runId = run?.run_id ?? '';
  const [gptRows, aio, gptSov, aioSov, months, visitsBy, leadsBy, gscFrom, asstRows, recRows, weeks, weekRec] = await Promise.all([
    q`select * from public.aeo_gpt_run_metrics_mv where run_id = ${runId}`,
    q`select * from public.aeo_aio_run_metrics_mv where run_id = ${runId}`,
    q`select display_name, brand_key, role, mention_sov from public.aeo_gpt_sov_mv where run_id = ${runId} and role in ('own','sov') order by mention_sov desc nulls last`,
    q`select display_name, brand_key, role, citation_sov from public.aeo_aio_sov_mv where run_id = ${runId} and role in ('own','sov') order by citation_sov desc nulls last`,
    q`select * from public.aeo_funnel_monthly_v`,
    q`select case when session_source ~* 'chatgpt|chat\\.openai' then 'ChatGPT' when session_source ~* 'gemini' then 'Gemini' when session_source ~* 'perplexity' then 'Perplexity'
        when session_source ~* 'claude' then 'Claude' when session_source ~* 'copilot' then 'Copilot' else 'Other' end assistant, sum(sessions) visits
      from public.aeo_ga4_ai_monthly where session_source !~* '^openai$' and month >= (select min(month) from public.aeo_funnel_monthly_v) group by 1`,
    q`select lower(assistant) assistant, sum(contacts) leads, coalesce(sum(contacts) filter (where tier = 'strict'), 0) strict from public.aeo_hubspot_ai_leads_monthly group by 1`,
    q`select min(date) d0 from public.aeo_gsc_ai_daily where source = 'gsc_genai_export_dates'`,
    q`select engine, answers_ok, aia_mention_rate, aia_citation_rate from public.aeo_asst_run_metrics_mv where run_id = ${runId} and answers_ok > 0`,
    q`select engine, answers, recommended, recommended_rate, recommended_rate_ci_low lo, recommended_rate_ci_high hi from public.aeo_asst_recommended_v where run_id = ${runId}`,
    // the last 16 weeks (Monday start, India time): AI visits and branded searches per week; a week still in progress has no count yet
    q`with w as (select generate_series(date_trunc('week', now() at time zone 'Asia/Kolkata')::date - 105, date_trunc('week', now() at time zone 'Asia/Kolkata')::date, interval '7 days')::date wk),
        g as (select date_trunc('week', date)::date wk, sum(sessions) visits from public.aeo_ga4_ai_traffic_v where counts_as_human_aeo_traffic group by 1),
        gx as (select min(date) d0, max(date) d1 from public.aeo_ga4_ai_traffic_v)
      select to_char(w.wk, 'YYYY-MM-DD') wk, to_char(w.wk, 'DD/MM') label, to_char(w.wk, 'DD/MM/YYYY') as day,
        case when b.full_week then b.searches end searches, case when b.full_week then b.clicks end clicks,
        case when w.wk >= gx.d0 and w.wk + 6 <= gx.d1 then coalesce(g.visits, 0) end visits,
        to_char(gx.d1, 'DD/MM/YYYY') ga4_through, (select to_char(max(date), 'DD/MM/YYYY') from public.aeo_gsc_brand_daily) brand_through
      from w cross join gx left join g on g.wk = w.wk left join public.aeo_gsc_brand_weekly_v b on b.week_start = w.wk order by 1`,
    q`select to_char(date_trunc('week', run_date), 'YYYY-MM-DD') wk, engine, sum(recommended) rec, sum(answers) n, count(distinct run_id) runs
      from public.aeo_asst_recommended_v where run_type <> 'test' and run_status = 'complete' group by 1, 2`,
  ]);
  // One weekly timeline for the chain: recommended with a link -> visits from AI assistants -> searches for our name
  const ASST = { chatgpt: 'var(--asst-chatgpt)', gemini: 'var(--asst-gemini)', perplexity: 'var(--asst-perplexity)' };
  const weekXs = weeks.map((w) => ({ key: w.wk, label: w.label, tip: `Week of ${w.day}` }));
  const weekPts = (k, detail) => Object.fromEntries(weeks.filter((w) => w[k] !== null && w[k] !== undefined).map((w) => [w.wk, { y: Number(w[k]), detail: detail ? detail(w) : undefined }]));
  const chainRows = [
    { id: 'rec', label: 'Recommends us with a link', kind: 'pct', title: <>AI assistants recommend us with a link<Info tip={O.chainRec} /></>,
      series: ['chatgpt', 'gemini', 'perplexity'].map((e) => ({ id: e, name: assistantName(e), color: ASST[e],
        points: Object.fromEntries(weekRec.filter((r) => r.engine === e && Number(r.n) > 0).map((r) => [r.wk, { y: Number(r.rec) / Number(r.n), detail: `${num(r.rec)} of ${num(r.n)} answers` }])) })) },
    { id: 'visits', label: 'Visits from AI assistants', kind: 'num', unit: 'visits a week', title: <>Visits from AI assistants<Info tip={O.chainVisits} /></>,
      series: [{ id: 'visits', name: 'Visits', color: 'var(--accent)', points: weekPts('visits') }] },
    { id: 'brand', label: 'Searches for our name on Google', kind: 'num', unit: 'searches a week', title: <>Searches for our name on Google<Info tip={O.chainBrand} /></>,
      series: [{ id: 'brand', name: 'Searches', color: 'var(--accent)', points: weekPts('searches', (w) => `${num(w.clicks)} clicked through`) }] },
  ];
  const recFor = (w, e) => { const r = weekRec.find((x) => x.wk === w.wk && x.engine === e); return r && Number(r.n) > 0 ? pct(Number(r.rec) / Number(r.n)) : '–'; };
  // The chain per assistant: recommended with a link (latest run) -> visits -> leads (months shown in the funnel)
  const recBy = Object.fromEntries(recRows.map((r) => [r.engine, r]));
  const chain = ['chatgpt', 'gemini', 'perplexity'].map((e) => ({ engine: e, rec: recBy[e],
    visits: Number(visitsBy.find((v) => v.assistant === assistantName(e))?.visits || 0),
    leads: Number(leadsBy.find((l) => l.assistant === e)?.leads || 0) }));
  // Gemini and Perplexity appear next to ChatGPT once a run has collected them
  const asstBy = Object.fromEntries(asstRows.map((r) => [r.engine, r]));
  const manyAssistants = ['gemini', 'perplexity'].some((e) => asstBy[e]);
  const [gpt] = gptRows;
  const aioBy = Object.fromEntries(aio.map((r) => [r.segment, r]));
  const b = aioBy.buyer, a = aioBy.all;
  const baselineRuns = runs.filter((r) => r.run_type !== 'test' && r.status === 'complete').length;

  // Funnel totals over the months shown (`months` is latest first)
  const sum = (k) => months.reduce((t, m) => t + Number(m[k] || 0), 0);
  const first = months[months.length - 1], last = months[0];
  const tot = { months: months.length, impressions: sum('google_ai_impressions'), visits: sum('visits'), leads: sum('leads'), leadsStrict: sum('leads_strict'),
    deals: sum('deals'), won: sum('won'), gscFrom: gscFrom[0]?.d0, gscThrough: months.find((m) => m.gsc_through)?.gsc_through,
    ga4Through: months.find((m) => m.ga4_through)?.ga4_through, hubspotThrough: months.find((m) => m.hubspot_through)?.hubspot_through };
  const per = (x, y, unit) => (y ? `${(100 * x / y).toFixed(1)} ${unit}` : '');
  const names = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Other'];
  const byAssistant = names.map((n) => ({ assistant: n, visits: Number(visitsBy.find((v) => v.assistant === n)?.visits || 0),
    leads: Number(leadsBy.find((l) => l.assistant === n.toLowerCase())?.leads || 0) })).filter((r) => r.visits || r.leads)
    .sort((x, y) => y.visits - x.visits).map((r) => ({ ...r, icon: <AssistantIcon id={r.assistant} />, txt: `${num(r.visits)} visit${r.visits === 1 ? '' : 's'} · ${num(r.leads)} lead${r.leads === 1 ? '' : 's'}` }));

  // Monthly series for the small charts, oldest first
  const chrono = months.slice().reverse();
  const series = (k) => chrono.map((m) => ({ label: monthLabel(m.month), value: m[k] === null || m[k] === undefined ? null : Number(m[k]),
    partial: m.is_current_month || (k === 'google_ai_impressions' && m.impressions_partial) }));
  const period = first && last ? `${monthLabel(first.month)} to ${monthLabel(last.month)}` : '';

  return (
    <>
      <div className="pagehead">
        <div><h1>Overview</h1>
          <p className="hint">Where AI Accountant stands in AI answers in India. Latest run {runId || '–'} on {run ? date(run.run_date) : '–'} · {num(baselineRuns)} baseline run{baselineRuns === 1 ? '' : 's'} so far.</p></div>
      </div>
      <TestBanner run={run} />

      <Band n="1" title="AI visibility" info={O.visible}
        lead="We ask AI assistants and Google the questions our buyers ask, several times each, and count how often AI Accountant shows up. Blue is us; grey is the competition.">
        <div className="grid2">
          <Engine logo="/logos/assistants.svg" title="AI assistants" href="/assistants">
            <p className="chain-lead">An assistant sends us a buyer when it <b>recommends AI Accountant by name and links to our site</b>. That share of answers is the figure to move.<Info tip={O.recommended} /></p>
            <div className="table-wrap">
              <table className="chain">
                <thead><tr><th>Assistant</th><th className="num">Recommends us with a link</th><th className="num">Visits sent</th><th className="num">Leads</th></tr></thead>
                <tbody>
                  {chain.map((c) => (
                    <tr key={c.engine}>
                      <td><span className="asst"><AssistantIcon id={c.engine} size={16} />{assistantName(c.engine)}</span></td>
                      <td className="num">{c.rec ? <><b className="chain-rate">{pct(c.rec.recommended_rate)}</b><span className="chain-sub">{num(c.rec.recommended)} of {num(c.rec.answers)} answers</span></> : <span className="chain-sub">not collected in this run</span>}</td>
                      <td className="num">{num(c.visits)}</td>
                      <td className="num">{num(c.leads)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="chain-note">Recommendation rate: run {runId}. Visits and leads: {period}.</p>
          </Engine>

          <Engine logo="/logos/google.svg" title="Google AI Overviews" href="/ai-overviews">
            <div className="stat">
              <div className="stat-value">{pct(b?.aia_cited_rate)}</div>
              <div className="stat-text">
                <div className="stat-label">of buyer searches cite aiaccountant.com<Info tip={A.citedBuyer(b)} /><Ask href={askHref('aio_cited', runId, 'buyer')} /></div>
              </div>
            </div>
            <ul className="facts">
              <li>Cited on <b>{num(b?.keywords_aia_cited_any)} of {num(b?.keywords)}</b> buyer keywords at least once<Info tip={A.citedAll(a, b, aioBy.informational)} /></li>
            </ul>
            <div>
              <h4>Against direct competitors<Info tip={A.sov(aioSov)} /></h4>
              <Bars rows={aioSov} labelKey="display_name" valueKey="citation_sov" max={1} highlight={(r) => r.brand_key === 'aia'} />
            </div>
          </Engine>
        </div>
      </Band>

      <Band n="2" title="Is AI visibility moving the outcomes?" info={O.chain}
        lead="One timeline, week by week. When assistants recommend us more often (1), visits from them should follow (2). Many people who see us in an AI answer do not click: they search for AI Accountant by name later, which shows up in (3). Point at a week to read all three.">
        <div className="card">
          <ChainTrend xs={weekXs} rows={chainRows} />
          <details className="tableview">
            <summary>Show every week as a table</summary>
            <Table columns={[
              { key: 'day', label: 'Week of', render: (w) => <span className="nowrap">{w.day}</span> },
              { key: 'chatgpt', label: 'ChatGPT recommends us', num: true, render: (w) => recFor(w, 'chatgpt') },
              { key: 'gemini', label: 'Gemini recommends us', num: true, render: (w) => recFor(w, 'gemini') },
              { key: 'perplexity', label: 'Perplexity recommends us', num: true, render: (w) => recFor(w, 'perplexity') },
              { key: 'visits', label: 'Visits from AI assistants', num: true, render: (w) => (w.visits === null ? '–' : num(w.visits)) },
              { key: 'searches', label: 'Searches for our name', num: true, render: (w) => (w.searches === null ? '–' : num(w.searches)) },
              { key: 'clicks', label: 'Clicked through', num: true, render: (w) => (w.clicks === null ? '–' : num(w.clicks)) }]} rows={weeks.slice().reverse()} />
          </details>
          <p className="hint ct-foot">We started asking the assistants on 17/11/2026, so chart 1 has few points for now; the pattern becomes readable after three to four weeks of runs. A week still in progress has no count yet. Loaded to: Google Analytics {weeks[0]?.ga4_through ?? '–'} · Search Console {weeks[0]?.brand_through ?? '–'}.</p>
        </div>
      </Band>

      <Band n="3" title="Traffic & Conversions" info={F.section(tot)}
        lead={<>{period}: AI assistants sent <b>{num(tot.visits)}</b> visits, which became <b>{num(tot.leads)}</b> leads, <b>{num(tot.deals)}</b> deals and <b>{num(tot.won)}</b> customers. <a href="/api/src?k=funnel" target="_blank" rel="noopener noreferrer">See the data behind it</a>.</>}>
        <div className="card">
          <div className="funnel-wrap">
            <div className="fgroup seen">
              <div className="fgroup-label"><AssistantIcon id="google" size={15} />Seen on Google</div>
              <div className="funnel one">
                <div className="fstep"><div className="fstep-label">AI impressions<Info tip={F.seen(tot)} /></div>
                  <div className="fstep-value">{num(tot.impressions)}</div><div className="fstep-sub">{tot.gscFrom ? `since ${date(tot.gscFrom)}` : ''}</div></div>
              </div>
            </div>
            <div className="fbreak" role="note"><span>Google does not report clicks from AI answers, so this cannot be linked to the steps on the right</span></div>
            <div className="fgroup">
              <div className="fgroup-label">From AI assistants<span className="logo-row">{['chatgpt', 'gemini', 'perplexity', 'claude', 'copilot'].map((id) => <span key={id} title={assistantName(id)}><AssistantIcon id={id} size={15} /></span>)}</span></div>
              <div className="funnel four">
                <div className="fstep"><div className="fstep-label">Visits<Info tip={F.visits(tot)} /></div>
                  <div className="fstep-value">{num(tot.visits)}</div><div className="fstep-sub">to the website</div></div>
                <div className="fstep"><div className="fstep-label">Leads<Info tip={F.leads(tot)} /><HubSpotLink href={HUBSPOT_AI_SEGMENT_URL} tip={F.hubspotLink} label="Open these leads in HubSpot" /></div>
                  <div className="fstep-value">{num(tot.leads)}</div><div className="fstep-sub">{per(tot.leads, tot.visits, 'per 100 visits')}</div></div>
                <div className="fstep"><div className="fstep-label">Deals<Info tip={F.deals(tot)} /><HubSpotLink href={HUBSPOT_AI_DEALS_URL} tip={F.hubspotDealsLink} label="Open these deals in HubSpot" /></div>
                  <div className="fstep-value">{num(tot.deals)}</div><div className="fstep-sub">{per(tot.deals, tot.leads, 'per 100 leads')}</div></div>
                <div className="fstep"><div className="fstep-label">Won<Info tip={F.won(tot)} /><HubSpotLink href={HUBSPOT_AI_WON_URL} tip={F.hubspotWonLink} label="Open these customers in HubSpot" /></div>
                  <div className="fstep-value">{num(tot.won)}</div><div className="fstep-sub">{per(tot.won, tot.leads, 'per 100 leads')}</div></div>
              </div>
            </div>
          </div>
          <div className="assist">
            <h4>Which assistants send them<Info tip={F.byAssistant} /></h4>
            <Bars rows={byAssistant} labelKey="assistant" valueKey="visits" format={(v) => num(v)} valueWidth={170} highlight={() => true} />
          </div>
        </div>
      </Band>

      <Band n="4" title="Trends" info={O.trend}
        lead="One bar per month, oldest on the left. Point at a month to see it in all four charts. A lighter bar is a month with incomplete data, such as the month still in progress.">
        <div className="card">
          <Minis charts={[{ title: 'Visits from AI assistants', points: series('visits') }, { title: 'Leads', points: series('leads') },
            { title: 'Deals', points: series('deals') }, { title: 'Google AI impressions', points: series('google_ai_impressions') }]} />
          <details className="tableview">
            <summary>Show every month as a table</summary>
            <Table columns={[
              { key: 'month', label: 'Month', render: (m) => <span className="nowrap">{monthLabel(m.month)}{m.is_current_month ? <span className="muted"> (so far)</span> : null}</span> },
              { key: 'google_ai_impressions', label: 'Google AI impressions', num: true, info: F.seen(tot), render: (m) => (m.google_ai_impressions === null ? '–' : <>{num(m.google_ai_impressions)}{m.impressions_partial ? <span className="muted"> part</span> : null}</>) },
              { key: 'google_cited_rate', label: 'Google cited', num: true, info: F.cited, render: (m) => (m.google_cited_rate === null ? '–' : pct(m.google_cited_rate)) },
              { key: 'visits', label: 'Visits', num: true, info: F.visits(tot), render: (m) => (m.visits === null ? '–' : num(m.visits)) },
              { key: 'leads', label: 'Leads', num: true, info: F.leads(tot), render: (m) => num(m.leads) },
              { key: 'deals', label: 'Deals', num: true, info: F.deals(tot), render: (m) => num(m.deals) },
              { key: 'won', label: 'Won', num: true, info: F.won(tot), render: (m) => num(m.won) }]} rows={months} />
          </details>
          <p className="hint" style={{ margin: '14px 0 0' }}>Data loaded to: Search Console {date(tot.gscThrough)} · Google Analytics {date(tot.ga4Through)} · HubSpot {date(tot.hubspotThrough)}.</p>
        </div>
      </Band>
    </>
  );
}
