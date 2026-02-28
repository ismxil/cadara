import glob
import re

randomizer_html = """
    <!-- ════════════════════════════════════════
         Fixed Randomize Button
         ════════════════════════════════════════ -->
    <a href="#" id="color-randomizer"
        class="fixed bottom-[30px] right-[30px] z-40 w-12 h-12 bg-brand-red rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(38,96,164,0.25)] hover:scale-110 transition-transform duration-200"
        aria-label="Randomize Colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785zm-9.031 3.88a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633zm7 8a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632z" />
        </svg>
    </a>
"""

new_logo_html = """                <a href="index.html" class="flex items-center gap-3 group relative z-50">
                    <div id="main-logo-container"
                        class="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center text-current transition-transform duration-500 group-hover:rotate-180">
                    </div>
                </a>"""

files = glob.glob('*.html')
for file_path in files:
    if file_path == 'index.html' or file_path == 'capture.html':
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Apply Randomizer if it's missing (usually missing from all subpages)
    if 'id="color-randomizer"' not in html:
        # Inject right before </body>
        html = html.replace('</body>', randomizer_html + '\n</body>')

    # Replace old Logo container for main top header
    # The old logo looks like: `<a href="index.html" class="flex justify-center items-center">\n                    <div id="main-logo-container" class="w-8 h-8 flex items-center justify-center text-current"></div>\n                </a>`
    # Warning: the mobile nav overlay also has an `id="nav-overlay-logo"`, making sure not to touch that.
    logo_pattern = r'<a href="index\.html"[^>]*>\s*<div id="main-logo-container".*?</div>\s*</a>'
    html = re.sub(logo_pattern, new_logo_html.strip(), html)

    # Note: On some pages the CSS for the color randomizer styling might also need injecting
    css_randomizer_style = """
        /* ── Randomize button: icon uses page background color ── */
        #color-randomizer svg path {
            fill: var(--brand-black, #FFF3DE);
        }
    """
    if css_randomizer_style.strip() not in html and 'var(--brand-black' not in html:
        style_insert = r'</style>'
        html = html.replace('</style>', css_randomizer_style + '</style>')

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
