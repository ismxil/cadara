# Cadara + Sanity

Content lives in Sanity project **o47ti8nx**, dataset **production**.

**Edit content:** https://cadara-content.sanity.studio/

The Studio has three sections:

- **Case studies:** client name, card copy and image, homepage visibility, display order, coming-soon status, headline, services, project date or duration, introduction, company link, hero image, ordered image/text gallery, closing section, next project, and search description.
- **Insights:** title, URL slug, excerpt, category, tags, cover image and caption, author name, role and photo, publication date, rich article body, and search description. Publish an article to create `/insights/<slug>`; the index is `/insights` and filters by category. Articles show reading time, a table of contents (when the body has two or more headings), share links, and up to three recommended reads. The importer seeds the articles in `scripts/insights.mjs`.
- **Studio:** homepage and work headlines, studio statement, services heading, services and icons, contact email, and social links. This is a singleton shared by the homepage, work, services, and article pages.

Gallery blocks can be reordered and set to full or half width. Images have editable alternative text, crop, and hotspot. Coming-soon projects show a card without a detail link. Case-study slugs create `/cases/<slug>`; retain existing slugs to preserve existing URLs.

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

The site stays static HTML with the original styles, fonts, loader, and interactions. All content is rendered during the build for search engines and visitors without JavaScript. Production builds read published documents directly from Sanity, bypassing the CDN. Drafts and release versions are excluded. Failed content queries fail the build, preserving the last successful deployment rather than deploying incomplete content.

The production dataset is public, so website builds need no token. If it becomes private, set `SANITY_API_READ_TOKEN` in the build environment. Import credentials are never shipped in the site. The generated output contains only public website assets and HTML, not the source or Studio configuration.

The decorative intro runs independently of fonts and images, with a 650 ms fallback. Reduced-motion visitors and late-loading scripts skip it. CMS images include responsive sizes; Studio photography is resized to WebP by Sharp during the build. Source photos remain unchanged.

## Import existing content

The existing HTML files are retained as the migration source and layout templates. The frontend renders their editable content from Sanity; source copy changes are not the editing workflow after migration.

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
