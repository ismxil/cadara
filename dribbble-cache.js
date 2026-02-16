/**
 * Dribbble Cache — Dribbble shots caching layer
 * 
 * Fetches shots from the Cloudflare Worker proxy (which scrapes Dribbble),
 * caches in localStorage. Similar pattern to project-cache.js.
 */
window.DribbbleCache = (function () {
    var API_BASE = 'https://notion-proxy.ismxilahmad.workers.dev';
    var CACHE_KEY = 'dribbble_shots';
    var CACHE_TS_KEY = 'dribbble_shots_ts';
    var CACHE_TTL = 60 * 60 * 1000; // 1 hour

    /**
     * Get all shots. Returns cached data instantly if available,
     * refreshes in background if stale.
     */
    function getShots(onReady) {
        var cached = readCache();
        if (cached) {
            onReady(cached, { fromCache: true });
            if (isCacheStale()) {
                fetchShots().then(function (fresh) {
                    if (fresh) onReady(fresh, { fromCache: false, refreshed: true });
                });
            }
        } else {
            fetchShots().then(function (shots) {
                onReady(shots || null, { fromCache: false });
            });
        }
    }

    // ── Internal helpers ──

    function readCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function writeCache(shots) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(shots));
            localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        } catch (e) { /* fail silently */ }
    }

    function isCacheStale() {
        var ts = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0', 10);
        return Date.now() - ts > CACHE_TTL;
    }

    async function fetchShots() {
        try {
            var resp = await fetch(API_BASE + '/dribbble');
            if (!resp.ok) {
                console.warn('DribbbleCache: /dribbble returned', resp.status);
                return null;
            }
            var data = await resp.json();
            var shots = data.shots || [];
            if (shots.length) writeCache(shots);
            return shots;
        } catch (e) {
            console.warn('DribbbleCache: fetch error', e);
            return null;
        }
    }

    return { getShots: getShots };
})();
