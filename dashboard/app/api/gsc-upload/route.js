import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Minimal CSV parser (handles quoted fields)
function parseCsv(text) {
  const rows = []; let row = []; let cur = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const toInt = (v) => { const n = Number(String(v ?? '').replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? Math.round(n) : null; };

export async function POST(req) {
  const back = (qs) => Response.redirect(new URL(`/runs?${qs}`, req.url), 303);
  try {
    const form = await req.formData();
    const expected = process.env.UPLOAD_PASSWORD || process.env.DASHBOARD_PASSWORD;
    if (!expected || String(form.get('key') || '') !== expected) return back('error=wrong+upload+password');
    const file = form.get('file');
    const period = String(form.get('period') || '').trim() || null;
    if (!file || typeof file === 'string') return back('error=no+file');
    const rows = parseCsv((await file.text()).replace(/^﻿/, ''));
    if (rows.length < 2) return back('error=empty+file');
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const iImp = header.findIndex((h) => h.includes('impression'));
    const iClk = header.findIndex((h) => h.includes('click'));
    const iDate = header.findIndex((h) => h === 'date' || h.includes('date'));
    const iPage = header.findIndex((h) => h.includes('page') || h.includes('url'));
    if (iImp < 0) return back('error=no+impressions+column');
    const today = new Date().toISOString().slice(0, 10);
    let records;
    if (iDate >= 0 && iPage < 0) {
      records = rows.slice(1).map((r) => ({ date: r[iDate].trim(), page: '', impressions: toInt(r[iImp]), clicks: iClk >= 0 ? toInt(r[iClk]) : null,
        source: 'gsc_genai_export_dates', period_label: period, pull_id: `upload-${today}` }));
    } else if (iPage >= 0) {
      records = rows.slice(1).map((r) => ({ date: today, page: r[iPage].trim(), impressions: toInt(r[iImp]), clicks: iClk >= 0 ? toInt(r[iClk]) : null,
        source: 'gsc_genai_export_pages', period_label: period || `export uploaded ${today}`, pull_id: `upload-${today}` }));
    } else return back('error=unrecognised+columns+(need+Date+or+Page)');
    records = records.filter((r) => r.impressions !== null && (r.page !== '' || /^\d{4}-\d{2}-\d{2}$/.test(r.date)));
    if (!records.length) return back('error=no+valid+rows');
    // Search Console can list the same page (or date) twice in one export. Merge those rows by adding their numbers,
    // otherwise the database rejects the whole upload ("cannot affect row a second time").
    const merged = new Map();
    for (const r of records) {
      const k = `${r.date}|${r.page}`;
      const prev = merged.get(k);
      if (!prev) merged.set(k, r);
      else {
        prev.impressions += r.impressions;
        if (r.clicks !== null) prev.clicks = (prev.clicks ?? 0) + r.clicks;
      }
    }
    records = [...merged.values()];
    const sql = await db();
    await sql`insert into public.aeo_gsc_ai_daily ${sql(records, 'date', 'page', 'impressions', 'clicks', 'source', 'period_label', 'pull_id')}
      on conflict (date, page, source) do update set impressions = excluded.impressions, clicks = excluded.clicks,
        period_label = excluded.period_label, pull_id = excluded.pull_id, pulled_at = now()`;
    return back(`uploaded=${records.length}`);
  } catch (e) {
    return back(`error=${encodeURIComponent(String(e?.message || e).slice(0, 120))}`);
  }
}
