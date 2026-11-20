import { pct, date } from '@/lib/format';
import { Info } from '@/components/info';

// Small arrow that opens an external record (e.g. a HubSpot contact) in a new tab
export function Src({ href, title = 'Open the raw data behind this number' }) {
  if (!href) return null;
  return <a className="src" href={href} target="_blank" rel="noopener noreferrer" data-tip={title} aria-label={title}>↗</a>;
}

// Claude mark that opens Claude in a new tab with a pre-filled prompt explaining this figure (see lib/ask.js)
export function Ask({ href, tip = 'Ask Claude to explain it!' }) {
  if (!href) return null;
  return (
    <a className="src ask" href={href} target="_blank" rel="noopener noreferrer nofollow" data-tip={tip} aria-label={tip}>
      <img src="/logos/claude.svg" alt="" width="14" height="14" />
    </a>
  );
}

// Label followed by its "i" icon. The last word and the icon are kept together so the icon never wraps onto a line of its own.
function WithInfo({ text, info }) {
  if (!info) return text;
  if (typeof text !== 'string' || !text.includes(' ')) return <span className="nowrap">{text}<Info tip={info} /></span>;
  const cut = text.lastIndexOf(' ');
  return <>{text.slice(0, cut + 1)}<span className="nowrap">{text.slice(cut + 1)}<Info tip={info} /></span></>;
}

// info = tooltip explaining the figure ({ title, body, now } from lib/glossary.js)
export function Kpi({ label, value, sub, note, ask, info }) {
  return (
    <div className="kpi">
      <div className="kpi-label"><span><WithInfo text={label} info={info} /></span><Ask href={ask} /></div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
      {note ? <div className="kpi-note">{note}</div> : null}
    </div>
  );
}

export function Section({ title, children, hint, info, icon }) {
  return (
    <section className="card">
      <h2>{icon ? <img className="h-logo" src={icon} alt="" /> : null}<WithInfo text={title} info={info} /></h2>
      {hint ? <p className="hint">{hint}</p> : null}
      {children}
    </section>
  );
}

// Horizontal bars. Pass max={1} for shares and rates so a bar's length is the true percentage;
// leave max out for counts, which are scaled to the largest row.
export function Bars({ rows, valueKey, labelKey, format = pct, max, highlight, valueWidth }) {
  const m = max ?? Math.max(0.0001, ...rows.map((r) => Number(r[valueKey] || 0)));
  return (
    <div className="bars" style={valueWidth ? { '--valw': `${valueWidth}px` } : undefined}>
      {rows.map((r, i) => {
        const v = Number(r[valueKey] || 0);
        return (
          <div className="bar-row" key={i} title={`${r[labelKey]}: ${format(r[valueKey])}`}>
            <div className="bar-label">{r.icon ? <span className="bar-ico">{r.icon}</span> : null}{r[labelKey]}</div>
            <div className="bar-track">
              {v > 0 ? <div className={`bar-fill ${highlight && highlight(r) ? 'own' : ''}`} style={{ width: `${Math.min(100, (v / m) * 100)}%` }} /> : null}
            </div>
            <div className="bar-value">{r.txt ?? format(r[valueKey])}</div>
          </div>
        );
      })}
    </div>
  );
}

// Line with CI band across runs. points: [{x: label, y, lo, hi}]
export function Trend({ points, height = 180 }) {
  if (!points.length) return <p className="hint">No runs yet.</p>;
  const w = 640, pad = 36;
  const ymax = Math.max(0.05, ...points.map((p) => Number(p.hi ?? p.y ?? 0))) * 1.15;
  const x = (i) => pad + (points.length === 1 ? (w - 2 * pad) / 2 : (i * (w - 2 * pad)) / (points.length - 1));
  const y = (v) => height - pad + 8 - (Number(v || 0) / ymax) * (height - pad - 8);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.y)}`).join(' ');
  const dec = ymax < 0.2 ? 1 : 0;
  const band = points.length > 1 && points.some((p) => p.lo !== null && p.lo !== undefined)
    ? points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.hi)}`).join(' ') + ' ' +
      points.slice().reverse().map((p, j) => `L${x(points.length - 1 - j)},${y(p.lo)}`).join(' ') + ' Z'
    : null;
  return (
    <svg viewBox={`0 0 ${w} ${height + 16}`} className="trend" role="img">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad} x2={w - pad} y1={y(ymax * t)} y2={y(ymax * t)} className="grid" />
          <text x={4} y={y(ymax * t) + 4} className="axis">{pct(ymax * t, dec)}</text>
        </g>
      ))}
      {band ? <path d={band} className="band" /> : null}
      {/* With a single run there is no band to draw, so show the 95% range as a whisker on the point */}
      {points.length === 1 && points[0].lo !== null && points[0].lo !== undefined ? (
        <g className="whisker">
          <line x1={x(0)} x2={x(0)} y1={y(points[0].hi)} y2={y(points[0].lo)} />
          <line x1={x(0) - 7} x2={x(0) + 7} y1={y(points[0].hi)} y2={y(points[0].hi)} />
          <line x1={x(0) - 7} x2={x(0) + 7} y1={y(points[0].lo)} y2={y(points[0].lo)} />
          <text x={x(0) + 12} y={y(points[0].hi) + 4} className="axis">{pct(points[0].hi)}</text>
          <text x={x(0) + 12} y={y(points[0].lo) + 4} className="axis">{pct(points[0].lo)}</text>
        </g>
      ) : null}
      <path d={line} className="line" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.y)} r={4} className="dot" />
          <text x={x(i)} y={height + 12} textAnchor="middle" className="axis">{p.x}</text>
          <text x={points.length === 1 ? x(i) - 12 : x(i)} y={points.length === 1 ? y(p.y) + 4 : y(p.y) - 9} textAnchor={points.length === 1 ? 'end' : 'middle'} className="val">{pct(p.y)}</text>
        </g>
      ))}
    </svg>
  );
}

export function Table({ columns, rows, empty = 'No data yet.' }) {
  if (!rows.length) return <p className="hint">{empty}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c.key} className={c.num ? 'num' : ''}>{c.label}<Info tip={c.info} align={c.num ? 'end' : 'start'} /></th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className={c.num ? 'num' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// extra = other query values to keep when the run changes, e.g. { engine: 'gemini' }
export function RunPicker({ runs, current, path, extra }) {
  return (
    <form method="get" action={path} className="runpicker">
      {Object.entries(extra || {}).filter(([, v]) => v).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <label>Run&nbsp;
        <select name="run" defaultValue={current}>
          {runs.map((r) => (
            <option key={r.run_id} value={r.run_id}>{r.run_id} · {date(r.run_date)} · {r.run_type}{r.status !== 'complete' ? ` · ${r.status}` : ''}</option>
          ))}
        </select>
      </label>
      <button type="submit">Show</button>
    </form>
  );
}

export function TestBanner({ run }) {
  if (!run || run.run_type !== 'test') return null;
  return <div className="banner">Showing a <b>test run</b> ({run.run_id}): a pipeline check, not baseline data.</div>;
}
