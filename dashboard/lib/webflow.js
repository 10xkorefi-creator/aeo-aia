// The dashboard's own line to Webflow, used only to publish one drafted post and to see whether a draft has gone live.
// Needs WEBFLOW_TOKEN (a site API token with CMS read and write). Without it these do nothing and the daily agent run keeps statuses in sync.
const API = 'https://api.webflow.com/v2';
export const hasWebflow = () => !!process.env.WEBFLOW_TOKEN;

async function call(path, init = {}, ms = 6000) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(API + path, { ...init, signal: ctrl.signal, cache: 'no-store',
      headers: { Authorization: `Bearer ${process.env.WEBFLOW_TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch { return { ok: false, status: 0, body: null }; } finally { clearTimeout(timer); }
}

// Has this draft reached the LIVE site? Webflow's own "last published" on an item also moves when the site is published
// to the staging address, so it cannot be trusted alone. The live page is the ground truth:
//   - a new post is live when its address answers on the live site;
//   - an edited post is live when the live page's "date modified" is on or after the day the draft was saved.
// The time recorded is the live domains' last publish when that is readable, otherwise the moment we noticed.
const SITE = '67ed19ac5d8a1253defd2450';
const istDay = (d) => new Date(new Date(d).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
export async function domainPublishedAt() {
  const r = await call(`/sites/${SITE}`);
  const times = (r.body?.customDomains || []).map((d) => d.lastPublished).filter(Boolean).sort();
  return r.ok && times.length ? times[times.length - 1] : null;
}
export async function liveSince({ pageUrl, draftedAt, isNew, domainAt }) {
  if (!pageUrl) return null;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 7000);
  let html = '';
  try {
    const res = await fetch(`${pageUrl}${pageUrl.includes('?') ? '&' : '?'}v=${Date.now()}`, { signal: ctrl.signal, cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 (AEO dashboard status check)' } });
    if (!res.ok) return null;
    html = await res.text();
  } catch { return null; } finally { clearTimeout(timer); }
  if (!isNew) {
    const m = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
    if (!m || m[1] < istDay(draftedAt)) return null;
  }
  return domainAt && new Date(domainAt) >= new Date(draftedAt) ? domainAt : new Date().toISOString();
}

export async function publishItem(collectionId, itemId) {
  return call(`/collections/${collectionId}/items/publish`, { method: 'POST', body: JSON.stringify({ itemIds: [itemId] }) }, 15000);
}
