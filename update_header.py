import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I need to move the header INTO the canvas grid so it scrolls WITH the canvas.
# Currently, it is fixed to the viewport.
# The user said "The header is not fixed".

# 1. Grab the header block
header_pattern = r'<!-- Header with Logo and Hamburger Menu -->.*?</div>\s*<!-- Mobile Navigation Overlay -->'
header_match = re.search(header_pattern, html, re.DOTALL)

if header_match:
    header_html = header_match.group(0).replace('<!-- Mobile Navigation Overlay -->', '').strip()
    
    # Remove fixed positioning and pointer-events-none from the header
    # old: class="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-50 pointer-events-none"
    # new: class="absolute top-0 left-0 w-full flex justify-between items-center p-8 z-50"
    header_html = header_html.replace('fixed top-0', 'absolute top-0')
    header_html = header_html.replace('pointer-events-none', '')
    
    # Also we should probably put the header INSIDE the block template so it repeats? No, the user said "header is not fixed". 
    # If the user means it should just be on the top left of the initial view, placing it absolute in the canvas-grid is right.
    
    # Actually wait - in damngoodbrands, where does the logo sit?
    # In damngoodbrands, there is NO distinct header. The logo and menu are completely separate cards mixed into the grid?
    # No, looking at the user's screenshot, it's a giant grid. Let me look at the screenshot from earlier exactly.
    pass

# For now, let's just make the header absolute so it scrolls with the canvas.
# I will change 'fixed top-0 left-0 w-full ...' to 'absolute top-0 left-0 w-full ...'
# Wait, if `canvas-grid` uses translate3d, keeping the header inside `#canvas-viewport` but OUTSIDE `canvas-grid` means it won't scroll.
# If we put it INSIDE `canvas-grid`, it will duplicate if we don't handle it right, or it will just sit at 0,0 of the grid (which moves away).
# Given the user says "The header is not fixed. And do not add gradient to quote box", I will just change "fixed" to "absolute" on the header,.
# Let's inspect Damngoodbrands.com/hypeboard. The logo and menu sit at the top corners and MOVE when you drag.

html = html.replace('class="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-50 pointer-events-none"',
                    'class="absolute top-0 left-0 w-full flex justify-between items-center p-8 z-50 pointer-events-none"')

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
