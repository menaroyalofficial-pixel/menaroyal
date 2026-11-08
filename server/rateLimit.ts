/**
 * Simple in-memory rate limit (per server instance).
 * Good enough for Demo Day. For production traffic, move it to a shared
 * store (Vercel KV / Upstash) so all instances share the same counts.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const allowed = recent.length < max;
  if (allowed) recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear(); // keep memory bounded
  return {
    allowed,
    remaining: Math.max(0, max - recent.length),
    retryAfterMs: allowed ? 0 : windowMs - (now - recent[0]),
  };
}

export function resetRateLimits() {
  hits.clear();
}
