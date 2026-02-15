/**
 * Blog Cache — shared RSS feed caching layer
 * 
 * Fetches the Substack RSS feed once, parses all articles into JSON,
 * and stores them in localStorage. Subsequent page loads read from
 * cache instantly. Cache auto-refreshes after CACHE_TTL.
 */
window.BlogCache = (function () {
    const FEED_URL = 'https://wandarer.com/feed';
    const CACHE_KEY = 'blog_articles';
    const CACHE_TS_KEY = 'blog_articles_ts';
    const CACHE_TTL = 60 * 60 * 1000; // 1 hour

    const CORS_PROXIES = [
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    /**
     * Get all articles. Returns cached data instantly if available,
     * and refreshes in the background if stale.
     * @param {Function} onReady - called with articles array (may be called twice: cache then fresh)
     */
    function getArticles(onReady) {
        const cached = readCache();

        if (cached) {
            // Serve from cache immediately
            onReady(cached, { fromCache: true });

            // If stale, refresh in background
            if (isCacheStale()) {
                fetchAndCache().then(fresh => {
                    if (fresh) onReady(fresh, { fromCache: false, refreshed: true });
                });
            }
        } else {
            // No cache — must fetch
            fetchAndCache().then(articles => {
                onReady(articles || null, { fromCache: false });
            });
        }
    }

    /**
     * Get a single article by slug.
     * @param {string} slug
     * @param {Function} onReady - called with article object or null
     */
    function getArticle(slug, onReady) {
        getArticles((articles, meta) => {
            if (!articles) {
                onReady(null, meta);
                return;
            }
            const article = articles.find(a => a.slug === slug);
            onReady(article || null, meta);
        });
    }

    // ── Internal helpers ──

    function readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeCache(articles) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
            localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        } catch {
            // localStorage full or unavailable — fail silently
        }
    }

    function isCacheStale() {
        const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0', 10);
        return Date.now() - ts > CACHE_TTL;
    }

    async function fetchAndCache() {
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            try {
                const proxyUrl = CORS_PROXIES[i](FEED_URL);
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;

                const xmlText = await response.text();
                const articles = parseRSS(xmlText);

                if (articles && articles.length > 0) {
                    writeCache(articles);
                    return articles;
                }
            } catch (e) {
                console.warn(`BlogCache: proxy ${i} failed`, e);
                continue;
            }
        }
        return null;
    }

    function parseRSS(xmlText) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');
        const items = xml.querySelectorAll('item');
        const articles = [];

        items.forEach(item => {
            const title = item.querySelector('title')?.textContent?.trim() || '';
            const description = item.querySelector('description')?.textContent?.trim() || '';
            const link = item.querySelector('link')?.textContent?.trim() || '';
            const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';

            const contentEncoded = item.getElementsByTagNameNS(
                'http://purl.org/rss/1.0/modules/content/', 'encoded'
            )[0]?.textContent || '';

            // Extract slug from link
            const slugMatch = link.match(/\/p\/([^/?#]+)/);
            const slug = slugMatch ? slugMatch[1] : '';

            if (!slug) return;

            articles.push({
                title,
                description,
                link,
                slug,
                pubDate,
                year: pubDate ? new Date(pubDate).getFullYear() : '',
                content: contentEncoded,
            });
        });

        return articles;
    }

    /**
     * Force a fresh fetch, bypassing cache.
     */
    function refresh() {
        return fetchAndCache();
    }

    return { getArticles, getArticle, refresh };
})();
