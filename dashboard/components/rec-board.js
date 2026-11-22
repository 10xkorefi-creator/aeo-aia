'use client';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AssistantIcon, assistantName } from '@/components/assistant';

// The recommendations board. Rows are individual tasks (one page, one video, one listing), each labelled with its
// channel. Tasks sit under the opportunity they serve, and opportunities are grouped by when to act. Clicking a task
// opens its brief; clicking an opportunity opens the reasoning behind it. Both read top to bottom as an argument
// built on the baseline runs.
const GROUPS = [
  { id: 'start', label: 'Start here', note: 'Our recommendation for Goal 3. The first is the largest gap among buyers who look like our customers. The second is the cheapest to test, because ChatGPT already reads our pages.' },
  { id: 'next', label: 'Next', note: 'Worth doing after the first two, in this order.' },
  { id: 'later', label: 'Later', note: 'Real gaps, but slower or lower in value. Revisit once the first pages are live.' },
  { id: 'skip', label: 'Not now', note: 'Looked at and deliberately left alone.' },
  { id: 'tracking', label: 'Tracking fix', note: 'Not an opportunity: a fix to what we measure.' },
];
const BARS = { start: 3, next: 2, later: 1, skip: 0, tracking: 0 };
const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
// channels in the order shown in the filter; `site` gives the logo for channels that are a platform
const CHANNELS = [
  { id: 'Website' }, { id: 'YouTube', site: 'youtube.com' }, { id: 'LinkedIn', site: 'linkedin.com' }, { id: 'Instagram', site: 'instagram.com' },
  { id: 'Facebook', site: 'facebook.com' }, { id: 'Reddit', site: 'reddit.com' }, { id: 'X', site: 'x.com' },
  { id: 'Directory' }, { id: 'Review site' }, { id: 'Outreach' }, { id: 'Tracking' },
];
const short = (u) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + (x.pathname === '/' ? '' : x.pathname.replace(/\/$/, '')) + (x.search && x.hostname.includes('youtube') ? x.search : ''); } catch { return u; } };
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Priority mark, three bars like a signal meter: more filled bars = do sooner
function Priority({ grp }) {
  const n = BARS[grp] ?? 0;
  if (grp === 'skip') return <svg className="rb-pri" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2.6" /></svg>;
  if (grp === 'tracking') return <svg className="rb-pri" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /></svg>;
  return (
    <svg className="rb-pri" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {[0, 1, 2].map((i) => <rect key={i} x={2 + i * 4.5} y={10 - i * 3.2} width="3" height={3.5 + i * 3.2} rx="1" fill="currentColor" opacity={i < n ? 1 : 0.22} />)}
    </svg>
  );
}

// Open circle = to do. The same mark Linear-style boards use for an unstarted task.
const Todo = () => <svg className="rb-todo" width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;

// Channel mark: the platform's own logo where there is one, a plain glyph otherwise
function ChannelIcon({ channel, size = 15 }) {
  const c = CHANNELS.find((x) => x.id === channel);
  if (c?.site) return <img className="rb-chan-ico" src={`https://www.google.com/s2/favicons?domain=${c.site}&sz=64`} alt="" width={size} height={size} />;
  const s = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'rb-chan-ico glyph' };
  if (channel === 'Website') return <svg {...s}><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" /></svg>;
  if (channel === 'Outreach') return <svg {...s}><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5 8 9l5.5-4.5" /></svg>;
  if (channel === 'Tracking') return <svg {...s}><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.6" /></svg>;
  return <svg {...s}><path d="M3 4h10M3 8h10M3 12h6" /></svg>;
}
const Channel = ({ channel }) => <span className="rb-chan"><ChannelIcon channel={channel} />{channel}</span>;

