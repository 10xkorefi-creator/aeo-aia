import { q } from '@/lib/db';
import { listRuns, pickRun } from '@/lib/data';
import { date } from '@/lib/format';
import { RecBoard } from '@/components/rec-board';
import { hasWebflow, liveSince, domainPublishedAt } from '@/lib/webflow';

export const dynamic = 'force-dynamic';

const when = (v) => (v ? new Date(v).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : null);

// Goal 2: what to do next, as tasks. The list is generated from the latest run by scripts/recs/build.py:
// for every tracked question and every assistant, the sources that assistant cited decide the task and its channel.
// This page loads the light rows; a row's detail is fetched from /api/rec-item when it is opened.
export default async function Recommendations({ searchParams }) {
  const sp = await searchParams;
  const runs = await listRuns();
  const latest = await pickRun(runs, null);
  const [tasks, questions, leadRows] = await Promise.all([
    q`select task_key, title, channel, kind, priority, assistants, assignee, start_here, prompt_keys, keyword_ids, based_on_run, status, agent, drafted_at, live_at, draft_url, webflow_collection_id, webflow_item_id, agent_note, page_url, body->'build'->>'url' as build_url, contact->>'li_stage' as li_stage
      from public.aeo_rec_tasks where is_active order by (contact->>'li_stage' = 'Replied') desc nulls last, sort`,
    q`select q_key, kind, label, text, stage, priority, start_here, volume, organic_rank, based_on_run, jsonb_array_length(body->'tasks') as tasks,
        (select jsonb_object_agg(c.k, jsonb_build_object('rec', c.v->'rec', 'n', c.v->'n', 'gap', c.v->'gap')) from jsonb_each(body->'cells') as c(k, v)) as cells
      from public.aeo_rec_questions where is_active order by pos`,
    q`select ai_channel, count(*) n from public.aeo_hubspot_ai_contacts_v where not is_internal group by 1`,
  ]);
  const leads = { total: leadRows.reduce((a, r) => a + Number(r.n), 0), chatgpt: Number(leadRows.find((r) => r.ai_channel === 'chatgpt')?.n || 0) };
  // drafts that have gone live in Webflow since (by the button, by hand, or with a site publish) are moved to Live here
  {
    const drafts = tasks.filter((t) => t.status === 'Draft' && (t.page_url || t.build_url)).slice(0, 25);
    if (drafts.length) {
      const domainAt = hasWebflow() ? await domainPublishedAt() : null;
      await Promise.all(drafts.map(async (t) => {
        const at = await liveSince({ pageUrl: t.page_url || t.build_url, draftedAt: t.drafted_at, isNew: t.kind === 'New page', domainAt });
        if (!at) return;
        try { await q`select public.aeo_task_set_live(${t.task_key}, ${at}::timestamptz)`; t.status = 'Live'; t.live_at = at; } catch { /* next load tries again */ }
      }));
    }
  }
  const basedOn = tasks[0]?.based_on_run || questions[0]?.based_on_run || null;
  const baseRun = runs.find((r) => r.run_id === basedOn);
  const baseline = { run: basedOn, runDate: baseRun ? date(baseRun.run_date) : '–', stale: !!(latest && basedOn && latest.run_id !== basedOn), latestDate: latest ? date(latest.run_date) : null };

  return (
    <>
      <div className="pagehead">
        <div><h1>Recommendations</h1>
          <p className="hint">What to do next, as tasks. For each question we track, the sources each assistant cited decide the task and where it goes. Click a row for the details.</p></div>
      </div>
      <RecBoard
        tasks={tasks.map((t) => ({ key: t.task_key, title: t.title, channel: t.channel, kind: t.kind, priority: t.priority || 'Low', assistants: t.assistants || [], assignee: t.assignee || null, done: t.status === 'Done',
          state: t.status === 'Draft' ? 'draft' : t.status === 'Live' ? 'live' : t.status === 'Done' ? 'done' : 'todo', agent: t.agent || null,
          draftedAt: when(t.drafted_at), liveAt: when(t.live_at), draftUrl: t.draft_url || null, agentNote: t.agent_note || null, pageUrl: t.page_url || null,
          outreach: t.li_stage && t.li_stage !== 'Message drafted' ? t.li_stage : null, important: t.li_stage === 'Replied',
          start: t.start_here, targets: [...(t.prompt_keys || []), ...(t.keyword_ids || [])] }))}
        questions={questions.map((x) => ({ key: x.q_key, kind: x.kind, label: x.label, text: x.text, stage: x.stage, priority: x.priority, start: x.start_here,
          volume: x.volume === null ? null : Number(x.volume), rank: x.organic_rank === null ? null : Number(x.organic_rank), tasks: Number(x.tasks), cells: x.cells || {} }))}
        baseline={baseline} leads={leads} canPublish={hasWebflow()}
        initial={typeof sp?.task === 'string' ? { task: sp.task } : typeof sp?.q === 'string' ? { q: sp.q } : null} />
    </>
  );
}
