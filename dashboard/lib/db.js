import postgres from 'postgres';

// Read-only role (aeo_dashboard_ro) via Supabase pooler. DB_HOSTS may list several hosts; the first that connects wins.
const hosts = (process.env.DB_HOSTS || 'aws-1-ap-south-1.pooler.supabase.com,aws-0-ap-south-1.pooler.supabase.com')
  .split(',').map((h) => h.trim()).filter(Boolean);

let clientPromise = null;

const withTimeout = (promise, ms, label) => {
  let timer;
  const t = new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error(`${label} timed out after ${ms}ms`), { dbTimeout: true })), ms); });
  return Promise.race([promise, t]).finally(() => clearTimeout(timer));
};

async function connect() {
  let lastErr;
  for (const host of hosts) {
    const sql = postgres({
      host,
      port: Number(process.env.DB_PORT || 6543),
      database: 'postgres',
      username: process.env.DB_USER || 'aeo_dashboard_ro.qmaphtslnvvifkzmbrvh',
      password: process.env.DB_PASSWORD,
      ssl: 'require',
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    try {
      await withTimeout(sql`select 1`, 6000, 'Database connect');
      sql.__host = host;
      return sql;
    } catch (e) {
      lastErr = e;
      sql.end({ timeout: 0 }).catch(() => {});
    }
  }
  throw lastErr || new Error('No database host reachable');
}

export async function db() {
  if (!clientPromise) clientPromise = connect().catch((e) => { clientPromise = null; throw e; });
  return clientPromise;
}

// A serverless instance can be paused mid-query, which leaves its one connection stuck. Every query has a short
// timeout; on a timeout or a dropped connection the client is thrown away and the query is retried once on a new one.
function reset(sql) {
  clientPromise = null;
  try { sql.end({ timeout: 0 }).catch(() => {}); } catch {}
}
async function runOnce(strings, values) {
  const sql = await db();
  try {
    return await withTimeout(sql(strings, ...values), 5000, 'Database query');
  } catch (e) {
    if (e.dbTimeout || /CONNECTION|ECONNRESET|EPIPE|ETIMEDOUT/i.test(`${e.code || ''} ${e.message || ''}`)) { reset(sql); e.retryable = true; }
    throw e;
  }
}

// One query at a time per server instance (parallel queries through the Supabase transaction pooler got stuck mid-protocol).
let chain = Promise.resolve();
export function q(strings, ...values) {
  const run = async () => {
    try { return await runOnce(strings, values); } catch (e) { if (!e.retryable) throw e; return runOnce(strings, values); }
  };
  const p = chain.then(run, run);
  chain = p.catch(() => {});
  return p;
}
