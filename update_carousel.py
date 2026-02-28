import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the grid container
old_grid = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">'
new_carousel = '<div id="process-carousel" class="flex flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing pb-4 select-none" style="scrollbar-width: none; -ms-overflow-style: none;">\n<style>#process-carousel::-webkit-scrollbar { display: none; }</style>'

html = html.replace(old_grid, new_carousel)

# Replace the classes on the details tags within the cards
# We want to remove `rounded-[2rem]` and add widths/flex-shrink
old_details_class = 'class="group border-[2px] border-current rounded-[2rem] p-6 md:p-8 transition-colors duration-300"'
new_details_class = 'class="group border-[2px] border-current p-6 md:p-8 transition-colors duration-300 w-[85vw] md:w-[400px] flex-shrink-0 snap-start bg-brand-black relative"'

html = html.replace(old_details_class, new_details_class)

# The user asked to "make the card a carousel, that can be drag"
# So the border radius is removed by removing rounded-[2rem]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Now Let's append JS for the drag-to-scroll functionality for #process-carousel
js_drag_logic = """
// ── Draggable Process Carousel ──
document.addEventListener('DOMContentLoaded', () => {
    const processCarousel = document.getElementById('process-carousel');
    if (!processCarousel) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    processCarousel.addEventListener('mousedown', (e) => {
        isDown = true;
        processCarousel.style.scrollSnapType = 'none'; // Disable snap while dragging
        startX = e.pageX - processCarousel.offsetLeft;
        scrollLeft = processCarousel.scrollLeft;
    });
    
    processCarousel.addEventListener('mouseleave', () => {
        isDown = false;
        processCarousel.style.scrollSnapType = 'x mandatory';
    });
    
    processCarousel.addEventListener('mouseup', () => {
        isDown = false;
        processCarousel.style.scrollSnapType = 'x mandatory';
    });
    
    processCarousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - processCarousel.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast multiplier
        processCarousel.scrollLeft = scrollLeft - walk;
    });
});
"""

with open('script.js', 'a', encoding='utf-8') as f:
    f.write(js_drag_logic)

