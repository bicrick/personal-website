const HANDLE = 'bicrick';
const PROFILE_URL = `https://cursor.com/@${HANDLE}`;

function extractProfile(html) {
  const pushPattern = /self\.__next_f\.push\(\[1,(.*?)\]\)\s*<\/script>/gs;
  let match;

  while ((match = pushPattern.exec(html)) !== null) {
    try {
      const decoded = JSON.parse(match[1]);
      if (typeof decoded !== 'string') continue;
      if (!decoded.includes('"activityCounts"') || !decoded.includes(`"handle":"${HANDLE}"`)) {
        continue;
      }

      const colon = decoded.indexOf(':');
      if (colon === -1) continue;

      const data = JSON.parse(decoded.slice(colon + 1));
      const profile = data?.[3]?.profile;
      if (profile?.handle === HANDLE) {
        return profile;
      }
    } catch (_) {
      // try next push payload
    }
  }

  throw new Error('profile payload not found');
}

function toPublicPayload(profile) {
  const stats = profile.stats || {};
  const agents = (stats.agentsLocal || 0) + (stats.agentsCloud || 0);

  return {
    handle: profile.handle,
    stats: {
      longestAgentSeconds: stats.longestAgentSeconds || 0,
      agents,
      agentsLocal: stats.agentsLocal || 0,
      agentsCloud: stats.agentsCloud || 0,
      longestStreak: stats.longestStreak || 0,
      currentStreak: stats.currentStreak || 0,
      mostActiveMonth: stats.mostActiveMonth || null,
      mostActiveDay: stats.mostActiveDay || null,
    },
    activityCounts: profile.activityCounts || [],
    agentsOverTime: profile.agentsOverTime || [],
    tokensOverTime: profile.tokensOverTime || [],
    fetchedAt: new Date().toISOString(),
    source: PROFILE_URL,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(PROFILE_URL, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'bicrick.com-cursor-activity/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`profile fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const profile = extractProfile(html);
    return res.status(200).json(toPublicPayload(profile));
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to load Cursor activity',
      message: error.message,
    });
  }
};
