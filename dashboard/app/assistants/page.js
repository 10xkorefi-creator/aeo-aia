import Link from 'next/link';
import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { pct, num, date, monthLabel } from '@/lib/format';
import { Section, Table, RunPicker, TestBanner } from '@/components/ui';
import { MultiTrend } from '@/components/multi-trend';
import { PromptPanel } from '@/components/prompt-panel';
import { AssistantIcon, assistantName } from '@/components/assistant';
import { assistants as A } from '@/lib/glossary';
import { Info } from '@/components/info';

export const dynamic = 'force-dynamic';

// One page for all three assistants, built around one figure: the share of answers that recommend
// AI Accountant by name AND link to our site. Everything else on the page explains or follows from it.
const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const COLOR = { chatgpt: 'var(--asst-chatgpt)', gemini: 'var(--asst-gemini)', perplexity: 'var(--asst-perplexity)' };
const Key = ({ id }) => <i className="asst-key" style={{ background: COLOR[id] }} aria-hidden="true" />;
const Name = ({ id }) => <span className="asst"><Key id={id} /><AssistantIcon id={id} size={15} />{assistantName(id)}</span>;
const frac = (a, b) => (b ? `${num(a)}/${num(b)}` : '–');

export default async function Assistants({ searchParams }) {
  const sp = await searchParams;
  const tab = ENGINES.includes(sp?.engine) ? sp.engine : 'all';
  const shown = tab === 'all' ? ENGINES : [tab];
  const tabHref = (t) => `/assistants${t === 'all' && !sp?.run ? '' : '?'}${new URLSearchParams({ ...(t !== 'all' ? { engine: t } : {}), ...(sp?.run ? { run: sp.run } : {}) })}`;
  const runs = await listRuns();
  const run = await pickRun(runs, sp?.run);
  const runId = run?.run_id ?? '';

  const [recAll, visitsBy, leadsBy, span, weekly, prompts, brands, pages, domains] = await Promise.all([
    q`select engine, run_id, run_date, answers, recommended, recommended_rate, recommended_rate_ci_low lo, recommended_rate_ci_high hi, prompts_recommended, prompts
      from public.aeo_asst_recommended_v where run_type <> 'test' or run_id = ${runId} order by run_date, run_id`,
    q`select case when session_source ~* 'chatgpt|chat\\.openai' then 'chatgpt' when session_source ~* 'gemini' then 'gemini' when session_source ~* 'perplexity' then 'perplexity' else 'other' end engine, sum(sessions) visits
      from public.aeo_ga4_ai_monthly where session_source !~* '^openai$' and month >= (select min(month) from public.aeo_funnel_monthly_v) group by 1`,
    q`select lower(assistant) engine, sum(contacts) leads from public.aeo_hubspot_ai_leads_monthly group by 1`,
    q`select min(month) m0, max(month) m1 from public.aeo_funnel_monthly_v`,
    q`select date_trunc('week', date)::date wk, ai_source engine, sum(sessions) visits, (select max(date) from public.aeo_ga4_ai_traffic_v) through, (select min(date) from public.aeo_ga4_ai_traffic_v) since
      from public.aeo_ga4_ai_traffic_v where ai_source in ('chatgpt', 'gemini', 'perplexity') group by 1, 2 order by 1`,
    q`select m.engine, m.prompt_key, p.prompt_text, coalesce(p.theme, p.topic, '') topic, count(*) n, count(*) filter (where m.mentioned and m.cited) rec
      from public.aeo_asst_mentions_mv m join public.aeo_runs r on r.run_id = m.run_id
      join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = m.prompt_key
      where m.run_id = ${runId} and m.brand_key = 'aia' and m.prompt_group = 'unbranded' group by 1, 2, 3, 4`,
    q`select engine, brand_key, display_name, count(*) n, count(*) filter (where mentioned and cited) rec
      from public.aeo_asst_mentions_mv where run_id = ${runId} and prompt_group = 'unbranded' and role in ('own', 'sov') group by 1, 2, 3`,
    q`select c.path, c.page_type, sum(c.answers) total, coalesce(sum(c.answers) filter (where c.engine = 'chatgpt'), 0) chatgpt,
        coalesce(sum(c.answers) filter (where c.engine = 'gemini'), 0) gemini, coalesce(sum(c.answers) filter (where c.engine = 'perplexity'), 0) perplexity,
        max(l.sessions) visits, max(l.first_day) d0, max(l.last_day) d1
      from public.aeo_asst_our_pages_v c left join public.aeo_ga4_ai_landing_path_v l using (path)
      where c.run_id = ${runId} group by 1, 2 order by 3 desc limit 12`,
    q`select engine, domain, share_of_answers from public.aeo_asst_cited_domains_mv where run_id = ${runId} and share_of_answers >= 0.03`,
  ]);

  // ---- the chain for the selected run
  const rec = Object.fromEntries(recAll.filter((r) => r.run_id === runId).map((r) => [r.engine, r]));
  const withData = shown.filter((e) => Number(rec[e]?.answers) > 0);
  const vBy = Object.fromEntries(visitsBy.map((r) => [r.engine, Number(r.visits)]));
  const lBy = Object.fromEntries(leadsBy.map((r) => [r.engine, Number(r.leads)]));
  const period = span[0]?.m0 ? `${monthLabel(span[0].m0)} to ${monthLabel(span[0].m1)}` : '';

  // ---- chart 1: rate per run, one line per assistant
  const runKeys = [...new Map(recAll.map((r) => [r.run_id, { key: r.run_id, label: date(r.run_date).slice(0, 5), tip: `Run ${r.run_id}, ${date(r.run_date)}` }])).values()];
  const rateSeries = shown.map((e) => ({ id: e, name: assistantName(e), color: COLOR[e],
    points: Object.fromEntries(recAll.filter((r) => r.engine === e).map((r) => [r.run_id, { y: Number(r.recommended_rate), detail: `${num(r.recommended)} of ${num(r.answers)} answers` }])) }));

  // ---- chart 2: visits per week, same colours. The week still in progress is left out.
  const through = weekly[0]?.through ? new Date(weekly[0].through) : null;
  const since = weekly[0]?.since ? new Date(weekly[0].since) : null;
  const fullWeeks = weekly.filter((w) => through && since && new Date(w.wk) >= since && new Date(new Date(w.wk).getTime() + 6 * 864e5) <= through);
  const weekKeys = [...new Map(fullWeeks.map((w) => [date(w.wk), { key: date(w.wk), label: date(w.wk).slice(0, 5), tip: `Week of ${date(w.wk)}` }])).values()];
  const visitSeries = shown.map((e) => ({ id: e, name: assistantName(e), color: COLOR[e],
    points: Object.fromEntries(weekKeys.map((k) => [k.key, { y: Number(fullWeeks.find((w) => w.engine === e && date(w.wk) === k.key)?.visits || 0) }])) }));

  // ---- by prompt, across assistants
  const pm = new Map();
  for (const r of prompts) {
    const row = pm.get(r.prompt_key) || { prompt_key: r.prompt_key, prompt_text: r.prompt_text, topic: r.topic, total: 0 };
    row[r.engine] = r; if (shown.includes(r.engine)) row.total += Number(r.rec || 0); pm.set(r.prompt_key, row);
  }
  const promptRows = [...pm.values()].sort((a, b) => b.total - a.total || a.prompt_key.localeCompare(b.prompt_key));
  const promptsHit = promptRows.filter((r) => r.total > 0).length;

  // ---- brands: who else is recommended with a link
  const bm = new Map();
  for (const r of brands) { const row = bm.get(r.brand_key) || { brand_key: r.brand_key, display_name: r.display_name, top: 0 }; row[r.engine] = r; if (shown.includes(r.engine)) row.top = Math.max(row.top, Number(r.rec) / Math.max(1, Number(r.n))); bm.set(r.brand_key, row); }
  const brandRows = [...bm.values()].sort((a, b) => b.top - a.top);

  const dm = new Map();
  for (const r of domains) { const row = dm.get(r.domain) || { domain: r.domain, top: 0 }; row[r.engine] = r; if (shown.includes(r.engine)) row.top = Math.max(row.top, Number(r.share_of_answers || 0)); dm.set(r.domain, row); }
  const domainRows = [...dm.values()].filter((r) => r.top > 0).sort((a, b) => b.top - a.top).slice(0, 20);
  // our pages: on one assistant's tab, only the pages that assistant linked to
  const linked = (r) => shown.reduce((t, e) => t + Number(r[e] || 0), 0);
  const pageRows = pages.filter((r) => linked(r) > 0).sort((a, b) => linked(b) - linked(a));
  const one = tab === 'all' ? null : assistantName(tab);

  const head = (e) => <Name id={e} />;
  const cols = (render) => withData.map((e) => ({ key: e, label: head(e), num: true, render: (r) => render(r, e) }));

  return (
    <>
      <div className="pagehead">
        <div><h1>AI assistants</h1>
          <p className="hint">The same buyer questions are asked on ChatGPT, Gemini and Perplexity, several times each, from India.</p></div>
        <RunPicker runs={runs} current={runId} path="/assistants" extra={{ engine: tab === 'all' ? '' : tab }} />
      </div>
      <TestBanner run={run} />
      <div className="subtabs" role="tablist" aria-label="Assistant">
        {['all', ...ENGINES].map((t) => (
          <Link key={t} href={tabHref(t)} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''}>
            {t === 'all' ? 'All assistants' : <><AssistantIcon id={t} size={15} />{assistantName(t)}</>}
          </Link>
        ))}
      </div>

      <Section title={one ? `How often ${one} recommends us with a link` : 'How often each assistant recommends us with a link'} info={A.recommended}
        hint="An assistant sends us a buyer when it names AI Accountant as a product and links to aiaccountant.com in the same answer. This is the figure to move; visits and leads follow from it.">
        <div className="table-wrap">
          <table className="chain wide">
            <thead><tr><th>Assistant</th><th className="num">Recommends us with a link<Info tip={A.rate} align="end" /></th><th className="num">On how many questions<Info tip={A.questions} align="end" /></th>
              <th className="num">Visits sent<Info tip={A.visits} align="end" /></th><th className="num">Leads<Info tip={A.leads} align="end" /></th><th className="num">Leads per 100 visits</th></tr></thead>
            <tbody>
              {shown.map((e) => {
                const r = rec[e];
                return (
                  <tr key={e}>
                    <td><Name id={e} /></td>
                    <td className="num">{r ? <><b className="chain-rate ink">{pct(r.recommended_rate)}</b><span className="chain-sub">{num(r.recommended)} of {num(r.answers)} answers · likely {pct(r.lo)} to {pct(r.hi)}</span></> : <span className="chain-sub">not collected in this run</span>}</td>
                    <td className="num">{r ? `${num(r.prompts_recommended)} of ${num(r.prompts)}` : '–'}</td>
                    <td className="num">{num(vBy[e] || 0)}</td>
                    <td className="num">{num(lBy[e] || 0)}</td>
                    <td className="num">{vBy[e] ? (100 * (lBy[e] || 0) / vBy[e]).toFixed(1) : '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="chain-note">Recommendation rate: run {runId} on {run ? date(run.run_date) : '–'}. Visits (Google Analytics) and leads (HubSpot): {period}. The rate cannot be compared across assistants as a predictor of leads, because far more buyers use ChatGPT; read each assistant against its own earlier runs.</p>
      </Section>

      <div className="grid2">
        <Section title="Recommendation rate, run by run" info={A.rateTrend} hint={one ? `One point per run for ${one}.` : 'One line per assistant. Gemini and Perplexity joined on 19/11/2026.'}>
          <MultiTrend xs={runKeys} series={rateSeries} kind="pct" />
          <details className="tableview">
            <summary>Show as a table</summary>
            <Table columns={[{ key: 'label', label: 'Run', render: (x) => x.tip }, ...shown.map((e) => ({ key: e, label: head(e), num: true,
              render: (x) => { const p = rateSeries.find((s) => s.id === e).points[x.key]; return p ? `${pct(p.y)} (${p.detail})` : '–'; } }))]} rows={runKeys.slice().reverse()} />
          </details>
        </Section>
        <Section title={one ? `Visits ${one} sent, week by week` : 'Visits each assistant sent, week by week'} info={A.visitsTrend} hint={`${one ? '' : 'Same colours as the chart on the left. '}Google Analytics, full weeks only, loaded to ${through ? date(through) : '–'}.`}>
          <MultiTrend xs={weekKeys} series={visitSeries} kind="num" />
          <details className="tableview">
            <summary>Show as a table</summary>
            <Table columns={[{ key: 'label', label: 'Week of', render: (x) => x.key }, ...shown.map((e) => ({ key: e, label: head(e), num: true,
              render: (x) => num(visitSeries.find((s) => s.id === e).points[x.key]?.y ?? 0) }))]} rows={weekKeys.slice().reverse()} />
          </details>
        </Section>
      </div>

      <Section title="Which questions get us recommended" info={A.byPrompt}
        hint={`Answers that recommend us with a link, out of answers collected. At least one assistant does so on ${num(promptsHit)} of ${num(promptRows.length)} questions; the rest are the gap. Click a question to see every page the answers cited.`}>
        <Table columns={[{ key: 'prompt_key', label: '#' }, { key: 'prompt_text', label: 'Question asked', render: (r) => <PromptPanel run={runId} promptKey={r.prompt_key} text={r.prompt_text} engines={withData} /> }, { key: 'topic', label: 'Topic' },
          ...cols((r, e) => (r[e] ? <span className={Number(r[e].rec) > 0 ? 'hit' : 'miss'}>{frac(r[e].rec, r[e].n)}</span> : '–'))]} rows={promptRows} />
      </Section>

      <div className="grid2">
        <Section title="Who else gets recommended with a link" info={A.brands} hint="Share of answers that name the brand and link to its site. AiA and its direct competitors.">
          <Table columns={[{ key: 'display_name', label: 'Brand', render: (r) => (r.brand_key === 'aia' ? <b className="own-text">{r.display_name}</b> : r.display_name) },
            ...cols((r, e) => (r[e] ? pct(Number(r[e].rec) / Math.max(1, Number(r[e].n))) : '–'))]} rows={brandRows} />
        </Section>
        <Section title="Which of our pages they link to" info={A.pages}
          hint={`Answers in this run linking to each page, and the visits AI assistants sent to that page${pages[0]?.d0 ? ` from ${date(pages[0].d0)} to ${date(pages[0].d1)}` : ''}.`}>
          <Table columns={[{ key: 'path', label: 'Page', render: (r) => <span className="path">{r.path}</span> }, { key: 'page_type', label: 'Type' },
            { key: 'total', label: 'Linked in answers', num: true, render: (r) => <>{num(linked(r))}<span className="chain-sub">{shown.filter((e) => Number(r[e]) > 0).map((e) => `${assistantName(e)} ${num(r[e])}`).join(' · ')}</span></> },
            { key: 'visits', label: 'AI visits', num: true, render: (r) => num(r.visits ?? 0) }]} rows={pageRows} />
        </Section>
      </div>

      <Section title="Most-cited websites by assistant" info={A.domains} hint="Share of each assistant's answers that list the site as a source. These are the places to get AI Accountant mentioned; the columns show which assistant each site matters for.">
          <Table columns={[{ key: 'domain', label: 'Website', render: (r) => (/(^|\.)aiaccountant\.com$/.test(r.domain) ? <b className="own-text">{r.domain}</b> : r.domain) },
            ...cols((r, e) => (r[e] ? pct(r[e].share_of_answers) : '–'))]} rows={domainRows} />
      </Section>
    </>
  );
}
