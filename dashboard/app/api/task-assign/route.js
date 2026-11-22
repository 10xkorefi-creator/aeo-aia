import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sets who a recommendation task is assigned to. The only thing this page lets anyone change:
// the database role behind the dashboard may update the assignee column and nothing else.
const PEOPLE = ['Wasif Kareem', 'Devansh Saini'];

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  const task = String(body?.task || '');
  const who = body?.assignee ? String(body.assignee) : null;
  if (!/^T-\d{2,3}$/.test(task) || (who !== null && !PEOPLE.includes(who))) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  try {
    const rows = await q`update public.aeo_rec_tasks set assignee = ${who}, updated_at = now() where task_key = ${task} returning task_key, assignee`;
    if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ task: rows[0].task_key, assignee: rows[0].assignee });
  } catch {
    return NextResponse.json({ error: 'could not save' }, { status: 500 });
  }
}
