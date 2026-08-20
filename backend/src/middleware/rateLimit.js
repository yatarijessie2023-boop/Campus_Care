const windows = new Map();

function getClientKey(req, scope = 'global') {
  const deviceId = req.get('x-device-id') || 'no-device';
  const account = req.body?.username || req.user?.id || 'no-account';
  const ip = req.ip || req.socket?.remoteAddress || 'no-ip';
  return `${scope}:${ip}:${deviceId}:${account}`;
}

function prune(now) {
  for (const [key, entry] of windows.entries()) {
    if (now - entry.lastSeen > 2 * 60 * 60 * 1000) windows.delete(key);
  }
}

export function createRateLimiter({ limit, windowMs, scope = 'global', message }) {
  return (req, res, next) => {
    const now = Date.now();
    prune(now);
    const key = getClientKey(req, scope);
    const entry = windows.get(key) || { hits: [], lastSeen: now };
    entry.lastSeen = now;
    entry.hits = entry.hits.filter((ts) => now - ts < windowMs);
    if (entry.hits.length >= limit) {
      const retryAfter = Math.ceil((windowMs - (now - entry.hits[0])) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: message || `操作過於頻繁，請稍後再試`
      });
    }
    entry.hits.push(now);
    windows.set(key, entry);
    next();
  };
}

