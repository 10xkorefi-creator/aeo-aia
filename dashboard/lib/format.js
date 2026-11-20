export const pct = (v, d = 1) => (v === null || v === undefined ? '–' : `${(Number(v) * 100).toFixed(d)}%`);
export const num = (v) => (v === null || v === undefined ? '–' : Number(v).toLocaleString('en-IN'));
export const ci = (lo, hi) => (lo === null || lo === undefined ? '' : `${pct(lo)}–${pct(hi)}`);
// Dates are shown as dd/mm/yyyy everywhere on the dashboard
export const date = (v) => {
  if (!v) return '–';
  const [y, m, d] = new Date(v).toISOString().slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
// "Nov 2026" for a month start date
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthLabel = (v) => { if (!v) return '–'; const [y, m] = new Date(v).toISOString().slice(0, 7).split('-'); return `${MONTHS[Number(m) - 1]} ${y}`; };
// dd/mm/yyyy hh:mm (UTC)
export const dateTime = (v) => (v ? `${date(v)} ${new Date(v).toISOString().slice(11, 16)}` : '–');
