'use client';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AssistantIcon, assistantName } from '@/components/assistant';

// The recommendations list: one row per task, in priority order. Clicking a row opens a short brief
// (why, what to make, an example, how we will know). The numbers behind it are one click further in.
const PEOPLE = ['Wasif Kareem', 'Devansh Saini'];
const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const SITES = { YouTube: 'youtube.com', LinkedIn: 'linkedin.com', Instagram: 'instagram.com', Facebook: 'facebook.com', Reddit: 'reddit.com', X: 'x.com' };
const CHANNEL_ORDER = ['Website', 'YouTube', 'LinkedIn', 'Instagram', 'Facebook', 'Reddit', 'X', 'Directory', 'Review site', 'Outreach', 'Tracking'];
const PRIORITY = { start: 'High', next: 'Medium', later: 'Low', skip: 'Low', tracking: 'Low' };
const RANK = { High: 0, Medium: 1, Low: 2 };
const short = (u) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + (x.pathname === '/' ? '' : x.pathname.replace(/\/$/, '')) + (x.search && x.hostname.includes('youtube') ? x.search : ''); } catch { return u; } };
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

// What kind of work a task is, in two plain columns
function typeOf(kind = '') {
  if (/^new page/i.test(kind)) return 'New content';
  if (/^edit/i.test(kind)) return 'Update a page';
  if (/video|short|reel|post|article|comment/i.test(kind)) return 'Social and video';
  if (/listing|profile/i.test(kind)) return 'Listing';
  if (/email/i.test(kind)) return 'Outreach';
  return 'Tracking';
}
function contentOf(kind = '') {
  if (/page/i.test(kind)) return 'Page';
  if (/short/i.test(kind)) return 'Short video';
  if (/video post/i.test(kind)) return 'Video post';
  if (/video/i.test(kind)) return 'Video';
  if (/reel/i.test(kind)) return 'Reel';
  if (/article/i.test(kind)) return 'Article';
  if (/post/i.test(kind)) return 'Post';
  if (/comment/i.test(kind)) return 'Comment';
  if (/listing/i.test(kind)) return 'Listing';
  if (/profile/i.test(kind)) return 'Profile';
  if (/email/i.test(kind)) return 'Email';
  return 'Data change';
}
const TYPE_CLASS = { 'New content': 'new', 'Update a page': 'upd', 'Social and video': 'soc', Listing: 'lst', Outreach: 'out', Tracking: 'trk' };

function ChannelIcon({ channel, size = 15 }) {
  if (SITES[channel]) return <img className="rb-chan-ico" src={`https://www.google.com/s2/favicons?domain=${SITES[channel]}&sz=64`} alt="" width={size} height={size} />;
  const s = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'rb-chan-ico glyph' };
  if (channel === 'Website') return <svg {...s}><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" /></svg>;
  if (channel === 'Outreach') return <svg {...s}><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5 8 9l5.5-4.5" /></svg>;
  if (channel === 'Tracking') return <svg {...s}><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.6" /></svg>;
  return <svg {...s}><path d="M3 4h10M3 8h10M3 12h6" /></svg>;
}
const Channel = ({ channel }) => <span className="rt-chan"><ChannelIcon channel={channel} />{channel}</span>;
const Pill = ({ kind }) => <span className={`rt-pill ${TYPE_CLASS[typeOf(kind)]}`}>{typeOf(kind)}</span>;
const Prio = ({ p }) => <span className={`rt-prio ${p.toLowerCase()}`}>{p}</span>;

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

