/* Shared token-page data helpers (desktop + mobile layouts). */
export const TIME_ZONE = 'America/Chicago';
export const TRACKER_URL = 'https://github.com/bicrick/tokentracker';
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PROVIDER_NAMES = {
  'github-copilot': 'github copilot',
};

export const SOURCES = [
  { id: 'cursor', name: 'cursor', method: 'public profile' },
  { id: 'claude-code', name: 'claude code', method: 'local collector' },
  { id: 'opencode', name: 'opencode', method: 'local collector' },
];

export const VIEWS = [
  { id: 'heatmap', label: 'heatmap' },
  { id: 'cumulative', label: 'cumulative' },
  { id: 'daily', label: 'daily' },
];

export const RANGES = [
  { id: 'year', label: 'ytd', days: null },
  { id: '90', label: '90d', days: 90 },
  { id: '30', label: '30d', days: 30 },
];

export function formatCount(count) {
  if (count >= 1e9) return `${(count / 1e9).toFixed(2).replace(/\.?0+$/, '')}b`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(1).replace(/\.0$/, '')}m`;
  if (count >= 1e3) return `${(count / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(count));
}

export function formatDay(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function timeAgo(iso) {
  if (!iso) return 'never';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function modelName(model) {
  const id = model.split('/').slice(1).join('/') || model;
  // claude-opus-4-5 -> claude-opus-4.5
  return id.replace(/-(\d)-(\d)(?=$|-)/, '-$1.$2');
}

function providerOf(model) {
  const provider = model.split('/')[0];
  return PROVIDER_NAMES[provider] || provider;
}

/** Daily counts restricted to the selected tools. */
function filterActivity(activityCounts, selected) {
  return (activityCounts || []).map((d) => {
    const sources = d.sources || { cursor: d.count };
    const kept = {};
    let count = 0;
    for (const [source, value] of Object.entries(sources)) {
      if (!selected.has(source)) continue;
      kept[source] = value;
      count += value;
    }
    return { date: d.date, count, sources: kept };
  });
}

export function computeStats(data, selected, rangeDays) {
  const today = todayIso();
  const year = today.slice(0, 4);
  const start = rangeDays ? addDays(today, -(rangeDays - 1)) : `${year}-01-01`;

  const filtered = filterActivity(data.activityCounts, selected);
  const byDate = new Map(filtered.map((d) => [d.date, d]));

  // Dense series over the range so charts have every day, including zeros
  const series = [];
  let running = 0;
  for (let iso = start; iso <= today; iso = addDays(iso, 1)) {
    const day = byDate.get(iso) || { date: iso, count: 0, sources: {} };
    running += day.count;
    series.push({ ...day, total: running });
  }

  const total = running;
  const active = series.filter((d) => d.count > 0);
  const busiest = series.reduce((best, d) => (!best || d.count > best.count ? d : best), null);

  let longest = 0;
  let run = 0;
  for (const d of series) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const sourceTotals = {};
  for (const d of series) {
    for (const [source, value] of Object.entries(d.sources)) {
      sourceTotals[source] = (sourceTotals[source] || 0) + value;
    }
  }

  // Cursor's public profile doesn't break usage down by model.
  // The same model can come through several tools, so merge by name.
  const byName = new Map();
  const providers = {};
  for (const m of data.models || []) {
    if (m.model === 'cursor/all') continue;
    (providers[m.source] ||= new Set()).add(providerOf(m.model));
    if (!selected.has(m.source)) continue;
    const name = modelName(m.model);
    const entry = byName.get(name) || { name, messages: 0, tokens: 0 };
    entry.messages += m.messages || 0;
    entry.tokens += m.tokens || 0;
    byName.set(name, entry);
  }
  const favorite = [...byName.values()].sort((a, b) => b.messages - a.messages)[0] || null;

  const synced = {};
  for (const d of data.devices || []) {
    if (!synced[d.source] || d.updatedAt > synced[d.source]) synced[d.source] = d.updatedAt;
  }

  return {
    series,
    filtered,
    total,
    busiest: busiest?.count ? busiest : null,
    longest,
    activeDays: active.length,
    avgActive: active.length ? total / active.length : 0,
    sourceTotals,
    favorite,
    providers,
    synced,
  };
}
