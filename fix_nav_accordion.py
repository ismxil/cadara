#!/usr/bin/env python3
"""
Restructures nav on all cadarastudio.com pages to use integrated #site-header
that expands as an accordion from below the header row.
"""
import os
import re

BASE_DIR = '/Users/macbook/Documents/CODE/cadarastudio.com'


def find_div_end(html, start):
    """Find position after the closing </div> matching the <div at start."""
    depth = 0
    i = start
    n = len(html)
    while i < n:
        if html[i:i+4] == '<div' and (i + 4 >= n or html[i + 4] in ' \t\n\r/>'):
            depth += 1
            i += 4
        elif html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                return i + 6
            i += 6
        else:
            i += 1
    return -1


NEW_SITE_HEADER = '''    <!-- ════ Site Header (integrated accordion nav) ════ -->
    <div id="site-header" class="fixed top-0 left-1/2 -translate-x-1/2 w-full md:w-[400px] z-[100]">
        <div id="header-row" class="bg-brand-black flex justify-between items-start px-4 pt-8 pb-4">
            <a href="index.html" aria-label="Cadara Studio – Home">
                <div id="main-logo-container" class="w-[72px] h-[72px] flex items-center justify-center text-current transition-transform duration-500"></div>
            </a>
            <button id="menu-toggle" class="relative w-8 h-8 flex flex-col justify-center items-center group mt-1" aria-label="Toggle Menu">
                <span class="hamburger-line w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"></span>
                <span class="hamburger-line w-6 h-0.5 bg-current transition-all duration-300 ease-in-out mt-1.5"></span>
                <span class="hamburger-line w-6 h-0.5 bg-current transition-all duration-300 ease-in-out mt-1.5"></span>
            </button>
        </div>
        <div id="nav-overlay" class="bg-brand-red text-brand-black overflow-hidden" style="max-height:0; transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1);">
            <div id="nav-inner" class="flex flex-col px-4 pb-16 overflow-y-auto">
                <div class="flex-1 min-h-[60px]"></div>
                <div class="flex flex-col gap-8">
                    <div class="flex items-end justify-between">
                        <h2 class="font-display text-[5.5rem] leading-[0.85] font-black uppercase text-brand-black nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:50ms;">LET\'S<br>CHAT</h2>
                        <a href="#" data-book-call="true" class="w-16 h-16 rounded-full border-2 border-brand-black flex items-center justify-center hover:bg-brand-black hover:text-brand-red transition-colors duration-200 flex-shrink-0 mb-2 nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:100ms;" aria-label="Book a Call">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                        </a>
                    </div>
                    <nav class="w-full">
                        <ul class="space-y-3">
                            <li class="flex items-end group nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:150ms;"><a href="about.html" class="uppercase tracking-widest text-base font-display font-medium group-hover:pl-2 transition-all duration-300">About</a><div class="flex-grow border-b border-dotted border-brand-black/30 mx-3 mb-1"></div><span class="font-mono text-xs font-bold opacity-60">I</span></li>
                            <li class="flex items-end group nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:200ms;"><a href="work.html" class="uppercase tracking-widest text-base font-display font-medium group-hover:pl-2 transition-all duration-300">Work</a><div class="flex-grow border-b border-dotted border-brand-black/30 mx-3 mb-1"></div><span class="font-mono text-xs font-bold opacity-60">II</span></li>
                            <li class="flex items-end group nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:250ms;"><a href="expertise.html" class="uppercase tracking-widest text-base font-display font-medium group-hover:pl-2 transition-all duration-300">Expertise</a><div class="flex-grow border-b border-dotted border-brand-black/30 mx-3 mb-1"></div><span class="font-mono text-xs font-bold opacity-60">III</span></li>
                            <li class="flex items-end group nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:300ms;"><a href="play.html" class="uppercase tracking-widest text-base font-display font-medium group-hover:pl-2 transition-all duration-300">Play</a><div class="flex-grow border-b border-dotted border-brand-black/30 mx-3 mb-1"></div><span class="font-mono text-xs font-bold opacity-60">IV</span></li>
                            <li class="flex items-end group nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:350ms;"><a href="thought.html" class="uppercase tracking-widest text-base font-display font-medium group-hover:pl-2 transition-all duration-300">Thought</a><div class="flex-grow border-b border-dotted border-brand-black/30 mx-3 mb-1"></div><span class="font-mono text-xs font-bold opacity-60">V</span></li>
                        </ul>
                    </nav>
                    <div class="flex items-center justify-between nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:400ms;">
                        <a href="https://linkedin.com/company/cadarastudio" target="_blank" class="hover:scale-110 transition-transform" aria-label="LinkedIn"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg></a>
                        <a href="https://behance.net/cadara" target="_blank" class="hover:scale-110 transition-transform" aria-label="Behance"><svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.881v1.139h-7.619c.123 2.502 2.061 3.255 3.659 3.255 1.488 0 2.457-.611 2.94-1.68h3.844zm-3.047-4.144c-.211-1.258-1.398-2.22-2.723-2.22-1.35 0-2.42 1.05-2.703 2.22h5.426zm-11.679.144h-5.908v5h6.391c2.259 0 3.822-1.314 3.822-3.15 0-2.03-1.681-3.238-3.32-3.238 1.428-.152 2.822-1.223 2.822-2.829 0-1.896-1.579-2.933-3.666-2.933h-6.041v12.15h5.9v-5zm-5.908-5.321h2.956c1.233 0 2.247.502 2.247 1.621 0 1.111-.908 1.623-2.261 1.623h-2.942v-3.244z"/></svg></a>
                        <a href="https://instagram.com/cadarastudio" target="_blank" class="hover:scale-110 transition-transform" aria-label="Instagram"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
                        <a href="https://x.com/cadarastudio" target="_blank" class="hover:scale-110 transition-transform" aria-label="X"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                        <a href="https://github.com/ismxil" target="_blank" class="hover:scale-110 transition-transform" aria-label="Github"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
                    </div>
                    <p class="text-[10px] font-mono tracking-widest uppercase nav-item" style="opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;transition-delay:450ms;">&lt;3 (c) 2026</p>
                </div>
            </div>
        </div>
    </div>
'''


