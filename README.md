# Cadara Studio

Static website for Cadara, a fintech-first product and brand design studio led by Ismail Ahmad.

## Project Structure

- `site/` - production-ready static website. Serve this folder locally.
- `site/assets/css/style.css` - global styles for all pages.
- `site/assets/js/main.js` - navigation, scroll reveal, work filters, and contact form behavior.
- `site/assets/img/` - project and profile images. Current images are placeholders and can be replaced using the same filenames.
- `docs/` - strategy and positioning documents.
- `content/` - original generated source files kept as a working backup.
- `works/`, `ua/`, `industries/`, `company`, `contact`, `services` - imported Tubik reference scrape, not used by the Cadara site.

## Local Preview

Run:

```bash
cd site
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Pages

- `/index.html` - Homepage
- `/work.html` - Work and case studies
- `/about.html` - Studio positioning and background
- `/contact.html` - Project enquiry page
