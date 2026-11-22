import Link from 'next/link';
import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { pct, num, date } from '@/lib/format';
import { Section, Table, RunPicker, TestBanner } from '@/components/ui';
import { ChainTrend } from '@/components/chain-trend';
import { PromptPanel } from '@/components/prompt-panel';
import { AssistantIcon, assistantName } from '@/components/assistant';
import { assistants as A, overview as O } from '@/lib/glossary';
import { Info } from '@/components/info';
import { ScoreTile, Moved } from '@/components/score';
import { assistantChange } from '@/lib/change';

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

  const asst = await assistantChange(runId);
  const [weekly, prompts, brands, pages, domains, weeks, weekRec] = await Promise.all([
    q`select to_char(date_trunc('week', date), 'YYYY-MM-DD') wk, ai_source engine, sum(sessions) visits
      from public.aeo_ga4_ai_traffic_v where ai_source in ('chatgpt', 'gemini', 'perplexity') group by 1, 2`,
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
    // the last 16 weeks (Monday start, India time), with branded searches; a week still in progress has no count yet
    q`with w as (select generate_series(date_trunc('week', now() at time zone 'Asia/Kolkata')::date - 105, date_trunc('week', now() at time zone 'Asia/Kolkata')::date, interval '7 days')::date wk),
        gx as (select min(date) d0, max(date) d1 from public.aeo_ga4_ai_traffic_v)
      select to_char(w.wk, 'YYYY-MM-DD') wk, to_char(w.wk, 'DD/MM') label, to_char(w.wk, 'DD/MM/YYYY') as day,
        b.searches, b.clicks, coalesce(b.full_week, false) brand_full,
        (w.wk >= gx.d0 and w.wk + 6 <= gx.d1) ga4_full, (w.wk <= gx.d1 and w.wk + 6 >= gx.d0) ga4_any, (w.wk + 6 > gx.d1) ga4_open, to_char(gx.d1, 'DD/MM/YYYY') ga4_through,
        (select to_char(max(date), 'DD/MM/YYYY') from public.aeo_gsc_brand_daily) brand_through
      from w cross join gx left join public.aeo_gsc_brand_weekly_v b on b.week_start = w.wk order by 1`,
    q`select to_char(date_trunc('week', run_date), 'YYYY-MM-DD') wk, engine, sum(recommended) rec, sum(answers) n, count(distinct run_id) runs
      from public.aeo_asst_recommended_v where run_type <> 'test' and run_status = 'complete' group by 1, 2`,
  ]);

  const withData = shown.filter((e) => Number(asst[e].cur?.answers) > 0);
  const prevDate = shown.map((e) => asst[e].prev?.run_date).find(Boolean);

  // ---- one weekly timeline: recommended with a link -> visits sent -> searches for our name
  const one = tab === 'all' ? null : assistantName(tab);
  const weekXs = weeks.map((w) => ({ key: w.wk, label: w.label, tip: `Week of ${w.day}` }));
  const recAt = (w, e) => { const r = weekRec.find((x) => x.wk === w.wk && x.engine === e); return r && Number(r.n) > 0 ? r : null; };
  // the charts draw complete weeks only; the table also shows a week in progress, marked "so far"
  const visitsAt = (w, e) => (w.ga4_full ? Number(weekly.find((x) => x.wk === w.wk && x.engine === e)?.visits || 0) : null);
  const soFar = (v, full, open = true) => (full ? num(v) : <>{num(v)}<span className="muted">{open ? ' so far' : ' part week'}</span></>);
  const visitsCell = (w, e) => (w.ga4_any ? soFar(Number(weekly.find((x) => x.wk === w.wk && x.engine === e)?.visits || 0), w.ga4_full, w.ga4_open) : '–');
  const chainRows = [
    { id: 'rec', label: 'Recommends us with a link', kind: 'pct', title: <>{one ? `${one} recommends us with a link` : 'Recommends us with a link'}<Info tip={O.chainRec} /></>,
      series: shown.map((e) => ({ id: e, name: assistantName(e), color: COLOR[e],
        points: Object.fromEntries(weeks.filter((w) => recAt(w, e)).map((w) => { const r = recAt(w, e); return [w.wk, { y: Number(r.rec) / Number(r.n), detail: `${num(r.rec)} of ${num(r.n)} answers` }]; })) })) },
    { id: 'visits', label: 'Visits sent', kind: 'num', unit: 'visits a week', title: <>{one ? `Visits ${one} sent` : 'Visits each assistant sent'}<Info tip={A.visitsTrend} /></>,
      series: shown.map((e) => ({ id: e, name: assistantName(e), color: COLOR[e],
        points: Object.fromEntries(weeks.filter((w) => visitsAt(w, e) !== null).map((w) => [w.wk, { y: visitsAt(w, e) }])) })) },
    { id: 'brand', label: 'Searches for our name on Google', kind: 'num', unit: 'searches a week', title: <>Searches for our name on Google<Info tip={O.chainBrand} /></>,
      series: [{ id: 'brand', name: 'Searches', color: 'var(--accent)',
        points: Object.fromEntries(weeks.filter((w) => w.brand_full && w.searches !== null).map((w) => [w.wk, { y: Number(w.searches), detail: `${num(w.clicks)} clicked through` }])) }] },
  ];

  // ---- by prompt, across assistants
  const pm = new Map();
  for (const r of prompts) {
    const row = pm.get(r.prompt_key) || { prompt_key: r.prompt_key, prompt_text: r.prompt_text, topic: r.topic, total: 0 };
    row[r.engine] = r; if (shown.includes(r.engine)) row.total += Number(r.rec || 0); pm.set(r.prompt_key, row);
  }
  const moved = (r, e) => asst[e].status.get(r.prompt_key);
  const touched = (r) => r.total > 0 || shown.some((e) => moved(r, e));
  const promptRows = [...pm.values()].sort((a, b) => b.total - a.total || a.prompt_key.localeCompare(b.prompt_key));
  const wonRows = promptRows.filter(touched), gapRows = promptRows.filter((r) => !touched(r));
  const promptsHit = promptRows.filter((r) => r.total > 0).length;

  // ---- brands: who else is recommended with a link
  const bm = new Map();
  for (const r of brands) { const row = bm.get(r.brand_key) || { brand_key: r.brand_key, display_name: r.display_name, top: 0 }; row[r.engine] = r; if (shown.includes(r.engine)) row.top = Math.max(row.top, Number(r.rec) / Math.max(1, Number(r.n))); bm.set(r.brand_key, row); }
  const brandRows = [...bm.values()].sort((a, b) => b.top - a.top);

  const dm = new Map();
  for (const r of domains) { const row = dm.get(r.domain) || { domain: r.domain, top: 0 }; row[r.engine] = r; if (shown.includes(r.engine)) row.top = Math.max(row.top, Number(r.share_of_answers || 0)); dm.set(r.domain, row); }
  const domainRows = [...dm.values()].filter((r) => r.top > 0).sort((a, b) => b.top - a.top).slice(0, 15);
  // our pages: on one assistant's tab, only the pages that assistant linked to
  const linked = (r) => shown.reduce((t, e) => t + Number(r[e] || 0), 0);
  const pageRows = pages.filter((r) => linked(r) > 0).sort((a, b) => linked(b) - linked(a));

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

      <div className={`scores ${shown.length === 1 ? 'one' : 'three'}`}>
        {shown.map((e) => {
          const a = asst[e], c = a.cur;
          return <ScoreTile key={e} icon={<AssistantIcon id={e} size={18} />} name={assistantName(e)} color={COLOR[e]}
            rate={c ? Number(c.recommended_rate) : null} history={a.history.map((h) => ({ rate: Number(h.recommended_rate) }))}
            sub={c ? <>{num(c.recommended)} of {num(c.answers)} answers recommend us with a link · on {num(c.prompts_recommended)} of {num(c.prompts)} questions</> : 'Not collected in this run'}
            change={a} prev={a.prev} changeInfo={O.change} />;
        })}
      </div>
      <p className="score-key">An assistant sends us a buyer when it <b>names AI Accountant as a product and links to aiaccountant.com</b> in the same answer.<Info tip={A.recommended} />{' '}
        This is the figure to move. Far more buyers use ChatGPT, so do not compare one assistant with another; read each against its own earlier runs.</p>

      <Section title="Week by week: recommended, then visited, then searched for" info={O.chain}
        hint={`One timeline. When ${one || 'an assistant'} recommends us more often (1), the visits it sends should follow (2). People who see us in an answer but do not click often search for AI Accountant by name later (3); that count covers all assistants together. Point at a week to read all three.`}>
        <ChainTrend xs={weekXs} rows={chainRows} />
        <details className="tableview">
          <summary>Show every week as a table</summary>
          <Table columns={[{ key: 'day', label: 'Week of', render: (w) => <span className="nowrap">{w.day}</span> },
            ...shown.map((e) => ({ key: `r_${e}`, label: `${assistantName(e)} recommends us`, num: true, render: (w) => { const r = recAt(w, e); return r ? pct(Number(r.rec) / Number(r.n)) : '–'; } })),
            ...shown.map((e) => ({ key: `v_${e}`, label: `${assistantName(e)} visits`, num: true, render: (w) => visitsCell(w, e) })),
            { key: 'searches', label: 'Searches for our name', num: true, render: (w) => (w.searches === null ? '–' : soFar(w.searches, w.brand_full)) },
            { key: 'clicks', label: 'Clicked through', num: true, render: (w) => (w.clicks === null ? '–' : soFar(w.clicks, w.brand_full)) }]} rows={weeks.slice().reverse()} />
        </details>
        <p className="hint ct-foot">We started asking the assistants on 17/11/2026 (Gemini and Perplexity on 19/11/2026), so chart 1 has few points for now; the pattern becomes readable after three to four weeks of runs. Each point pools every run of that week. A week still in progress is left off the charts and marked "so far" in the table. Loaded to: Google Analytics {weeks[0]?.ga4_through ?? '–'} · Search Console {weeks[0]?.brand_through ?? '–'}.</p>
      </Section>

      <Section title="Which questions get us recommended" info={A.byPrompt}
        hint={`Answers that recommend us with a link, out of answers collected, on the ${num(promptsHit)} of ${num(promptRows.length)} questions where at least one assistant does.${prevDate ? ` "New" and "lost" compare with the run of ${date(prevDate)}.` : ''} Click a question to see every page the answers cited.`}>
        <Table columns={[{ key: 'prompt_text', label: 'Question asked', render: (r) => <PromptPanel run={runId} promptKey={r.prompt_key} text={r.prompt_text} engines={withData} /> }, { key: 'topic', label: 'Topic' },
          ...cols((r, e) => (r[e] ? <><Moved status={moved(r, e)} /><span className={Number(r[e].rec) > 0 ? 'hit' : 'miss'}>{frac(r[e].rec, r[e].n)}</span></> : '–'))]} rows={wonRows} empty="No assistant recommends us on any tracked question in this run." />
        <details className="tableview">
          <summary>The gap: {num(gapRows.length)} questions where no assistant recommends us</summary>
          <Table columns={[{ key: 'prompt_text', label: 'Question asked', render: (r) => <PromptPanel run={runId} promptKey={r.prompt_key} text={r.prompt_text} engines={withData} /> }, { key: 'topic', label: 'Topic' }]} rows={gapRows} />
        </details>
      </Section>

      <div className="grid2">
        <Section title="Who else gets recommended with a link" info={A.brands} hint="Share of answers that name the brand and link to its site. AiA and its direct competitors.">
          <Table columns={[{ key: 'display_name', label: 'Brand', render: (r) => (r.brand_key === 'aia' ? <b className="own-text">{r.display_name}</b> : r.display_name) },
            ...cols((r, e) => (r[e] ? pct(Number(r[e].rec) / Math.max(1, Number(r[e].n))) : '–'))]} rows={brandRows} />
        </Section>
        <Section title="Which of our pages they link to" info={A.pages}
          hint={`Answers in this run that link to each page, and the visits AI assistants sent to that page${pages[0]?.d0 ? ` from ${date(pages[0].d0)} to ${date(pages[0].d1)}` : ''}.`}>
          <Table columns={[{ key: 'path', label: 'Page', render: (r) => <span className="path">{r.path}</span> },
            { key: 'total', label: 'Linked in answers', num: true, render: (r) => <>{num(linked(r))}<span className="chain-sub">{shown.filter((e) => Number(r[e]) > 0).map((e) => `${assistantName(e)} ${num(r[e])}`).join(' · ')}</span></> },
            { key: 'visits', label: 'Visits from AI assistants', num: true, render: (r) => num(r.visits ?? 0) }]} rows={pageRows} />
        </Section>
      </div>

      <Section title="Most-cited websites by assistant" info={A.domains} hint="Share of each assistant's answers that list the site as a source. These are the places to get AI Accountant mentioned; the columns show which assistant each site matters for.">
          <Table columns={[{ key: 'domain', label: 'Website', render: (r) => (/(^|\.)aiaccountant\.com$/.test(r.domain) ? <b className="own-text">{r.domain}</b> : r.domain) },
            ...cols((r, e) => (r[e] ? pct(r[e].share_of_answers) : '–'))]} rows={domainRows} />
      </Section>
    </>
  );
}
