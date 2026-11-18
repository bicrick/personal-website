import { useEffect, useState } from 'react';

let pending = null;

async function loadActivity() {
  const tokenApi = process.env.REACT_APP_TOKEN_API;
  if (tokenApi) {
    try {
      const res = await fetch(`${tokenApi}/api/activity`);
      if (res.ok) return await res.json();
    } catch (_) {
      // fall through to the cursor-only endpoint
    }
  }

  try {
    const res = await fetch('/api/cursor-activity');
    if (res.ok) return await res.json();
  } catch (_) {
    // fall through to static snapshot for local/dev
  }

  const res = await fetch(`${process.env.PUBLIC_URL}/cursor-activity.json`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}

/** Combined token activity, shared across components for the page lifetime. */
export default function useTokenActivity() {
  const [state, setState] = useState({ data: null, error: false });

  useEffect(() => {
    let cancelled = false;
    pending ||= loadActivity().catch((err) => {
      pending = null;
      throw err;
    });
    pending
      .then((data) => !cancelled && setState({ data, error: false }))
      .catch(() => !cancelled && setState({ data: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