// The numbers behind a task or an opportunity, read live from the runs. Kept out of the way until asked for.
function Cell({ c }) {
  if (!c) return <span className="rb-na">not asked</span>;
  return <b className={c.rec > 0 ? 'hit' : 'miss'}>{c.rec}/{c.n}</b>;
}
function Data({ r, baseline }) {
  const engines = ENGINES.filter((e) => r.questions.some((qn) => qn.cells[e]));
  if (!r.questions.length && !r.keywords.length) return null;
  return (
    <details className="rb-more">
      <summary>See the data behind this</summary>
      {r.questions.length ? (
        <>
          <div className="table-wrap">
            <table className="rb-table">
              <thead><tr><th>Question we ask the assistants</th>{engines.map((e) => <th key={e} className="num"><span className="asst"><AssistantIcon id={e} size={14} />{assistantName(e)}</span></th>)}</tr></thead>
              <tbody>{r.questions.map((qn) => <tr key={qn.key}><td>{qn.text}</td>{engines.map((e) => <td key={e} className="num"><Cell c={qn.cells[e]} /></td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="rb-foot">Answers that recommend us with a link, out of answers collected, in the run of {baseline.runDate}.</p>
        </>
      ) : null}
      {r.keywords.length ? (
        <>
          <div className="table-wrap">
            <table className="rb-table">
              <thead><tr><th>Google keyword</th><th className="num">Searches a month</th><th className="num">AI Overview links to us</th></tr></thead>
              <tbody>{r.keywords.map((k) => (
                <tr key={k.id}><td>{k.keyword}</td><td className="num">{k.volume === null ? '–' : k.volume.toLocaleString('en-IN')}</td>
                  <td className="num"><b className={k.cited > 0 ? 'hit' : 'miss'}>{k.cited}/{k.shown}</b></td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className="rb-foot">Searches whose AI Overview linked to our site, out of searches that showed one.</p>
        </>
      ) : null}
    </details>
  );
}

function Pages({ list }) {
  return (
    <ul className="rb-winners">
      {list.map((w) => (
        <li key={w.url}>
          <Favicon domain={host(w.url)} />
          <div>
            {w.who ? <b>{w.who}</b> : null}
            <a href={w.url} target="_blank" rel="noopener noreferrer nofollow">{short(w.url)}<i aria-hidden="true"> ↗</i></a>
            <p>{w.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---- one task: why, what to make, an example, how we will know
function TaskDetail({ t, rec, baseline, openRec, assign, saving }) {
  const b = t.body || {};
  return (
    <>
      <div className="rb-kicker"><span>{t.key}</span></div>
      <Dialog.Title className="rb-title">{t.title}</Dialog.Title>
      <div className="rt-meta">
        <Channel channel={t.channel} /><Pill kind={t.kind} /><span className="rt-plain">{contentOf(t.kind)}</span><Prio p={t.priority} />
        <span className="rt-meta-assign"><i>Assignee</i><Assignee value={t.assignee} onChange={(v) => assign(t.key, v)} saving={saving === t.key} /></span>
      </div>

      <section className="rb-sec"><h3>Why</h3><Bullets items={(b.why || []).slice(0, 2)} /></section>
      <section className="rb-sec rb-do"><h3>What to make</h3><ol className="rb-steps">{(b.include || []).slice(0, 4).map((x, i) => <li key={i}>{x}</li>)}</ol></section>
      {b.model?.length ? <section className="rb-sec"><h3>Example to follow</h3><Pages list={b.model.slice(0, 1)} /></section> : null}
      <section className="rb-sec"><h3>We will know it worked when</h3><Bullets items={(b.done || []).slice(0, 1)} /></section>

      <section className="rb-sec rb-extra">
        <Data r={t} baseline={baseline} />
        {rec ? <button type="button" className="rb-open-rec" onClick={() => openRec(rec.key)}>Full reasoning: {rec.title}<span aria-hidden="true">→</span></button> : null}
      </section>
    </>
  );
}

// ---- the reasoning behind a group of tasks
function RecDetail({ r, tasks, baseline, openTask }) {
  const b = r.body || {};
  return (
    <>
      <div className="rb-kicker"><span>{r.key}</span><span className="rb-dot">·</span><span>the reasoning</span></div>
      <Dialog.Title className="rb-title">{r.title}</Dialog.Title>
      <Dialog.Description className="rb-lead">{b.opportunity}</Dialog.Description>

      <section className="rb-sec"><h3>What our runs show</h3><Bullets items={(b.evidence || []).slice(0, 4)} /></section>
      {b.winners?.length ? <section className="rb-sec"><h3>Who is winning today</h3><Pages list={b.winners.slice(0, 3)} /></section> : null}
      <section className="rb-sec"><h3>Why they win</h3><Bullets items={b.why} /></section>
      <section className="rb-sec rb-do">
        <h3>What we should do</h3>
        {tasks.length ? (
          <ul className="rb-tasklist">
            {tasks.map((t) => <li key={t.key}><button type="button" onClick={() => openTask(t.key)}><span className="rb-tl-title">{t.title}</span><Channel channel={t.channel} /></button></li>)}
          </ul>
        ) : <ol className="rb-steps">{(b.actions || []).map((x, i) => <li key={i}>{x}</li>)}</ol>}
      </section>
      <section className="rb-sec"><h3>Why this should work</h3><Bullets items={(b.change || []).slice(0, 2)} /></section>
      <section className="rb-sec"><h3>We will know it worked when</h3><Bullets items={(b.measure || []).slice(0, 1)} /></section>
      <section className="rb-sec"><h3>What we are not sure of</h3><Bullets items={(b.risks || []).slice(0, 2)} /></section>
      <section className="rb-sec rb-extra"><Data r={r} baseline={baseline} /></section>
    </>
  );
}

export function RecBoard({ items, tasks: initialTasks, baseline, initial }) {
  const [tasks, setTasks] = useState(() => initialTasks.map((t) => ({ ...t, priority: PRIORITY[items.find((r) => r.key === t.rec)?.grp] || 'Low' })));
  const valid = (k) => items.some((r) => r.key === k) || tasks.some((t) => t.key === k);
  const [open, setOpen] = useState(valid(initial) ? initial : null);
  const [chan, setChan] = useState('');
  const [who, setWho] = useState('');
  const [saving, setSaving] = useState(null);
  const [failed, setFailed] = useState(false);
  const curTask = tasks.find((t) => t.key === open) || null;
  const curRec = items.find((r) => r.key === open) || null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('rec'); url.searchParams.delete('task');
    if (open) url.searchParams.set(open.startsWith('T-') ? 'task' : 'rec', open);
    window.history.replaceState(null, '', url);
  }, [open]);

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

  const channels = CHANNEL_ORDER.filter((c) => tasks.some((t) => t.channel === c));
  const rows = tasks.filter((t) => (!chan || t.channel === chan) && (!who || (who === 'none' ? !t.assignee : t.assignee === who)))
    .sort((a, b) => RANK[a.priority] - RANK[b.priority]);

  return (
    <div className="rb">
      <div className="rt-bar">
        <span className="rt-count">{rows.length} of {tasks.length} tasks</span>
        <label>Channel
          <select value={chan} onChange={(e) => setChan(e.target.value)}><option value="">All</option>{channels.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label>Assignee
          <select value={who} onChange={(e) => setWho(e.target.value)}><option value="">Anyone</option>{PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}<option value="none">Unassigned</option></select>
        </label>
        {failed ? <span className="rt-fail" role="status">Could not save the assignee. Try again.</span> : null}
      </div>

      <div className="rt-wrap">
        <table className="rt">
          <thead><tr><th>Task</th><th>Type</th><th>Content</th><th>Channel</th><th>Priority</th><th>Assignee</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.key} onClick={() => setOpen(t.key)}>
                <td><button type="button" className="rt-title" onClick={(e) => { e.stopPropagation(); setOpen(t.key); }} aria-haspopup="dialog">{t.title}</button></td>
                <td><Pill kind={t.kind} /></td>
                <td className="rt-plain">{contentOf(t.kind)}</td>
                <td><Channel channel={t.channel} /></td>
                <td><Prio p={t.priority} /></td>
                <td onClick={(e) => e.stopPropagation()}><Assignee value={t.assignee} onChange={(v) => assign(t.key, v)} saving={saving === t.key} /></td>
              </tr>
            ))}
            {!rows.length ? <tr className="rt-empty"><td colSpan={6}>No tasks match these filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="rt-note">Every task comes from our own runs ({baseline.runs} so far, {baseline.from} to {baseline.to}). Open a task to see why it is on the list.</p>

      <Dialog.Root open={!!(curTask || curRec)} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dlg-overlay" />
          <Dialog.Content className="pp rec" aria-describedby={undefined}>
            <div className="dlg-head rb-close"><span />
              <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
            </div>
            {curTask ? <TaskDetail t={curTask} rec={items.find((r) => r.key === curTask.rec)} baseline={baseline} openRec={setOpen} assign={assign} saving={saving} />
              : curRec ? <RecDetail r={curRec} tasks={tasks.filter((t) => t.rec === curRec.key)} baseline={baseline} openTask={setOpen} />
                : <Dialog.Title className="rb-title">Recommendation</Dialog.Title>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
