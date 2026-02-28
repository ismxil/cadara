import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove gap from the grid
# .canvas-block { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; padding: 40px; }
# Removing gap and padding so it forms an endless seamless block
html = html.replace('gap: 40px;', 'gap: 0px;')
html = html.replace('padding: 40px;', 'padding: 0px;')

# 2. Remove border radius from the canvas cards
html = html.replace('border-radius: 16px;', 'border-radius: 0px;')

# 3. Increase the size of the cards to compensate for the lost gap, let's make them larger
# width: 400px; height: 500px;
html = html.replace('width: 400px;\n            height: 500px;', 'width: 500px;\n            height: 600px;')

# 4. Hide the title and service type by default, show on hover
# We can do this by wrapping the .canvas-card-content in a CSS hover logic.
# Wait, let's just add the CSS directly into the style block.
css_new_rules = """
        /* Hide content by default, reveal on hover */
        .canvas-card-content {
            position: relative;
            z-index: 20;
            color: #fff;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        /* The dark overlay should also fade in on hover so the card is fully bright when not hovered */
        .canvas-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%);
            z-index: 10;
            opacity: 0;
            transition: opacity 0.4s ease;
        }

        .canvas-card:hover::before {
            opacity: 1;
        }

        .canvas-card:hover .canvas-card-content {
            opacity: 1;
            transform: translateY(0);
        }
"""

# Remove old .canvas-card::before and .canvas-card-content from style, replace with new
old_gradient = """        /* Dark overlay for text legibility */
        .canvas-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 50%);
            z-index: 10;
        }"""
        
old_content = """        .canvas-card-content {
            position: relative;
            z-index: 20;
            color: #fff;
        }"""
        
# Be robust with regex for these replacements due to formatting variations
html = re.sub(r'/\* Dark overlay.*?\nz-index: 10;\n\s*}', '', html, flags=re.DOTALL)
html = re.sub(r'\.canvas-card-content \{.*?\n\s*\}', '', html, flags=re.DOTALL)

# Insert new CSS just before .canvas-card-title
html = html.replace('.canvas-card-title {', css_new_rules + '\n        .canvas-card-title {')


# 5. Remove the spacing helpers I added earlier (mt-8, ml-12, etc) on the canvas cards so there are truly no gaps.
# Let's just strip out all the margin classes from the cards in the template.
html = re.sub(r'(class="canvas-card group)[^"]*(")', r'\1\2', html)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
