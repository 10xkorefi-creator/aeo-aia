import { q } from '@/lib/db';

// What changed between a run and the run before it.
//
// The comparison is like for like: only the questions (or keywords) asked in BOTH runs are compared, so adding or
// removing a question never shows up as a rise or a fall. For each of them we take this run's rate minus the earlier
// run's rate; the change is the average of those differences. It counts as real only when that average is larger than
// about twice its own uncertainty (a 95% test on the paired differences), otherwise it is normal run-to-run variation.

const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const frac = (r) => `${Number(r.hit)}/${Number(r.n)}`;

function compare(cur, prev) {
  const d = [];
  const gained = [], lost = [], status = new Map();
  for (const [key, c] of cur) {
    const p = prev.get(key);
    if (!p || !(Number(c.n) > 0) || !(Number(p.n) > 0)) continue;
    d.push(Number(c.hit) / Number(c.n) - Number(p.hit) / Number(p.n));
    // a single answer can flip by chance, so a question counts as won or lost only when at least half of the answers changed
    if (Number(p.hit) === 0 && Number(c.hit) / Number(c.n) >= 0.5) { gained.push({ key, text: c.text, now: frac(c), before: frac(p), weight: Number(c.weight || 0) }); status.set(key, 'gained'); }
    if (Number(p.hit) / Number(p.n) >= 0.5 && Number(c.hit) === 0) { lost.push({ key, text: c.text, now: frac(c), before: frac(p), weight: Number(c.weight || 0) }); status.set(key, 'lost'); }
  }
  const k = d.length;
  if (k < 2) return { common: k, delta: null, verdict: null, gained, lost, status };
  const mean = d.reduce((s, v) => s + v, 0) / k;
  const sd = Math.sqrt(d.reduce((s, v) => s + (v - mean) ** 2, 0) / (k - 1));
  const se = sd / Math.sqrt(k);
  const verdict = se > 0 && Math.abs(mean) > 1.96 * se ? (mean > 0 ? 'up' : 'down') : 'same';
  return { common: k, delta: mean, verdict, gained, lost, status };
}

// The three assistants: share of answers that recommend us with a link.
export async function assistantChange(runId) {
  const hist = await q`select v.engine, v.run_id, v.run_date, v.answers, v.recommended, v.recommended_rate, v.recommended_rate_ci_low lo, v.recommended_rate_ci_high hi, v.prompts_recommended, v.prompts
    from public.aeo_asst_recommended_v v join public.aeo_runs r on r.run_id = v.run_id
    where (v.run_type <> 'test' and v.run_status in ('complete', 'partial')) or v.run_id = ${runId} order by r.created_at`;
  const out = {};
  for (const e of ENGINES) {
    const rows = hist.filter((h) => h.engine === e && Number(h.answers) > 0);
    const i = rows.findIndex((h) => h.run_id === runId);
    out[e] = { cur: i >= 0 ? rows[i] : null, prev: i > 0 ? rows[i - 1] : null, history: i >= 0 ? rows.slice(0, i + 1) : [], gained: [], lost: [], status: new Map(), common: 0, delta: null, verdict: null };
  }
  const pid = (e) => out[e].prev?.run_id || runId;
  const per = await q`select m.engine, m.run_id, m.prompt_key, max(p.prompt_text) prompt_text, count(*) n, count(*) filter (where m.mentioned and m.cited) hit
    from public.aeo_asst_mentions_mv m join public.aeo_runs r on r.run_id = m.run_id
    left join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = m.prompt_key
    where m.brand_key = 'aia' and m.prompt_group = 'unbranded' and m.run_id in (${runId}, ${pid('chatgpt')}, ${pid('gemini')}, ${pid('perplexity')})
    group by 1, 2, 3`;
  for (const e of ENGINES) {
    if (!out[e].cur || !out[e].prev) continue;
    const pick = (id) => new Map(per.filter((r) => r.engine === e && r.run_id === id).map((r) => [r.prompt_key, { n: r.n, hit: r.hit, text: r.prompt_text }]));
    Object.assign(out[e], compare(pick(runId), pick(out[e].prev.run_id)));
  }
  return out;
}

// Google: share of buyer searches whose AI Overview links to our site.
export async function googleChange(runId) {
  const hist = await q`select m.run_id, m.run_date, m.aia_cited_rate rate, m.aia_cited_rate_ci_low lo, m.aia_cited_rate_ci_high hi, m.aia_cited_captures hit, m.captures_with_aio n,
      m.keywords_aia_cited_any kw_hit, m.keywords kw
    from public.aeo_aio_run_metrics_mv m join public.aeo_runs r on r.run_id = m.run_id
    where m.segment = 'buyer' and ((m.run_type <> 'test' and r.status in ('complete', 'partial')) or m.run_id = ${runId}) order by r.created_at`;
  const rows = hist.filter((h) => Number(h.n) > 0);
  const i = rows.findIndex((h) => h.run_id === runId);
  const out = { cur: i >= 0 ? rows[i] : null, prev: i > 0 ? rows[i - 1] : null, history: i >= 0 ? rows.slice(0, i + 1) : [], gained: [], lost: [], status: new Map(), common: 0, delta: null, verdict: null };
  if (!out.cur || !out.prev) return out;
  const per = await q`select run_id, keyword_id, keyword, volume, aia_cited_samples hit, aio_samples n from public.aeo_aio_keyword_metrics_mv
    where segment = 'buyer' and run_id in (${runId}, ${out.prev.run_id})`;
  const pick = (id) => new Map(per.filter((r) => r.run_id === id).map((r) => [r.keyword_id, { n: r.n, hit: r.hit, text: r.keyword, weight: r.volume }]));
  Object.assign(out, compare(pick(runId), pick(out.prev.run_id)));
  return out;
}
