'use client';
import { useRef, useState } from 'react';

// Button that copies a record link (e.g. a HubSpot contact) to the clipboard instead of navigating to it
export function CopyLink({ href, label = 'Open in HubSpot', logo = '/logos/hubspot.svg' }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  if (!href) return null;

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(href);
      ok = true;
    } catch {
      // Older browsers, or clipboard permission blocked: fall back to a hidden field
      try {
        const el = document.createElement('textarea');
        el.value = href;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        ok = document.execCommand('copy');
        el.remove();
      } catch { ok = false; }
    }
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  }

  const text = state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy failed' : label;
  return (
    <button type="button" className="copylink" data-state={state} onClick={copy} title="Copies this contact's HubSpot link">
      <img src={logo} alt="" width="14" height="14" />
      <span aria-live="polite">{text}</span>
    </button>
  );
}
