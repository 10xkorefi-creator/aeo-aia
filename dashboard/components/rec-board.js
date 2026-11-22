'use client';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AssistantIcon, assistantName } from '@/components/assistant';

// The recommendations list: one compact row per opportunity, grouped by when to do it. Clicking a row opens a side
// panel that reads top to bottom as an argument: the opportunity, what our baseline shows, who wins today and why,
// what to do, why that should change the answer, and how we will know.
const GROUPS = [
  { id: 'start', label: 'Start here', note: 'Our recommendation for Goal 3. The first is the largest gap among buyers who look like our customers. The second is the cheapest to test, because ChatGPT already reads our pages.' },
  { id: 'next', label: 'Next', note: 'Worth doing after the first two, in this order.' },
  { id: 'later', label: 'Later', note: 'Real gaps, but slower or lower in value. Revisit once the first pages are live.' },
  { id: 'skip', label: 'Not now', note: 'Looked at and deliberately left alone.' },
  { id: 'tracking', label: 'Tracking fix', note: 'Not an opportunity: a fix to what we measure.' },
];
const BARS = { start: 3, next: 2, later: 1, skip: 0, tracking: 0 };
const ENGINES = ['chatgpt', 'gemini', 'perplexity'];
const short = (u) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + (x.pathname === '/' ? '' : x.pathname.replace(/\/$/, '')); } catch { return u; } };
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

function Detail({ r, baseline }) {
  const b = r.body || {};
  const g = GROUPS.find((x) => x.id === r.grp);
  const engines = ENGINES.filter((e) => r.questions.some((qn) => qn.cells[e]));
  return (
    <>
      <div className="rb-kicker"><Priority grp={r.grp} /><span>{r.key}</span><span className="rb-dot">·</span><span>{g?.label}</span><span className="rb-dot">·</span><span>{r.status}</span></div>
      <Dialog.Title className="rb-title">{r.title}</Dialog.Title>
      <Dialog.Description className="rb-lead">{r.summary}</Dialog.Description>
      <div className="rb-chips">
        <Chip label="Topic" value={r.topic} /><Chip label="Kind of work" value={r.play} /><Chip label="Effort" value={r.effort} />
        <Chip label="Buyer value" value={r.value} /><Chip label="How close we are" value={r.closeness} />
        {r.assistants.length ? <span className="rb-chip"><i>Where</i>{r.assistants.map((a) => <span className="rb-asst" key={a}><AssistantIcon id={a} size={14} />{assistantName(a)}</span>)}</span> : null}
      </div>

      <section className="rb-sec">
        <h3>The opportunity</h3>
        <p>{b.opportunity}</p>
      </section>

      <section className="rb-sec">
        <h3>What our baseline shows</h3>
        <Bullets items={b.evidence} />
        {r.questions.length ? (
          <>
            <h4>The questions behind this, in the latest run ({baseline.runDate})</h4>
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
            <h4>The Google keywords behind this, in the latest run ({baseline.runDate})</h4>
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
      </section>

      {b.winners?.length ? (
        <section className="rb-sec">
          <h3>Who is winning today</h3>
          <ul className="rb-winners">
            {b.winners.map((w) => (
              <li key={w.url}>
                <Favicon domain={host(w.url)} />
                <div>
                  <b>{w.who}</b>
                  <a href={w.url} target="_blank" rel="noopener noreferrer nofollow">{short(w.url)}<i aria-hidden="true"> ↗</i></a>
                  <p>{w.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rb-sec">
        <h3>Why they win</h3>
        <Bullets items={b.why} />
      </section>

      <section className="rb-sec rb-do">
        <h3>What we should do</h3>
        <ol className="rb-steps">{(b.actions || []).map((t, i) => <li key={i}>{t}</li>)}</ol>
      </section>

      <section className="rb-sec">
        <h3>Why this should change the answer</h3>
        <Bullets items={b.change} />
      </section>

      <section className="rb-sec">
        <h3>How we will know it worked</h3>
        <Bullets items={b.measure} />
      </section>

      <section className="rb-sec">
        <h3>Risks and what we do not know</h3>
        <Bullets items={b.risks} />
      </section>

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

export function RecBoard({ items, baseline, initial }) {
  const [open, setOpen] = useState(items.some((r) => r.key === initial) ? initial : null);
  const cur = items.find((r) => r.key === open) || null;

  // keep the address shareable: /recommendations?rec=REC-2 opens that recommendation
  useEffect(() => {
    const url = new URL(window.location.href);
    if (open) url.searchParams.set('rec', open); else url.searchParams.delete('rec');
    window.history.replaceState(null, '', url);
  }, [open]);

  return (
    <div className="rb">
      <div className="rb-base">
        <div><b>Built from</b> {baseline.runs} baseline runs, {baseline.from} to {baseline.to}: {baseline.chatgpt} of ChatGPT and Google, {baseline.gemini} of Gemini and Perplexity · {baseline.prompts} questions and {baseline.keywords} Google keywords, asked from India.</div>
        <details>
          <summary>How we ranked these</summary>
          <ol>
            <li><b>Buyer value.</b> Does the question match who actually buys: Tally users, business owners, data entry and reconciliation problems (from our HubSpot customers)? For Google, how many searches a month?</li>
            <li><b>Which assistant.</b> ChatGPT first, because it sends 75 of our 94 AI leads. Then Google, Gemini, and Perplexity last because it swings most between runs.</li>
            <li><b>How close we are.</b> An assistant that already reads our page is closer than one that has never found us.</li>
            <li><b>Effort.</b> Editing a page comes before writing one, which comes before getting onto someone else&apos;s site.</li>
            <li><b>Stability.</b> The gap has to show in more than one run, so we do not chase a one-day swing.</li>
          </ol>
          <p>Each recommendation is a topic, not a single question, because one question can flip by chance. The method follows what the AEO vendors we studied do (most closely The Prompting Company): find the questions where others are named and we are not, read the pages cited for them, then publish or earn the page that is missing.</p>
        </details>
      </div>

      {GROUPS.map((g) => {
        const rows = items.filter((r) => r.grp === g.id);
        if (!rows.length) return null;
        return (
          <section className="rb-group" key={g.id}>
            <header className="rb-ghead"><Priority grp={g.id} /><h2>{g.label}</h2><span className="rb-count">{rows.length}</span><p>{g.note}</p></header>
            <ul className="rb-list">
              {rows.map((r) => (
                <li key={r.key}>
                  <button type="button" className="rb-row" onClick={() => setOpen(r.key)} aria-haspopup="dialog">
                    <Priority grp={r.grp} />
                    <span className="rb-id">{r.key}</span>
                    <span className="rb-main"><b>{r.title}</b><span>{r.summary}</span></span>
                    <span className="rb-head">{r.headline}</span>
                    <span className="rb-tags">
                      <span className="rb-tag">{r.topic}</span>
                      <span className="rb-tag muted">{r.effort}</span>
                      <span className="rb-icons">{r.assistants.map((a) => <span key={a} title={assistantName(a)}><AssistantIcon id={a} size={15} /></span>)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Dialog.Root open={!!cur} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dlg-overlay" />
          <Dialog.Content className="pp rec">
            <div className="dlg-head rb-close"><span />
              <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
            </div>
            {cur ? <Detail r={cur} baseline={baseline} /> : <Dialog.Title className="rb-title">Recommendation</Dialog.Title>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
