/**
 * Cloudflare Worker — Notion API Proxy for ismailahmad.com
 * 
 * Deploy this as a Cloudflare Worker. It proxies requests to the Notion API
 * so the integration token stays server-side.
 * 
 * Routes:
 *   GET /projects          → List all projects from the database
 *   GET /projects/:id      → Get a single project page metadata
 *   GET /blocks/:id        → Get page content blocks (recursive)
 *   GET /dribbble          → Scrape Dribbble shots for the profile
 * 
 * Environment variable required:
 *   NOTION_TOKEN (set via `wrangler secret put NOTION_TOKEN`)
 */

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const DATABASE_ID = '1d9286be832b805698fadbf843e24d6f';

// Allowed origins — add your domain(s)
const ALLOWED_ORIGINS = [
  'https://ismailahmad.com',
  'https://www.ismailahmad.com',
  'http://localhost',
  'http://127.0.0.1',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function notionFetch(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${NOTION_API}${path}`, opts);
}

// Parse a Notion page into a clean project object
function parsePage(page) {
  const props = page.properties || {};
  const titleArr = props.Name?.title || [];
  const name = titleArr.map(t => t.plain_text).join('').trim();

  const services = (props['Services ']?.multi_select || []).map(s => s.name);
  const description = (props.Description?.rich_text || []).map(t => t.plain_text).join('');
  const industries = (props.Industries?.multi_select || []).map(s => s.name);
  const role = (props.Role?.rich_text || []).map(t => t.plain_text).join('');
  const outcome = (props.Outcome?.rich_text || []).map(t => t.plain_text).join('');
  const challenges = (props.Challenges?.rich_text || []).map(t => t.plain_text).join('');

  let url = '';
  if (props.URL?.type === 'url') url = props.URL.url || '';
  else if (props.URL?.type === 'rich_text') url = (props.URL.rich_text || []).map(t => t.plain_text).join('');

  let cover = null;
  if (page.cover) {
    const ct = page.cover.type;
    cover = page.cover[ct]?.url || null;
  }

  return {
    id: page.id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    cover,
    services,
    description,
    industries,
    role,
    outcome,
    challenges,
    url,
    created: page.created_time,
  };
}

// Scrape Dribbble profile page to extract shot data
const DRIBBBLE_USER = 'ismxil';
async function fetchDribbbleShots() {
  const url = `https://dribbble.com/${DRIBBBLE_USER}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  if (!resp.ok) return [];
  const html = await resp.text();

  // Strategy 1: Parse the embedded JSON (var newestShots = [...])
  // This gives us proper titles, IDs, and paths
  let shotList = [];
  const jsonStart = html.indexOf('var newestShots');
  if (jsonStart !== -1) {
    const arrStart = html.indexOf('[', jsonStart);
    if (arrStart !== -1) {
      // Find the matching closing bracket by counting depth
      let depth = 0;
      let arrEnd = -1;
      for (let i = arrStart; i < html.length; i++) {
        if (html[i] === '[') depth++;
        else if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
      }
      if (arrEnd !== -1) {
        try { shotList = JSON.parse(html.substring(arrStart, arrEnd + 1)); } catch (e) { /* fall through */ }
      }
    }
  }

  // Build a map of shot ID → image URL by finding images within each shot's <li> block
  // Each shot lives in <li id="screenshot-{id}"> ... <img data-src="..."> ... </li>
  const imageMap = {};
  const liRegex = /<li[^>]*id="screenshot-(\d+)"[\s\S]*?<\/li>/g;
  let liMatch;
  while ((liMatch = liRegex.exec(html)) !== null) {
    const shotId = liMatch[1];
    const liBlock = liMatch[0];
    // Prefer data-src (lazy loaded real image) over src (placeholder gif)
    const dataSrcMatch = liBlock.match(/data-src="([^"]*cdn\.dribbble\.com[^"]*)"/);
    const srcMatch = liBlock.match(/<img[^>]*src="(https:\/\/cdn\.dribbble\.com[^"]*)"/);
    const imgUrl = dataSrcMatch ? dataSrcMatch[1].replace(/&amp;/g, '&') : (srcMatch ? srcMatch[1] : null);
    if (imgUrl) imageMap[shotId] = imgUrl;
  }

  if (shotList.length > 0) {
    // Use the structured JSON data — it has proper titles
    return shotList.map(s => {
      const id = String(s.id);
      const imgUrl = imageMap[id] || '';
      // Thumbnail: use 400x300 for fast grid loading
      const thumb = imgUrl.replace(/resize=\d+x\d+/, 'resize=800x600');
      // Hi-res: strip all params for original
      const hires = imgUrl.replace(/\?.*$/, '');
      return {
        id: id,
        title: s.title || 'Untitled',
        url: 'https://dribbble.com' + (s.path || '/shots/' + id),
        image: thumb || imgUrl,
        image_hires: hires,
      };
    }).filter(s => s.image);
  }

  // Fallback: pair links with images if JSON wasn't found
  const linkRegex = /href="(\/shots\/(\d+)-([^"]*?))"/g;
  const shots = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const id = m[2];
    if (shots.some(s => s.id === id)) continue;
    const imgUrl = imageMap[id];
    if (!imgUrl) continue;
    const title = m[3].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
    shots.push({
      id: id,
      title: title || 'Untitled',
      url: 'https://dribbble.com' + m[1],
      image: imgUrl.replace(/resize=\d+x\d+/, 'resize=800x600'),
      image_hires: imgUrl.replace(/\?.*$/, ''),
    });
  }
  return shots;
}

