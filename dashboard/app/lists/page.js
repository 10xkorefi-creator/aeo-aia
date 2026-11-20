import { q } from '@/lib/db';
import { term } from '@/lib/glossary';
import { num } from '@/lib/format';
import { Section, Table } from '@/components/ui';

export const dynamic = 'force-dynamic';

function SourceList({ label, items }) {
  if (!items || !items.length) return null;
  const shown = items.slice(0, 4);
  return (
    <div style={{ marginBottom: 4 }}>
      <span className="pill">{label} · {items.length}</span>
      <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>{shown.map((t) => <li key={t}>{t}</li>)}</ul>
      {items.length > 4 ? (
        <details className="more"><summary>+{items.length - 4} more</summary>
          <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>{items.slice(4).map((t) => <li key={t}>{t}</li>)}</ul>
        </details>
      ) : null}
    </div>
  );
}

function Evidence({ r }) {
  return (
    <div style={{ fontSize: 12, minWidth: 260 }}>
      <SourceList label="Autocomplete (IN)" items={r.evidence_autocomplete_in} />
      <SourceList label="People Also Ask (IN)" items={r.evidence_paa_in} />
      <SourceList label="People Also Ask (global)" items={r.evidence_paa_global} />
      <SourceList label="Search Console (IN, 90 days · impressions)" items={r.evidence_gsc_in} />
      {r.rewritten_from_fragment ? <div className="hint">Prompt worded as a question from: “{r.source_query}”</div> : null}
    </div>
  );
}

export default async function Lists() {
  const prompts = await q`select prompt_key, prompt_text, coalesce(theme, topic) topic, stage, persona, prompt_group, evidence_score, evidence_phrasings,
      evidence_autocomplete_in, evidence_paa_in, evidence_paa_global, evidence_gsc_in, rewritten_from_fragment, source_query
    from public.aeo_prompts where is_active and list_version = 'v4'
    order by case prompt_group when 'unbranded' then 1 when 'competitor' then 2 else 3 end, prompt_key`;
  const GROUP = { unbranded: 'Unbranded', competitor: 'Competitor comparison', own_brand: 'Own brand' };
  const n = (g) => prompts.filter((r) => r.prompt_group === g).length;
  const keywords = await q`select keyword_id, keyword, topic, segment, ahrefs_volume_in, gsc_impressions_90d_in, source from public.aeo_keywords where is_active and list_version = 'v2' order by segment, topic, keyword_id`;
  const comps = await q`select c.display_name, c.role, string_agg(p.pattern_type || ': ' || p.pattern, '  ·  ' order by p.pattern_type) rules
    from public.aeo_competitors c left join public.aeo_competitor_patterns p on p.list_version = c.list_version and p.brand_key = c.brand_key
    where c.list_version = 'v1' group by 1,2, c.sort_order order by c.sort_order`;
  return (
    <>
      <div className="pagehead"><div><h1>Tracked lists</h1><p className="hint">Source of truth: Supabase (project AI Accountant) tables aeo_prompts, aeo_keywords, aeo_competitors, aeo_competitor_patterns.</p></div></div>
      <Section icon="/logos/openai.svg" title={`ChatGPT prompts (${prompts.length})`} hint={`Built from real Google searches (India autocomplete, People Also Ask, our Search Console queries), checked against what AI Accountant actually sells, and worded the short, informal way people type into a chatbot. Each prompt runs 4× per run in ChatGPT (India). ${n('unbranded')} unbranded prompts feed the headline numbers and share of voice; ${n('competitor')} competitor-comparison and ${n('own_brand')} own-brand prompts are captured but reported separately.`}>
        <Table columns={[{ key: 'prompt_key', label: 'Key' }, { key: 'prompt_text', label: 'Prompt' }, { key: 'prompt_group', label: 'Group', info: term.promptGroup, render: (r) => GROUP[r.prompt_group] ?? r.prompt_group },
          { key: 'topic', label: 'Theme' }, { key: 'stage', label: 'Stage' },
          { key: 'evidence', label: 'Source queries (real Google searches)', render: (r) => <Evidence r={r} /> }]} rows={prompts} />
      </Section>
      <Section icon="/logos/google.svg" title={`Google AI Overview keywords (${keywords.length})`} hint="Product keywords only. Each keyword is captured 4× per run on Google India (desktop). Buyer keywords feed the headline; informational keywords (free tools, GST lookups) are reported separately.">
        <Table columns={[{ key: 'keyword_id', label: '#' }, { key: 'keyword', label: 'Keyword' }, { key: 'topic', label: 'Topic' }, { key: 'segment', label: 'Segment', info: term.segment },
          { key: 'ahrefs_volume_in', label: 'Volume (IN)', num: true, info: term.volumeIn, render: (r) => num(r.ahrefs_volume_in) },
          { key: 'gsc_impressions_90d_in', label: 'GSC impr. 90d', num: true, render: (r) => num(r.gsc_impressions_90d_in) },
          { key: 'source', label: 'Source' }]} rows={keywords} />
      </Section>
      <Section title={`Competitor set (${comps.length})`} hint="own = AiA · sov = in share of voice · context / watchlist = reported separately. Rules: text = matched in answer text, url = matched in cited links.">
        <Table columns={[{ key: 'display_name', label: 'Brand' }, { key: 'role', label: 'Role', info: term.role },
          { key: 'rules', label: 'Matching rules', render: (r) => <code style={{ fontSize: 11 }}>{r.rules}</code> }]} rows={comps} />
      </Section>
    </>
  );
}
