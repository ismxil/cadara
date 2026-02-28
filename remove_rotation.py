import glob
import re

files = glob.glob('*.html')
for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove the rotation class from the main logo container string
    if 'group-hover:rotate-180' in html:
        html = html.replace('group-hover:rotate-180', '')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
