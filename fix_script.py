import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the drag script to attach to the window instead of just the document (for mousedown/mousemove)
# and fix the drag delta logic
new_script = """        // --- INFINITE CANVAS LOGIC ---
        document.addEventListener('DOMContentLoaded', () => {
            const grid = document.getElementById('canvas-grid');
            const template = document.getElementById('block-template');
            if (!grid || !template) return;

            // Clone the block 9 times (3x3 grid) to wrap properly
            for (let i = 0; i < 9; i++) {
                grid.appendChild(template.content.cloneNode(true));
            }

            // After painting, we calculate the size of a ONE block.
            let blockWidth = 0;
            let blockHeight = 0;

            function measureBlock() {
                const firstBlock = grid.querySelector('.canvas-block');
                if (firstBlock) {
                    const rect = firstBlock.getBoundingClientRect();
                    blockWidth = rect.width;
                    blockHeight = rect.height;
                }
            }
            
            // Wait a tick for layouts
            setTimeout(measureBlock, 100);
            window.addEventListener('resize', measureBlock);

            // Positioning and momentum variables
            let x = 0;
            let y = 0;
            let targetX = 0;
            let targetY = 0;
            let isDragging = false;
            let hasDragged = false;
            let lastMouseX = 0;
            let lastMouseY = 0;

            // Start drag
            window.addEventListener('mousedown', (e) => {
                // If they clicked the nav, let the nav handle it
                if (e.target.closest('#nav-overlay') || e.target.closest('.fixed.top-0') || e.target.closest('#color-randomizer')) return;
                
                // Allow clicking links natively if no drag happens
                // e.preventDefault(); 
                
                isDragging = true;
                hasDragged = false; // Reset drag detection
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                document.body.style.cursor = 'grabbing';
            });

            // Dragging (Move)
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                
                // If they moved more than 3 pixels, we consider it a drag (not a click)
                if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                    hasDragged = true;
                }

                targetX -= deltaX * 1.5;
                targetY -= deltaY * 1.5;

                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            });

            // End drag
            window.addEventListener('mouseup', () => {
                isDragging = false;
                document.body.style.cursor = 'grab';
            });

            // Stop click if we dragged
            grid.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            // Touch support
            window.addEventListener('touchstart', (e) => {
                if (e.target.closest('#nav-overlay') || e.target.closest('.fixed.top-0') || e.target.closest('#color-randomizer')) return;
                
                isDragging = true;
                hasDragged = false;
                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
            }, { passive: false });
            
            window.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const deltaX = e.touches[0].clientX - lastMouseX;
                const deltaY = e.touches[0].clientY - lastMouseY;
                
                if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                    hasDragged = true;
                }

                targetX -= deltaX * 1.5;
                targetY -= deltaY * 1.5;

                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
            }, { passive: false });
            
            window.addEventListener('touchend', () => {
                isDragging = false;
            });

            // Add basic wheel tracking for trackpads
            window.addEventListener('wheel', (e) => {
                if (e.target.closest('#nav-overlay')) return;
                targetX += e.deltaX * 1.5;
                targetY += e.deltaY * 1.5;
            }, { passive: true });

            // Animation Loop (Inertia + Toroidal Wrapping)
            function tick() {
                // Smooth interpolation (lerp)
                x += (targetX - x) * 0.08;
                y += (targetY - y) * 0.08;

                if (blockWidth > 0 && blockHeight > 0) {
                    // Normalize the wrapped coordinates 
                    // To do modulo properly in JS with negative numbers: ((ans % w) + w) % w
                    if (x > blockWidth / 2) {
                        x -= blockWidth;
                        targetX -= blockWidth;
                    } else if (x < -blockWidth / 2) {
                        x += blockWidth;
                        targetX += blockWidth;
                    }

                    if (y > blockHeight / 2) {
                        y -= blockHeight;
                        targetY -= blockHeight;
                    } else if (y < -blockHeight / 2) {
                        y += blockHeight;
                        targetY += blockHeight;
                    }
                }

                // Apply rendering position
                grid.style.transform = `translate3d(calc(-50% - ${x}px), calc(-50% - ${y}px), 0)`;
                requestAnimationFrame(tick);
            }

            // Start the loop
            requestAnimationFrame(tick);
        });"""

html = re.sub(r'// --- INFINITE CANVAS LOGIC ---.*}\);', new_script, html, flags=re.DOTALL)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
