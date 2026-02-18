import { Request, Response, NextFunction } from 'express';

interface WindowEntry {
  timestamps: number[];
}

// NOTE: This in-memory store is per-process.  In a multi-instance deployment
// (e.g. behind a load balancer), replace with a shared store such as Redis to
// enforce rate limits consistently across all instances.
const store = new Map<string, WindowEntry>();

export function rateLimit(windowMs?: number, maxRequests?: number) {
  const window = windowMs ?? 60000;
  const max = maxRequests ?? 100;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    // Sliding window: remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => now - t < window);

    if (entry.timestamps.length >= max) {
      const oldestValid = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestValid + window - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: { message: 'Too many requests, please try again later' },
      });
      return;
    }

    entry.timestamps.push(now);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(max - entry.timestamps.length));
    next();
  };
}

/** Clear the rate limit store (for testing) */
export function clearRateLimitStore(): void {
  store.clear();
}
