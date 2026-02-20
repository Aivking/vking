import { createClient } from '@supabase/supabase-js';

// TEMP TEST MODE:
// - true: run cron settle checks every 5 minutes (see vercel.json)
// - bypass Wednesday 12:00-12:02 window
// - dedupe by hour (one settlement per hour)
// Switch back to false after verification.
const TEMP_TEST_MODE = true;

const getShanghaiNow = () => new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));

const getShanghaiDateKey = (d) => {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getShanghaiHourKey = (d) => {
  if (!d) return '';
  const dateKey = getShanghaiDateKey(d);
  const hh = String(d.getHours()).padStart(2, '0');
  return `${dateKey}-${hh}`;
};

const isWithinShanghaiSettleWindow = (d) => {
  if (!d) return false;
  const day = d.getDay();
  const hour = d.getHours();
  const minute = d.getMinutes();
  return day === 3 && hour === 12 && minute >= 0 && minute <= 2;
};

export default async function handler(req, res) {
  try {
    if (req.method && req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const cronSecret = process.env.CRON_SECRET;
    const userAgent = String(req.headers?.['user-agent'] || '');
    const isVercelCron = userAgent.includes('vercel-cron/1.0');

    const authHeader = req.headers?.authorization || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : '';
    const headerSecret = token || req.headers?.['x-cron-secret'] || '';
    const secretOk = cronSecret ? (headerSecret && headerSecret === cronSecret) : false;

    // - Vercel Cron calls: allowed without secret, but only execute in the settle window
    // - Manual calls: require secret (if configured)
    if (!isVercelCron) {
      if (cronSecret && !secretOk) {
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        ok: false,
        error: 'Missing env: SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const now = getShanghaiNow();
    if (isVercelCron && !TEMP_TEST_MODE && !isWithinShanghaiSettleWindow(now)) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'outside_settle_window' });
    }
    const settleKey = TEMP_TEST_MODE ? getShanghaiHourKey(now) : getShanghaiDateKey(now);

    const { data: exists, error: existsError } = await supabase
      .from('transactions')
      .select('id')
      .eq('status', 'approved')
      .in('type', ['interest_income', 'interest_expense'])
      .ilike('remark', `%autoSettleKey:${settleKey}%`)
      .limit(1);

    if (existsError) throw existsError;
    if ((exists || []).length > 0) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'already_settled', settleKey });
    }

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('type, principal, rate')
      .eq('status', 'approved')
      .in('type', ['loan', 'injection', 'deposit']);

    if (txError) throw txError;

    const approved = txs || [];
    const sumInterest = (types) =>
      approved
        .filter((tx) => types.includes(tx.type))
        .reduce((acc, cur) => acc + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100), 0);

    const loanInterest = sumInterest(['loan']);
    const injectionInterest = sumInterest(['injection']);
    const depositInterest = sumInterest(['deposit']);

    const settleTime = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
    const settleId = Date.now();

    const recordsToInsert = [];

    if (loanInterest > 0) {
      recordsToInsert.push({
        type: 'interest_income',
        client: '利息收入',
        principal: loanInterest,
        rate: 0,
        timestamp: settleTime,
        created_by: 'System',
        creator_id: 'system',
        status: 'approved',
        settle_id: settleId,
        remark: `本周贷款利息自动结算\nautoSettleKey:${settleKey}`
      });
    }

    if (injectionInterest > 0) {
      recordsToInsert.push({
        type: 'interest_expense',
        client: '注资利息支出',
        principal: injectionInterest,
        rate: 0,
        timestamp: settleTime,
        created_by: 'System',
        creator_id: 'system',
        status: 'approved',
        settle_id: settleId,
        remark: `注资账户利息自动结算\nautoSettleKey:${settleKey}`
      });
    }

    if (depositInterest > 0) {
      recordsToInsert.push({
        type: 'interest_expense',
        client: '存款利息支出',
        principal: depositInterest,
        rate: 0,
        timestamp: settleTime,
        created_by: 'System',
        creator_id: 'system',
        status: 'approved',
        settle_id: settleId,
        remark: `存款账户利息自动结算\nautoSettleKey:${settleKey}`
      });
    }

    if (recordsToInsert.length === 0) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'no_interest', settleKey });
    }

    const { error: insertError } = await supabase.from('transactions').insert(recordsToInsert);
    if (insertError) throw insertError;

    return res.status(200).json({
      ok: true,
      tempTestMode: TEMP_TEST_MODE,
      settleKey,
      settleId,
      inserted: recordsToInsert.length,
      loanInterest,
      injectionInterest,
      depositInterest
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