def remove_nav_overlay(html):
    """Remove the nav-overlay div (and its preceding comment if any). Returns (new_html, end_pos)."""
    # Find the nav-overlay div
    nav_div_pos = html.find('<div id="nav-overlay"')
    if nav_div_pos == -1:
        return html, -1

    # Look back for a preceding comment (up to 200 chars before)
    look_back = max(0, nav_div_pos - 200)
    segment = html[look_back:nav_div_pos]
    # Find last comment end in segment
    comment_start_rel = segment.rfind('<!--')
    if comment_start_rel != -1:
        remove_from = look_back + comment_start_rel
        # Only remove if there's nothing but whitespace between comment and div
        between = html[remove_from + segment[comment_start_rel:].find('-->') + 3 + look_back + comment_start_rel - remove_from:nav_div_pos]
        between = html[remove_from:nav_div_pos]
        # Check that the region between comment start and nav_div_pos is only comment + whitespace
        comment_end = html.find('-->', remove_from)
        if comment_end != -1 and comment_end < nav_div_pos:
            between_text = html[comment_end + 3:nav_div_pos].strip()
            if not between_text:
                nav_div_pos = remove_from

    nav_end = find_div_end(html, html.find('<div id="nav-overlay"', nav_div_pos) if nav_div_pos != html.find('<div id="nav-overlay"') else nav_div_pos)
    if nav_end == -1:
        return html, -1

    # Skip trailing newline
    if nav_end < len(html) and html[nav_end] == '\n':
        nav_end += 1

    return html[:nav_div_pos], nav_end, html[nav_end:]


