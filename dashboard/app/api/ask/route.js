import { NextResponse } from 'next/server';
import { askPrompt } from '@/lib/ask';

export const dynamic = 'force-dynamic';

// Builds the explanation prompt for one dashboard figure and sends the visitor to Claude with it pre-filled.
export async function GET(req) {
  const u = new URL(req.url);
  const k = u.searchParams.get('k') || '', run = u.searchParams.get('run') || '', id = u.searchParams.get('id') ?? undefined;
  if (!/^[a-z0-9_]{2,30}$/.test(k) || !/^[A-Za-z0-9_-]{0,40}$/.test(run) || (id !== undefined && id.length > 120)) return new NextResponse('Bad request', { status: 400 });
  let prompt = null;
  try { prompt = await askPrompt(k, run, id); } catch (e) { return new NextResponse('Could not build the explanation: ' + (e.message || 'error'), { status: 500 }); }
  if (!prompt) return new NextResponse('Nothing to explain for this link.', { status: 404 });
  if (u.searchParams.get('show') === '1') return new NextResponse(prompt, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  return NextResponse.redirect('https://claude.ai/new?q=' + encodeURIComponent(prompt), 302);
}
