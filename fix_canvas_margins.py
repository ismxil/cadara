import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I want to specifically eliminate the extra top/left margins we added earlier (e.g. mt-24, mt-[150px], -mt-12)
html = re.sub(r'class="canvas-card group [^"]*"', 'class="canvas-card group"', html)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
