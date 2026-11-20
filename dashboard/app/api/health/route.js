import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = await db();
    const [r] = await sql`select current_user u, (select count(*) from public.aeo_runs) runs`;
    return Response.json({ ok: true, host: sql.__host, user: r.u, runs: Number(r.runs) });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
