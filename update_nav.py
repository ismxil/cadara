import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

with open('work.html', 'r', encoding='utf-8') as f:
    work_html = f.read()

nav_pattern = r'<!-- NAV Starts here-->.*?<!-- NAV Ends here-->'
nav_match = re.search(nav_pattern, index_html, re.DOTALL)

if nav_match:
    nav_content = nav_match.group(0)
    work_html = re.sub(nav_pattern, nav_content, work_html, flags=re.DOTALL)
    
    with open('work.html', 'w', encoding='utf-8') as f:
        f.write(work_html)
