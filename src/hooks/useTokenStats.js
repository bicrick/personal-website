import { useEffect, useState } from 'react';
import { apiRange, tokenApi } from '../lib/tokentracker';

/** Run one or more tokentracker API queries; re-runs when `deps` change. */
export function useTokenQuery(run, deps) {
  const [state, setState] = useState({ data: null, error: false });

  useEffect(() => {
    let cancelled = false;
    run()
      .then((data) => !cancelled && setState({ data, error: false }))
      .catch(() => !cancelled && setState((s) => ({ data: s.data, error: true })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

const PROVIDER_NAMES = { 'github-copilot': 'github copilot' };
const providerOf = (model) => PROVIDER_NAMES[model.split('/')[0]] || model.split('/')[0];
// claude-opus-4-5 -> claude-opus-4.5, so the same model from different tools merges
const modelName = (model) => (model.split('/').slice(1).join('/') || model).replace(/-(\d)-(\d)(?=$|-)/, '-$1.$2');

/**
 * Everything the tokens page shows, built from API queries:
 *   /usage (daily series by tool), /stats, /models, /tools, /devices, profile.
 * `selected` is a Set of tool ids; `rangeDays` is null (this year), 90 or 30.
 */
export async function loadTokenStats(selected, allTools, rangeDays) {
  const range = apiRange(rangeDays);
  const tools = allTools.every((t) => selected.has(t)) ? null : [...selected].join(',');

  const [heatmap, usage, stats, models, allModels, toolRows, devices, profile] = await Promise.all([
    tokenApi('/heatmap', { range: rangeDays ? `${rangeDays}d` : 'year', tools }),
    tokenApi('/usage', { range, group: 'day', split: 'tool', tools }),
    tokenApi('/stats', { range, tools }),
    tokenApi('/models', { range, tools }),
    tokenApi('/models'),
    tokenApi('/tools', { range }),
    tokenApi('/devices'),
    tokenApi(''),
  ]);

  // Colour levels come from the heatmap endpoint so every calendar matches the API's scale
  const levels = new Map();
  for (const week of heatmap.weeks) for (const d of week) if (d) levels.set(d.date, d.level);

  let running = 0;
  const series = usage.rows.map((r) => {
    running += r.tokens;
    return { date: r.period, count: r.tokens, sources: r.split || {}, total: running, level: levels.get(r.period) ?? 0 };
  });

  const byName = new Map();
  for (const m of models.rows) {
    if (m.model === 'cursor/all') continue;
    const name = modelName(m.model);
    const e = byName.get(name) || { name, messages: 0, tokens: 0 };
    e.messages += m.responses;
    e.tokens += m.tokens;
    byName.set(name, e);
  }
  const favorite = [...byName.values()].sort((a, b) => b.messages - a.messages)[0] || null;

  const providers = {};
  for (const m of allModels.rows) {
    if (m.model !== 'cursor/all') (providers[m.tool] ||= new Set()).add(providerOf(m.model));
  }

  const synced = { cursor: profile.lastSync };
  for (const d of devices.rows) {
    for (const t of d.tools) if (!synced[t] || d.lastSync > synced[t]) synced[t] = d.lastSync;
  }

  return {
    series,
    total: stats.tokens,
    busiest: stats.busiestDay ? { date: stats.busiestDay.date, count: stats.busiestDay.tokens } : null,
    longest: stats.longestStreak,
    activeDays: stats.activeDays,
    avgActive: stats.averagePerActiveDay,
    // Per-source totals for the range, unfiltered, so a switched-off tool still shows its size
    sourceTotals: Object.fromEntries(toolRows.rows.map((t) => [t.tool, t.tokens])),
    favorite,
    providers,
    synced,
  };
}

export function useTokenStats(selected, allTools, rangeDays) {
  const key = [...selected].sort().join(',');
  return useTokenQuery(() => loadTokenStats(selected, allTools, rangeDays), [key, rangeDays]);
}
