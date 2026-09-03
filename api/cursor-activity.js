const HANDLE = 'bicrick';
const PROFILE_URL = `https://cursor.com/@${HANDLE}`;
const HANDLE_NEEDLE = `"handle":"${HANDLE}"`;

function sliceBalancedObject(text, start) {
  if (text[start] !== '{') return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function profileFromObject(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const profile = parsed.handle === HANDLE ? parsed : parsed.profile;
  if (profile?.handle === HANDLE && Array.isArray(profile.activityCounts)) {
    return profile;
  }
  return null;
}

function findProfileInText(text) {
  let from = 0;

  while (from < text.length) {
    const handleAt = text.indexOf(HANDLE_NEEDLE, from);
    if (handleAt === -1) return null;

    let start = handleAt;
    while (start >= 0) {
      start = text.lastIndexOf('{', start);
      if (start === -1) break;

      const blob = sliceBalancedObject(text, start);
      if (blob) {
        try {
          const profile = profileFromObject(JSON.parse(blob));
          if (profile) return profile;
        } catch (_) {
          // keep walking outward
        }
      }

      start -= 1;
    }

    from = handleAt + HANDLE_NEEDLE.length;
  }

  return null;
}

function collectFlightStrings(html) {
  const strings = [];
  const pushPattern = /self\.__next_f\.push\(\[1,(.*?)\]\)\s*<\/script>/gs;
  let match;

  while ((match = pushPattern.exec(html)) !== null) {
    try {
      const decoded = JSON.parse(match[1]);
      if (typeof decoded === 'string') {
        strings.push(decoded);
      }
    } catch (_) {
      // skip malformed push payloads
    }
  }

  return strings;
}

function extractProfile(html) {
  for (const flight of collectFlightStrings(html)) {
    const profile = findProfileInText(flight);
    if (profile) return profile;
  }

  const fromHtml = findProfileInText(html);
  if (fromHtml) return fromHtml;

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
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

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

module.exports.extractProfile = extractProfile;
module.exports.toPublicPayload = toPublicPayload;
