import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

// The detail behind one row of the Recommendations page: a task's brief, or a question's per-assistant plan.
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const task = sp.get('task'), question = sp.get('q');
  try {
    if (task && /^[A-Z]-[A-Za-z0-9.-]{1,60}$/.test(task)) {
      const rows = await q`select task_key, body, contact from public.aeo_rec_tasks where task_key = ${task} and is_active`;
      if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({ key: rows[0].task_key, body: rows[0].contact ? { ...rows[0].body, contact: rows[0].contact } : rows[0].body });
    }
    if (question && /^[A-Z][0-9]{2,4}$/.test(question)) {
      const rows = await q`select q_key, body from public.aeo_rec_questions where q_key = ${question} and is_active`;
      if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({ key: rows[0].q_key, body: rows[0].body });
    }
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'could not load' }, { status: 500 });
  }
}
