// tokentracker v1 API client. All token data on this site comes from here.
// Docs: https://tokentracker-nu.vercel.app/docs
const BASE = process.env.REACT_APP_TOKEN_API || 'https://tokentracker-nu.vercel.app';
export const HANDLE = 'bicrick';

const cache = new Map();

/**
 * GET /api/v1/users/{handle}{path}?{params}. Responses are cached for the page
 * lifetime, so components asking for the same query share one request.
 */
export function tokenApi(path = '', params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  const url = `${BASE}/api/v1/users/${HANDLE}${path}${query ? `?${query}` : ''}`;
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(async (res) => {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error?.message || `tokentracker ${res.status}`);
      return body;
    }).catch((err) => {
      cache.delete(url); // let a later render retry
      throw err;
    }));
  }
  return cache.get(url);
}

/** Map a UI range (null = this year, or a day count) to the API's range param. */
export const apiRange = (rangeDays) => (rangeDays ? `${rangeDays}d` : 'ytd');
