import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { RUN_PROMPT, runPromptHref } from '@/lib/runprompt';

export const dynamic = 'force-dynamic';

// Everything the "Trigger a run" popup shows: the prompt, the Claude link, what a run involves (from the last
// finished run) and whether a run is in progress right now.
export async function GET() {
  let estimate = null, running = null;
  try {
    const [row] = await q`select public.aeo_run_estimate() estimate,
      (select public.aeo_run_progress_json(run_id) from public.aeo_runs where status = 'running' order by created_at desc limit 1) running`;
    estimate = row?.estimate ?? null; running = row?.running ?? null;
  } catch { /* the prompt still works without the estimate */ }
  return NextResponse.json({ prompt: RUN_PROMPT, href: runPromptHref(), estimate, running });
}
