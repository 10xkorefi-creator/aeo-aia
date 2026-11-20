'use client';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

// A tracked question that opens a side panel on the right: the question, how each assistant answered it,
// and every page those answers cited, grouped as our pages, competitors' pages and other websites.
const NAMES = { chatgpt: 'ChatGPT', gemini: 'Gemini', perplexity: 'Perplexity' };
const COLOR = { chatgpt: 'var(--asst-chatgpt)', gemini: 'var(--asst-gemini)', perplexity: 'var(--asst-perplexity)' };
const short = (u) => { try { const x = new URL(u); return (x.pathname === '/' ? '/' : x.pathname.replace(/\/$/, '')) + (x.search || ''); } catch { return u; } };

const LOGO = { chatgpt: '/logos/openai.svg', gemini: '/logos/gemini.svg', perplexity: '/logos/perplexity.svg' };
const isVideo = (r) => /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(r.domain || '');
const brandName = (b) => String(b || '').replace(/\s*\(.*$/, '');

// The site's small icon, loaded from Google's public favicon service; falls back to the first letter of the domain.
function Favicon({ domain }) {
  const [bad, setBad] = useState(false);
  // the letter sits underneath, so a slow or missing icon never leaves an empty gap
  return (
    <span className="pp-fav pp-fav-none" aria-hidden="true">{(domain || '?').charAt(0).toUpperCase()}
      {!bad && domain ? <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`} alt="" width="20" height="20" onError={() => setBad(true)} /> : null}
    </span>
  );
}

// One row per cited page: icon, domain, the address underneath, and a label on the right for videos and competitors' pages.
function Links({ rows, showDomain, max = 8 }) {
  const item = (r) => (
    <li key={r.url}>
      <Favicon domain={r.domain} />
      <a href={r.url} target="_blank" rel="noopener noreferrer nofollow">
        <b>{r.domain}<i aria-hidden="true">↗</i></b>
        <span>{isVideo(r) && r.label ? r.label : (showDomain ? r.url : short(r.url))}</span>
      </a>
      <div className="pp-tags">
        {isVideo(r) ? <em className="pp-tag video">Video</em> : null}
        {showDomain && r.brand_key && r.brand_key !== 'aia' ? <em className="pp-tag comp">{brandName(r.brand)}</em> : null}
      </div>
    </li>
  );
  return (
    <>
      <ul className="pp-links">{rows.slice(0, max).map(item)}</ul>
      {rows.length > max ? <details className="pp-more"><summary>{rows.length - max} more</summary><ul className="pp-links">{rows.slice(max).map(item)}</ul></details> : null}
    </>
  );
}

// One assistant: our pages, then every other page it cited (competitors' pages are labelled)
function AssistantBlock({ engine, a, pages }) {
  const mine = pages.filter((r) => Number(r[engine]) > 0).sort((x, y) => Number(y[engine]) - Number(x[engine]));
  const ours = mine.filter((r) => r.brand_key === 'aia');
  const cited = mine.filter((r) => r.brand_key !== 'aia');
  return (
    <section className="pp-sec">
      <h3 className="pp-sec-h"><img src={LOGO[engine]} alt="" width="18" height="18" />{NAMES[engine]}
        <span>{a ? `${a.rec} of ${a.n} answers recommend us with a link` : 'not asked in this run'}</span></h3>
      {a ? (
        <>
          <div className="pp-lab own">Our pages</div>
          {ours.length ? <Links rows={ours} /> : <p className="pp-none">None cited.</p>}
          <div className="pp-lab">Cited pages <span>{cited.length}</span></div>
          {cited.length ? <Links rows={cited} showDomain /> : <p className="pp-none">None cited.</p>}
        </>
      ) : null}
    </section>
  );
}

export function PromptPanel({ run, promptKey, text, engines }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  async function load(open) {
    if (!open || data) return;
    setFailed(false);
    try {
      const res = await fetch(`/api/prompt-sources?run=${encodeURIComponent(run)}&prompt=${encodeURIComponent(promptKey)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('bad response');
      setData(await res.json());
    } catch { setFailed(true); }
  }

  return (
    <Dialog.Root onOpenChange={load}>
      <Dialog.Trigger asChild><button type="button" className="pp-open">{text}</button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="pp">
          <div className="dlg-head">
            <div className="pp-kicker">Question {promptKey} · run {run}</div>
            <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
          </div>
          <Dialog.Title className="pp-title">{text}</Dialog.Title>
          <Dialog.Description className="pp-desc">The pages each assistant cited when answering this question.</Dialog.Description>

          {failed ? <p className="hint">Could not load this question. Close and try again.</p> : null}
          {!data && !failed ? <p className="hint">Loading…</p> : null}
          {data ? engines.map((e) => <AssistantBlock key={e} engine={e} a={data.assistants.find((x) => x.engine === e)} pages={data.pages || []} />) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// The same panel for a tracked Google keyword: the pages Google's AI Overview cited for it.
export function KeywordPanel({ run, keywordId, text }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  async function load(open) {
    if (!open || data) return;
    setFailed(false);
    try {
      const res = await fetch(`/api/keyword-sources?run=${encodeURIComponent(run)}&keyword=${encodeURIComponent(keywordId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('bad response');
      setData(await res.json());
    } catch { setFailed(true); }
  }

  const pages = data?.pages || [];
  const ours = pages.filter((r) => r.brand_key === 'aia');
  const cited = pages.filter((r) => r.brand_key !== 'aia');
  const sm = data?.summary;

  return (
    <Dialog.Root onOpenChange={load}>
      <Dialog.Trigger asChild><button type="button" className="pp-open">{text}</button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="pp">
          <div className="dlg-head">
            <div className="pp-kicker">Keyword {keywordId} · run {run}</div>
            <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
          </div>
          <Dialog.Title className="pp-title">{text}</Dialog.Title>
          <Dialog.Description className="pp-desc">The pages Google&apos;s AI Overview cited when this keyword was searched.</Dialog.Description>

          {failed ? <p className="hint">Could not load this keyword. Close and try again.</p> : null}
          {!data && !failed ? <p className="hint">Loading…</p> : null}
          {data ? (
            <section className="pp-sec">
              <h3 className="pp-sec-h"><img src="/logos/google.svg" alt="" width="18" height="18" />Google AI Overview
                <span>{sm ? (Number(sm.shown) > 0 ? `linked to us in ${sm.linked} of ${sm.shown} searches that showed an AI Overview` : `no AI Overview shown in ${sm.searches} searches`) : ''}</span></h3>
              <div className="pp-lab own">Our pages</div>
              {ours.length ? <Links rows={ours} /> : <p className="pp-none">None cited.</p>}
              <div className="pp-lab">Cited pages <span>{cited.length}</span></div>
              {cited.length ? <Links rows={cited} showDomain max={12} /> : <p className="pp-none">None cited.</p>}
            </section>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
