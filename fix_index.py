import re
import codecs

with codecs.open('work.html', 'r', 'utf-8') as f:
    work = f.read()

nav_start = work.find('<div id="nav-overlay"')
nav_end = work.find('<!-- ════════════════════════════════════════\n         Infinite Canvas')
if nav_end == -1:
    nav_end = work.find('<!-- NAV Ends here-->')

if nav_end == -1:
    # Just find the </div> that closes nav-overlay. It's heavily nested, let's just grab up to <main>
    nav_end = work.find('<main>')

nav_block = work[nav_start:nav_end]

with codecs.open('index.html', 'r', 'utf-8') as f:
    index = f.read()

idx_start = index.find('<div id="nav-overlay"')
idx_end = index.find('<!-- ════════════════════════════════════════\n         Page content')

if idx_start != -1 and idx_end != -1 and nav_start != -1 and nav_end != -1:
    new_index = index[:idx_start] + nav_block + index[idx_end:]
    with codecs.open('index.html', 'w', 'utf-8') as f:
        f.write(new_index)
    print("Nav replaced in index.html")
else:
    print("Failed to find boundaries", idx_start, idx_end, nav_start, nav_end)
