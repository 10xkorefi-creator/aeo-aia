'use client';
import { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

// One provider for the whole page: the first tooltip waits a moment, moving on to the next one is instant.
export function TipProvider({ children }) {
  return <Tooltip.Provider delayDuration={250} skipDelayDuration={500}>{children}</Tooltip.Provider>;
}

// The tooltip body. tip = { title, body, now }
//   title: the term being explained
//   body:  plain-language meaning (no numbers that can go stale)
//   now:   optional line with this run's figures, always built from live data by lib/glossary.js
function Body({ tip }) {
  if (typeof tip === 'string') return <span className="tip-body">{tip}</span>;
  return (
    <>
      {tip.title ? <strong className="tip-title">{tip.title}</strong> : null}
      {tip.body ? <span className="tip-body">{tip.body}</span> : null}
      {tip.now ? <span className="tip-now">{tip.now}</span> : null}
    </>
  );
}

function useTip() {
  const [open, setOpen] = useState(false);
  // Radix closes a tooltip when its trigger is clicked. Keeping it open on click makes tooltips usable on touch screens.
  const onClick = (e) => { e.preventDefault(); setOpen(true); };
  return { open, setOpen, onClick };
}

function Content({ tip, side = 'top', align = 'start' }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Content className="tip" side={side} align={align} sideOffset={6} collisionPadding={12}>
        <Body tip={tip} />
      </Tooltip.Content>
    </Tooltip.Portal>
  );
}

// Small "i" button placed next to a label
export function Info({ tip, side, align }) {
  const { open, setOpen, onClick } = useTip();
  if (!tip) return null;
  const name = typeof tip === 'string' ? 'this figure' : tip.title || 'this figure';
  return (
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <button type="button" className="info" aria-label={`What is ${name}?`} onClick={onClick}>i</button>
      </Tooltip.Trigger>
      <Content tip={tip} side={side} align={align} />
    </Tooltip.Root>
  );
}

// A word or phrase in running text with a dotted underline, explained on hover, focus or tap
export function Term({ tip, children }) {
  const { open, setOpen, onClick } = useTip();
  if (!tip) return children;
  return (
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <span className="term" tabIndex={0} onClick={onClick}>{children}</span>
      </Tooltip.Trigger>
      <Content tip={tip} />
    </Tooltip.Root>
  );
}

// Tooltip around any element (used for the navigation tabs). A longer delay, since tabs are passed over often.
export function Hint({ tip, children, side = 'bottom', align = 'center', delay = 500 }) {
  if (!tip) return children;
  return (
    <Tooltip.Root delayDuration={delay}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Content tip={tip} side={side} align={align} />
    </Tooltip.Root>
  );
}
