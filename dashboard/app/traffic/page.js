import { q } from '@/lib/db';
import { pct, num, date } from '@/lib/format';
import { Kpi, Section, Bars, Table, Src, Ask } from '@/components/ui';
import { hubspotContact } from '@/lib/links';
import { CopyLink } from '@/components/copy-link';
import { Assistant, assistantName } from '@/components/assistant';
import { MultiTrend } from '@/components/multi-trend';
import { askHref } from '@/lib/ask';
import { traffic as T, term, assistants as AS } from '@/lib/glossary';

export const dynamic = 'force-dynamic';

export default async function Traffic({ searchParams }) {
  const sp = await searchParams;
  const weekly = await q`select week_start, sum(sessions) filter (where ai_source='chatgpt') chatgpt, sum(sessions) filter (where counts_as_human_aeo_traffic and ai_source<>'chatgpt') other_ai,
      sum(sessions) filter (where not counts_as_human_aeo_traffic) automated
    from public.aeo_ga4_ai_traffic_weekly_v group by 1 order by 1 desc`;
  const bySource = await q`select ai_source, sum(sessions) sessions, round(sum(engaged_sessions)::numeric/nullif(sum(sessions),0),3) engagement, sum(key_events) key_events
    from public.aeo_ga4_ai_traffic_v group by 1 order by 2 desc`;
  // Free-trial journey per assistant (sessions that reached each step), from the latest GA4 journey pull
  const journey = await q`select ai_source, min(period_start) d0, max(period_end) d1,
      coalesce(sum(sessions) filter (where step = 'free_trial_page_view'), 0) viewed,
      coalesce(sum(sessions) filter (where step = 'free_trial_form_start'), 0) started,
      coalesce(sum(sessions) filter (where step = 'free_trial_form_submit'), 0) submitted
    from public.aeo_ga4_ai_journey_v group by 1`;
  const pages = await q`select landing_page, sum(sessions) sessions, sum(engaged_sessions) engaged from public.aeo_ga4_ai_landing_pages_v group by 1 order by 2 desc limit 15`;
  const tiers = await q`select attribution_tier, ai_channel, count(*) contacts, count(*) filter (where reached_opportunity) opportunity
    from public.aeo_hubspot_ai_contacts_v group by 1,2 order by 1,2`;
  const hsWeekly = await q`select week_start, count(*) filter (where attribution_tier='1_original_source_ai') strict_n, count(*) broad_n
    from public.aeo_hubspot_ai_contacts_v group by 1 order by 1 desc limit 16`;
  const contacts = await q`select hubspot_contact_id, created_date, ai_channel, attribution_tier, lifecycle_stage, reached_opportunity
    from public.aeo_hubspot_ai_contacts_v order by created_date desc`;
  const gsc = await q`select source, period_label, count(*) rows, sum(impressions) impressions, sum(clicks) clicks, max(pulled_at) loaded
    from public.aeo_gsc_ai_daily where page = '' or date = (select max(date) from public.aeo_gsc_ai_daily where page <> '') group by 1,2 order by loaded desc`;
  // A Pages export is stored under its upload day. Only the most recent upload is read, so two uploads are never added together
  const gscTop = await q`select page, max(period_label) period_label, sum(impressions) impressions from public.aeo_gsc_ai_daily
    where page <> '' and date = (select max(date) from public.aeo_gsc_ai_daily where page <> '')
    group by 1 order by 3 desc limit 15`;
  const rec = await q`select engine, run_id, recommended, answers, recommended_rate from public.aeo_asst_recommended_v
    where run_id = (select run_id from public.aeo_runs where run_type <> 'test' and status in ('complete', 'partial') order by created_at desc limit 1)`;
  const recBy = Object.fromEntries(rec.map((r) => [r.engine, r]));
  const wk = await q`select date_trunc('week', date)::date wk, ai_source engine, sum(sessions) visits, (select max(date) from public.aeo_ga4_ai_traffic_v) through, (select min(date) from public.aeo_ga4_ai_traffic_v) since
    from public.aeo_ga4_ai_traffic_v where ai_source in ('chatgpt', 'gemini', 'perplexity') group by 1, 2 order by 1`;
  const through = wk[0]?.through ? new Date(wk[0].through) : null;
  const since = wk[0]?.since ? new Date(wk[0].since) : null;
  const full = wk.filter((w) => through && since && new Date(w.wk) >= since && new Date(new Date(w.wk).getTime() + 6 * 864e5) <= through);
  const weekKeys = [...new Map(full.map((w) => [date(w.wk), { key: date(w.wk), label: date(w.wk).slice(0, 5), tip: `Week of ${date(w.wk)}` }])).values()];
  const COLOR = { chatgpt: 'var(--asst-chatgpt)', gemini: 'var(--asst-gemini)', perplexity: 'var(--asst-perplexity)' };
  const visitSeries = ['chatgpt', 'gemini', 'perplexity'].map((e) => ({ id: e, name: assistantName(e), color: COLOR[e],
    points: Object.fromEntries(weekKeys.map((k) => [k.key, { y: Number(full.find((w) => w.engine === e && date(w.wk) === k.key)?.visits || 0) }])) }));
  // Leads created in the same days as the Analytics data, so the form steps and the leads can be read side by side
  const sameDays = await q`with w as (select min(date) d0, max(date) d1 from public.aeo_ga4_ai_traffic_v)
    select ai_channel, count(*) leads, count(*) filter (where attribution_tier = '1_original_source_ai') strict,
      count(*) filter (where attribution_tier <> '1_original_source_ai' and original_source = 'OFFLINE') no_form
    from public.aeo_hubspot_ai_contacts_v, w where created_date between w.d0 and w.d1 group by 1`;
  const sdBy = Object.fromEntries(sameDays.map((r) => [r.ai_channel, r]));
  const sameDayTip = { title: 'Leads, same days', body: 'HubSpot contacts from this assistant created in the same days as the Google Analytics figures in this row. "From a website visit" means HubSpot recorded the assistant as the first source of a website session that ended in a form. "Without a website form" means the contact carries the assistant\'s tag but was created by a connected system, not by a form on the site, so it never shows up as a form submission here.' };
  const maxW = Math.max(1, ...weekly.map((w) => Number(w.chatgpt || 0) + Number(w.other_ai || 0)));
  const total = bySource.reduce((s, r) => s + (r.ai_source !== 'openai_utm_likely_automated' ? Number(r.sessions) : 0), 0);
  const chat = bySource.find((r) => r.ai_source === 'chatgpt');
  const jBy = Object.fromEntries(journey.map((j) => [j.ai_source, j]));
  const jv = (r, k) => (journey.length ? num(jBy[r.ai_source]?.[k] ?? 0) : '–');
  const human = journey.filter((j) => j.ai_source !== 'openai_utm_likely_automated');
  const jTotal = { sessions: total, viewed: human.reduce((s, j) => s + Number(j.viewed), 0), started: human.reduce((s, j) => s + Number(j.started), 0),
    submitted: human.reduce((s, j) => s + Number(j.submitted), 0), d0: journey[0]?.d0, d1: journey[0]?.d1, loaded: journey.length > 0 };
  const strictRows = tiers.filter((t) => t.attribution_tier === '1_original_source_ai');
  const sumOf = (rows, k) => rows.reduce((s, t) => s + Number(t[k] || 0), 0);
  const strict = { n: sumOf(strictRows, 'contacts'), opp: sumOf(strictRows, 'opportunity') };
  const broad = { n: sumOf(tiers, 'contacts'), opp: sumOf(tiers, 'opportunity') };

  return (
    <>
      <div className="pagehead"><div><h1>Traffic & conversions</h1><p className="hint">GA4 (via treg) · HubSpot · Search Console Generative AI export</p></div></div>
      {sp?.uploaded ? <div className="banner">Search Console export loaded: {sp.uploaded} rows.</div> : null}
      {sp?.error ? <div className="banner">Upload failed: {sp.error}</div> : null}
      <div className="kpis">
        <Kpi ask={askHref('ga4', '', 'all')} label="Visits from AI assistants" info={T.aiSessions({ sessions: total })} value={num(total)} sub={`Google Analytics, all loaded days · ${num(chat?.sessions)} from ChatGPT`} />
        <Kpi label="Of those, viewed the free-trial page" info={term.ftViewed} value={jTotal.loaded ? num(jTotal.viewed) : '–'} sub={jTotal.loaded ? `${num(jTotal.started)} started the form · ${num(jTotal.submitted)} submitted it` : ''} />
        <Kpi ask={askHref('hubspot', '', 'broad')} label="Leads from AI assistants" info={T.broad(broad)} value={num(broad.n)} sub={`HubSpot · ${num(strict.n)} with an AI assistant as the recorded first source`} />
      </div>
      <Section title="By assistant: recommended, visited, converted" info={T.bySource(jTotal)} hint={`How often each assistant recommends us with a link${rec[0] ? ` (run ${rec[0].run_id})` : ''}, the visits it sent, and how far those visitors got on the free-trial page. Each step counts visits, not people. The form columns cover only the form on the free-trial page; HubSpot also counts leads that never used it, so leads can be higher than form submissions.`}>
          <Table columns={[{ key: 'ai_source', label: 'Assistant', render: (r) => <Assistant id={r.ai_source} /> }, { key: 'rec', label: 'Recommends us with a link', num: true, info: AS.recommended, render: (r) => (recBy[r.ai_source] ? `${pct(recBy[r.ai_source].recommended_rate)} (${num(recBy[r.ai_source].recommended)} of ${num(recBy[r.ai_source].answers)})` : '–') },
            { key: 'sessions', label: 'Visits', num: true, render: (r) => num(r.sessions) },
            { key: 'engagement', label: 'Engaged', num: true, info: term.engaged, render: (r) => pct(r.engagement, 0) },
            { key: 'viewed', label: 'Viewed free trial', num: true, info: term.ftViewed, render: (r) => jv(r, 'viewed') },
            { key: 'started', label: 'Started free-trial form', num: true, info: term.ftStarted, render: (r) => jv(r, 'started') },
            { key: 'submitted', label: 'Submitted free-trial form', num: true, info: term.ftSubmitted, render: (r) => jv(r, 'submitted') },
            { key: 'leads', label: 'Leads, same days', num: true, info: sameDayTip, render: (r) => (sdBy[r.ai_source] ? <>{num(sdBy[r.ai_source].leads)}<span className="chain-sub">{num(sdBy[r.ai_source].strict)} from a website visit · {num(sdBy[r.ai_source].no_form)} without a website form</span></> : (r.ai_source === 'openai_utm_likely_automated' ? '–' : '0')) },
            { key: 'src', label: '', render: (r) => <Ask href={askHref('ga4', '', r.ai_source)} /> }]} rows={[...bySource].sort((x, y) => (x.ai_source === 'openai_utm_likely_automated') - (y.ai_source === 'openai_utm_likely_automated'))} />
      </Section>
      <div className="grid2">
        <Section title="Visits each assistant sent, week by week" info={AS.visitsTrend} hint={`One line per assistant, in the same colours as the AI assistants page. Full weeks only, loaded to ${through ? date(through) : '–'}.`}>
          <MultiTrend xs={weekKeys} series={visitSeries} kind="num" />
          <details className="tableview">
            <summary>Show as a table</summary>
            <Table columns={[{ key: 'label', label: 'Week of', render: (x) => x.key }, ...visitSeries.map((sr) => ({ key: sr.id, label: sr.name, num: true, render: (x) => num(sr.points[x.key]?.y ?? 0) }))]} rows={weekKeys.slice().reverse()} />
          </details>
        </Section>
        <Section title="Top landing pages from AI assistants" info={T.landing}>
          <Table columns={[{ key: 'landing_page', label: 'Landing page' }, { key: 'sessions', label: 'Sessions', num: true, render: (r) => num(r.sessions) }]} rows={pages} />
        </Section>
      </div>
      <div className="grid2">
        <Section title="HubSpot AI-sourced contacts" info={T.hsTiers} hint="Tier 1 strict (original source AI Referrals) · Tier 2 AI utm_source · internal contacts excluded.">
          <Table columns={[{ key: 'attribution_tier', label: 'Tier', info: term.tier }, { key: 'ai_channel', label: 'Assistant', render: (r) => <Assistant id={r.ai_channel} /> },
            { key: 'contacts', label: 'Contacts', num: true }, { key: 'opportunity', label: 'Reached opp/SQL', num: true, info: term.reachedOpp }]} rows={tiers} />
        </Section>
        <Section title="HubSpot AI contacts per week" info={T.hsWeekly} hint="AI-sourced contacts created that week (broad count), latest week first; the strict count is shown beside it. Shows the 16 most recent weeks that had a contact; the list below has all of them.">
          <Bars rows={hsWeekly.map((w) => ({ label: `Week of ${date(w.week_start)}`, v: Number(w.broad_n), s: Number(w.strict_n), txt: `${num(w.broad_n)} · ${num(w.strict_n)} strict` }))} labelKey="label" valueKey="v" format={(v) => num(v)} valueWidth={96} />
        </Section>
      </div>
      <Section title={`AI-sourced contacts (${contacts.length})`} info={T.contacts} hint={`One row per HubSpot contact created since ${contacts.length ? date(contacts[contacts.length - 1].created_date) : '–'}, the same contacts as the Leads figure on the Overview. No names or emails are stored here: the button copies the contact's HubSpot link; paste it in a browser where you are logged in to HubSpot.`}>
        <Table columns={[{ key: 'created_date', label: 'Created', render: (r) => date(r.created_date) }, { key: 'ai_channel', label: 'Assistant', render: (r) => <Assistant id={r.ai_channel} /> },
          { key: 'attribution_tier', label: 'Tier', info: term.tier }, { key: 'lifecycle_stage', label: 'Lifecycle stage', info: term.lifecycle },
          { key: 'reached_opportunity', label: 'Reached opp/SQL', info: term.reachedOpp, render: (r) => (r.reached_opportunity ? 'Yes' : '') },
          { key: 'src', label: 'HubSpot', render: (r) => <CopyLink href={hubspotContact(r.hubspot_contact_id)} /> }]} rows={contacts} />
      </Section>
      <Section title="Google AI Overviews impressions (Search Console export)" info={T.gsc(gsc)} hint="Search Console has no API for the Generative AI report: export it (Performance → Generative AI features → Export → CSV) and upload Chart.csv (daily totals) and Pages.csv here, one file at a time. Re-uploading a longer period replaces the overlapping days.">
        <form action="/api/gsc-upload" method="post" encType="multipart/form-data" className="runpicker">
          <input type="file" name="file" accept=".csv,text/csv" required />
          <input type="text" name="period" placeholder="Period, e.g. 3 months to 16/11/2026" />
          <input type="password" name="key" placeholder="Upload password" required />
          <button type="submit">Upload</button>
        </form>
        <div style={{ marginTop: 12 }}>
          <Table columns={[{ key: 'source', label: 'Export' }, { key: 'period_label', label: 'Period' }, { key: 'rows', label: 'Rows', num: true },
            { key: 'impressions', label: 'Impressions', num: true, render: (r) => num(r.impressions) }, { key: 'loaded', label: 'Loaded', render: (r) => date(r.loaded) }]}
            rows={gsc} empty="Awaiting first export upload." />
        </div>
        {gscTop.length ? <div style={{ marginTop: 12 }}><p className="hint">Top pages in the latest Pages export{gscTop[0].period_label ? ` (${gscTop[0].period_label})` : ''}.</p><Table columns={[{ key: 'page', label: 'Page' }, { key: 'impressions', label: 'AI impressions', num: true, render: (r) => num(r.impressions) }]} rows={gscTop} /></div> : null}
      </Section>
    </>
  );
}
