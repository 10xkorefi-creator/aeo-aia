'use client';
import { useEffect, useRef, useState } from 'react';

// Several small line charts stacked on ONE shared weekly axis, so a change in the top chart can be followed down the page.
// Each chart keeps its own y-scale (they measure different things), which is why they are separate charts and not one chart with two axes.
// xs:   [{ key, label, tip }]   the weeks, oldest first
// rows: [{ id, title, kind: 'pct' | 'num', unit, series: [{ id, name, color, points: { [key]: { y, detail } } }] }]
const fmt = (v, kind) => (v === null || v === undefined ? '–' : kind === 'pct' ? `${(Number(v) * 100).toFixed(1)}%` : Number(v).toLocaleString('en-IN'));

function niceMax(v, kind) {
  if (kind === 'pct') { const steps = [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1]; return steps.find((s) => s >= v * 1.15) || 1; }
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, v)))); const step = p / 2; return Math.ceil((v * 1.15) / step) * step || 1;
}

const padL = 46, padT = 12;

function Plot({ row, xs, hi, setHi, last, W }) {
  // drawn at the real pixel width, so text keeps its size on a phone and on a wide screen
  const narrow = W < 560, padR = narrow ? 58 : 124;
  const height = last ? 150 : 128, padB = last ? 30 : 8;
  const all = row.series.flatMap((s) => xs.map((x) => s.points[x.key]?.y).filter((v) => v !== null && v !== undefined).map(Number));
  const ymax = niceMax(all.length ? Math.max(...all) : 1, row.kind);
  const X = (i) => padL + (xs.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (xs.length - 1));
  const Y = (v) => padT + (1 - Number(v) / ymax) * (height - padT - padB);
  const band = xs.length === 1 ? W - padL - padR : (W - padL - padR) / (xs.length - 1);
  const every = Math.ceil(xs.length / Math.max(2, Math.min(8, Math.floor((W - padL - padR) / 64))));

  // end-of-line labels, pushed apart so they never overlap
  const ends = row.series.map((s) => {
    let at = -1; xs.forEach((x, i) => { const v = s.points[x.key]?.y; if (v !== null && v !== undefined) at = i; });
    return at < 0 ? null : { s, i: at, v: s.points[xs[at].key].y, y: Y(s.points[xs[at].key].y) };
  }).filter(Boolean).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 15) ends[k].y = ends[k - 1].y + 15;
  const over = ends.length ? ends[ends.length - 1].y - (height - padB + 2) : 0;
  if (over > 0) ends.forEach((e) => { e.y -= over; });
  const many = row.series.length > 1;

  return (
    <div className="mt-plot" onMouseLeave={() => setHi(null)}>
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${row.label}, ${xs.length} weeks`}>
        {[0, 1].map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={Y(ymax * t)} y2={Y(ymax * t)} className="mt-grid" />
            <text x={padL - 8} y={Y(ymax * t) + 4} textAnchor="end" className="mt-axis">{row.kind === 'pct' ? `${+(ymax * t * 100).toFixed(1)}%` : Math.round(ymax * t).toLocaleString('en-IN')}</text>
          </g>
        ))}
        {last ? xs.map((x, i) => ((xs.length - 1 - i) % every === 0 ? <text key={x.key} x={X(i)} y={height - 8} textAnchor="middle" className="mt-axis">{x.label}</text> : null)) : null}
        {hi !== null ? <line x1={X(hi)} x2={X(hi)} y1={padT - 6} y2={height - padB} className="mt-cross" /> : null}
        {all.length === 0 ? <text x={(padL + W - padR) / 2} y={height / 2} textAnchor="middle" className="mt-axis">No data yet</text> : null}
        {row.series.map((s) => {
          const pts = xs.map((x, i) => ({ i, v: s.points[x.key]?.y })).filter((p) => p.v !== null && p.v !== undefined);
          const d = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i)},${Y(p.v)}`).join(' ');
          return (
            <g key={s.id}>
              {pts.length > 1 ? <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /> : null}
              {pts.map((p) => ((pts.length <= 6 || p.i === hi || p.i === pts[pts.length - 1].i)
                ? <circle key={p.i} cx={X(p.i)} cy={Y(p.v)} r={p.i === hi ? 5 : 4} fill={s.color} className="mt-dot" /> : null))}
            </g>
          );
        })}
        {ends.map((e) => (
          <text key={e.s.id} x={X(e.i) + 10} y={e.y + 4} className="mt-end"><tspan className="mt-end-v">{fmt(e.v, row.kind)}</tspan>{many && !narrow ? ` ${e.s.name}` : ''}</text>
        ))}
        {xs.map((x, i) => (
          <rect key={x.key} x={X(i) - band / 2} y={0} width={band} height={height} fill="transparent" tabIndex={last ? 0 : -1} aria-label={x.tip || x.label}
            onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(null)} />
        ))}
      </svg>
    </div>
  );
}

export function ChainTrend({ xs, rows }) {
  const [hi, setHi] = useState(null);
  const [W, setW] = useState(960);
  const box = useRef(null);
  useEffect(() => {
    const el = box.current; if (!el) return undefined;
    const fit = () => { const w = Math.round(el.clientWidth); if (w > 0) setW(w); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!xs.length) return <p className="hint">No data yet.</p>;
  return (
    <div className="ct" ref={box}>
      {rows.map((row, k) => {
        const many = row.series.length > 1;
        // the readout on the right: the week being pointed at, or a prompt to point
        const read = hi === null ? null : row.series.map((s) => ({ s, p: s.points[xs[hi].key] }));
        return (
          <div className="ct-row" key={row.id}>
            <div className="ct-head">
              <div className="ct-step"><span className="ct-n">{k + 1}</span><h4>{row.title}</h4></div>
              <div className="ct-read" aria-live="polite">
                {read ? (
                  <><span className="ct-when">{xs[hi].tip || xs[hi].label}</span>
                    {read.map(({ s, p }) => (
                      <span className="ct-val" key={s.id}>{many ? <i style={{ background: s.color }} /> : null}<b>{fmt(p?.y, row.kind)}</b>{many ? ` ${s.name}` : row.unit ? ` ${row.unit}` : ''}{p?.detail ? <em> · {p.detail}</em> : null}</span>
                    ))}</>
                ) : many ? (
                  <span className="mt-legend ct-legend">{row.series.map((s) => <span key={s.id}><i style={{ background: s.color }} />{s.name}</span>)}</span>
                ) : <span className="ct-when">{row.unit || ''}</span>}
              </div>
            </div>
            <Plot row={row} xs={xs} hi={hi} setHi={setHi} last={k === rows.length - 1} W={W} />
            {k < rows.length - 1 ? <div className="ct-link" aria-hidden="true">↓</div> : null}
          </div>
        );
      })}
    </div>
  );
}
