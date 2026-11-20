'use client';
import { useState } from 'react';

// Several series on one line chart, one colour per series (used for the three assistants).
// xs:     [{ key, label }]            the x positions, oldest first
// series: [{ id, name, color, points: { [key]: { y, detail } } }]   a missing key = no data for that x
// kind:   'pct' (y is a share, 0..1) or 'num' (a count)
const fmt = (v, kind) => (v === null || v === undefined ? '–' : kind === 'pct' ? `${(Number(v) * 100).toFixed(1)}%` : Number(v).toLocaleString('en-IN'));

function niceMax(v, kind) {
  if (kind === 'pct') { const steps = [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1]; return steps.find((s) => s >= v * 1.15) || 1; }
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, v)))); return Math.ceil((v * 1.15) / p) * p || 1;
}

export function MultiTrend({ xs, series, kind = 'pct', height = 230, empty = 'No data yet.' }) {
  const [hi, setHi] = useState(null);
  const all = series.flatMap((s) => xs.map((x) => s.points[x.key]?.y).filter((v) => v !== null && v !== undefined).map(Number));
  if (!xs.length || !all.length) return <p className="hint">{empty}</p>;
  const W = 720, padL = 46, padR = 118, padT = 14, padB = 30;
  const ymax = niceMax(Math.max(...all), kind);
  const X = (i) => padL + (xs.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (xs.length - 1));
  const Y = (v) => padT + (1 - Number(v) / ymax) * (height - padT - padB);
  const band = xs.length === 1 ? W - padL - padR : (W - padL - padR) / (xs.length - 1);
  // every nth x label, so long weekly axes stay readable
  const every = Math.ceil(xs.length / 7);

  // end-of-line labels, pushed apart so they never overlap
  const ends = series.map((s) => {
    let last = -1; xs.forEach((x, i) => { const v = s.points[x.key]?.y; if (v !== null && v !== undefined) last = i; });
    return last < 0 ? null : { s, i: last, v: s.points[xs[last].key].y, y: Y(s.points[xs[last].key].y) };
  }).filter(Boolean).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 15) ends[k].y = ends[k - 1].y + 15;
  const over = ends.length ? ends[ends.length - 1].y - (height - padB + 4) : 0;
  if (over > 0) ends.forEach((e) => { e.y -= over; });

  return (
    <div className="mt">
      {series.length > 1 ? (
        <div className="mt-legend">{series.map((s) => <span key={s.id}><i style={{ background: s.color }} />{s.name}</span>)}</div>
      ) : null}
      <div className="mt-plot" onMouseLeave={() => setHi(null)}>
        <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${series.map((s) => s.name).join(', ')} over ${xs.length} points`}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={Y(ymax * t)} y2={Y(ymax * t)} className="mt-grid" />
              <text x={padL - 8} y={Y(ymax * t) + 4} textAnchor="end" className="mt-axis">{kind === 'pct' ? `${+(ymax * t * 100).toFixed(1)}%` : Math.round(ymax * t).toLocaleString('en-IN')}</text>
            </g>
          ))}
          {xs.map((x, i) => ((xs.length - 1 - i) % every === 0 ? <text key={x.key} x={X(i)} y={height - 8} textAnchor="middle" className="mt-axis">{x.label}</text> : null))}
          {hi !== null ? <line x1={X(hi)} x2={X(hi)} y1={padT} y2={height - padB} className="mt-cross" /> : null}
          {series.map((s) => {
            const pts = xs.map((x, i) => ({ i, v: s.points[x.key]?.y })).filter((p) => p.v !== null && p.v !== undefined);
            const d = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i)},${Y(p.v)}`).join(' ');
            return (
              <g key={s.id}>
                {pts.length > 1 ? <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /> : null}
                {pts.map((p) => ((pts.length <= 8 || p.i === hi || p.i === pts[pts.length - 1].i)
                  ? <circle key={p.i} cx={X(p.i)} cy={Y(p.v)} r={p.i === hi ? 5 : 4} fill={s.color} className="mt-dot" /> : null))}
              </g>
            );
          })}
          {ends.map((e) => (
            <text key={e.s.id} x={X(e.i) + 10} y={e.y + 4} className="mt-end"><tspan className="mt-end-v">{fmt(e.v, kind)}</tspan> {e.s.name}</text>
          ))}
          {xs.map((x, i) => (
            <rect key={x.key} x={X(i) - band / 2} y={0} width={band} height={height} fill="transparent" tabIndex={0} aria-label={x.label}
              onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(null)} />
          ))}
        </svg>
        {hi !== null ? (
          <div className="mt-tip" style={{ left: `${(X(hi) / W) * 100}%` }} data-side={X(hi) > W * 0.6 ? 'left' : 'right'}>
            <div className="mt-tip-title">{xs[hi].tip || xs[hi].label}</div>
            {series.map((s) => {
              const p = s.points[xs[hi].key];
              return (
                <div className="mt-tip-row" key={s.id}>
                  <i style={{ background: s.color }} /><b>{fmt(p?.y, kind)}</b><span>{s.name}{p?.detail ? ` · ${p.detail}` : ''}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
