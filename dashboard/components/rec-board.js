'use client';
import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AssistantIcon, assistantName } from '@/components/assistant';

// The recommendations: one row per task, in priority order, and the same work seen per question.
// Tasks are generated from the latest run (scripts/recs/build.py). A row's detail is loaded when it is opened.
const PEOPLE = ['Wasif Kareem', 'Devansh Saini'];
const ENGINES = ['chatgpt', 'gemini', 'perplexity', 'google'];
const SITES = { YouTube: 'youtube.com', LinkedIn: 'linkedin.com', Instagram: 'instagram.com', Facebook: 'facebook.com', Reddit: 'reddit.com', Quora: 'quora.com', X: 'x.com' };
const CHANNEL_ORDER = ['Website', 'Outreach', 'Review site', 'YouTube', 'LinkedIn', 'Reddit', 'Quora', 'X', 'Facebook', 'Instagram'];
const TYPE = { 'New page': ['New content', 'new'], 'Update page': ['Update a page', 'upd'], Video: ['Social and video', 'soc'], Post: ['Social and video', 'soc'], 'Thread answer': ['Social and video', 'soc'],
  Listing: ['Listing', 'lst'], Outreach: ['Outreach', 'out'] };
const STAGE = { decision: 'Ready to buy', consideration: 'Comparing tools', 'problem (how-to)': 'How-to', awareness: 'Learning', 'Google search': 'Google search' };
const engineName = (e) => (e === 'google' ? 'Google AI Overviews' : assistantName(e));
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

function ChannelIcon({ channel, size = 15 }) {
  if (SITES[channel]) return <img className="rb-chan-ico" src={`https://www.google.com/s2/favicons?domain=${SITES[channel]}&sz=64`} alt="" width={size} height={size} />;
  const s = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'rb-chan-ico glyph' };
  if (channel === 'Website') return <svg {...s}><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" /></svg>;
  if (channel === 'Outreach') return <svg {...s}><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5 8 9l5.5-4.5" /></svg>;
  if (channel === 'Review site') return <svg {...s}><path d="m8 2.2 1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4L2.2 6.5l4-.6z" /></svg>;
  return <svg {...s}><path d="M3 4h10M3 8h10M3 12h6" /></svg>;
}
const Channel = ({ channel }) => <span className="rt-chan"><ChannelIcon channel={channel} />{channel}</span>;
const Pill = ({ kind }) => { const [label, cls] = TYPE[kind] || ['Other', 'trk']; return <span className={`rt-pill ${cls}`}>{label}</span>; };
const Done = () => <span className="rt-done"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>Done</span>;
const State = ({ t }) => (t.state === 'draft' ? <span className="rt-state draft">Draft</span> : t.state === 'live' ? <span className="rt-state live">Live</span> : t.done ? <Done /> : <Prio p={t.priority} />);
const Prio = ({ p }) => <span className={`rt-prio ${String(p).toLowerCase()}`}>{p === 'Done' ? 'No gap' : p}</span>;
const For = ({ list, names }) => (
  <span className="rt-for" title={list.map(engineName).join(', ')}>
    {list.map((e) => <span key={e} className="rt-for-i"><AssistantIcon id={e} size={15} />{names ? engineName(e) : null}</span>)}
  </span>
);

