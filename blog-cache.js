/**
 * Blog Cache — shared RSS feed caching layer
 * 
 * Fetches the Substack RSS feed once, parses all articles into JSON,
 * and stores them in localStorage. Subsequent page loads read from
 * cache instantly. Cache auto-refreshes after CACHE_TTL.
 */
window.BlogCache = (function () {
    var FEED_URL = 'https://wandarer.com/feed';
    var CACHE_KEY = 'blog_articles';
    var CACHE_TS_KEY = 'blog_articles_ts';
    var CACHE_TTL = 60 * 60 * 1000; // 1 hour

    // rss2json returns clean JSON — no XML parsing or CORS proxy needed
    var RSS2JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED_URL);

    // Fallback CORS proxies for full content (rss2json may truncate content)
    var CORS_PROXIES = [
        function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
        function (url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); },
    ];

    /**
     * Get all articles. Returns cached data instantly if available,
     * and refreshes in the background if stale.
     */
    function getArticles(onReady) {
        var cached = readCache();

        if (cached) {
            onReady(cached, { fromCache: true });
            if (isCacheStale()) {
                fetchAndCache().then(function (fresh) {
                    if (fresh) onReady(fresh, { fromCache: false, refreshed: true });
                });
            }
        } else {
            fetchAndCache().then(function (articles) {
                onReady(articles || null, { fromCache: false });
            });
        }
    }

    /**
     * Get a single article by slug.
     */
    function getArticle(slug, onReady) {
        getArticles(function (articles, meta) {
            if (!articles) { onReady(null, meta); return; }
            var article = null;
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].slug === slug) { article = articles[i]; break; }
            }
            onReady(article, meta);
        });
    }

    // ── Internal helpers ──

    function readCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function writeCache(articles) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
            localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        } catch (e) { /* localStorage full — fail silently */ }
    }

    function isCacheStale() {
        var ts = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0', 10);
        return Date.now() - ts > CACHE_TTL;
    }

    async function fetchAndCache() {
        // Strategy 1: rss2json.com — returns clean JSON, always CORS-friendly
        try {
            var resp = await fetch(RSS2JSON_URL);
            if (resp.ok) {
                var data = await resp.json();
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    var articles = parseRss2Json(data.items);
                    if (articles.length > 0) {
                        writeCache(articles);
                        // Try to enrich with full content from RSS XML in the background
                        enrichWithFullContent(articles);
                        return articles;
                    }
                }
            }
        } catch (e) {
            console.warn('BlogCache: rss2json failed', e);
        }

        // Strategy 2: CORS proxies for raw RSS XML
        for (var i = 0; i < CORS_PROXIES.length; i++) {
            try {
                var proxyUrl = CORS_PROXIES[i](FEED_URL);
                var response = await fetch(proxyUrl);
                if (!response.ok) continue;
                var xmlText = await response.text();
                var parsed = parseRSS(xmlText);
                if (parsed && parsed.length > 0) {
                    writeCache(parsed);
                    return parsed;
                }
            } catch (e) {
                console.warn('BlogCache: proxy ' + i + ' failed', e);
                continue;
            }
        }
        return null;
    }

    function parseRss2Json(items) {
        var articles = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var link = item.link || '';
            var slugMatch = link.match(/\/p\/([^/?#]+)/);
            var slug = slugMatch ? slugMatch[1] : '';
            if (!slug) continue;
            articles.push({
                title: item.title || '',
                description: item.description || '',
                link: link,
                slug: slug,
                pubDate: item.pubDate || '',
                year: item.pubDate ? new Date(item.pubDate).getFullYear() : '',
                content: item.content || item.description || '',
            });
        }
        return articles;
    }

    function parseRSS(xmlText) {
        var parser = new DOMParser();
        var xml = parser.parseFromString(xmlText, 'text/xml');
        var items = xml.querySelectorAll('item');
        var articles = [];

        items.forEach(function (item) {
            var title = (item.querySelector('title') || {}).textContent || '';
            var description = (item.querySelector('description') || {}).textContent || '';
            var link = (item.querySelector('link') || {}).textContent || '';
            var pubDate = (item.querySelector('pubDate') || {}).textContent || '';

            var contentEl = item.getElementsByTagNameNS(
                'http://purl.org/rss/1.0/modules/content/', 'encoded'
            );
            var contentEncoded = contentEl.length ? contentEl[0].textContent : '';

            var slugMatch = link.match(/\/p\/([^/?#]+)/);
            var slug = slugMatch ? slugMatch[1] : '';
            if (!slug) return;

            articles.push({
                title: title.trim(),
                description: description.trim(),
                link: link.trim(),
                slug: slug,
                pubDate: pubDate.trim(),
                year: pubDate ? new Date(pubDate).getFullYear() : '',
                content: contentEncoded,
            });
        });
        return articles;
    }

    /** Background enrichment: try to get full article content from raw RSS */
    function enrichWithFullContent(articles) {
        for (var i = 0; i < CORS_PROXIES.length; i++) {
            (function (proxyFn) {
                fetch(proxyFn(FEED_URL)).then(function (r) {
                    if (!r.ok) return;
                    return r.text();
                }).then(function (xmlText) {
                    if (!xmlText) return;
                    var full = parseRSS(xmlText);
                    if (!full || full.length === 0) return;
                    // Merge full content into existing articles
                    var map = {};
                    for (var j = 0; j < full.length; j++) map[full[j].slug] = full[j].content;
                    var updated = false;
                    for (var k = 0; k < articles.length; k++) {
                        if (map[articles[k].slug] && map[articles[k].slug].length > (articles[k].content || '').length) {
                            articles[k].content = map[articles[k].slug];
                            updated = true;
                        }
                    }
                    if (updated) writeCache(articles);
                }).catch(function () { /* silently fail */ });
            })(CORS_PROXIES[i]);
        }
    }

    function refresh() { return fetchAndCache(); }

    return { getArticles: getArticles, getArticle: getArticle, refresh: refresh };
})();
