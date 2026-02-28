import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I want to add some randomness to the placement of the cards to make it feel more organic
# like the damngoodbrands hypeboard.

card_1_old = '<a href="project.html" class="canvas-card group">'
card_1_new = '<a href="project.html" class="canvas-card group mt-8 ml-12">'

card_3_old = '<a href="project.html" class="canvas-card group">'
card_3_new = '<a href="project.html" class="canvas-card group mt-16">'

card_6_old = '<a href="project.html" class="canvas-card group">'
card_6_new = '<a href="project.html" class="canvas-card group ml-8 -mt-8">'

# Only replace the first instance to avoid messing up template logic if there's multiples somehow
html = html.replace(card_1_old, card_1_new, 1)
html = html.replace(card_3_old, card_3_new, 1)
html = html.replace(card_6_old, card_6_new, 1)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
