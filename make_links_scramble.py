import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's add the generalized scramble logic
generalized_scramble = """
    // --- Generalized Scramble Effect for Links ---
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    const allLinks = document.querySelectorAll('a, button');
    
    allLinks.forEach(link => {
        // Only apply to links that contain primarily text (no images or SVGs inside, or handle them carefully)
        // We'll skip links that have SVG or IMG children to avoid breaking icons/images
        if (link.querySelector('svg, img')) return;
        
        // Skip if it's already a hero line or has no text
        if (link.closest('.hero-line') || link.id === 'hero-text') return;
        
        const textContent = link.textContent.trim();
        if (!textContent || textContent.length === 0) return;
        
        // Save original HTML in case we need to restore, but here we just replace text with spans
        // Actually, it's safer to just split the text nodes
        link.dataset.originalHtml = link.innerHTML;
        link.textContent = '';
        
        const spans = [];
        textContent.split('').forEach((char) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.textContent = char === ' ' ? '\\u00A0' : char;
            span.dataset.original = char === ' ' ? '\\u00A0' : char;
            span.style.transition = 'opacity 0.2s';
            link.appendChild(span);
            spans.push(span);
        });
        
        // Lock widths on hover before scrambling so it doesn't jump
        let scrambleInterval = null;
        
        link.addEventListener('mouseenter', () => {
            if (window.innerWidth < 768) return; // Optional: skip on mobile
            if (scrambleInterval) return;
            
            // Lock widths once
            if (!link.dataset.widthsLocked) {
                spans.forEach(span => {
                    span.style.width = '';
                    span.style.minWidth = '';
                });
                const rects = spans.map(s => s.getBoundingClientRect().width);
                spans.forEach((span, i) => {
                    span.style.width = rects[i] + 'px';
                    span.style.minWidth = rects[i] + 'px';
                    span.style.textAlign = 'center';
                });
                link.dataset.widthsLocked = 'true';
            }
            
            const iterations = new Array(spans.length).fill(0);
            const maxIterations = 5;
            
            scrambleInterval = setInterval(() => {
                let allDone = true;
                spans.forEach((span, i) => {
                    if (span.dataset.original === '\\u00A0') return;
                    if (iterations[i] < maxIterations + i) {
                        span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                        iterations[i]++;
                        allDone = false;
                    } else {
                        span.textContent = span.dataset.original;
                    }
                });
                if (allDone) {
                    clearInterval(scrambleInterval);
                    scrambleInterval = null;
                }
            }, 30);
        });
    });
"""

js = js.replace("// --- Hamburger menu toggle (subpages) ---", generalized_scramble + "\n    // --- Hamburger menu toggle (subpages) ---")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
