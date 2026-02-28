import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

index_header_match = re.search(r'<!-- Header with Logo and Hamburger Menu -->\s*(<div[^>]*>.*?</div>\s*)<!-- Mobile Navigation Overlay -->', index_html, re.DOTALL)

with open('work.html', 'r', encoding='utf-8') as f:
    work_html = f.read()

work_header_match = re.search(r'<!-- Header with Logo and Hamburger Menu -->\s*(<div[^>]*>.*?</div>\s*)<!-- Mobile Navigation Overlay -->', work_html, re.DOTALL)

if index_header_match and work_header_match:
    print("Found both headers.")
    # Wait, the index header has `text-white mix-blend-difference`!
    header_content = index_header_match.group(1)
    print("\nINDEX HEADER TO INSERT:\n")
    print(header_content)
    new_work_html = work_html[:work_header_match.start(1)] + header_content + work_html[work_header_match.end(1):]
    
    with open('work.html', 'w', encoding='utf-8') as f:
        f.write(new_work_html)
else:
    print("Could not find headers.")
