import { NextResponse } from 'next/server';
import { SRC, SRC_NEEDS_RUN } from '@/lib/links';

// Sends the visitor to the raw data behind a result: the Supabase SQL editor with the query filled in (Supabase login needed).
export async function GET(req) {
  const u = new URL(req.url);
  const k = u.searchParams.get('k') || '', run = u.searchParams.get('run') || '';
  if (!SRC[k] || !/^[A-Za-z0-9_-]{0,40}$/.test(run)) return new NextResponse('Unknown source link.', { status: 400 });
  if (SRC_NEEDS_RUN.has(k) && !run) return new NextResponse('This source link needs a run id.', { status: 400 });
  return NextResponse.redirect(SRC[k](run), 302);
}
