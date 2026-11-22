import { q } from '@/lib/db';
import { num, date } from '@/lib/format';
import { Kpi, Section, Table } from '@/components/ui';
import { hubspotContact } from '@/lib/links';
import { CopyLink } from '@/components/copy-link';
import { Assistant } from '@/components/assistant';
import { traffic as T, term } from '@/lib/glossary';

export const dynamic = 'force-dynamic';

// The outcome side of the assistants chain: who visited from an AI assistant (Google Analytics) and who became a lead (HubSpot).
// How often each assistant recommends us is on the AI assistants page; this page only counts what followed.
const HOW = { '1_original_source_ai': 'First source recorded by HubSpot', '2_utm_ai': 'Tag on the sign-up link' };

export default async function Traffic() {
  const bySource = await q`select ai_source, sum(sessions) sessions from public.aeo_ga4_ai_traffic_v group by 1 order by 2 desc`;
  const span = await q`select min(date) d0, max(date) d1 from public.aeo_ga4_ai_traffic_v`;
  // Free-trial journey per assistant (visits that reached each step), from the latest Google Analytics journey pull
  const journey = await q`select ai_source,
      coalesce(sum(sessions) filter (where step = 'free_trial_page_view'), 0) viewed,
      coalesce(sum(sessions) filter (where step = 'free_trial_form_start'), 0) started,
      coalesce(sum(sessions) filter (where step = 'free_trial_form_submit'), 0) submitted
    from public.aeo_ga4_ai_journey_v group by 1`;
  const pages = await q`select landing_page, sum(sessions) sessions from public.aeo_ga4_ai_landing_pages_v group by 1 order by 2 desc limit 10`;
  // Leads created in the same days as the Analytics data, so visits and leads in one row cover one period
  const sameDays = await q`with w as (select min(date) d0, max(date) d1 from public.aeo_ga4_ai_traffic_v)
    select ai_channel, count(*) leads from public.aeo_hubspot_ai_contacts_v, w where created_date between w.d0 and w.d1 group by 1`;
  const byAsst = await q`select ai_channel, count(*) leads, count(*) filter (where reached_opportunity) sales, count(*) filter (where lifecycle_stage ilike 'customer%') customers,
      count(*) filter (where attribution_tier = '1_original_source_ai') strict
    from public.aeo_hubspot_ai_contacts_v group by 1 order by 2 desc`;
  const contacts = await q`select hubspot_contact_id, created_date, ai_channel, attribution_tier, lifecycle_stage
    from public.aeo_hubspot_ai_contacts_v order by created_date desc`;

  const human = bySource.filter((r) => r.ai_source !== 'openai_utm_likely_automated');
  const automated = bySource.find((r) => r.ai_source === 'openai_utm_likely_automated');
  const total = human.reduce((s, r) => s + Number(r.sessions), 0);
  const jBy = Object.fromEntries(journey.map((j) => [j.ai_source, j]));
  const jHuman = journey.filter((j) => j.ai_source !== 'openai_utm_likely_automated');
  const jTotal = { sessions: total, viewed: jHuman.reduce((s, j) => s + Number(j.viewed), 0), started: jHuman.reduce((s, j) => s + Number(j.started), 0),
    submitted: jHuman.reduce((s, j) => s + Number(j.submitted), 0), loaded: journey.length > 0 };
  const sdBy = Object.fromEntries(sameDays.map((r) => [String(r.ai_channel).toLowerCase(), Number(r.leads)]));
  const leads = { n: byAsst.reduce((s, r) => s + Number(r.leads), 0), strict: byAsst.reduce((s, r) => s + Number(r.strict), 0), opp: byAsst.reduce((s, r) => s + Number(r.sales), 0) };
  const period = span[0]?.d0 ? `${date(span[0].d0)} to ${date(span[0].d1)}` : '';
  const leadsTip = { title: 'Leads in the same days', body: 'HubSpot contacts from this assistant created in the same days as the visits in this row. Leads can be higher than form submissions: some contacts carry the assistant\'s tag but were created by a connected system, not by the form on the free-trial page.' };

  return (
    <>
      <div className="pagehead"><div><h1>Visits &amp; leads</h1><p className="hint">Who came to the website from an AI assistant (Google Analytics) and who became a lead (HubSpot).</p></div></div>
      <div className="kpis">
        <Kpi label="Visits from AI assistants" info={T.aiSessions({ sessions: total })} value={num(total)} sub={period ? `Google Analytics, ${period}` : 'Google Analytics'} />
        <Kpi label="Of those, viewed the free-trial page" info={term.ftViewed} value={jTotal.loaded ? num(jTotal.viewed) : '–'} sub={jTotal.loaded ? `${num(jTotal.submitted)} submitted the form` : ''} />
        <Kpi label="Leads from AI assistants" info={T.broad({ n: leads.n, opp: leads.opp })} value={num(leads.n)} sub={`HubSpot, all time · ${num(leads.opp)} reached a sales stage`} />
      </div>

      <Section title="By assistant: visited, signed up, became a lead" info={T.bySource(jTotal)}
        hint={`${period ? `${period}. ` : ''}Each step counts visits, not people. Leads are the HubSpot contacts created in the same days.`}>
        <Table columns={[{ key: 'ai_source', label: 'Assistant', render: (r) => <Assistant id={r.ai_source} /> },
          { key: 'sessions', label: 'Visits', num: true, render: (r) => num(r.sessions) },
          { key: 'viewed', label: 'Viewed the free-trial page', num: true, info: term.ftViewed, render: (r) => (journey.length ? num(jBy[r.ai_source]?.viewed ?? 0) : '–') },
          { key: 'submitted', label: 'Submitted the form', num: true, info: term.ftSubmitted, render: (r) => (journey.length ? num(jBy[r.ai_source]?.submitted ?? 0) : '–') },
          { key: 'leads', label: 'Leads', num: true, info: leadsTip, render: (r) => num(sdBy[r.ai_source] ?? 0) }]} rows={human} />
        {automated ? <p className="hint" style={{ margin: '12px 0 0' }}>Left out: {num(automated.sessions)} visits tagged &quot;openai&quot; that behave like automated traffic, not people.</p> : null}
      </Section>

      <div className="grid2">
        <Section title="Leads by assistant, all time" info={T.contacts} hint="HubSpot contacts whose source is an AI assistant, and how far they got. Contacts created by our free website tools are left out.">
          <Table columns={[{ key: 'ai_channel', label: 'Assistant', render: (r) => <Assistant id={r.ai_channel} /> },
            { key: 'leads', label: 'Leads', num: true, render: (r) => num(r.leads) },
            { key: 'sales', label: 'Reached a sales stage', num: true, info: term.reachedOpp, render: (r) => num(r.sales) },
            { key: 'customers', label: 'Customers', num: true, render: (r) => num(r.customers) }]} rows={byAsst} />
        </Section>
        <Section title="Where AI visitors land" info={T.landing} hint={period ? `Top pages people arrived on, ${period}.` : ''}>
          <Table columns={[{ key: 'landing_page', label: 'Page', render: (r) => (r.landing_page === '(not set)' ? <span className="muted">Page not recorded</span> : <span className="path">{r.landing_page}</span>) },
            { key: 'sessions', label: 'Visits', num: true, render: (r) => num(r.sessions) }]} rows={pages} />
        </Section>
      </div>

      <Section title={`Every lead (${contacts.length})`} info={T.contacts} hint="One row per HubSpot contact, newest first. No names or emails are stored here: the button copies the contact's HubSpot link; paste it in a browser where you are logged in to HubSpot.">
        <details className="tableview first">
          <summary>Show all {num(contacts.length)} leads</summary>
          <Table columns={[{ key: 'created_date', label: 'Created', render: (r) => date(r.created_date) }, { key: 'ai_channel', label: 'Assistant', render: (r) => <Assistant id={r.ai_channel} /> },
            { key: 'lifecycle_stage', label: 'Stage now', info: term.lifecycle },
            { key: 'attribution_tier', label: 'How we know', info: term.tier, render: (r) => HOW[r.attribution_tier] || r.attribution_tier },
            { key: 'src', label: 'HubSpot', render: (r) => <CopyLink href={hubspotContact(r.hubspot_contact_id)} /> }]} rows={contacts} />
        </details>
      </Section>
    </>
  );
}
