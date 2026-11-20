'use client';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

// Navbar button + popup. The popup is the re-run documentation: what a run does, what it needs,
// and the exact prompt that starts one in Claude. Figures are loaded when the popup opens (see /api/run-prompt).
export function RunDialog() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState('idle');

  async function load(open) {
    if (!open) return;
    setFailed(false);
    try {
      const res = await fetch('/api/run-prompt', { cache: 'no-store' });
      if (!res.ok) throw new Error('bad response');
      setData(await res.json());
    } catch { setFailed(true); }
  }

  async function copy() {
    let ok = false;
    try { await navigator.clipboard.writeText(data.prompt); ok = true; } catch { ok = false; }
    setCopied(ok ? 'copied' : 'failed');
    setTimeout(() => setCopied('idle'), 1600);
  }

  const e = data?.estimate, r = data?.running;
  return (
    <Dialog.Root onOpenChange={load}>
      <Dialog.Trigger asChild><button type="button" className="run-btn">Trigger a run</button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="dlg">
          <div className="dlg-head">
            <Dialog.Title className="dlg-title">Trigger a run</Dialog.Title>
            <Dialog.Close asChild><button type="button" className="dlg-x" aria-label="Close">×</button></Dialog.Close>
          </div>
          <Dialog.Description className="dlg-desc">
            Collects fresh ChatGPT answers and Google AI Overviews for every tracked prompt and keyword, then gives you a short summary where every result links to its raw data. Anyone on the team can do this; no setup beyond the two items below.
          </Dialog.Description>

          {r ? <div className="banner">A run is already in progress ({r.run_id}, {r.percent_done}% done). Opening the prompt will report on that run and will not start a second one.</div> : null}

          {e ? (
            <div className="dlg-facts">
              <div><b>{Number(e.chatgpt_answers).toLocaleString('en-IN')}</b><span>ChatGPT answers</span></div>
              <div><b>{Number(e.google_searches).toLocaleString('en-IN')}</b><span>Google searches</span></div>
              <div><b>about {e.minutes} min</b><span>to finish</span></div>
              <div><b>about ${Number(e.approx_cost_usd).toFixed(2)}</b><span>treg credit</span></div>
            </div>
          ) : null}
          {e ? <p className="dlg-note">Based on the last finished run ({e.based_on_run}). These figures update by themselves after every run.</p> : null}

          <h3 className="dlg-h">How it works</h3>
          <ol className="dlg-steps">
            <li><b>Open in Claude.</b> The prompt below opens in a new tab in your own Claude account. Send it.</li>
            <li><b>Claude starts the run</b> and tells you the run id and when to come back. The data collection runs by itself.</li>
            <li><b>Reply “check”</b> when the time is up. Claude checks the brand mentions and writes the summary, with ChatGPT and Google shown separately and source links under every result.</li>
          </ol>

          <h3 className="dlg-h">What you need</h3>
          <ul className="dlg-steps">
            <li>A Claude account with the <b>Supabase connector</b> connected to the project “AI Accountant”.</li>
            <li>Enough treg balance for the run. If it runs out mid-run, the run pauses and resumes after a top-up.</li>
          </ul>

          <h3 className="dlg-h">The prompt</h3>
          {failed ? <p className="dlg-note">Could not load the prompt. Close this popup and try again.</p> : null}
          <pre className="dlg-prompt" tabIndex={0}>{data ? data.prompt : failed ? '' : 'Loading…'}</pre>

          <div className="dlg-actions">
            <a className={`dlg-open${data ? '' : ' disabled'}`} href={data?.href || '#'} target="_blank" rel="noopener noreferrer" aria-disabled={!data}>
              <img src="/logos/claude.svg" alt="" width="14" height="14" />Open in Claude
            </a>
            <button type="button" className="dlg-copy" onClick={copy} disabled={!data} data-state={copied}>
              {copied === 'copied' ? 'Prompt copied' : copied === 'failed' ? 'Copy failed' : 'Copy prompt'}
            </button>
          </div>
          <p className="dlg-note">No Claude access? In n8n, open “AEO Baseline v1 | Orchestrator” and click Execute on “Manual: Start Extra Run”. The results then appear on this dashboard in under an hour. Scheduled runs happen every four days at 06:00 IST without anyone triggering them.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