def process_index(html):
    """Handle index.html: nav-overlay is before <main>, in-page header is inside <main>."""
    # Step 1: Find nav-overlay comment + div before <main>, replace with site-header
    nav_comment = '<!-- Mobile Navigation Overlay -->'
    nav_comment_pos = html.find(nav_comment)
    if nav_comment_pos == -1:
        nav_comment_pos = html.find('<div id="nav-overlay"')
    else:
        # Back up to find start of line (include indentation)
        line_start = html.rfind('\n', 0, nav_comment_pos) + 1
        nav_comment_pos = line_start

    nav_div_start = html.find('<div id="nav-overlay"', nav_comment_pos)
    nav_div_end = find_div_end(html, nav_div_start)
    if nav_div_end == -1:
        print("  ERROR: Could not find end of nav-overlay in index.html")
        return html

    # Skip trailing newline(s)
    while nav_div_end < len(html) and html[nav_div_end] in '\n\r':
        nav_div_end += 1

    html = html[:nav_comment_pos] + NEW_SITE_HEADER + html[nav_div_end:]

    # Step 2: Remove the in-page header (logo + hamburger) from inside <main>
    header_comment = '<!-- Header: profile photo + hamburger -->'
    hc_pos = html.find(header_comment)
    if hc_pos == -1:
        header_comment = '<!-- Header:'
        hc_pos = html.find(header_comment)

    if hc_pos != -1:
        # Go back to find start of line
        line_start = html.rfind('\n', 0, hc_pos) + 1
        hc_pos = line_start
        # Find the following <div
        div_start = html.find('<div', hc_pos)
        if div_start != -1:
            div_end = find_div_end(html, div_start)
            if div_end != -1:
                if div_end < len(html) and html[div_end] == '\n':
                    div_end += 1
                html = html[:hc_pos] + html[div_end:]

    # Step 3: Add padding to <main>
    html = re.sub(r'<main>', '<main class="pt-[120px]">', html, count=1)
    html = re.sub(r'<main class="([^"]*)">', lambda m: f'<main class="pt-[120px] {m.group(1)}">'
                  if 'pt-' not in m.group(1) else m.group(0), html, count=1)

    return html


def process_work(html):
    """Handle work.html: has <!-- NAV Starts here--> and <!-- NAV Ends here--> markers."""
    nav_start_marker = '<!-- NAV Starts here-->'
    nav_end_marker = '<!-- NAV Ends here-->'

    ns = html.find(nav_start_marker)
    ne = html.find(nav_end_marker)

    if ns == -1 or ne == -1:
        print("  ERROR: Could not find NAV markers in work.html")
        return html

    # Go to start of the line containing <!-- NAV Starts here-->
    line_start = html.rfind('\n', 0, ns) + 1
    # End after <!-- NAV Ends here-->
    ne_end = ne + len(nav_end_marker)
    if ne_end < len(html) and html[ne_end] == '\n':
        ne_end += 1

    html = html[:line_start] + NEW_SITE_HEADER + '\n' + html[ne_end:]
    return html


def process_project(html):
    """Handle project.html: has <header> element + separate nav-overlay."""
    # Find the <header element
    header_start = html.find('<header ')
    if header_start == -1:
        header_start = html.find('<header>')
    if header_start != -1:
        # Go to start of the line
        line_start = html.rfind('\n', 0, header_start) + 1
        # Find the preceding comment if any
        look_back = html.rfind('<!--', line_start - 300, header_start)
        if look_back != -1:
            comment_end = html.find('-->', look_back)
            if comment_end != -1:
                between = html[comment_end + 3:header_start].strip()
                if not between:
                    line_start = html.rfind('\n', 0, look_back) + 1

        # Find </header>
        header_end = html.find('</header>', header_start)
        if header_end != -1:
            header_end += len('</header>')
            if header_end < len(html) and html[header_end] == '\n':
                header_end += 1
        else:
            header_end = line_start  # fallback

        # Remove the header element
        html = html[:line_start] + html[header_end:]

    # Find and remove nav-overlay
    nav_comment_pos = html.rfind('<!--', 0, html.find('<div id="nav-overlay"'))
    if nav_comment_pos != -1:
        # Check if it's close (within 5 lines) to the nav-overlay div
        comment_end = html.find('-->', nav_comment_pos)
        between = html[comment_end + 3:html.find('<div id="nav-overlay"')].strip()
        if between:
            nav_comment_pos = html.find('<div id="nav-overlay"')

    nav_div_start = html.find('<div id="nav-overlay"')
    if nav_div_start == -1:
        print("  ERROR: nav-overlay not found in project.html")
        return html

    # Use nav_comment_pos if valid
    remove_from = nav_comment_pos if nav_comment_pos != -1 and nav_comment_pos < nav_div_start else nav_div_start
    # Get start of line
    remove_from = html.rfind('\n', 0, remove_from) + 1

    nav_div_end = find_div_end(html, nav_div_start)
    if nav_div_end != -1:
        if nav_div_end < len(html) and html[nav_div_end] == '\n':
            nav_div_end += 1
        html = html[:remove_from] + NEW_SITE_HEADER + html[nav_div_end:]

    return html


