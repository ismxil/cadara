import re

with open('play.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's completely nuke the Trusted By and logo marquee layout entirely from play.html
# and replace it with the exact structure from the reference image matching 100vw width

trusted_pattern = r'<!-- Trusted By Section -->.*?</div>\s*</div>\s*</div>'
new_trusted = """<!-- Trusted By Section -->
            <div class="w-full mb-32 text-center overflow-hidden">
                <h2 class="font-display text-[10px] md:text-xs uppercase tracking-widest opacity-60 mb-8 font-bold">Trusted by 40+ industry leaders</h2>
                <div class="w-full relative">
                    <div id="logo-marquee" class="logo-strip flex items-center gap-16 md:gap-24 opacity-60 py-4">
                        <!-- SVG logos injected by initLogoMarquee() below -->
                    </div>
                </div>
            </div>"""
html = re.sub(trusted_pattern, new_trusted, html, flags=re.DOTALL)

# Clean up any leftover Cal url manually in case the regex missed it
html = html.replace('cadara/intro30mins?embed=true', 'cadara/intro?embed=true')
html = html.replace('cadara/intro30mins', 'cadara/intro')

with open('play.html', 'w', encoding='utf-8') as f:
    f.write(html)
