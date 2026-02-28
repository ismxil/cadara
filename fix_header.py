import glob
import re

files = glob.glob('*.html')
for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # The current logo container uses: class="... w-10 h-10 md:w-16 md:h-16 ..." (or similar variants after the rotation removal)
    # We want to make it significantly smaller to shrink the header container footprint.
    # We'll change it to roughly w-8 h-8 md:w-10 md:h-10 to match the previous smaller scale.
    
    # regex to find the main logo container class and replace specifically the w/h classes
    # Because the exact class string varies slightly, we can replace the specific W/H tokens
    # But only inside the main-logo-container div.
    
    # Find the tag roughly like: <div id="main-logo-container" class="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center text-current transition-transform duration-500 ">
    
    def replacer(match):
        classes = match.group(2)
        classes = re.sub(r'\bw-10\b', 'w-8', classes)
        classes = re.sub(r'\bh-10\b', 'h-8', classes)
        classes = re.sub(r'\bmd:w-16\b', 'md:w-10', classes)
        classes = re.sub(r'\bmd:h-16\b', 'md:h-10', classes)
        # Also clean up trailing spaces in class string if we want
        return match.group(1) + classes + match.group(3)

    pattern = r'(<div id="main-logo-container"\s+class=")([^"]*)(")'
    html = re.sub(pattern, replacer, html)
    
    # We should also check the padding on the header itself if it's contributing to the height.
    # In work.html and project.html there's a `p-8` on the header div
    # `<div class="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-50 pointer-events-none">`
    if 'p-8' in html and 'fixed top-0' in html:
        html = html.replace('p-8 z-50', 'p-4 md:px-8 md:py-6 z-50')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
