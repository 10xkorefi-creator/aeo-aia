import Link from 'next/link';
import { pct, date } from '@/lib/format';
import { Info } from '@/components/info';

const day = (v) => date(v).slice(0, 5);

// "▲ 1.6 pts since 19/11 · no real change" or "▲ 6.5 pts since 19/11 · rise, to confirm in the next run". Colour is used only for a change that passed the test; the arrow and the
// words carry the same meaning, so it never depends on colour alone.
export function Change({ change, prev, info }) {
  if (!prev) return <div className="chg none">First run: nothing to compare with yet</div>;
  if (change?.delta === null || change?.delta === undefined) return <div className="chg none">Not comparable with {day(prev.run_date)}</div>;
  const pts = Math.abs(change.delta * 100);
  const flat = pts < 0.05;
  const arrow = flat ? '' : change.delta > 0 ? '▲' : '▼';
  // "to confirm": larger than re-asking would explain, but an assistant's own search results also shift from day to day,
  // so it only counts as lasting once the next run stays at the new level.
  const verdict = change.verdict === 'up' ? 'rise, to confirm in the next run' : change.verdict === 'down' ? 'drop, to confirm in the next run' : 'no real change';
  return (
    <div className={`chg ${change.verdict || 'same'}`}>
      <span className="chg-pill">{flat ? 'No change' : <>{arrow} {pts.toFixed(1)} pts</>}</span>
      <span className="chg-text">since {day(prev.run_date)}{flat ? '' : <> · <b>{verdict}</b></>}<Info tip={info} /></span>
    </div>
  );
}

// Tiny run-by-run line: shows direction at a glance, the number beside it carries the value.
export function Spark({ points, color = 'var(--accent)' }) {
  const ys = points.map((p) => Number(p));
  if (ys.length < 2) return null;
  const w = 96, h = 30, pad = 4;
  const max = Math.max(...ys, 0.0001), min = Math.min(...ys, 0);
  const X = (i) => pad + (i * (w - 2 * pad)) / (ys.length - 1);
  const Y = (v) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={`${ys.length} runs, from ${pct(ys[0])} to ${pct(ys[ys.length - 1])}`}>
      <path d={ys.map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(ys.length - 1)} cy={Y(ys[ys.length - 1])} r="3.5" fill={color} className="mt-dot" />
    </svg>
  );
}

// One tracked surface: the rate now, what it is counted from, and how it moved since the run before.
export function ScoreTile({ icon, name, rate, sub, change, prev, history, color, href, changeInfo }) {
  const body = (
    <>
      <div className="score-head">{icon}<span>{name}</span></div>
      <div className="score-main">
        <div className="score-value">{rate === null || rate === undefined ? '–' : pct(rate)}</div>
        <Spark points={(history || []).map((h) => h.rate ?? h.recommended_rate)} color={color} />
      </div>
      <div className="score-sub">{sub}</div>
      {rate === null || rate === undefined ? null : <Change change={change} prev={prev} info={changeInfo} />}
    </>
  );
  return href ? <Link className="score" href={href}>{body}</Link> : <div className="score">{body}</div>;
}

// Small marker beside a table cell: this question or keyword was won or lost since the run before.
export function Moved({ status }) {
  if (status === 'gained') return <span className="mv up" title="We were not here in the previous run">▲ new</span>;
  if (status === 'lost') return <span className="mv down" title="We were here in the previous run">▼ lost</span>;
  return null;
}

// Two short lists: where we appeared since the last run, and where we dropped out.
export function Movers({ gained, lost, max = 6, more }) {
  const col = (title, cls, rows, empty) => (
    <div className="movers-col">
      <h4><span className={`mv ${cls}`}>{cls === 'up' ? '▲' : '▼'}</span> {title} <span className="muted">{rows.length}</span></h4>
      {rows.length ? (
        <ul>{rows.slice(0, max).map((r, i) => <li key={i}>{r.icon}<span className="movers-text">{r.text}</span><span className="movers-frac">{r.before} → {r.now}</span></li>)}</ul>
      ) : <p className="hint">{empty}</p>}
      {rows.length > max ? <p className="hint">and {rows.length - max} more{more ? <>, on the {more}</> : ''}.</p> : null}
    </div>
  );
  return (
    <div className="movers">
      {col('Newly won', 'up', gained, 'Nothing new since the last run.')}
      {col('Lost', 'down', lost, 'Nothing lost since the last run.')}
    </div>
  );
}
