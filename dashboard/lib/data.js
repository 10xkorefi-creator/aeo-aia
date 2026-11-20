import { q } from '@/lib/db';

export async function listRuns() {
  return q`select run_id, run_date, run_type, status from public.aeo_runs order by created_at desc`;
}

// Selected run, else latest non-test finished run, else latest run of any kind
export async function pickRun(runs, requested) {
  if (requested) { const r = runs.find((x) => x.run_id === requested); if (r) return r; }
  return runs.find((r) => r.run_type !== 'test' && ['complete', 'partial'].includes(r.status))
    || runs.find((r) => r.run_type !== 'test') || runs[0] || null;
}
