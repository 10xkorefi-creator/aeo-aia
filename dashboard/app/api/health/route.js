import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Is the dashboard's own line to Webflow working? Says only set / working / refused, never the token.
async function webflow() {
  if (!process.env.WEBFLOW_TOKEN) return 'not set';
  try {
    const res = await fetch('https://api.webflow.com/v2/collections/67ed19ac5d8a1253defd24e1/items?limit=1', { cache: 'no-store', headers: { Authorization: `Bearer ${process.env.WEBFLOW_TOKEN}` } });
    return res.ok ? 'working' : `refused (${res.status})`;
  } catch { return 'unreachable'; }
}

export async function GET() {
  try {
    const sql = await db();
    const [r] = await sql`select current_user u, (select count(*) from public.aeo_runs) runs`;
    return Response.json({ ok: true, host: sql.__host, user: r.u, runs: Number(r.runs), webflow: await webflow() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
