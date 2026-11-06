const buckets = new Map();

export function rateLimit({ limit = 20, windowMs = 15 * 60 * 1000 } = {}) {
    return (req, res, next) => {
        const now = Date.now();
        if (buckets.size > 5000) {
            for (const [entry, value] of buckets) if (value.expiresAt <= now) buckets.delete(entry);
        }
        const key = `${req.ip}:${req.baseUrl}${req.path}`;
        const current = buckets.get(key);
        if (!current || current.expiresAt <= now) {
            buckets.set(key, { count: 1, expiresAt: now + windowMs });
            return next();
        }
        if (current.count >= limit) {
            res.set('Retry-After', String(Math.ceil((current.expiresAt - now) / 1000)));
            return res.status(429).json({ message: 'Too many requests. Please wait a little and try again.' });
        }
        current.count += 1;
        next();
    };
}
