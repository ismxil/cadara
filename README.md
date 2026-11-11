# Cadara + Sanity

Content lives in Sanity project **o47ti8nx**, dataset **production**.

**Edit content:** https://cadara-content.sanity.studio/

The Studio has three sections:

- **Case studies:** project name, URL slug, short description (shown under See more and used for search/link previews), homepage card image, homepage visibility, display order, introduction (first paragraph above See more), story sections (heading + paragraphs, e.g. Objective, Outcome), services, duration, company website, and **Images**. Images is one list of rows: pick **Single** (full width), **Pair** (two squares side by side, framed by the hotspot) or **Grid** (three across, cropped to the first image's shape). The first image is the hero. Use each image's crop/hotspot to adjust framing. Every published case study is live; untick *Show on homepage* to hide its card.
- **Insights:** title, URL slug, excerpt, category, tags, cover image and caption, author name, role and photo, publication date, rich article body, and search description. Publish an article to create `/insights/<slug>`; the index is `/insights` and shows the published article count. Articles show reading time, a table of contents (when the body has two or more headings), share links, and up to three recommended reads. The importer seeds the articles in `scripts/insights.mjs`.
- **Studio:** homepage copy, engagements, contact and social links (under **Homepage**), work headline, studio statement, services heading, services and icons, contact email, and social links. This is a singleton shared by the homepage, work, services, and article pages.

Image rows can be reordered. Images have editable alternative text, crop, and hotspot. Documents saved with the old schema (hero + gallery + outcome) are converted at build time; `npm run migrate:case-studies` (add `-- --dry-run` to preview) moves them to the new fields permanently, turning old forced aspect ratios into visible crops. Case-study slugs create `/cases/<slug>`; retain existing slugs to preserve existing URLs.

## Local development

Use Node 22.12+ (Node 24 recommended).

```sh
npm ci
npm run studio         # Studio at http://localhost:3333
npm run build          # Published Sanity content -> dist/site
npm test
npm run studio:build
```

To view the generated website:

```sh
python3 -m http.server 8080 --directory dist/site
```

The homepage follows the compact studio design in Figma ([revised Figma file](https://www.figma.com/design/RsSALnjECSqSyEZP0Br7Vj/Untitled?node-id=8-265)), with locally hosted fonts and SVGs, a saved light/dark preference, and the Berlin/Lagos studio locations. Optional fields under **Studio → Homepage** override the design defaults; the shared studio statement and services remain CMS-driven. The Work/Index button switches between past engagements and an infinite image-only project wheel containing every featured CMS project. Desktop shows five cards by default: Cadana starts expanded at the center, with two narrow, dimmed cards on each side. Clicking a side card centers and expands it; clicking the centered card opens its project. Only the centered card cycles through its preview images. The inverted eye cursor appears only over the settled, centered project and follows the pointer; preview cycling begins without a timer once the next image is ready and continues every 600 ms. Images warm up as the cards approach view, and reduced motion keeps a static cover. The surrounding page blurs during a preview. Horizontal scrolling, Shift+wheel, dragging, swiping, and left/right arrow keys loop through all projects in either direction without an endpoint. Dragging uses a single composited track with one update per animation frame and can interrupt a previous centering animation. Drags snap to the card nearest the center on release, and each horizontal trackpad gesture advances once, including its momentum tail. Home/End select the first/last project. Unmodified vertical scrolling still moves the page. Narrower screens show fewer cards, with one main card on mobile. Coming-soon projects can be centered but do not open. Without the wheel script, the original horizontal image list and real project links remain usable. The carousel is implemented in `js/home-carousel.js`. On desktop, the bottom divider resizes the centered card while neighboring cards scale proportionally and move outside the viewport rather than narrowing; Up/Down and Home/End adjust its size, Escape cancels a drag, and the size resets on refresh or mobile layout. Typography uses the supplied Suisse Intl, Beirut Display SemiBold/Black, and Beirut Text Book files. Active past engagement rows show a right-aligned external arrow and open company websites in a new tab. Set **Company website** on an engagement, or reference a project to reuse its company website. Disabled rows and rows without a URL are greyed out and sorted below active links; internal Cadara destinations are rejected. Biscons and Salarify start disabled. Grid cards open `/projects?project=<slug>`.

Refresh plays a brief entrance: navigation fades in first, headline words rise gently in sequence, and the copy and project view follow. The CSS sequence never blocks the page, works without JavaScript, and respects reduced motion; the project viewer also fades in gently. With JavaScript available, the entrance is retired after the initial load so Work/Index switches stay immediate; word markup preserves CMS text, selection, and natural wrapping.

The hero uses Beirut Display Regular at 64px with 105% line height and −2px tracking on desktop, scaling down on mobile. The default contact email is info@cadarastudio.com. The introduction uses 20px text on desktop and 16px on mobile, with widow prevention and a highlighted LinkedIn link for Ismail Ahmad that turns green on hover and keyboard focus. The contact email and supplied copy icon form one control, with a shared green hover/focus state. Clicking either copies the address without opening a mail app when clipboard access is available; the mailto link remains a fallback without JavaScript or clipboard support. The team panels show the names and roles from the revised design. The team section has no hiring invitation. The dim footer wordmark reveals vector anchors and Bézier handles around a mouse pointer, with olive (`#A5C174`) guides and handles that turn green (`#00E935`) for the node being dragged; points can be dragged, and edits persist until the page is refreshed. It uses outlines generated from our Beirut Display SemiBold font, with a static text fallback on touch devices or if the effect cannot load. The booking text and arrow turn Cadara green together on hover and keyboard focus. The popup uses Cal.com’s official embed, warmed up near the footer; the ordinary calendar link remains the fallback if JavaScript or the embed is unavailable. The footer shows Berlin DE / Lagos NG with a globe icon, opens “Let’s talk” in Cal.com’s on-site booking popup for https://cal.com/cadara/intro, and includes Email, Instagram, LinkedIn, and X (`https://x.com/cadarastudio`); these can be overridden through Homepage social links. New schema fields require the normal Studio deployment to appear in the editor; the website defaults work with the existing published content.

The project viewer uses a horizontal rail on desktop, with project introductions, full CMS galleries, text chapters, and outcomes. Mouse wheels, trackpads, keyboard arrows, navigate the rail. The magnifying project icon dock and query URL select a project directly. A small dot below the icon marks the selected project. Mobile uses vertical project sections. Back returns to the homepage Work view in a green pill. The top project list and old bottom toolbar are replaced by the icon dock. Supplied Lemfi, Cadana, Gomoney, FoMA, and Mezovest SVG icons live in `asset/app-icon`; other projects use their CMS card image as a thumbnail, falling back to a monogram if absent. The existing `/cases/<slug>` pages remain available for old links.

Clickable controls use a 32px green crosshair cursor on desktop, changing to black on the green avatar cards; centered project previews keep the eye cursor, with separate drag and resize cursors. Navigation and footer hover/focus states, including their SVG icons, turn green in both themes.

Cadara’s accent is `#00E935` in both themes, including the star symbols, globe, favicon, and copy-email confirmation pill. The header uses Beirut Display SemiBold for both its C logo and hover typeout, with supplied folder/document and dark/light icons for its icon-only controls. Project background disclosures use the matching plus/close icons. The heart above the services draws, completes three full six-second turns, then fades out before redrawing to avoid a visible reset; reduced motion shows the static heart.

The site stays static HTML with the original styles, fonts, loader, and interactions. All content is rendered during the build for search engines and visitors without JavaScript. Production builds read published documents directly from Sanity, bypassing the CDN. Drafts and release versions are excluded. Failed content queries fail the build, preserving the last successful deployment rather than deploying incomplete content.

The production dataset is public, so website builds need no token. If it becomes private, set `SANITY_API_READ_TOKEN` in the build environment. Import credentials are never shipped in the site. The generated output contains only public website assets and HTML, not the source or Studio configuration.

The decorative intro runs independently of fonts and images, with a 650 ms fallback. Reduced-motion visitors and late-loading scripts skip it. CMS images include responsive sizes; Studio photography is resized to WebP by Sharp during the build. Source photos remain unchanged.

## Import existing content

The original homepage is retained in `scripts/templates/legacy-home.html` for the content importer and article shell. The existing HTML files are retained as the migration source and layout templates. The frontend renders their editable content from Sanity; source copy changes are not the editing workflow after migration.

```sh
npm run import:preview # Validate 8 source documents / 68 images; write .context/content-preview.json
npx sanity login
npm run import:content
```

The importer uploads the existing images and creates deterministic document IDs. It preserves existing published documents and drafts, so rerunning does not replace editor changes. New document creation is committed in one transaction; Sanity deduplicates identical image assets. Alternatively, set `SANITY_API_TOKEN` to an authenticated write token for automation.

## Publishing website updates

`vercel.json` enables clean URLs (for example `/studio`), redirects old `.html` URLs permanently, and builds with `npm run build` and serves **dist/site**. The frontend changes must be deployed before the live site uses Sanity.

Automatic updates are configured: the Sanity webhook **Cadara published content → Vercel main** sends published create/update/delete events to the existing Cadara Vercel project's **sanity-content** deploy hook on `main`. Draft edits and release versions do not trigger a rebuild. This becomes effective for the CMS-driven frontend when these repository changes are deployed to `main`.

To recreate the configuration if needed:

1. In the existing Cadara Vercel project, open **Settings → Git → Deploy Hooks** and create a hook for `main`, named `Sanity published content`.
2. In https://www.sanity.io/manage/project/o47ti8nx open **API → Webhooks**, create a webhook for dataset `production`, use the deploy hook URL, and set the HTTP method to `POST`.
3. Enable create, update, and delete events. Leave drafts and versions disabled. Use this filter:

   ```groq
   _type in ["caseStudy", "insight", "studioPage"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
   ```

4. After the frontend changes have reached `main`, publish an edit in the Studio. Sanity triggers a Vercel rebuild; the website updates when that deployment completes. Unpublishing or deleting a document removes its generated page on the next build.

Keep the deploy hook URL private. No frontend CORS entry is needed because reads occur at build time. Local Studio login may require adding `http://localhost:3333` as a credentialed CORS origin in Sanity's API settings; the hosted Studio origin is registered by deployment.

For Vercel administration, installing the CLI is recommended: `npm i -g vercel`. It enables `vercel env pull`, `vercel deploy`, and `vercel logs`.

## Studio deployment

```sh
npm run studio:deploy
```

This rebuilds and deploys the Studio to https://cadara-content.sanity.studio/. Studio code/schema changes need a Studio deployment; content edits only need publication and a website rebuild.

### Interactive team portraits

The homepage team cards use self-hosted GLB versions of Emmanuel's, Ahmad's, and Wale's supplied Blender heads. Click a portrait to flip its card to the supplied Care, Curiosity, or Craft value; click the back or press Escape to return. Only the separate LinkedIn icon opens LinkedIn. Both faces support keyboard access and reduced motion. Only the head in the hovered, unflipped card follows the mouse within that card; other heads face forward. Heads load when the team section approaches the viewport and stay still with reduced motion. Static WebP portraits remain available if JavaScript, WebGL, or a model fails to load.

The editable renderer lives in `scripts/team-heads.js`. After editing it, run `npm run build:team` to regenerate the checked-in `js/team-heads.js` browser bundle (Three.js and its loaders are included; no CDN is required). The website build copies the bundle and `asset/team/` unchanged.
