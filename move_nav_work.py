import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract Navigation, Social Links, Footer
nav_pattern = r"(<!-- Navigation Section -->.*?</footer>)"
match = re.search(nav_pattern, html, flags=re.DOTALL)
if match:
    nav_content = match.group(1)
    
    # Remove it from the bottom
    html = html.replace(nav_content, "")
    
    # Inject into desktop container
    desktop_target = '<div id="desktop-nav-container"></div>'
    html = html.replace(desktop_target, nav_content)
    
    # Inject into mobile container
    mobile_target = '<div class="block lg:hidden mt-24 max-w-sm mx-auto pb-12" id="mobile-nav-container">\n    </div>'
    html = html.replace(mobile_target, '<div class="block lg:hidden mt-24 max-w-sm mx-auto pb-12" id="mobile-nav-container">\n' + nav_content + '\n</div>')

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
