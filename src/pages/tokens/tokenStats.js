/* Shared token-page data helpers (desktop + mobile layouts). */
export const TIME_ZONE = 'America/Chicago';
export const TRACKER_URL = 'https://github.com/bicrick/tokentracker';
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
