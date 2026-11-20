import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Everything the prompt side panel shows: for one tracked question in one run, how each assistant answered
// (recommended with a link or not) and every page the answers cited, marked as ours, a competitor's or another site.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const run = searchParams.get('run') || '';
  const prompt = searchParams.get('prompt') || '';
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(run) || !/^[A-Za-z0-9_-]{1,20}$/.test(prompt)) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  try {
    const [head, pages] = await Promise.all([
      q`select m.engine, max(p.prompt_text) prompt_text, count(*) n, count(*) filter (where m.mentioned and m.cited) rec,
          count(*) filter (where m.mentioned) named, count(*) filter (where m.cited) cited
        from public.aeo_asst_mentions_mv m join public.aeo_runs r on r.run_id = m.run_id
        join public.aeo_prompts p on p.list_version = r.prompt_list_version and p.prompt_key = m.prompt_key
        where m.run_id = ${run} and m.prompt_key = ${prompt} and m.brand_key = 'aia' group by m.engine`,
      q`with u as (
          select url, domain, max(label) label, count(distinct capture_id) answers,
            count(distinct capture_id) filter (where engine = 'chatgpt') chatgpt,
            count(distinct capture_id) filter (where engine = 'gemini') gemini,
            count(distinct capture_id) filter (where engine = 'perplexity') perplexity
          from public.aeo_asst_citations_mv where run_id = ${run} and prompt_key = ${prompt} group by url, domain
        ), b as (
          select p.pattern, k.display_name, k.brand_key
          from public.aeo_competitor_patterns p join public.aeo_competitors k on k.list_version = p.list_version and k.brand_key = p.brand_key
          where p.pattern_type = 'url' and p.list_version = (select competitor_list_version from public.aeo_runs where run_id = ${run})
        )
        select u.*, x.display_name brand, x.brand_key
        from u left join lateral (select b.display_name, b.brand_key from b where u.url ~* b.pattern order by (b.brand_key = 'aia') desc limit 1) x on true
        order by u.answers desc, u.url`,
    ]);
    return NextResponse.json({ run, prompt, prompt_text: head[0]?.prompt_text ?? '', assistants: head, pages });
  } catch {
    return NextResponse.json({ error: 'could not load' }, { status: 500 });
  }
}