function Favicon({ domain }) {
  const [bad, setBad] = useState(false);
  return (
    <span className="pp-fav pp-fav-none" aria-hidden="true">{(domain || '?').charAt(0).toUpperCase()}
      {!bad && domain ? <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`} alt="" width="20" height="20" onError={() => setBad(true)} /> : null}
    </span>
  );
}

function Assignee({ value, onChange, saving }) {
  return (
    <select className={`rt-assign${value ? ' set' : ''}`} value={value || ''} disabled={saving} aria-label="Assignee"
      onClick={(e) => e.stopPropagation()} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Unassigned</option>
      {PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  );
}

const Bullets = ({ items }) => <ul className="rb-bullets">{(items || []).map((t, i) => <li key={i}>{t}</li>)}</ul>;
const Loading = ({ failed }) => <p className="rq-load">{failed ? 'Could not load the details. Close and open the row again.' : 'Loading…'}</p>;

// ---- the build brief: what kind of page, where it lives, its search tags, and the full prompt the Webflow agent works from
function BuildBrief({ b }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(b.prompt); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard not available */ } };
  const rows = [['Page type', b.page_type], ['Made by', b.made_by], ['What to do', b.action], ['Address', b.url], ['SEO title', b.seo_title], ['Meta description', b.meta_description],
    ['Format', b.words ? `${b.format}, about ${b.words.toLocaleString('en-IN')} words` : b.format], ['Compare with', (b.compare_with || []).join(', ')], ['Images', b.images], ['Schema', b.schema]].filter(([, v]) => v);
  return (
    <section className="rb-sec"><h3>Build brief</h3>
      <dl className="rd-build">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{k === 'Address' ? <a href={v} target="_blank" rel="noopener noreferrer">{v.replace(/^https?:\/\/(www\.)?/, '')}</a> : v}</dd></div>)}</dl>
      {b.seo_note ? <p className="rb-foot">{b.seo_note}</p> : null}
      <details className="rd-prompt">
        <summary>Full prompt for the Webflow agent</summary>
        <button type="button" className="rd-copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        <pre>{b.prompt}</pre>
      </details>
    </section>
  );
}

// ---- who to write to for an outreach task, and how that contact was found
function OutreachContact({ c }) {
  const link = (u, label) => <a href={u} target="_blank" rel="noopener noreferrer">{label || u.replace(/^https?:\/\/(www\.)?/, '')}</a>;
  const li = c.linkedin_url ? <>{link(c.linkedin_url)}{c.linkedin_name ? ` (${c.linkedin_name}${c.linkedin_role ? ', ' + c.linkedin_role : ''})` : ''}</> : null;
  const rows = [['LinkedIn', li || c.linkedin_status], ['LinkedIn match', c.linkedin_url ? c.linkedin_confidence : null], ['LinkedIn note', c.linkedin_url ? null : c.linkedin_note], ['Company page', c.linkedin_company ? link(c.linkedin_company) : null],
    ['Other profiles', (c.linkedin || []).length ? <>{c.linkedin.map((u, i) => <span key={u}>{i ? ', ' : ''}{link(u)}</span>)}</> : null],
    ['Email status', c.status], ['Name', c.name], ['Role', c.role], ['Email', c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : null], ['Email confidence', c.confidence],
    ['Found on', c.source], ['Other addresses', (c.other_emails || []).join(', ')],
    ['Author page', c.author_page ? link(c.author_page) : null], ['Contact form', c.form ? link(c.form) : null], ['Site', c.site], ['How found', c.method], ['Checked', c.linkedin_checked || c.checked]].filter(([, v]) => v);
  return (
    <section className="rb-sec"><h3>Outreach contact</h3>
      {c.outreach_note ? <p className="rd-agent-note"><b>Note for outreach{c.relationship ? ` (${c.relationship.toLowerCase()})` : ''}:</b> {c.outreach_note}</p> : null}
      <dl className="rd-build">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {c.note ? <p className="rb-foot">{c.note}</p> : null}
      {c.li_message ? (
        <details className="rd-prompt" open>
          <summary>LinkedIn message, sent after they accept{c.li_stage ? ` (${c.li_stage.toLowerCase()})` : ''}</summary>
          {c.li_group > 1 ? <p className="rb-foot">One message covers {c.li_group} tasks for this person.</p> : null}
          <pre>{c.li_message}</pre>
          <p className="rb-foot">Follow-up after 5 working days with no reply:</p>
          <pre>{c.li_followup}</pre>
        </details>
      ) : null}
    </section>
  );
}

// ---- one task: the task itself first, then what is driving it, why it should work and how we will know
function TaskDetail({ t, body, failed, questions, openQ, assign, saving, canPublish, publish, publishing, pubError }) {
  const mine = t.targets.map((k) => questions.find((x) => x.key === k)).filter(Boolean);
  const cols = ENGINES.filter((e) => t.assistants.includes(e));
  const [all, setAll] = useState(false);
  const shown = all ? mine : mine.slice(0, 5);
  return (
    <>
      <div className="rb-kicker"><span>Recommendation</span>{t.done ? <><span className="rb-dot">·</span><span>Done</span></> : null}{t.start ? <><span className="rb-dot">·</span><span>Start here</span></> : null}</div>
      <Dialog.Title className="rb-title">{t.title}</Dialog.Title>
      <div className="rt-meta">
        <Channel channel={t.channel} /><Pill kind={t.kind} /><State t={t} /><For list={t.assistants} names />
        <span className="rt-meta-assign"><i>{t.done ? 'Done by' : t.state === 'draft' ? 'Reviewer' : 'Assignee'}</i><Assignee value={t.assignee} onChange={(v) => assign(t.key, v)} saving={saving === t.key} /></span>
      </div>
      {t.state === 'draft' || t.state === 'live' ? (
        <div className={`rd-agent ${t.state}`}>
          <p>{t.state === 'live' ? <><b>Live since {t.liveAt}.</b> Drafted by the {t.agent || 'Webflow agent'} on {t.draftedAt}.</>
            : <><b>Drafted by the {t.agent || 'Webflow agent'} on {t.draftedAt}.</b> Saved in Webflow as a draft{t.assignee ? `, with ${t.assignee} to review` : ''}.</>}</p>
          <div className="rd-agent-act">
            {t.draftUrl ? <a href={t.draftUrl} target="_blank" rel="noopener noreferrer">Open in Webflow ↗</a> : null}
            {t.state === 'live' && t.pageUrl ? <a href={t.pageUrl} target="_blank" rel="noopener noreferrer">Open the page ↗</a> : null}
            {t.state === 'draft' && canPublish ? <button type="button" disabled={publishing === t.key} onClick={() => publish(t.key)}>{publishing === t.key ? 'Publishing…' : 'Publish'}</button> : null}
          </div>
          {pubError ? <p className="rd-agent-err" role="status">{pubError}</p> : null}
          {t.agentNote ? <p className="rd-agent-note"><b>What the agent did:</b> {t.agentNote}</p> : null}
        </div>
      ) : null}
      {!body ? <Loading failed={failed} /> : (
        <>
          <section className="rb-sec rb-do"><h3>Task</h3>
            <p className="rd-lead">{body.task?.lead}</p>
            {body.task?.points?.length ? <Bullets items={body.task.points} /> : null}
          </section>

          {body.build ? <BuildBrief b={body.build} /> : null}
          {body.contact ? <OutreachContact c={body.contact} /> : null}

          <section className="rb-sec"><h3>What’s driving this recommendation</h3>
            <h4>{mine.length > 1 ? `The ${mine.length} prompts this covers` : mine[0]?.kind === 'keyword' ? 'The Google search this covers' : 'The prompt this covers'}</h4>
            <div className="table-wrap">
              <table className="rb-table rd-prompts">
                <thead><tr><th>{mine.some((x) => x.kind === 'keyword') && mine.some((x) => x.kind !== 'keyword') ? 'Prompt or search' : mine[0]?.kind === 'keyword' ? 'Search' : 'Prompt'}</th>
                  {cols.map((e) => <th key={e} className="num"><span className="asst"><AssistantIcon id={e} size={14} />{assistantName(e)}</span></th>)}</tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.key}><td><button type="button" className="rd-q" onClick={() => openQ(x.key)}>{x.text}</button></td>
                    {cols.map((e) => <td key={e} className="num"><Score c={x.cells[e]} /></td>)}</tr>
                ))}</tbody>
              </table>
            </div>
            <p className="rb-foot">Answers that recommend us with a link, out of answers collected{cols.includes('google') ? '; for Google, AI Overviews that link to us' : ''}. Click a prompt to see every source cited for it.
              {mine.length > 5 && !all ? <> <button type="button" className="rd-more" onClick={() => setAll(true)}>Show all {mine.length}</button></> : null}</p>

            <h4>What the assistants do today</h4>
            <Bullets items={(body.today || body.why || []).slice(0, 4)} />

            {body.ours ? (
              <>
                <h4>Our own page on this</h4>
                <ul className="rb-winners">
                  <li><Favicon domain="aiaccountant.com" />
                    <div><b>{body.ours.title || host(body.ours.url)}</b>
                      <a href={body.ours.url} target="_blank" rel="noopener noreferrer">{body.ours.url.replace(/^https?:\/\/(www\.)?/, '')}<i aria-hidden="true"> ↗</i></a>
                      <p>{body.ours.clicks.toLocaleString('en-IN')} clicks from Google in the last 90 days.{body.ours.queries?.length ? ` Ranks for ${body.ours.queries.map((x) => `“${x}”`).join(', ')}.` : ''} {body.ours.cited ? 'Already cited for this prompt.' : 'Not cited for this prompt.'} {body.ours.note}</p></div>
                  </li>
                </ul>
                {body.ours.has?.length || body.ours.missing?.length ? (
                  <div className="rd-gap">
                    {body.ours.missing?.length ? <div><h5 className="miss">Missing next to the cited pages</h5><Bullets items={body.ours.missing} /></div> : null}
                    {body.ours.has?.length ? <div><h5>Already on the page</h5><Bullets items={body.ours.has} /></div> : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {body.model?.length ? (
              <>
                <h4>{body.model_title || 'Sources cited today'}</h4>
                {body.mix ? <p className="rd-mix">{body.mix}</p> : null}
                <ul className="rb-winners">
                  {body.model.slice(0, 4).map((w) => (
                    <li key={w.url}><Favicon domain={host(w.url)} />
                      <div><b>{w.title || host(w.url)}</b>
                        <a href={w.url} target="_blank" rel="noopener noreferrer nofollow">{host(w.url)}<i aria-hidden="true"> ↗</i></a><span className="pp-tag">{w.tag}</span>
                        <p>{w.note}</p></div>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          {body.works?.length ? <section className="rb-sec"><h3>Why this should work</h3><Bullets items={body.works.slice(0, 2)} /></section> : null}
          {body.check?.length ? <section className="rb-sec"><h3>Check before starting</h3><Bullets items={body.check.slice(0, 2)} /></section> : null}
          <section className="rb-sec"><h3>We will know it worked when</h3><Bullets items={(body.done || []).slice(0, 1)} /></section>
        </>
      )}
    </>
  );
}

// ---- one question: what each assistant did with it, the sources it used, and the tasks that follow
function QuestionDetail({ x, body, failed, tasks, openTask }) {
  const mine = body ? (body.tasks || []).map((k) => tasks.find((t) => t.key === k)).filter(Boolean) : [];
  return (
    <>
      <div className="rb-kicker"><span>{x.kind === 'keyword' ? 'Google search we track' : 'Question we ask the assistants'}</span>{x.start ? <><span className="rb-dot">·</span><span>Start here</span></> : null}</div>
      <Dialog.Title className="rb-title">{x.text}</Dialog.Title>
      <div className="rt-meta"><Prio p={x.priority} /><span className="rt-plain">{STAGE[x.stage] || x.stage}</span>
        {x.kind === 'keyword' && x.volume ? <span className="rt-plain">{x.volume.toLocaleString('en-IN')} searches a month</span> : null}
        {x.kind === 'keyword' && x.rank ? <span className="rt-plain">We rank number {x.rank}</span> : null}
      </div>
      {!body ? <Loading failed={failed} /> : (
        <>
          {ENGINES.filter((e) => body.cells[e]).map((e) => {
            const c = body.cells[e];
            return (
              <section className="rb-sec" key={e}>
                <h3 className="rq-h"><AssistantIcon id={e} size={17} />{engineName(e)}
                  <span className={`rq-score ${c.gap ? 'miss' : 'hit'}`}>{e === 'google' ? `Links to us in ${c.rec} of ${c.n} AI Overviews` : `Recommends us in ${c.rec} of ${c.n} answers`}</span></h3>
                {c.names?.length ? <p className="rq-names">Names {c.names.map(([n, k]) => `${n} (${k})`).join(', ')}.</p> : null}
                {c.proof ? <p className="rq-names">{c.proof}</p> : null}
                {c.sources?.length ? (
                  <ul className="rb-pages">
                    {c.sources.map((s) => (
                      <li key={s.url}><Favicon domain={s.domain} />
                        <a href={s.url} target="_blank" rel="noopener noreferrer nofollow"><b>{s.title || s.domain}</b><span>{s.domain} · {s.tag}{s.names_us ? ' · names us' : ''}</span></a>
                        <span className="rq-cited">{s.answers} of {c.n}</span></li>
                    ))}
                  </ul>
                ) : <p className="rq-names">No source was cited in most of its answers.</p>}
                {c.sources?.length ? <p className="rb-foot">Sources it cited in most of its {e === 'google' ? 'AI Overviews' : 'answers'}, out of {c.cited_pages} pages cited in all.</p> : null}
              </section>
            );
          })}
          <section className="rb-sec rb-do"><h3>{mine.length ? `What to do: ${mine.length} ${mine.length === 1 ? 'task' : 'tasks'}` : 'Nothing to do'}</h3>
            {mine.length ? (
              <ul className="rb-tasklist">
                {mine.map((t) => <li key={t.key}><button type="button" onClick={() => openTask(t.key)}><span className="rb-tl-title">{t.title}</span><Channel channel={t.channel} /><For list={t.assistants} /></button></li>)}
              </ul>
            ) : <p>{body.own_ok ? 'No task was produced for this one.' : 'We are already recommended here in most answers.'}</p>}
            {body.own_ok ? <p className="rq-own">No change is recommended on our own page, <a href={body.own_ok.url} target="_blank" rel="noopener noreferrer">{body.own_ok.title || body.own_ok.url}</a>. It already has what the cited pages have: {body.own_ok.has.slice(0, 4).join(' ')}</p> : null}
          </section>
        </>
      )}
    </>
  );
}

function Score({ c }) {
  if (!c) return <span className="rb-na">–</span>;
  return <b className={`rq-cell ${c.gap ? 'miss' : 'hit'}`}>{c.rec}/{c.n}</b>;
}

export function RecBoard({ tasks: initialTasks, questions, baseline, leads, initial, canPublish }) {
  const [tasks, setTasks] = useState(initialTasks);
  const start = initial?.task && initialTasks.some((t) => t.key === initial.task) ? { type: 'task', key: initial.task }
    : initial?.q && questions.some((x) => x.key === initial.q) ? { type: 'q', key: initial.q } : null;
  const [open, setOpen] = useState(start);
  const [view, setView] = useState(start?.type === 'q' ? 'questions' : 'tasks');
  const [chan, setChan] = useState('');
  const [eng, setEng] = useState('');
  const [prio, setPrio] = useState('');
  const [who, setWho] = useState('');
  const [qkind, setQkind] = useState('');
  const [saving, setSaving] = useState(null);
  const [failed, setFailed] = useState(false);
  const [detail, setDetail] = useState({});
  const [loadFailed, setLoadFailed] = useState(false);
  const asked = useRef(new Set());
  const curTask = open?.type === 'task' ? tasks.find((t) => t.key === open.key) : null;
  const curQ = open?.type === 'q' ? questions.find((x) => x.key === open.key) : null;
  const id = open ? `${open.type}:${open.key}` : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('rec'); url.searchParams.delete('task'); url.searchParams.delete('q');
    if (open) url.searchParams.set(open.type, open.key);
    window.history.replaceState(null, '', url);
    if (!open || asked.current.has(id)) return;
    asked.current.add(id); setLoadFailed(false);
    fetch(`/api/rec-item?${open.type}=${encodeURIComponent(open.key)}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => setDetail((d) => ({ ...d, [id]: j.body })))
      .catch(() => { asked.current.delete(id); setLoadFailed(true); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [publishing, setPublishing] = useState(null);
  const [pubError, setPubError] = useState(null);
  async function publish(key) {
    let pw = null;
    try { pw = window.sessionStorage.getItem('aeo-pw'); } catch { /* no storage */ }
    if (!pw) pw = window.prompt('Dashboard password, to publish this page in Webflow:');
    if (!pw) return;
    setPubError(null); setPublishing(key);
    try {
      const res = await fetch('/api/task-publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: key, password: pw }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { if (res.status === 401) { try { window.sessionStorage.removeItem('aeo-pw'); } catch { /* ignore */ } } throw new Error(res.status === 401 ? 'Wrong password.' : 'Webflow did not publish it. Try again, or publish it in Webflow.'); }
      try { window.sessionStorage.setItem('aeo-pw', pw); } catch { /* ignore */ }
      const at = new Date(j.live_at).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
      setTasks((ts) => ts.map((t) => (t.key === key ? { ...t, state: 'live', liveAt: at } : t)));
    } catch (e) { setPubError(e.message); }
    setPublishing(null);
  }

  async function assign(key, value) {
    const before = tasks.find((t) => t.key === key)?.assignee ?? null;
    setFailed(false); setSaving(key);
    setTasks((ts) => ts.map((t) => (t.key === key ? { ...t, assignee: value } : t)));
    try {
      const res = await fetch('/api/task-assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: key, assignee: value }) });
      if (!res.ok) throw new Error('not saved');
    } catch {
      setTasks((ts) => ts.map((t) => (t.key === key ? { ...t, assignee: before } : t)));
      setFailed(true);
    }
    setSaving(null);
  }

  const byPrio = (p, s, d, st) => !prio || (prio === 'done' ? !!d : prio === 'draft' || prio === 'live' ? st === prio : prio === 'start' ? s && !d : p === prio && !d && (!st || st === 'todo'));
  const channels = CHANNEL_ORDER.filter((c) => tasks.some((t) => t.channel === c));
  const rows = tasks.filter((t) => (!chan || t.channel === chan) && (!eng || t.assistants.includes(eng)) && byPrio(t.priority, t.start, t.done, t.state) && (!who || (who === 'none' ? !t.assignee : t.assignee === who)));
  const qrows = questions.filter((x) => (!qkind || x.kind === qkind) && byPrio(x.priority, x.start));
  const qEngines = ENGINES.filter((e) => qrows.some((x) => x.cells[e]));
  const openTask = (key) => setOpen({ type: 'task', key });
  const openQ = (key) => setOpen({ type: 'q', key });

  return (
    <div className="rb">
      <div className="rt-bar">
        <div className="rt-tabs" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={view === 'tasks'} className={view === 'tasks' ? 'on' : ''} onClick={() => setView('tasks')}>Tasks <span>{tasks.length}</span></button>
          <button type="button" role="tab" aria-selected={view === 'questions'} className={view === 'questions' ? 'on' : ''} onClick={() => setView('questions')}>By prompt <span>{questions.length}</span></button>
        </div>
        <span className="rt-count">{view === 'tasks' ? `${rows.length} of ${tasks.length} tasks` : `${qrows.length} of ${questions.length}`}</span>
        {view === 'tasks' ? (
          <>
            <label>Channel
              <select value={chan} onChange={(e) => setChan(e.target.value)}><option value="">All</option>{channels.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </label>
            <label>For
              <select value={eng} onChange={(e) => setEng(e.target.value)}><option value="">All</option>{ENGINES.map((e) => <option key={e} value={e}>{engineName(e)}</option>)}</select>
            </label>
          </>
        ) : (
          <label>Show
            <select value={qkind} onChange={(e) => setQkind(e.target.value)}><option value="">All</option><option value="question">Assistant questions</option><option value="keyword">Google searches</option></select>
          </label>
        )}
        <label>Priority
          <select value={prio} onChange={(e) => setPrio(e.target.value)}><option value="">All</option><option value="start">Start here</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>{view === 'tasks' ? <><option value="draft">Draft</option><option value="live">Live</option><option value="done">Done</option></> : null}</select>
        </label>
        {view === 'tasks' ? (
          <label>Assignee
            <select value={who} onChange={(e) => setWho(e.target.value)}><option value="">Anyone</option>{PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}<option value="none">Unassigned</option></select>
          </label>
        ) : null}
        {failed ? <span className="rt-fail" role="status">Could not save the assignee. Try again.</span> : null}
      </div>

      {view === 'tasks' ? (
        <div className="rt-wrap">
          <table className="rt">
            <thead><tr><th>Task</th><th>Type</th><th>Channel</th><th>For</th><th>Status</th><th>Assignee</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.key} className={t.done ? 'is-done' : undefined} onClick={() => openTask(t.key)}>
                  <td><button type="button" className="rt-title" title={t.title} onClick={(e) => { e.stopPropagation(); openTask(t.key); }} aria-haspopup="dialog">{t.title}</button></td>
                  <td><Pill kind={t.kind} /></td>
                  <td><Channel channel={t.channel} /></td>
                  <td><For list={t.assistants} /></td>
                  <td><State t={t} /></td>
                  <td onClick={(e) => e.stopPropagation()}><Assignee value={t.assignee} onChange={(v) => assign(t.key, v)} saving={saving === t.key} /></td>
                </tr>
              ))}
              {!rows.length ? <tr className="rt-empty"><td colSpan={6}>No tasks match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rt-wrap">
          <table className="rt rq">
            <thead><tr><th>Question or search</th>{qEngines.map((e) => <th key={e}><span className="asst"><AssistantIcon id={e} size={14} />{assistantName(e)}</span></th>)}<th className="num">Tasks</th><th>Priority</th></tr></thead>
            <tbody>
              {qrows.map((x) => (
                <tr key={x.key} onClick={() => openQ(x.key)}>
                  <td><button type="button" className="rt-title" onClick={(e) => { e.stopPropagation(); openQ(x.key); }} aria-haspopup="dialog">{x.label}</button>{x.start ? <span className="rt-start">Start here</span> : null}</td>
                  {qEngines.map((e) => <td key={e}><Score c={x.cells[e]} /></td>)}
                  <td className="num">{x.tasks || '–'}</td>
                  <td><Prio p={x.priority} /></td>
                </tr>
              ))}
              {!qrows.length ? <tr className="rt-empty"><td colSpan={qEngines.length + 3}>Nothing matches these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}

      <p className="rt-note">
        {view === 'questions' ? 'Each number is answers that recommend us with a link, out of answers collected. For Google it is AI Overviews that link to us. ' : null}
        Built from the run of {baseline.runDate}.{baseline.stale ? ` A newer run (${baseline.latestDate}) exists; the list has not been rebuilt from it yet.` : ''}
      </p>
      <details className="rt-how">
        <summary>How this list is made</summary>
        <ol>
          <li>Every run asks each assistant every tracked question three times, and records which sources it cites.</li>
          <li>Where an assistant does not recommend us in at least half its answers, each source it cited in most of those answers becomes a task.</li>
          <li>The source decides the channel. A list that leaves us out becomes outreach, a review site becomes a listing, a YouTube video becomes a video, and a product page or article becomes a page on our site. A channel that no assistant cited for a question gets no task for it.</li>
          <li>Priority: High is a buying question where ChatGPT does not recommend us{leads?.total ? `, because ChatGPT sent ${leads.chatgpt} of our ${leads.total} leads from AI` : ''}. Medium is a how-to question, a question about a named competitor, or a Google search where we already rank on page one. The rest is Low.</li>
          <li>Before any change to one of our pages, we read the page itself. The task lists only what the page lacks next to the cited pages: tools the assistants name, the wording of the question, a comparison table, how our name is written. If the page lacks nothing, no page task is made.</li>
          <li>For a page on our site, we first look for a page we already have, by its title and the Google searches it ranks for. A close page with real Google traffic (100 or more clicks in 90 days) or a product page is only added to. A close blog page with little traffic can be reworked. If our nearest page is about something else, we write a new page and link to it from the old one.</li>
          <li>“Start here” marks the ten High questions where ChatGPT already links to us or names us, so the step to a full recommendation is smallest.</li>
        </ol>
      </details>

      <Dialog.Root open={!!(curTask || curQ)} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dlg-overlay" />
          <Dialog.Content className="pp rec" aria-describedby={undefined}>
            <div className="dlg-head rb-close"><span />
              <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
            </div>
            {curTask ? <TaskDetail t={curTask} body={detail[id]} failed={loadFailed} questions={questions} openQ={openQ} assign={assign} saving={saving} canPublish={canPublish} publish={publish} publishing={publishing} pubError={pubError} />
              : curQ ? <QuestionDetail x={curQ} body={detail[id]} failed={loadFailed} tasks={tasks} openTask={openTask} />
                : <Dialog.Title className="rb-title">Recommendation</Dialog.Title>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