// Recursively fetch all blocks for a page
async function fetchAllBlocks(blockId) {
  let allBlocks = [];
  let cursor = undefined;

  do {
    const url = `/blocks/${blockId}/children?page_size=100` + (cursor ? `&start_cursor=${cursor}` : '');
    const resp = await notionFetch(url);
    if (!resp.ok) break;
    const data = await resp.json();
    const blocks = data.results || [];

    // Recursively fetch children
    for (const block of blocks) {
      allBlocks.push(block);
      if (block.has_children && block.type !== 'child_page' && block.type !== 'child_database') {
        const children = await fetchAllBlocks(block.id);
        block._children = children;
      }
    }

    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return allBlocks;
}

export default {
  async fetch(request, env) {
    // Make NOTION_TOKEN available globally from env
    globalThis.NOTION_TOKEN = env.NOTION_TOKEN;

    const url = new URL(request.url);
    const path = url.pathname;
    const cors = corsHeaders(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      // GET /dribbble — scrape Dribbble shots
      if (path === '/dribbble' && request.method === 'GET') {
        const shots = await fetchDribbbleShots();
        return new Response(JSON.stringify({ shots }), {
          headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
        });
      }

      // GET /projects — list all projects
      if (path === '/projects' && request.method === 'GET') {
        const resp = await notionFetch(`/databases/${DATABASE_ID}/query`, 'POST', {});
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: 'Notion API error' }), {
            status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' }
          });
        }
        const data = await resp.json();
        const projects = (data.results || []).map(parsePage);
        return new Response(JSON.stringify({ projects }), {
          headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
        });
      }

      // GET /projects/:id — single project metadata
      const projectMatch = path.match(/^\/projects\/([a-f0-9-]+)$/);
      if (projectMatch && request.method === 'GET') {
        const pageId = projectMatch[1];
        const resp = await notionFetch(`/pages/${pageId}`);
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: 'Page not found' }), {
            status: 404, headers: { ...cors, 'Content-Type': 'application/json' }
          });
        }
        const page = await resp.json();
        const project = parsePage(page);
        return new Response(JSON.stringify({ project }), {
          headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
        });
      }

      // GET /blocks/:id — page content blocks (recursive)
      const blocksMatch = path.match(/^\/blocks\/([a-f0-9-]+)$/);
      if (blocksMatch && request.method === 'GET') {
        const blockId = blocksMatch[1];
        const blocks = await fetchAllBlocks(blockId);
        return new Response(JSON.stringify({ blocks }), {
          headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  }
};
