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

// When Webflow last published this item, or null if it has not been published since the draft was saved.
export async function liveSince(collectionId, itemId, draftedAt) {
  const r = await call(`/collections/${collectionId}/items/${itemId}`);
  const it = r.body;
  if (!r.ok || !it || it.isDraft || !it.lastPublished) return null;
  return new Date(it.lastPublished) >= new Date(draftedAt) ? it.lastPublished : null;
}

export async function publishItem(collectionId, itemId) {
  return call(`/collections/${collectionId}/items/publish`, { method: 'POST', body: JSON.stringify({ itemIds: [itemId] }) }, 15000);
}
