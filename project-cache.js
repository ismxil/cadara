/**
 * Project Cache — Notion project caching layer
 * 
 * Fetches projects from the Cloudflare Worker proxy,
 * caches in localStorage. Similar pattern to blog-cache.js.
 */
window.ProjectCache = (function () {
    var API_BASE = 'https://notion-proxy.ismxilahmad.workers.dev';
    var CACHE_KEY = 'projects_data';
    var CACHE_TS_KEY = 'projects_data_ts';
    var BLOCKS_PREFIX = 'project_blocks_';
    var BLOCKS_TS_PREFIX = 'project_blocks_ts_';
    var CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    /**
     * Get all projects. Returns cached data instantly if available,
     * refreshes in background if stale.
     */
    function getProjects(onReady) {
        var cached = readCache(CACHE_KEY);
        if (cached) {
            onReady(cached, { fromCache: true });
            if (isCacheStale(CACHE_TS_KEY)) {
                fetchProjects().then(function (fresh) {
                    if (fresh) onReady(fresh, { fromCache: false, refreshed: true });
                });
            }
        } else {
            fetchProjects().then(function (projects) {
                onReady(projects || null, { fromCache: false });
            });
        }
    }

    /**
     * Get a single project by ID.
     */
    function getProject(id, onReady) {
        getProjects(function (projects, meta) {
            if (!projects) { onReady(null, meta); return; }
            var project = null;
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].id === id) { project = projects[i]; break; }
            }
            onReady(project, meta);
        });
    }

    /**
     * Get page content blocks for a project.
     */
    function getBlocks(pageId, onReady) {
        var cacheKey = BLOCKS_PREFIX + pageId;
        var tsKey = BLOCKS_TS_PREFIX + pageId;
        var cached = readCache(cacheKey);

        if (cached) {
            onReady(cached, { fromCache: true });
            if (isCacheStale(tsKey)) {
                fetchBlocks(pageId).then(function (fresh) {
                    if (fresh) onReady(fresh, { fromCache: false, refreshed: true });
                });
            }
        } else {
            fetchBlocks(pageId).then(function (blocks) {
                onReady(blocks || null, { fromCache: false });
            });
        }
    }

    // ── Internal helpers ──

    function readCache(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function writeCache(key, data, tsKey) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(tsKey, Date.now().toString());
        } catch (e) { /* fail silently */ }
    }

    function isCacheStale(tsKey) {
        var ts = parseInt(localStorage.getItem(tsKey) || '0', 10);
        return Date.now() - ts > CACHE_TTL;
    }

    async function fetchProjects() {
        try {
            var resp = await fetch(API_BASE + '/projects');
            if (!resp.ok) {
                console.warn('ProjectCache: /projects returned', resp.status);
                return null;
            }
            var data = await resp.json();
            var projects = data.projects || [];
            console.log('ProjectCache: fetched', projects.length, 'projects');
            if (projects.length > 0) {
                writeCache(CACHE_KEY, projects, CACHE_TS_KEY);
            }
            return projects;
        } catch (e) {
            console.warn('ProjectCache: fetch failed', e);
            return null;
        }
    }

    async function fetchBlocks(pageId) {
        try {
            var resp = await fetch(API_BASE + '/blocks/' + pageId);
            if (!resp.ok) return null;
            var data = await resp.json();
            var blocks = data.blocks || [];
            if (blocks.length > 0) {
                writeCache(BLOCKS_PREFIX + pageId, blocks, BLOCKS_TS_PREFIX + pageId);
            }
            return blocks;
        } catch (e) {
            console.warn('ProjectCache: blocks fetch failed', e);
            return null;
        }
    }

    return {
        getProjects: getProjects,
        getProject: getProject,
        getBlocks: getBlocks
    };
})();