def process_inline(html, filename):
    """
    Handle pages where nav is INSIDE <main> (about, thought, expertise, play, article).
    Pattern: <!-- NAV Starts here--> + page header div + nav-overlay div, all inside <main>.
    """
    # Find the NAV section start
    nav_starts_marker = '<!-- NAV Starts here-->'
    ns_pos = html.find(nav_starts_marker)

    if ns_pos == -1:
        # No marker; just find the nav-overlay
        nav_div_start = html.find('<div id="nav-overlay"')
        if nav_div_start == -1:
            print(f"  ERROR: Could not find nav section in {filename}")
            return html
        ns_pos = nav_div_start
    else:
        # Go to start of line containing the marker
        ns_pos = html.rfind('\n', 0, ns_pos) + 1

    # Find the nav-overlay div and its end
    nav_div_start = html.find('<div id="nav-overlay"', ns_pos)
    if nav_div_start == -1:
        print(f"  ERROR: Could not find nav-overlay div in {filename}")
        return html

    nav_div_end = find_div_end(html, nav_div_start)
    if nav_div_end == -1:
        print(f"  ERROR: Could not find end of nav-overlay in {filename}")
        return html

    # Skip trailing newline
    if nav_div_end < len(html) and html[nav_div_end] == '\n':
        nav_div_end += 1

    # Remove the entire nav section from inside <main>
    html = html[:ns_pos] + html[nav_div_end:]

    # Insert site-header BEFORE <main (find the main tag)
    main_match = re.search(r'\n(\s*<main)', html)
    if main_match:
        insert_pos = main_match.start() + 1  # after the \n, before indentation
        html = html[:insert_pos] + NEW_SITE_HEADER + html[insert_pos:]
    else:
        print(f"  WARNING: Could not find <main in {filename}, inserting before body content")
        body_pos = html.find('<body')
        if body_pos != -1:
            after_body = html.find('>', body_pos) + 1
            html = html[:after_body] + '\n' + NEW_SITE_HEADER + html[after_body:]

    # Add padding-top to <main> tag
    def add_pt_to_main(m):
        attrs = m.group(1)
        if 'pt-[' in attrs or 'pt-32' in attrs or 'pt-36' in attrs:
            return m.group(0)
        if 'class="' in attrs:
            return m.group(0).replace('class="', 'class="pt-[120px] ', 1)
        elif "class='" in attrs:
            return m.group(0).replace("class='", "class='pt-[120px] ", 1)
        else:
            return f'<main{attrs} style="padding-top:120px">'

    html = re.sub(r'<main([^>]*)>', add_pt_to_main, html, count=1)
    return html


def process_file(filename, page_type):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  SKIP: {filename} not found")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html

    if page_type == 'index':
        html = process_index(html)
    elif page_type == 'work':
        html = process_work(html)
    elif page_type == 'project':
        html = process_project(html)
    elif page_type == 'inline':
        html = process_inline(html, filename)
    else:
        print(f"  UNKNOWN type: {page_type}")
        return

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ {filename} updated")
    else:
        print(f"  ✗ {filename} - NO CHANGES (check logic!)")


def main():
    pages = [
        ('index.html',    'index'),
        ('about.html',    'inline'),
        ('thought.html',  'inline'),
        ('expertise.html','inline'),
        ('play.html',     'inline'),
        ('article.html',  'inline'),
        ('project.html',  'project'),
        ('work.html',     'work'),
    ]

    print("Restructuring navigation on all pages...\n")
    for filename, page_type in pages:
        print(f"Processing {filename} (type={page_type})...")
        process_file(filename, page_type)
    print("\nDone.")


if __name__ == '__main__':
    main()
