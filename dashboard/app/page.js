import Link from 'next/link';
import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { num, date, monthLabel } from '@/lib/format';
import { Table, TestBanner } from '@/components/ui';
import { Minis } from '@/components/minis';
import { AssistantIcon, assistantName } from '@/components/assistant';
import { ScoreTile, Movers } from '@/components/score';
import { assistantChange, googleChange } from '@/lib/change';
import { funnel as F, overview as O } from '@/lib/glossary';
import { HUBSPOT_AI_SEGMENT_URL, HUBSPOT_AI_DEALS_URL, HUBSPOT_AI_WON_URL } from '@/lib/links';
import { Info, Hint } from '@/components/info';

export const dynamic = 'force-dynamic';

const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const COLOR = { chatgpt: 'var(--asst-chatgpt)', gemini: 'var(--asst-gemini)', perplexity: 'var(--asst-perplexity)' };

// The page reads top to bottom as two questions: where do we stand in AI answers (and did it move), and what did it bring.
function Band({ n, title, lead, info, children }) {
  return (
    <section className="band">
      <div className="band-head"><span className="band-n">{n}</span><h2>{title}<Info tip={info} /></h2></div>
      {lead ? <p className="band-lead">{lead}</p> : null}
      {children}
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
  const asst = await assistantChange(runId);
  const google = await googleChange(runId);
  const [months, extra, brandThrough] = await Promise.all([
    q`select * from public.aeo_funnel_monthly_v order by month desc`,
    // per month, in the same order as the funnel: searches for our name (Search Console)
    q`select (select sum(impressions) from public.aeo_gsc_brand_daily_v b where b.kind = 'brand' and date_trunc('month', b.date)::date = f.month) brand_searches
      from public.aeo_funnel_monthly_v f order by f.month desc`,
    q`select max(date) d from public.aeo_gsc_brand_daily`,
  ]);
  months.forEach((m, i) => { m.brand_searches = extra[i]?.brand_searches ?? null; });
  const baselineRuns = runs.filter((r) => r.run_type !== 'test' && r.status === 'complete').length;
  const prevDate = ENGINES.map((e) => asst[e].prev?.run_date).find(Boolean) || google.prev?.run_date;

  // What moved: one row per assistant and question, then Google keywords (most searched first)
  const icon = (id) => <AssistantIcon id={id} size={15} />;
  const moves = (k) => [
    ...ENGINES.flatMap((e) => asst[e][k].map((r) => ({ ...r, icon: icon(e) }))),
    ...google[k].slice().sort((a, b) => b.weight - a.weight).map((r) => ({ ...r, icon: icon('google') })),
  ];
  const gained = moves('gained'), lost = moves('lost');

  // Results over the months shown (`months` is latest first)
  const sum = (k) => months.reduce((t, m) => t + Number(m[k] || 0), 0);
  const first = months[months.length - 1], last = months[0];
  const tot = { months: months.length, visits: sum('visits'), leads: sum('leads'), leadsStrict: sum('leads_strict'), deals: sum('deals'), won: sum('won'),
    ga4Through: months.find((m) => m.ga4_through)?.ga4_through, hubspotThrough: months.find((m) => m.hubspot_through)?.hubspot_through };
  const per = (x, y, unit) => (y ? `${(100 * x / y).toFixed(1)} ${unit}` : '');
  const chrono = months.slice().reverse();
  const series = (k) => chrono.map((m) => ({ label: monthLabel(m.month), value: m[k] === null || m[k] === undefined ? null : Number(m[k]), partial: m.is_current_month }));
  const period = first && last ? `${monthLabel(first.month)} to ${monthLabel(last.month)}` : '';

  return (
    <>
      <div className="pagehead">
        <div><h1>Overview</h1>
          <p className="hint">Run of {run ? date(run.run_date) : '–'}{prevDate ? <>, compared with the run of {date(prevDate)}</> : null} · {num(baselineRuns)} baseline run{baselineRuns === 1 ? '' : 's'} so far.</p></div>
      </div>
      <TestBanner run={run} />

      <Band n="1" title="Where we stand in AI answers, and how it moved" info={O.visible}
        lead="We ask the questions our buyers ask, three times each, and count how often AI Accountant is recommended. Each card shows the share in this run and how it moved since the run before.">
        <div className="scores">
          {ENGINES.map((e) => {
            const a = asst[e], c = a.cur;
            return <ScoreTile key={e} href={`/assistants?engine=${e}`} icon={<AssistantIcon id={e} size={18} />} name={assistantName(e)} color={COLOR[e]}
              rate={c ? Number(c.recommended_rate) : null} history={a.history.map((h) => ({ rate: Number(h.recommended_rate) }))}
              sub={c ? <>{num(c.recommended)} of {num(c.answers)} answers recommend us with a link</> : 'Not collected in this run'}
              change={a} prev={a.prev} changeInfo={O.change} />;
          })}
          <ScoreTile href="/ai-overviews" icon={<AssistantIcon id="google" size={18} />} name="Google AI Overviews"
            rate={google.cur ? Number(google.cur.rate) : null} history={google.history.map((h) => ({ rate: Number(h.rate) }))}
            sub={google.cur ? <>{num(google.cur.hit)} of {num(google.cur.n)} buyer searches link to our site</> : 'Not collected in this run'}
            change={google} prev={google.prev} changeInfo={O.change} />
        </div>
        <p className="score-key">
          <b>Assistants:</b> the share of answers that name AI Accountant as a product and link to aiaccountant.com.<Info tip={O.recommended} />{' '}
          <b>Google:</b> the share of buyer searches whose AI Overview links to our site.{' '}
          Do not compare one card with another; read each against its own earlier runs.
        </p>
        {prevDate ? (
          <div className="card">
            <h3 className="card-h">What moved since {date(prevDate)}<Info tip={O.moved} /></h3>
            <Movers gained={gained} lost={lost} max={7} more={<><Link href="/assistants">AI assistants</Link> and <Link href="/ai-overviews">Google</Link> pages</>} />
          </div>
        ) : null}
      </Band>

      <Band n="2" title="What it brought" info={F.section(tot)}
        lead={<>{period}: AI assistants sent <b>{num(tot.visits)}</b> visits, which became <b>{num(tot.leads)}</b> leads, <b>{num(tot.deals)}</b> deals and <b>{num(tot.won)}</b> customers. <a href="/api/src?k=funnel" target="_blank" rel="noopener noreferrer">See the data behind it</a>.</>}>
        <div className="card">
          <div className="funnel four">
            <div className="fstep"><div className="fstep-label">Visits from AI assistants<Info tip={F.visits(tot)} /></div>
              <div className="fstep-value">{num(tot.visits)}</div><div className="fstep-sub">to the website</div></div>
            <div className="fstep"><div className="fstep-label">Leads<Info tip={F.leads(tot)} /><HubSpotLink href={HUBSPOT_AI_SEGMENT_URL} tip={F.hubspotLink} label="Open these leads in HubSpot" /></div>
              <div className="fstep-value">{num(tot.leads)}</div><div className="fstep-sub">{per(tot.leads, tot.visits, 'per 100 visits')}</div></div>
            <div className="fstep"><div className="fstep-label">Deals<Info tip={F.deals(tot)} /><HubSpotLink href={HUBSPOT_AI_DEALS_URL} tip={F.hubspotDealsLink} label="Open these deals in HubSpot" /></div>
              <div className="fstep-value">{num(tot.deals)}</div><div className="fstep-sub">{per(tot.deals, tot.leads, 'per 100 leads')}</div></div>
            <div className="fstep"><div className="fstep-label">Customers<Info tip={F.won(tot)} /><HubSpotLink href={HUBSPOT_AI_WON_URL} tip={F.hubspotWonLink} label="Open these customers in HubSpot" /></div>
              <div className="fstep-value">{num(tot.won)}</div><div className="fstep-sub">{per(tot.won, tot.leads, 'per 100 leads')}</div></div>
          </div>
          <h3 className="card-h">Month by month<Info tip={O.trend} /></h3>
          <Minis charts={[{ title: 'Visits from AI assistants', points: series('visits') }, { title: 'Searches for our name on Google', points: series('brand_searches') },
            { title: 'Leads', points: series('leads') }, { title: 'Deals', points: series('deals') }]} />
          <details className="tableview">
            <summary>Show every month as a table</summary>
            <Table columns={[
              { key: 'month', label: 'Month', render: (m) => <span className="nowrap">{monthLabel(m.month)}{m.is_current_month ? <span className="muted"> (so far)</span> : null}</span> },
              { key: 'visits', label: 'Visits from AI assistants', num: true, info: F.visits(tot), render: (m) => (m.visits === null ? '–' : num(m.visits)) },
              { key: 'brand_searches', label: 'Searches for our name', num: true, info: O.chainBrand, render: (m) => (m.brand_searches === null ? '–' : num(m.brand_searches)) },
              { key: 'leads', label: 'Leads', num: true, info: F.leads(tot), render: (m) => num(m.leads) },
              { key: 'deals', label: 'Deals', num: true, info: F.deals(tot), render: (m) => num(m.deals) },
              { key: 'won', label: 'Customers', num: true, info: F.won(tot), render: (m) => num(m.won) }]} rows={months} />
          </details>
          <p className="hint" style={{ margin: '14px 0 0' }}>A lighter bar is the month still in progress. Week by week, next to the recommendation rate: <Link href="/assistants">AI assistants</Link>. Loaded to: Google Analytics {date(tot.ga4Through)} · Search Console {date(brandThrough[0]?.d)} · HubSpot {date(tot.hubspotThrough)}.</p>
        </div>
      </Band>
    </>
  );
}
