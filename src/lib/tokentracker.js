// tokentracker data client. All token data on this site comes from the static
// files GitHub Pages serves from github.com/bicrick/tokentracker-data. We load
// the raw daily rows once and run tokentracker's own query functions on them in
// the browser, so every chart can filter by range and tool with no server.
// Docs: https://tokentracker.patrickbrown.dev/docs
import { devices, filterRows, heatmap, models, parseFilters, stats, tools, totals, usage } from './tokentracker-core/query';

export const HANDLE = 'bicrick';
const ROWS_URL =
  process.env.REACT_APP_TOKEN_ROWS || `https://${HANDLE}.github.io/tokentracker-data/api/v1/rows.json`;

let rowsPromise = null;

function loadRows() {
  if (!rowsPromise) {
    rowsPromise = fetch(ROWS_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error(`tokentracker data ${res.status}`);
        const body = await res.json();
        return { rows: body.rows || [], machines: body.machines || [] };
      })
      .catch((err) => {
        rowsPromise = null; // let a later render retry
        throw err;
      });
  }
  return rowsPromise;
}

const cache = new Map();

function compute(path, params, { rows: all, machines }) {
  const filters = parseFilters(params);
  const syncs = new Map(machines.map((m) => [m.device, m.updatedAt]));
  const rows = filterRows(all, filters);
  switch (path) {
    case '/usage': {
      const group = String(params.group || 'day');
      const split = params.split || null;
      return { group, split, totals: totals(rows), rows: usage(rows, filters, { group, split, fill: params.fill !== 'false' }) };
    }
    case '/models':
      return { rows: models(rows) };
    case '/tools':
      return { rows: tools(rows) };
    case '/stats':
      return stats(rows);
    case '/heatmap':
      // The heatmap does its own calendar range handling
      return heatmap(HANDLE, filterRows(all, { ...filters, from: null, to: null }), params);
    case '/devices':
      return { rows: devices(rows, syncs) };
    case '':
      // Profile: only what this site reads
      return { handle: HANDLE, totals: totals(rows), lastSync: [...syncs.values()].sort().at(-1) || null };
    default:
      throw new Error(`unknown tokentracker query ${path}`);
  }
}

/**
 * Same queries as the old v1 API (path + params), answered locally from rows.json.
 * Results are cached for the page lifetime, so identical queries are computed once.
 */
export function tokenApi(path = '', params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  const key = `${path}?${new URLSearchParams(clean).toString()}`;
  if (!cache.has(key)) {
    cache.set(key, loadRows().then((all) => compute(path, clean, all)).catch((err) => {
      cache.delete(key);
      throw err;
    }));
  }
  return cache.get(key);
}

/** Map a UI range (null = this year, or a day count) to the query's range param. */
export const apiRange = (rangeDays) => (rangeDays ? `${rangeDays}d` : 'ytd');
