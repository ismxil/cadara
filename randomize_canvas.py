import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to insert a shuffle function before the grid cloning loop
# The loop looks like:
# for (let i = 0; i < 9; i++) {
#    grid.appendChild(template.content.cloneNode(true));
# }

new_script = """        // --- INFINITE CANVAS LOGIC ---
        document.addEventListener('DOMContentLoaded', () => {
            const grid = document.getElementById('canvas-grid');
            const template = document.getElementById('block-template');
            if (!grid || !template) return;

            // Extract the cards inside the template content
            const blockContainer = template.content.querySelector('.canvas-block');
            const cards = Array.from(blockContainer.querySelectorAll('.canvas-card'));

            // Generate a single shuffled order for this session
            // Fisher-Yates shuffle
            const shuffledCards = [...cards];
            for (let i = shuffledCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
            }

            // Empty the template block and re-insert the shuffled cards
            blockContainer.innerHTML = '';
            shuffledCards.forEach(card => blockContainer.appendChild(card));

            // Clone the block 9 times (3x3 grid) to wrap properly
            for (let i = 0; i < 9; i++) {
                grid.appendChild(template.content.cloneNode(true));
            }"""

html = re.sub(r'// \-\-\- INFINITE CANVAS LOGIC \-\-\-.*?for \(let i = 0; i < 9; i\+\+\) \{\n\s*grid\.appendChild\(template\.content\.cloneNode\(true\)\);\n\s*\}', new_script, html, flags=re.DOTALL)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
