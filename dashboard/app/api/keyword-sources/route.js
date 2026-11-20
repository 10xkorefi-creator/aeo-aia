import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Everything the keyword side panel shows: for one tracked keyword in one run, how many searches showed an AI Overview,
// how many of those linked to us, and every page the AI Overviews cited (marked as ours or a competitor's).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const run = searchParams.get('run') || '';
  const keyword = searchParams.get('keyword') || '';
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(run) || !/^[A-Za-z0-9_-]{1,20}$/.test(keyword)) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  try {
    const [head, pages] = await Promise.all([
      q`select max(k.keyword) keyword, count(*) searches, count(*) filter (where f.aio_shown) shown,
          (select count(*) from public.aeo_aio_mentions_base_mv m where m.run_id = ${run} and m.keyword_id = ${keyword} and m.brand_key = 'aia' and m.cited) linked
        from public.aeo_aio_capture_flags_base_mv f join public.aeo_runs r on r.run_id = f.run_id
        join public.aeo_keywords k on k.list_version = r.keyword_list_version and k.keyword_id = f.keyword_id
        where f.run_id = ${run} and f.keyword_id = ${keyword}`,
      q`with u as (
          select url, domain, max(label) label, count(distinct capture_id) answers
          from public.aeo_aio_citations_base_mv where run_id = ${run} and keyword_id = ${keyword} group by url, domain
        ), b as (
          select p.pattern, k.display_name, k.brand_key
          from public.aeo_competitor_patterns p join public.aeo_competitors k on k.list_version = p.list_version and k.brand_key = p.brand_key
          where p.pattern_type = 'url' and p.list_version = (select competitor_list_version from public.aeo_runs where run_id = ${run})
        )
        select u.*, x.display_name brand, x.brand_key
        from u left join lateral (select b.display_name, b.brand_key from b where u.url ~* b.pattern order by (b.brand_key = 'aia') desc limit 1) x on true
        order by u.answers desc, u.url`,
    ]);
    return NextResponse.json({ run, keyword_id: keyword, keyword: head[0]?.keyword ?? '', summary: head[0] ?? null, pages });
  } catch {
    return NextResponse.json({ error: 'could not load' }, { status: 500 });
  }
}
