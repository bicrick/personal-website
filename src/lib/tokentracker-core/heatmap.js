// Vendored from github.com/bicrick/tokentracker cli/core/heatmap.js @ 91f7a57. Keep in sync, do not edit here.
// tokentracker headless heatmap library. Pure ESM, no DOM: works in browsers,
// Node and edge functions. Fetch a profile and get back everything needed to
// render a heatmap or stats in your own markup.
//

export const DEFAULT_ORIGIN = 'https://tokentracker.patrickbrown.dev';
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const TOOL_NAMES = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  cursor: 'Cursor',
  opencode: 'OpenCode',
  'gemini-cli': 'Gemini CLI',
  'copilot-cli': 'Copilot CLI',
  'deepseek-harness': 'DeepSeek Harness',
  cline: 'Cline',
  'roo-code': 'Roo Code',
  'kilo-code': 'Kilo Code',
};

const iso = (d) => d.toISOString().slice(0, 10);
const utc = (s) => new Date(`${s}T00:00:00Z`);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

export function formatTokens(n, { precision = 2 } = {}) {
  const f = (v, s) => `${v.toFixed(precision).replace(/\.?0+$/, '')}${s}`;
  if (n >= 1e12) return f(n / 1e12, 'T');
  if (n >= 1e9) return f(n / 1e9, 'B');
  if (n >= 1e6) return f(n / 1e6, 'M');
  if (n >= 1e3) return f(n / 1e3, 'K');
  return String(Math.round(n));
}

/** Fetch a public profile's raw activity. */

/** Resolve a range option to [startISO, endISO]. */
export function resolveRange(range = 'year', today = iso(new Date())) {
  const end = utc(today);
  if (range === 'year') return [`${today.slice(0, 4)}-01-01`, today];
  if (range === 'rolling' || range === '365d') return [iso(addDays(end, -364)), today];
  const m = /^(\d+)d$/.exec(range);
  if (m) return [iso(addDays(end, -(Number(m[1]) - 1))), today];
  if (/^\d{4}$/.test(range)) return [`${range}-01-01`, range === today.slice(0, 4) ? today : `${range}-12-31`];
  throw new Error(`unknown range: ${range}`);
}

/**
 * Turn raw activity into a calendar heatmap.
 * Options: range ('year' | '30d' | '90d' | '365d' | '2025'), tools (array of
 * tool ids to include), levels (number of colour steps incl. empty), weekStart
 * ('sun' | 'mon'), fullYear (pad to Dec 31 when range is a calendar year).
 */
export function buildHeatmap(data, {
  range = 'year',
  tools = null,
  levels = 5,
  weekStart = 'sun',
  fullYear = true,
  today = iso(new Date()),
} = {}) {
  const [start, end] = resolveRange(range, today);
  const allow = tools?.length ? new Set(tools) : null;

  const byDate = new Map();
  for (const d of data.activityCounts || []) {
    if (d.date < start || d.date > end) continue;
    const sources = d.sources || { cursor: d.count };
    const kept = {};
    let count = 0;
    for (const [k, v] of Object.entries(sources)) {
      if (allow && !allow.has(k)) continue;
      kept[k] = v;
      count += v;
    }
    byDate.set(d.date, { count, sources: kept });
  }

  // Colour level from a day's rank among active days, so one huge day doesn't
  // wash out the rest and the busiest days always reach the top level
  const active = [...byDate.values()].map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const steps = levels - 1;
  const rankOf = (c) => {
    let lo = 0;
    let hi = active.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (active[mid] <= c) lo = mid + 1;
      else hi = mid;
    }
    return lo; // number of active days with count <= c
  };
  const levelOf = (c) => (c <= 0 ? 0 : Math.max(1, Math.ceil((rankOf(c) / active.length) * steps)));

  const isCalendarYear = range === 'year' || /^\d{4}$/.test(range);
  const last = isCalendarYear && fullYear ? `${start.slice(0, 4)}-12-31` : end;
  const offset = weekStart === 'mon' ? 1 : 0;
  const first = utc(start);
  const gridStart = addDays(first, -((first.getUTCDay() - offset + 7) % 7));

  const weeks = [];
  const months = [];
  let total = 0;
  let max = 0;
  let maxDay = null;
  const sourceTotals = {};
  let streak = 0;
  let longest = 0;

  for (let d = gridStart; iso(d) <= last || weeks.at(-1)?.length < 7; d = addDays(d, 1)) {
    if (!weeks.length || weeks.at(-1).length === 7) weeks.push([]);
    const date = iso(d);
    const inRange = date >= start && date <= last;
    const future = date > end;
    const entry = byDate.get(date) || { count: 0, sources: {} };
    const day = inRange
      ? { date, count: future ? null : entry.count, level: future ? 0 : levelOf(entry.count), sources: entry.sources, future }
      : null;
    weeks.at(-1).push(day);

    if (day && !future) {
      total += entry.count;
      if (entry.count > max) {
        max = entry.count;
        maxDay = date;
      }
      for (const [k, v] of Object.entries(entry.sources)) sourceTotals[k] = (sourceTotals[k] || 0) + v;
      streak = entry.count > 0 ? streak + 1 : 0;
      longest = Math.max(longest, streak);
    }
    if (inRange && (date === start || date.endsWith('-01'))) {
      const m = Number(date.slice(5, 7)) - 1;
      if (!months.length || months.at(-1).month !== m) months.push({ label: MONTHS[m], month: m, week: weeks.length - 1 });
    }
  }

  return {
    handle: data.handle,
    range: { start, end, last },
    weeks,
    months,
    levels,
    total,
    max,
    maxDay,
    activeDays: active.length,
    longestStreak: longest,
    currentStreak: streak,
    tools: Object.entries(sourceTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([id, tokens]) => ({ id, name: TOOL_NAMES[id] || id, tokens, share: total ? tokens / total : 0 })),
  };
}

/** Fetch and build in one call. */

/** Daily series for line/bar charts: [{ date, count, cumulative }]. */
export function buildSeries(data, { range = 'year', tools = null, today = iso(new Date()) } = {}) {
  const hm = buildHeatmap(data, { range, tools, today, fullYear: false });
  const out = [];
  let cumulative = 0;
  for (const week of hm.weeks) {
    for (const d of week) {
      if (!d || d.future) continue;
      cumulative += d.count;
      out.push({ date: d.date, count: d.count, cumulative });
    }
  }
  return out;
}