function Favicon({ domain }) {
  const [bad, setBad] = useState(false);
  return (
    <span className="pp-fav pp-fav-none" aria-hidden="true">{(domain || '?').charAt(0).toUpperCase()}
      {!bad && domain ? <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`} alt="" width="20" height="20" onError={() => setBad(true)} /> : null}
    </span>
  );
}

const Chip = ({ label, value }) => (value ? <span className="rb-chip"><i>{label}</i>{value}</span> : null);
const Bullets = ({ items }) => <ul className="rb-bullets">{(items || []).map((t, i) => <li key={i}>{t}</li>)}</ul>;

// One assistant's result on one question: answers that recommend us, with what sits behind it
function Cell({ c }) {
  if (!c) return <span className="rb-na">not asked</span>;
  const before = c.before || [];
  return (
    <div className="rb-cell">
      <b className={c.rec > 0 ? 'hit' : 'miss'}>{c.rec}/{c.n}</b>
      <span>named {c.named} · linked {c.linked}</span>
      {before.length ? <span className="rb-before" title="Answers that recommended us in earlier runs, oldest first">earlier: {before.map((b) => `${b.rec}/${b.n}`).join(', ')}</span> : null}
    </div>
  );
}

// The live evidence: the tracked questions and Google keywords behind an opportunity or a task
function Evidence({ r, baseline, heading }) {
  const engines = ENGINES.filter((e) => r.questions.some((qn) => qn.cells[e]));
  return (
    <>
      {r.questions.length ? (
        <>
          <h4>{heading ? 'Tracked questions' : 'The questions behind this'}, in the latest run ({baseline.runDate})</h4>
          <div className="table-wrap">
            <table className="rb-table">
              <thead><tr><th>Question we ask</th>{engines.map((e) => <th key={e} className="num"><span className="asst"><AssistantIcon id={e} size={14} />{assistantName(e)}</span></th>)}</tr></thead>
              <tbody>{r.questions.map((qn) => <tr key={qn.key}><td>{qn.text}</td>{engines.map((e) => <td key={e} className="num"><Cell c={qn.cells[e]} /></td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="rb-foot">Each cell is answers that recommend us with a link, out of answers collected. “Named” counts answers that mention AI Accountant as a product; “linked” counts answers that cite aiaccountant.com.</p>
        </>
      ) : null}
      {r.keywords.length ? (
        <>
          <h4>{heading ? 'Tracked Google keywords' : 'The Google keywords behind this'}, in the latest run ({baseline.runDate})</h4>
          <div className="table-wrap">
            <table className="rb-table">
              <thead><tr><th>Keyword</th><th className="num">Searches a month</th><th className="num">AI Overview links to us</th><th className="num">Our normal Google rank</th></tr></thead>
              <tbody>{r.keywords.map((k) => (
                <tr key={k.id}><td>{k.keyword}</td><td className="num">{k.volume === null ? '–' : k.volume.toLocaleString('en-IN')}</td>
                  <td className="num"><div className="rb-cell"><b className={k.cited > 0 ? 'hit' : 'miss'}>{k.cited}/{k.shown}</b>{k.before.length ? <span className="rb-before">earlier: {k.before.map((x) => `${x.cited}/${x.shown}`).join(', ')}</span> : null}</div></td>
                  <td className="num">{k.rank === null ? 'not on page one' : k.rank}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className="rb-foot">“Links to us” is searches whose AI Overview linked to aiaccountant.com, out of searches that showed an AI Overview.</p>
        </>
      ) : null}
    </>
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

// ---- the brief for one task
function TaskDetail({ t, rec, baseline, openRec }) {
  const b = t.body || {};
  return (
    <>
      <div className="rb-kicker"><Todo /><span>{t.key}</span><span className="rb-dot">·</span><span>{t.status}</span><span className="rb-dot">·</span><span>task</span></div>
      <Dialog.Title className="rb-title">{t.title}</Dialog.Title>
      <Dialog.Description className="rb-lead">One task from {rec?.key}: {rec?.title}.</Dialog.Description>
      <div className="rb-chips">
        <span className="rb-chip"><i>Channel</i><Channel channel={t.channel} /></span>
        <Chip label="What it is" value={t.kind} /><Chip label="Size" value={t.effort} />
        {rec ? <button type="button" className="rb-chip rb-link" onClick={() => openRec(rec.key)}><i>Part of</i>{rec.key}<span aria-hidden="true">→</span></button> : null}
      </div>

      <section className="rb-sec">
        <h3>Why this task</h3>
        <Bullets items={b.why} />
      </section>

      <section className="rb-sec rb-do">
        <h3>What to make</h3>
        <ol className="rb-steps">{(b.include || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
      </section>

      {b.model?.length ? (
        <section className="rb-sec">
          <h3>Model it on what is cited today</h3>
          <Pages list={b.model} />
        </section>
      ) : null}

      {t.questions.length || t.keywords.length ? (
        <section className="rb-sec">
          <h3>What it should move</h3>
          <Evidence r={t} baseline={baseline} heading />
        </section>
      ) : null}

      <section className="rb-sec">
        <h3>Done when</h3>
        <Bullets items={b.done} />
      </section>

      {rec ? (
        <section className="rb-sec">
          <h3>The opportunity it belongs to</h3>
          <p>{rec.summary}</p>
          <button type="button" className="rb-open-rec" onClick={() => openRec(rec.key)}><Priority grp={rec.grp} />{rec.key}: read the full reasoning<span aria-hidden="true">→</span></button>
        </section>
      ) : null}

      <p className="rb-foot rb-end">The points under “Why this task” were read from the run tables on 22/11/2026; the tables are read live and show run {baseline.runId}.</p>
    </>
  );
}

// ---- the reasoning for one opportunity
function RecDetail({ r, tasks, baseline, openTask }) {
  const b = r.body || {};
  const g = GROUPS.find((x) => x.id === r.grp);
  return (
    <>
      <div className="rb-kicker"><Priority grp={r.grp} /><span>{r.key}</span><span className="rb-dot">·</span><span>{g?.label}</span><span className="rb-dot">·</span><span>opportunity</span></div>
      <Dialog.Title className="rb-title">{r.title}</Dialog.Title>
      <Dialog.Description className="rb-lead">{r.summary}</Dialog.Description>
      <div className="rb-chips">
        <Chip label="Topic" value={r.topic} /><Chip label="Buyer value" value={r.value} /><Chip label="How close we are" value={r.closeness} />
        {r.assistants.length ? <span className="rb-chip"><i>Where</i>{r.assistants.map((a) => <span className="rb-asst" key={a}><AssistantIcon id={a} size={14} />{assistantName(a)}</span>)}</span> : null}
      </div>

      <section className="rb-sec"><h3>The opportunity</h3><p>{b.opportunity}</p></section>

      <section className="rb-sec">
        <h3>What our baseline shows</h3>
        <Bullets items={b.evidence} />
        <Evidence r={r} baseline={baseline} />
      </section>

      {b.winners?.length ? <section className="rb-sec"><h3>Who is winning today</h3><Pages list={b.winners} /></section> : null}

      <section className="rb-sec"><h3>Why they win</h3><Bullets items={b.why} /></section>

      <section className="rb-sec rb-do">
        <h3>What we should do</h3>
        {tasks.length ? (
          <>
            <p className="rb-do-lead">{tasks.length} task{tasks.length === 1 ? '' : 's'}. Open one for its brief.</p>
            <ul className="rb-tasklist">
              {tasks.map((t) => (
                <li key={t.key}><button type="button" onClick={() => openTask(t.key)}><Todo /><span className="rb-id">{t.key}</span><span className="rb-tl-title">{t.title}</span><Channel channel={t.channel} /></button></li>
              ))}
            </ul>
          </>
        ) : <ol className="rb-steps">{(b.actions || []).map((x, i) => <li key={i}>{x}</li>)}</ol>}
      </section>

      <section className="rb-sec"><h3>Why this should change the answer</h3><Bullets items={b.change} /></section>
      <section className="rb-sec"><h3>How we will know it worked</h3><Bullets items={b.measure} /></section>
      <section className="rb-sec"><h3>Risks and what we do not know</h3><Bullets items={b.risks} /></section>

      {r.pages.length ? (
        <section className="rb-sec">
          <details className="rb-more">
            <summary>Every page cited for these {r.questions.length ? 'questions' : 'keywords'} in the latest run (top {r.pages.length})</summary>
            <ul className="rb-pages">
              {r.pages.map((p) => (
                <li key={p.url}>
                  <Favicon domain={p.domain} />
                  <a href={p.url} target="_blank" rel="noopener noreferrer nofollow"><b>{p.domain}</b><span>{short(p.url).replace(p.domain, '') || '/'}</span></a>
                  <div className="rb-counts">
                    {p.ours ? <em className="pp-tag comp">ours</em> : null}
                    {['chatgpt', 'gemini', 'perplexity', 'google'].filter((e) => p[e] > 0).map((e) => <span key={e}><AssistantIcon id={e} size={13} />{p[e]}</span>)}
                  </div>
                </li>
              ))}
            </ul>
            <p className="rb-foot">The number beside each logo is how many answers (or Google searches) cited that page.</p>
          </details>
        </section>
      ) : null}

      <p className="rb-foot rb-end">Written from run {r.basedOn}. The points under “What our baseline shows” were read from the run tables on 22/11/2026; the tables above are read live and show run {baseline.runId}.</p>
    </>
  );
}

export function RecBoard({ items, tasks, baseline, initial }) {
  const valid = (k) => items.some((r) => r.key === k) || tasks.some((t) => t.key === k);
  const [open, setOpen] = useState(valid(initial) ? initial : null);
  const [chan, setChan] = useState('all');
  const curTask = tasks.find((t) => t.key === open) || null;
  const curRec = items.find((r) => r.key === open) || null;
  const recOf = (t) => items.find((r) => r.key === t.rec);
  const shown = (t) => chan === 'all' || t.channel === chan;
  const counts = Object.fromEntries(CHANNELS.map((c) => [c.id, tasks.filter((t) => t.channel === c.id).length]));

  // keep the address shareable: ?task=T-02 or ?rec=REC-1 opens that panel
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('rec'); url.searchParams.delete('task');
    if (open) url.searchParams.set(open.startsWith('T-') ? 'task' : 'rec', open);
    window.history.replaceState(null, '', url);
  }, [open]);

  const targets = (t) => [t.questions.length ? `${t.questions.length} question${t.questions.length === 1 ? '' : 's'}` : null, t.keywords.length ? `${t.keywords.length} keyword${t.keywords.length === 1 ? '' : 's'}` : null].filter(Boolean).join(' · ');

  return (
    <div className="rb">
      <div className="rb-base">
        <div><b>Built from</b> {baseline.runs} baseline runs, {baseline.from} to {baseline.to}: {baseline.chatgpt} of ChatGPT and Google, {baseline.gemini} of Gemini and Perplexity · {baseline.prompts} questions and {baseline.keywords} Google keywords, asked from India. <b>{items.length} opportunities, {tasks.length} tasks.</b></div>
        <details>
          <summary>How we ranked these, and how tasks were chosen</summary>
          <ol>
            <li><b>Buyer value.</b> Does the question match who actually buys: Tally users, business owners, data entry and reconciliation problems (from our HubSpot customers)? For Google, how many searches a month?</li>
            <li><b>Which assistant.</b> ChatGPT first, because it sends 75 of our 94 AI leads. Then Google, Gemini, and Perplexity last because it swings most between runs.</li>
            <li><b>How close we are.</b> An assistant that already reads our page is closer than one that has never found us.</li>
            <li><b>Effort.</b> Editing a page comes before writing one, which comes before getting onto someone else&apos;s site.</li>
            <li><b>Stability.</b> The gap has to show in more than one run, so we do not chase a one-day swing.</li>
          </ol>
          <p><b>Tasks and channels.</b> Each opportunity is broken into individual tasks: one page, one video, one post, one listing. A task on a channel exists only where our runs show that channel being cited for those questions. For example, Google&apos;s AI Overviews cited a YouTube video in 238 of the 369 AI Overviews it showed on our keywords, so there are video tasks for those keywords; where a channel was not cited, there is no task for it.</p>
          <p>The method follows what the AEO vendors we studied do (most closely The Prompting Company): find the questions where others are named and we are not, read the pages cited for them, then publish or earn the page that is missing.</p>
        </details>
      </div>

      <div className="rb-filter" role="group" aria-label="Filter tasks by channel">
        <button type="button" className={chan === 'all' ? 'on' : ''} aria-pressed={chan === 'all'} onClick={() => setChan('all')}>All tasks<span>{tasks.length}</span></button>
        {CHANNELS.filter((c) => counts[c.id] > 0).map((c) => (
          <button type="button" key={c.id} className={chan === c.id ? 'on' : ''} aria-pressed={chan === c.id} onClick={() => setChan(chan === c.id ? 'all' : c.id)}><ChannelIcon channel={c.id} size={14} />{c.id}<span>{counts[c.id]}</span></button>
        ))}
      </div>

      {GROUPS.map((g) => {
        const recs = items.filter((r) => r.grp === g.id).map((r) => ({ r, ts: tasks.filter((t) => t.rec === r.key) }))
          .filter(({ ts }) => chan === 'all' || ts.some(shown));
        if (!recs.length) return null;
        return (
          <section className="rb-group" key={g.id}>
            <header className="rb-ghead"><Priority grp={g.id} /><h2>{g.label}</h2><span className="rb-count">{recs.reduce((n, x) => n + x.ts.filter(shown).length, 0)} tasks</span><p>{g.note}</p></header>
            <div className="rb-list">
              {recs.map(({ r, ts }) => (
                <div className="rb-opp" key={r.key}>
                  <button type="button" className="rb-opp-head" onClick={() => setOpen(r.key)} aria-haspopup="dialog">
                    <span className="rb-id">{r.key}</span>
                    <span className="rb-main"><b>{r.title}</b><span>{r.summary}</span></span>
                    <span className="rb-head">{r.headline}</span>
                    <span className="rb-why">Why<span aria-hidden="true">→</span></span>
                  </button>
                  {ts.filter(shown).length ? (
                    <ul className="rb-tasks">
                      {ts.filter(shown).map((t) => (
                        <li key={t.key}>
                          <button type="button" className="rb-task" onClick={() => setOpen(t.key)} aria-haspopup="dialog">
                            <Todo />
                            <span className="rb-id">{t.key}</span>
                            <span className="rb-task-title">{t.title}</span>
                            <span className="rb-task-meta">{targets(t)}</span>
                            <span className="rb-tag muted">{t.kind}</span>
                            <Channel channel={t.channel} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : chan === 'all' ? <p className="rb-notask">No tasks: {r.grp === 'skip' ? 'deliberately left alone. Open it to see why.' : 'open it for the reasoning.'}</p> : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Dialog.Root open={!!(curTask || curRec)} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dlg-overlay" />
          <Dialog.Content className="pp rec">
            <div className="dlg-head rb-close"><span />
              <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
            </div>
            {curTask ? <TaskDetail t={curTask} rec={recOf(curTask)} baseline={baseline} openRec={setOpen} />
              : curRec ? <RecDetail r={curRec} tasks={tasks.filter((t) => t.rec === curRec.key)} baseline={baseline} openTask={setOpen} />
                : <Dialog.Title className="rb-title">Recommendation</Dialog.Title>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
