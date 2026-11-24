import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { hasWebflow, publishItem } from '@/lib/webflow';

export const dynamic = 'force-dynamic';

// Publishes one drafted post in Webflow and marks its task Live. The dashboard link is public, so this asks for the
// same password as the Search Console upload.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  const task = String(body?.task || '');
  const expected = process.env.UPLOAD_PASSWORD || process.env.DASHBOARD_PASSWORD;
  if (!expected || String(body?.password || '') !== expected) return NextResponse.json({ error: 'wrong password' }, { status: 401 });
  if (!hasWebflow()) return NextResponse.json({ error: 'not connected' }, { status: 503 });
  if (!/^[A-Z]-[A-Za-z0-9.-]{1,60}$/.test(task)) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  try {
    const rows = await q`select task_key, status, webflow_collection_id c, webflow_item_id i from public.aeo_rec_tasks where task_key = ${task} and is_active`;
    const t = rows[0];
    if (!t || t.status !== 'Draft' || !t.c || !t.i) return NextResponse.json({ error: 'not a draft' }, { status: 409 });
    const r = await publishItem(t.c, t.i);
    if (!r.ok) return NextResponse.json({ error: 'webflow refused', detail: r.body?.message || r.status }, { status: 502 });
    const now = new Date().toISOString();
    await q`select public.aeo_task_set_live(${task}, ${now}::timestamptz)`;
    return NextResponse.json({ task, live_at: now });
  } catch {
    return NextResponse.json({ error: 'could not publish' }, { status: 500 });
  }
}
