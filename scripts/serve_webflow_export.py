#!/usr/bin/env python3
"""Local preview server for extensionless Webflow exports.

Python's built-in static server serves extensionless files as
application/octet-stream and treats /works as a directory. Webflow exports often
expect extensionless HTML routes and query-backed pagination, so this small
handler maps those routes for local preview.
"""

from __future__ import annotations

import argparse
import io
import mimetypes
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


WORKS_PAGE_KEY = "37edc366_page"


class WebflowExportHandler(SimpleHTTPRequestHandler):
    export_root: Path
    nav_link_removers = (
        re.compile(
            r'<a\b(?=[^>]*href="https://blog\.cadarastudio\.com/")[\s\S]*?</a>'
        ),
        re.compile(
            r'<a\b(?=[^>]*href="https://lab\.cadarastudio\.com/")[\s\S]*?</a>'
        ),
        re.compile(
            r'<a\b(?=[^>]*\bmenu_link_2\b)[^>]*>[\s\S]*?'
            r'<div[^>]*class="nav-link"[^>]*>\s*blog\s*<br/>\s*blog\s*</div>'
            r'[\s\S]*?</a>',
            re.IGNORECASE,
        ),
        re.compile(
            r'<a\b(?=[^>]*\bmenu_link_2\b)[^>]*>[\s\S]*?'
            r'<div[^>]*class="nav-link"[^>]*>\s*lab\s*<br/>\s*lab\s*</div>'
            r'[\s\S]*?</a>',
            re.IGNORECASE,
        ),
    )
    removed_page_routes = {"blog", "lab", "ua/blog", "ua/lab"}
    canonical_page_routes = {
        "index.html": "/",
        "works": "/works",
        "company": "/company",
        "services": "/services",
        "contact": "/contact",
        "ua": "/ua",
        "ua/company": "/ua/company",
        "ua/services": "/ua/services",
        "ua/contact": "/ua/contact",
        "ua/works": "/ua/works",
    }
    relative_route_prefixes = (
        "works/",
        "company/",
        "services/",
        "contact/",
        "industries/",
        "ua/",
        "cdn-cgi/",
        "avljl2rk9q5pNjE2ZDJmNzQ1NWVkZDg4MmU2NTk1Mzll/",
    )

    def canonical_redirect_target(self) -> str | None:
        parsed = urlsplit(self.path)
        route = unquote(parsed.path).strip("/")

        if route in self.removed_page_routes:
            return "/"

        if route == "index.html":
            return f"/?{parsed.query}" if parsed.query else "/"

        if route in ("works/works", "ua/works/works"):
            target = "/ua/works" if route.startswith("ua/") else "/works"
            return f"{target}?{parsed.query}" if parsed.query else target

        for prefix in ("works/", "ua/works/"):
            if not route.startswith(prefix):
                continue
            nested = route[len(prefix) :].strip("/")
            if nested in self.canonical_page_routes:
                target = self.canonical_page_routes[nested]
                return f"{target}?{parsed.query}" if parsed.query else target
            if nested.startswith(("industries/", "works/")):
                return f"/{nested}"
        return None

    def rewrite_links(self, html: str, current_route: str) -> str:
        is_ua = current_route == "ua" or current_route.startswith("ua/")

        for remover in self.nav_link_removers:
            html = remover.sub("", html)

        def normalize_attr(match: re.Match[str]) -> str:
            attr = match.group("attr")
            quote = match.group("quote")
            value = match.group("value")

            if (
                not value
                or value.startswith(("#", "http://", "https://", "mailto:", "tel:"))
                or value.startswith("data:")
                or value.startswith("/")
            ):
                return match.group(0)

            suffix = ""
            base = value
            for separator in ("#", "?"):
                if separator in base:
                    base, suffix = base.split(separator, 1)
                    suffix = separator + suffix
                    break

            parts = [part for part in base.split("/") if part not in ("", ".")]
            while parts and parts[0] == "..":
                parts.pop(0)
            normalized = "/".join(parts)

            if is_ua:
                if normalized in ("index.html", "ua"):
                    return f"{attr}={quote}/ua{suffix}{quote}"
                if normalized in ("works", "company", "services", "contact"):
                    return f"{attr}={quote}/ua/{normalized}{suffix}{quote}"
                if normalized.startswith(("works/", "industries/")):
                    return f"{attr}={quote}/ua/{normalized}{suffix}{quote}"

            if normalized in self.canonical_page_routes:
                return f"{attr}={quote}{self.canonical_page_routes[normalized]}{suffix}{quote}"

            if normalized.startswith(self.relative_route_prefixes):
                return f"{attr}={quote}/{normalized}{suffix}{quote}"

            return match.group(0)

        return re.sub(
            r'(?P<attr>\b(?:href|src|action))=(?P<quote>["\'])(?P<value>[^"\']*)(?P=quote)',
            normalize_attr,
            html,
        )

    def translate_path(self, path: str) -> str:
        parsed = urlsplit(path)
        route = unquote(parsed.path).lstrip("/")
        query = parsed.query

        for prefix in ("works/", "ua/works/"):
            if route.startswith(prefix):
                nested = route[len(prefix) :]
                if nested.startswith(
                    (
                        "avljl2rk9q5pNjE2ZDJmNzQ1NWVkZDg4MmU2NTk1Mzll/",
                        "cdn-cgi/",
                    )
                ):
                    return str(self.export_root / nested)

        if route.rstrip("/") in ("works/works", "ua/works/works"):
            page = "1"
            for part in query.split("&"):
                if part.startswith(f"{WORKS_PAGE_KEY}="):
                    page = part.split("=", 1)[1] or "1"
                    break
            if route.startswith("ua/"):
                return str(self.export_root / "ua" / f"works?{WORKS_PAGE_KEY}={page}")
            return str(self.export_root / f"works?{WORKS_PAGE_KEY}={page}")

        if route in ("", "index.html"):
            return str(self.export_root / "index.html")

        if route.strip("/") == "ua":
            return str(self.export_root / "ua" / f"works?{WORKS_PAGE_KEY}=1")

        if route.rstrip("/") == "works":
            page = "1"
            for part in query.split("&"):
                if part.startswith(f"{WORKS_PAGE_KEY}="):
                    page = part.split("=", 1)[1] or "1"
                    break
            return str(self.export_root / f"works?{WORKS_PAGE_KEY}={page}")

        if route.rstrip("/") == "ua/works":
            page = "1"
            for part in query.split("&"):
                if part.startswith(f"{WORKS_PAGE_KEY}="):
                    page = part.split("=", 1)[1] or "1"
                    break
            return str(self.export_root / "ua" / f"works?{WORKS_PAGE_KEY}={page}")

        candidate = self.export_root / route
        if candidate.is_dir():
            index = candidate / "index.html"
            if index.exists():
                return str(index)
        return str(candidate)

    def guess_type(self, path: str) -> str:
        file_path = Path(path)
        if file_path.suffix:
            return mimetypes.guess_type(path)[0] or "application/octet-stream"

        try:
            head = file_path.read_bytes()[:512].lstrip()
        except OSError:
            return "application/octet-stream"

        lower = head.lower()
        if lower.startswith((b"<!doctype html", b"<html")):
            return "text/html; charset=utf-8"
        if head.startswith(b"//") or b"function" in lower or b"window." in lower:
            return "application/javascript; charset=utf-8"
        if file_path.name == "robots.txt":
            return "text/plain; charset=utf-8"
        return "application/octet-stream"

    def send_head(self):
        redirect_target = self.canonical_redirect_target()
        if redirect_target:
            self.send_response(302)
            self.send_header("Location", redirect_target)
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.end_headers()
            return None

        path = Path(self.translate_path(self.path))
        if path.is_file() and self.guess_type(str(path)).startswith("text/html"):
            current_route = unquote(urlsplit(self.path).path).strip("/")
            html = path.read_text(encoding="utf-8", errors="ignore")
            html = self.rewrite_links(html, current_route)
            encoded = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header(
                "Last-Modified",
                self.date_time_string(path.stat().st_mtime),
            )
            self.end_headers()
            return io.BytesIO(encoded)
        return super().send_head()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, help="Path to the Webflow export")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4174)
    args = parser.parse_args()

    WebflowExportHandler.export_root = Path(args.root).resolve()
    server = ThreadingHTTPServer((args.host, args.port), WebflowExportHandler)
    print(
        f"Serving {WebflowExportHandler.export_root} at "
        f"http://{args.host}:{args.port}/"
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
