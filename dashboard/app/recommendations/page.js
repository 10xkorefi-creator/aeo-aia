import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { date, num } from '@/lib/format';
import { RecBoard } from '@/components/rec-board';

export const dynamic = 'force-dynamic';

// Goal 2: the ranked AEO opportunities. The written analysis is stored in aeo_recommendations (source: docs/recommendations.py).
// Everything shown as a table under a recommendation is read here, live, from the run tables, for the questions and
// keywords that recommendation names, so the evidence always reflects the latest run.
const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const OURS = /(^|\.)aiaccountant\.com$/i;

export default async function Recommendations({ searchParams }) {
  const sp = await searchParams;
  const runs = await listRuns();
  const run = await pickRun(runs, null);
  const runId = run?.run_id ?? '';
  const recs = await q`select * from public.aeo_recommendations where is_active order by rank`;
  const pk = [...new Set(recs.flatMap((r) => r.prompt_keys || []))].join(',');
  const kk = [...new Set(recs.flatMap((r) => r.keyword_ids || []))].join(',');

  const [hist, texts, cites, khist, kcites, sizes] = await Promise.all([
    q`select m.engine, m.run_id, to_char(r.run_date, 'DD/MM') as day, m.prompt_key, count(*) n, count(*) filter (where m.mentioned) named,
        count(*) filter (where m.cited) linked, count(*) filter (where m.mentioned and m.cited) rec
      from public.aeo_asst_mentions_mv m join public.aeo_runs r on r.run_id = m.run_id
      where m.brand_key = 'aia' and r.run_type <> 'test' and r.status in ('complete', 'partial') and m.prompt_key = any(string_to_array(${pk}, ','))
      group by m.engine, m.run_id, r.run_date, r.created_at, m.prompt_key order by r.created_at`,
    q`select prompt_key, prompt_text from public.aeo_prompts
      where list_version = (select prompt_list_version from public.aeo_runs where run_id = ${runId}) and prompt_key = any(string_to_array(${pk}, ','))`,
    q`select prompt_key, engine, url, domain, count(distinct capture_id) n from public.aeo_asst_citations_mv
      where run_id = ${runId} and prompt_key = any(string_to_array(${pk}, ',')) group by 1, 2, 3, 4`,
    q`select k.run_id, to_char(r.run_date, 'DD/MM') as day, k.keyword_id, k.keyword, k.volume, k.aia_cited_samples cited, k.aio_samples shown, k.aia_best_organic_rank rank
      from public.aeo_aio_keyword_metrics_mv k join public.aeo_runs r on r.run_id = k.run_id
      where r.run_type <> 'test' and r.status in ('complete', 'partial') and k.keyword_id = any(string_to_array(${kk}, ',')) order by r.created_at`,
    q`select keyword_id, url, domain, count(distinct capture_id) n from public.aeo_aio_citations_base_mv
      where run_id = ${runId} and keyword_id = any(string_to_array(${kk}, ',')) group by 1, 2, 3`,
    q`select (select count(*) from public.aeo_prompts where list_version = r.prompt_list_version) prompts,
        (select count(*) from public.aeo_keywords where list_version = r.keyword_list_version) keywords
      from public.aeo_runs r where r.run_id = ${runId}`,
  ]);

  const textOf = Object.fromEntries(texts.map((t) => [t.prompt_key, t.prompt_text]));
  const baselineRuns = runs.filter((r) => r.run_type !== 'test' && ['complete', 'partial'].includes(r.status));
  const runsBy = (e) => new Set(hist.filter((h) => h.engine === e).map((h) => h.run_id)).size;
  const firstRun = baselineRuns[baselineRuns.length - 1], lastRun = baselineRuns[0];

  const items = recs.map((r) => {
    const keys = r.prompt_keys || [], kids = r.keyword_ids || [];
    const questions = keys.filter((k) => textOf[k]).map((k) => {
      const cells = {};
      for (const e of ENGINES) {
        const rows = hist.filter((h) => h.prompt_key === k && h.engine === e);
        const cur = rows.find((h) => h.run_id === runId);
        cells[e] = cur ? { n: Number(cur.n), named: Number(cur.named), linked: Number(cur.linked), rec: Number(cur.rec),
          before: rows.filter((h) => h.run_id !== runId).map((h) => ({ day: h.day, n: Number(h.n), named: Number(h.named), linked: Number(h.linked), rec: Number(h.rec) })) } : null;
      }
      return { key: k, text: textOf[k], cells };
    });
    const keywords = kids.map((id) => {
      const rows = khist.filter((h) => h.keyword_id === id);
      const cur = rows.find((h) => h.run_id === runId);
      return cur ? { id, keyword: cur.keyword, volume: cur.volume === null ? null : Number(cur.volume), cited: Number(cur.cited), shown: Number(cur.shown), rank: cur.rank === null ? null : Number(cur.rank),
        before: rows.filter((h) => h.run_id !== runId).map((h) => ({ day: h.day, cited: Number(h.cited), shown: Number(h.shown) })) } : null;
    }).filter(Boolean);
    // every page cited for these questions and keywords in the latest run
    const pm = new Map();
    const add = (url, domain, col, n) => { const p = pm.get(url) || { url, domain, ours: OURS.test(domain || ''), chatgpt: 0, gemini: 0, perplexity: 0, google: 0, total: 0 }; p[col] += Number(n); p.total += Number(n); pm.set(url, p); };
    for (const c of cites) if (keys.includes(c.prompt_key)) add(c.url, c.domain, c.engine, c.n);
    for (const c of kcites) if (kids.includes(c.keyword_id)) add(c.url, c.domain, 'google', c.n);
    const pages = [...pm.values()].sort((a, b) => b.total - a.total).slice(0, 14);
    return { key: r.rec_key, rank: r.rank, grp: r.grp, title: r.title, summary: r.summary, headline: r.headline, topic: r.topic, play: r.play, assistants: r.assistants || [],
      effort: r.effort, value: r.value, closeness: r.closeness, status: r.status, body: r.body || {}, basedOn: r.based_on_run, questions, keywords, pages };
  });

  const baseline = { runId, runDate: run ? date(run.run_date) : '–', from: firstRun ? date(firstRun.run_date) : '–', to: lastRun ? date(lastRun.run_date) : '–',
    runs: baselineRuns.length, chatgpt: runsBy('chatgpt'), gemini: runsBy('gemini'), perplexity: runsBy('perplexity'),
    prompts: num(sizes[0]?.prompts), keywords: num(sizes[0]?.keywords) };

  return (
    <>
      <div className="pagehead">
        <div><h1>Recommendations</h1>
          <p className="hint">The biggest AEO opportunities for AI Accountant, ranked, with where to start. Every item is built from our own baseline runs, not from general advice.</p></div>
      </div>
      <RecBoard items={items} baseline={baseline} initial={typeof sp?.rec === 'string' ? sp.rec : null} />
    </>
  );
}
