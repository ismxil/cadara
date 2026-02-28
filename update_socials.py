import re
import glob

# The new social links required by the user
socials = {
    'linkedin': 'https://linkedin.com/company/cadarastudio',
    'behance': 'https://behance.net/cadara',
    'instagram': 'https://instagram.com/cadarastudio',
    'x': 'https://x.com/cadarastudio',
    'github': 'https://github.com/cadara-studio',
    'email': 'mailto:cadarastudio@gmail.com'
}

# Regex replacements targeting the href parameter based on the aria-label
for fpath in glob.glob('/Users/macbook/Documents/CODE/cadarastudio.com/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # We want to replace href="..." for elements containing specific aria-labels
    # To do this safely, we can replace known old links, or use regex that looks for aria-label adjacent
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="LinkedIn"|aria-label="linkedin"))', f'href="{socials["linkedin"]}"\\1', html, flags=re.IGNORECASE)
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="Behance"|aria-label="behance"))', f'href="{socials["behance"]}"\\1', html, flags=re.IGNORECASE)
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="Instagram"|aria-label="instagram"))', f'href="{socials["instagram"]}"\\1', html, flags=re.IGNORECASE)
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="X"|aria-label="x"|aria-label="Twitter"))', f'href="{socials["x"]}"\\1', html, flags=re.IGNORECASE)
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="GitHub"|aria-label="github"))', f'href="{socials["github"]}"\\1', html, flags=re.IGNORECASE)
    html = re.sub(r'href="[^"]*"([^>]*(?:aria-label="Email"|aria-label="email"))', f'href="{socials["email"]}"\\1', html, flags=re.IGNORECASE)

    # Global text replacements
    html = html.replace('Ismail Ahmad', 'Cadara Studio')
    html = html.replace('ismailahmad.com', 'cadarastudio.com')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
