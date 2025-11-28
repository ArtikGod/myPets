class CacheService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
        this.maxCacheSize = 1000;
        this.cleanupInterval = 60 * 1000;

        this.startCleanupTimer();
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        cached.accessCount++;
        cached.lastAccessed = Date.now();
        return cached.data;
    }

    set(key, data, customTimeout = null) {
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLeastUsed();
        }

        const timeout = customTimeout
            ? customTimeout * 1000
            : this.cacheTimeout;

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 1,
            timeout,
        });
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    evictLeastUsed() {
        let leastUsedKey = null;
        let leastAccessCount = Infinity;
        let oldestAccess = Infinity;

        for (const [key, value] of this.cache.entries()) {
            if (
                value.accessCount < leastAccessCount ||
                (value.accessCount === leastAccessCount &&
                    value.lastAccessed < oldestAccess)
            ) {
                leastUsedKey = key;
                leastAccessCount = value.accessCount;
                oldestAccess = value.lastAccessed;
            }
        }

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
        }
    }

    startCleanupTimer() {
        setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];

            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > value.timeout) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach((key) => this.cache.delete(key));
        }, this.cleanupInterval);
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            timeout: this.cacheTimeout,
            entries: Array.from(this.cache.entries()).map(([key, value]) => ({
                key,
                accessCount: value.accessCount,
                age: Date.now() - value.timestamp,
                lastAccessed: Date.now() - value.lastAccessed,
            })),
        };
    }
}

module.exports = new CacheService();
