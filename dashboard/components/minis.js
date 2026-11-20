'use client';
import { useState } from 'react';

const fmtNum = (v) => Number(v).toLocaleString('en-IN');
const compactNum = (v) => (v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v));
const fmtPct = (v) => `${(Number(v) * 100).toFixed(1)}%`;

// Small monthly column charts that share one hover: pointing at a month in any chart highlights that month in all of
// them and shows each chart's figure for it. charts: [{ title, kind ('pct' for a share between 0 and 1), points: [{ label, value (null = no data), partial }] }], oldest first.
// Bars use the AiA accent (this is our own data); a month with incomplete data is a lighter tint. The table below has every figure.
export function Minis({ charts }) {
  const [active, setActive] = useState(null);
  return (
    <div className={`minis${charts.length > 4 ? ' six' : ''}`} onMouseLeave={() => setActive(null)}>
      {charts.map((c) => <Mini key={c.title} chart={c} active={active} setActive={setActive} />)}
    </div>
  );
}

function Mini({ chart, active, setActive }) {
  const { title, points } = chart;
  const share = chart.kind === 'pct', fmt = share ? fmtPct : fmtNum, compact = share ? fmtPct : compactNum;
  const vals = points.filter((p) => p.value !== null);
  if (!vals.length) return null;
  const max = share ? Math.max(0.0001, ...vals.map((p) => p.value)) : Math.max(1, ...vals.map((p) => p.value));
  const full = points.filter((p) => p.value !== null && !p.partial);
  // no complete month yet (a figure that only started this month): show the month so far
  const latest = full[full.length - 1] ?? vals[vals.length - 1];
  const peak = vals.reduce((m, p) => (p.value > m.value ? p : m), vals[0]);
  const shown = active !== null ? points[active] : latest;
  return (
    <figure className="mini">
      <figcaption>
        <div className="mini-title">{title}</div>
        <div className="mini-now" aria-live="polite">
          {!shown ? '–' : shown.value === null ? <>No data for {shown.label}</> : <><b>{fmt(shown.value)}</b> in {shown.label}{shown.partial ? ' (incomplete)' : ''}</>}
        </div>
      </figcaption>
      <div className={`mini-plot${active !== null ? ' has-active' : ''}`} role="img"
        aria-label={`${title} per month, ${points[0].label} to ${points[points.length - 1].label}. Peak ${fmt(peak.value)} in ${peak.label}.`}>
        {points.map((p, i) => (
          <div key={i} className={`mini-col${active === i ? ' active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => setActive(active === i ? null : i)}>
            {p === peak && active === null ? <span className="mini-peak">{compact(p.value)}</span> : null}
            {p.value === null ? null : <div className={`mini-bar${p.partial ? ' partial' : ''}`} style={{ height: `${Math.max(2, (p.value / max) * 100)}%` }} />}
          </div>
        ))}
      </div>
      <div className="mini-axis"><span>{points[0].label}</span><span>{points[points.length - 1].label}</span></div>
    </figure>
  );
}
