// Vendored from github.com/bicrick/tokentracker cli/core/query.js @ 91f7a57. Keep in sync, do not edit here.
// The v1 API's query logic, shared by the hosted server, the CLI and the
// GitHub Action that builds a user's static API. Pure functions over rows:
// { date, source, model, input, output, reasoning, cache_read, cache_write, messages, device }.
import { buildHeatmap } from './heatmap.js';

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

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9][a-z0-9._/-]{0,119}$/i;
const iso = (d) => d.toISOString().slice(0, 10);
const today = () => iso(new Date());

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Parse shared filters. range: all | ytd | year | Nd | YYYY. from/to override.
 * Returns { from, to, tools, models } with from/to as ISO dates or null (unbounded).
 */
export function parseFilters(q = {}) {
  let from = null;
  let to = null;
  const range = q.range ? String(q.range) : null;
  const t = today();
  if (range && range !== 'all') {
    if (range === 'ytd' || range === 'year') from = `${t.slice(0, 4)}-01-01`;
    else if (/^\d{1,4}d$/.test(range)) {
      const d = new Date(`${t}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - (parseInt(range, 10) - 1));
      from = iso(d);
    } else if (/^\d{4}$/.test(range)) {
      from = `${range}-01-01`;
      to = `${range}-12-31`;
    } else throw new ApiError(400, 'bad_range', 'range must be all, ytd, Nd (e.g. 30d) or a year (e.g. 2026)');
  }
  if (q.from) {
    if (!DATE.test(q.from)) throw new ApiError(400, 'bad_date', 'from must be YYYY-MM-DD');
    from = q.from;
  }
  if (q.to) {
    if (!DATE.test(q.to)) throw new ApiError(400, 'bad_date', 'to must be YYYY-MM-DD');
    to = q.to;
  }
  if (from && to && from > to) throw new ApiError(400, 'bad_range', 'from must be on or before to');
  const list = (v, name) => {
    if (!v) return null;
    const items = String(v).split(',').map((s) => s.trim()).filter(Boolean);
    if (!items.every((s) => ID.test(s))) throw new ApiError(400, `bad_${name}`, `invalid ${name} list`);
    return items.length ? items : null;
  };
  return { from, to, tools: list(q.tools, 'tools'), models: list(q.models, 'models') };
}



const num = (v) => Number(v) || 0;

function emptyTotals() {
  return { tokens: 0, input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, responses: 0 };
}

function addTo(t, r) {
  const input = num(r.input);
  const output = num(r.output);
  const reasoning = num(r.reasoning);
  const cacheRead = num(r.cache_read);
  const cacheWrite = num(r.cache_write);
  t.input += input;
  t.output += output;
  t.reasoning += reasoning;
  t.cacheRead += cacheRead;
  t.cacheWrite += cacheWrite;
  t.tokens += input + output + reasoning + cacheRead + cacheWrite;
  t.responses += num(r.messages);
  return t;
}

export const dateStr = (d) => (d instanceof Date ? iso(d) : String(d).slice(0, 10));

export function splitModel(model) {
  const i = model.indexOf('/');
  return i === -1 ? { provider: null, name: model } : { provider: model.slice(0, i), name: model.slice(i + 1) };
}


function periodKey(date, group) {
  if (group === 'day') return date;
  if (group === 'month') return date.slice(0, 7);
  if (group === 'year') return date.slice(0, 4);
  if (group === 'week') {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // ISO weeks start Monday
    return iso(d);
  }
  return 'total';
}

/** Time series. group: day|week|month|year|total. split: tool|model adds a per-key breakdown. */
export function usage(rows, filters, { group = 'day', split = null, fill = true } = {}) {
  if (!['day', 'week', 'month', 'year', 'total'].includes(group)) throw new ApiError(400, 'bad_group', 'group must be day, week, month, year or total');
  if (split && !['tool', 'model'].includes(split)) throw new ApiError(400, 'bad_split', 'split must be tool or model');
  const buckets = new Map();
  for (const r of rows) {
    const key = periodKey(r.date, group);
    const b = buckets.get(key) || { period: key, ...emptyTotals(), ...(split ? { split: {} } : {}) };
    addTo(b, r);
    if (split) {
      const k = split === 'tool' ? r.source : r.model;
      b.split[k] = addTo(b.split[k] || emptyTotals(), r);
    }
    buckets.set(key, b);
  }
  // Fill empty days so charts get a continuous series
  if (group === 'day' && fill && rows.length) {
    const start = filters.from || rows.reduce((m, r) => (r.date < m ? r.date : m), rows[0].date);
    const end = filters.to && filters.to < today() ? filters.to : today();
    for (let d = new Date(`${start}T00:00:00Z`); iso(d) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const k = iso(d);
      if (!buckets.has(k)) buckets.set(k, { period: k, ...emptyTotals(), ...(split ? { split: {} } : {}) });
    }
  }
  const out = [...buckets.values()].sort((a, b) => (a.period < b.period ? -1 : 1));
  if (split) {
    for (const b of out) {
      b.split = Object.fromEntries(Object.entries(b.split).sort((x, y) => y[1].tokens - x[1].tokens).map(([k, v]) => [k, v.tokens]));
    }
  }
  return out;
}

export function totals(rows) {
  return rows.reduce((t, r) => addTo(t, r), emptyTotals());
}

function grouped(rows, keyOf) {
  const map = new Map();
  for (const r of rows) {
    const key = keyOf(r);
    const g = map.get(key) || { key, ...emptyTotals(), firstUsed: r.date, lastUsed: r.date, tools: new Set(), models: new Set() };
    addTo(g, r);
    if (r.date < g.firstUsed) g.firstUsed = r.date;
    if (r.date > g.lastUsed) g.lastUsed = r.date;
    g.tools.add(r.source);
    g.models.add(r.model);
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.tokens - a.tokens);
}

/** Per-model totals. Cursor's public profile has no model detail and reports as cursor/all. */
export function models(rows) {
  const all = totals(rows).tokens || 1;
  return grouped(rows, (r) => `${r.source}\u0000${r.model}`).map((g) => {
    const [tool, model] = g.key.split('\u0000');
    const { provider, name } = splitModel(model);
    const { key, tools, models: _m, ...t } = g;
    return { model, provider, name, tool, ...t, share: t.tokens / all };
  });
}

export function tools(rows) {
  const all = totals(rows).tokens || 1;
  return grouped(rows, (r) => r.source).map((g) => {
    const { key, tools: _t, models: m, ...t } = g;
    return { tool: key, name: TOOL_NAMES[key] || key, ...t, share: t.tokens / all, models: [...m].filter((x) => x !== 'cursor/all').length };
  });
}

export function devices(rows, syncs) {
  const byDevice = grouped(rows.filter((r) => r.device !== 'cursor.com'), (r) => r.device);
  return byDevice.map((g) => {
    const { key, tools: t, models: _m, ...rest } = g;
    return { device: key, tools: [...t].sort(), lastSync: syncs.get(key) || null, ...rest };
  });
}

/** Daily totals in the shape the heatmap builder expects. */
function dailyActivity(handle, rows) {
  const byDate = new Map();
  for (const r of rows) {
    const t = num(r.input) + num(r.output) + num(r.reasoning) + num(r.cache_read) + num(r.cache_write);
    const d = byDate.get(r.date) || { date: r.date, count: 0, sources: {} };
    d.count += t;
    d.sources[r.source] = (d.sources[r.source] || 0) + t;
    byDate.set(r.date, d);
  }
  return { handle, activityCounts: [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1)) };
}

export function heatmap(handle, rows, q = {}) {
  const levels = q.levels ? Number(q.levels) : 5;
  if (!Number.isInteger(levels) || levels < 2 || levels > 10) throw new ApiError(400, 'bad_levels', 'levels must be 2-10');
  const range = q.range && /^(\d{1,3}d|365d|\d{4}|year|ytd)$/.test(q.range) ? (q.range === 'ytd' ? 'year' : q.range) : (q.year && /^\d{4}$/.test(q.year) ? q.year : 'year');
  const hm = buildHeatmap(dailyActivity(handle, rows), {
    range,
    levels,
    weekStart: q.weekStart === 'mon' ? 'mon' : 'sun',
    tools: q.tools ? String(q.tools).split(',') : null,
  });
  // Compact days: [date, tokens, level] keeps the grid small; null outside the range
  return {
    range: hm.range,
    levels,
    weekStart: q.weekStart === 'mon' ? 'mon' : 'sun',
    total: hm.total,
    max: hm.max,
    activeDays: hm.activeDays,
    months: hm.months.map(({ label, week }) => ({ label, week })),
    weeks: hm.weeks.map((w) => w.map((d) => (d ? { date: d.date, tokens: d.future ? null : d.count, level: d.level } : null))),
  };
}

export function stats(rows) {
  const t = totals(rows);
  const daily = usage(rows, {}, { group: 'day', fill: false });
  const active = daily.filter((d) => d.tokens > 0);
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of active) {
    run = prev && (new Date(`${d.period}T00:00:00Z`) - new Date(`${prev}T00:00:00Z`)) === 86400000 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d.period;
  }
  // Current streak: consecutive active days ending today or yesterday
  let current = 0;
  const activeSet = new Set(active.map((d) => d.period));
  const cursor = new Date(`${today()}T00:00:00Z`);
  if (!activeSet.has(iso(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeSet.has(iso(cursor))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const busiest = active.reduce((b, d) => (!b || d.tokens > b.tokens ? d : b), null);
  const m = models(rows).filter((x) => x.model !== 'cursor/all');
  const topModel = [...m].sort((a, b) => b.responses - a.responses)[0] || null;
  const topTool = tools(rows)[0] || null;
  const month = today().slice(0, 7);
  return {
    ...t,
    activeDays: active.length,
    firstDay: active[0]?.period || null,
    lastDay: active.at(-1)?.period || null,
    busiestDay: busiest ? { date: busiest.period, tokens: busiest.tokens } : null,
    longestStreak: longest,
    currentStreak: current,
    averagePerActiveDay: active.length ? Math.round(t.tokens / active.length) : 0,
    today: daily.find((d) => d.period === today())?.tokens || 0,
    thisMonth: daily.filter((d) => d.period.startsWith(month)).reduce((s, d) => s + d.tokens, 0),
    topTool: topTool ? { tool: topTool.tool, name: topTool.name, tokens: topTool.tokens } : null,
    topModel: topModel ? { model: topModel.model, tool: topModel.tool, responses: topModel.responses, tokens: topModel.tokens } : null,
  };
}


export function toCsv(rows) {
  if (!rows.length) return '';
  const flat = rows.map((r) => {
    const o = {};
    for (const [k, v] of Object.entries(r)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k2, v2] of Object.entries(v)) o[`${k}.${k2}`] = v2;
      else o[k] = Array.isArray(v) ? v.join(' ') : v;
    }
    return o;
  });
  const cols = [...new Set(flat.flatMap((r) => Object.keys(r)))];
  const cell = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return `${[cols.join(','), ...flat.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n')}\n`;
}

/** Apply parsed filters to rows in memory (the hosted API does this in SQL). */
export function filterRows(rows, f) {
  return rows.filter((r) => (!f.from || r.date >= f.from)
    && (!f.to || r.date <= f.to)
    && (!f.tools || f.tools.includes(r.source))
    && (!f.models || f.models.includes(r.model)));
}
