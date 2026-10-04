/**
 * ==============================================================================
 * CLIENT-SIDE WEATHER & INUNDATION DATABASE ENGINE (IndexedDB / LocalStore)
 * Smart India Hackathon 2026 | Problem Statement ID: 26071
 * ==============================================================================
 * 
 * Provides high-performance client-side caching, search history persistence,
 * and offline-capable storage to respect free-tier rate limits and ensure
 * instant demo responsiveness.
 */

const DB_PREFIX = "imd_early_warning_";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

class LocalWeatherDatabase {
  constructor() {
    this.memoryCache = new Map();
    this.stats = {
      reads: 0,
      writes: 0,
      cacheHits: 0,
      cacheMisses: 0,
      status: "CONNECTED",
      engine: "Local Storage & In-Memory Indexed Store",
      lastSync: new Date().toLocaleTimeString()
    };
  }

  /**
   * Generates a spatial cache key rounded to 2 decimal places (~1.1 km)
   */
  getSpatialKey(lat, lon) {
    return `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
  }

  /**
   * Retrieves a cached weather scenario if valid and within TTL
   */
  getCachedScenario(lat, lon) {
    this.stats.reads++;
    const key = this.getSpatialKey(lat, lon);
    const storageKey = `${DB_PREFIX}forecast_${key}`;

    // 1. Check in-memory cache
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (Date.now() - item.timestamp < CACHE_TTL_MS) {
        this.stats.cacheHits++;
        return item.data;
      }
    }

    // 2. Check persistent localStorage
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const item = JSON.parse(raw);
        if (Date.now() - item.timestamp < CACHE_TTL_MS) {
          this.memoryCache.set(key, item);
          this.stats.cacheHits++;
          return item.data;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.warn("Database read error:", e);
    }

    this.stats.cacheMisses++;
    return null;
  }

  /**
   * Saves a weather scenario to the database with a timestamp
   */
  saveScenario(lat, lon, scenarioData) {
    this.stats.writes++;
    this.stats.lastSync = new Date().toLocaleTimeString();
    const key = this.getSpatialKey(lat, lon);
    const storageKey = `${DB_PREFIX}forecast_${key}`;
    const payload = {
      timestamp: Date.now(),
      data: scenarioData
    };

    this.memoryCache.set(key, payload);

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      // If quota exceeded, purge older entries
      this.purgeExpired();
    }
  }

  /**
   * Adds a searched location to search history (keeps last 5)
   */
  addSearchHistory(location) {
    try {
      const key = `${DB_PREFIX}search_history`;
      let history = this.getSearchHistory();
      // Remove duplicate
      history = history.filter(h => h.name.toLowerCase() !== location.name.toLowerCase());
      history.unshift({
        name: location.name,
        state: location.state || "",
        country: location.country || "",
        lat: location.lat,
        lon: location.lon,
        timestamp: Date.now()
      });
      // Cap at 5 items
      history = history.slice(0, 5);
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn("Error saving search history:", e);
    }
  }

  /**
   * Gets recent search history
   */
  getSearchHistory() {
    try {
      const raw = localStorage.getItem(`${DB_PREFIX}search_history`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Default initial quick-access suggestions for demo
    return [
      { name: "Kharar", state: "Punjab", country: "India", lat: 30.75, lon: 76.66 },
      { name: "Mumbai", state: "Maharashtra", country: "India", lat: 19.076, lon: 72.877 },
      { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707 },
      { name: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946 },
      { name: "New Delhi", state: "Delhi", country: "India", lat: 28.6139, lon: 77.2090 }
    ];
  }

  /**
   * Returns live diagnostic metrics for the database inspection panel
   */
  getDatabaseHealth() {
    let storedItemsCount = 0;
    let approximateBytes = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DB_PREFIX)) {
          storedItemsCount++;
          approximateBytes += (localStorage.getItem(k) || "").length * 2;
        }
      }
    } catch (e) {}

    return {
      status: this.stats.status,
      engine: this.stats.engine,
      totalEntries: storedItemsCount + this.memoryCache.size,
      storageUsedKb: (approximateBytes / 1024).toFixed(1),
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      reads: this.stats.reads,
      writes: this.stats.writes,
      hitRatePct: this.stats.reads > 0 
        ? ((this.stats.cacheHits / this.stats.reads) * 100).toFixed(1) 
        : "100.0",
      lastSync: this.stats.lastSync
    };
  }

  /**
   * Purges expired entries from cache
   */
  purgeExpired() {
    try {
      const now = Date.now();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${DB_PREFIX}forecast_`)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const item = JSON.parse(raw);
            if (now - item.timestamp >= CACHE_TTL_MS) {
              localStorage.removeItem(k);
            }
          }
        }
      }
    } catch (e) {}
  }

  /**
   * Resets local cache
   */
  clearDatabase() {
    this.memoryCache.clear();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DB_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
    this.stats.lastSync = new Date().toLocaleTimeString();
  }
}

export const localDB = new LocalWeatherDatabase();
