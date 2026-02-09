// Basic script for any interactive elements if needed
document.addEventListener('DOMContentLoaded', () => {
    console.log("Ismail Ahmad portfolio loaded.");

    // Smooth scroll for nav links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault();
            // console.log(`Navigating to: ${link.textContent}`);
        });
    });

    // Hamburger menu functionality
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const navOverlay = document.getElementById('nav-overlay');
    const navItems = document.querySelectorAll('.nav-item');

    function openMenu() {
        if (navOverlay) {
            navOverlay.classList.remove('opacity-0', 'pointer-events-none');
            navOverlay.classList.add('opacity-100', 'pointer-events-auto');
            document.body.style.overflow = 'hidden';
            
            // Animate nav items in (from bottom to top appearance)
            navItems.forEach(item => {
                item.classList.remove('translate-y-8', 'opacity-0');
                item.classList.add('translate-y-0', 'opacity-100');
            });
        }
    }

    function closeMenu() {
        if (navOverlay) {
            // Animate nav items out (slide down and fade)
            navItems.forEach((item, index) => {
                item.style.transitionDelay = `${(navItems.length - index - 1) * 50}ms`;
                item.classList.remove('translate-y-0', 'opacity-100');
                item.classList.add('translate-y-8', 'opacity-0');
            });
            
            // Close overlay after animation
            setTimeout(() => {
                navOverlay.classList.remove('opacity-100', 'pointer-events-auto');
                navOverlay.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = '';
                
                // Reset transition delays
                navItems.forEach(item => {
                    item.style.transitionDelay = '';
                });
            }, 350);
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }

    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay && !navOverlay.classList.contains('opacity-0')) {
            closeMenu();
        }
    });

    // Color randomizer functionality
    const colorRandomizer = document.getElementById('color-randomizer');
    
    if (colorRandomizer) {
        colorRandomizer.addEventListener('click', (e) => {
            e.preventDefault();
            randomizeColors();
        });
    }

    function randomizeColors() {
        // Generate a random hue (0-360)
        const hue = Math.floor(Math.random() * 360);
        
        // Create complementary color (opposite on color wheel)
        const complementaryHue = (hue + 180) % 360;
        
        // Generate vibrant text color with high saturation and lightness
        const textColor = `hsl(${hue}, 70%, 55%)`;
        
        // Generate dark background with same hue but low lightness
        const bgColor = `hsl(${complementaryHue}, 25%, 8%)`;
        
        // Apply colors to CSS custom properties
        document.documentElement.style.setProperty('--brand-red', textColor);
        document.documentElement.style.setProperty('--brand-black', bgColor);
        
        // Also update body directly for immediate effect
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;
        
        // Update all elements that use the brand colors
        const allTextElements = document.querySelectorAll('h1, p, a, span, nav, footer');
        allTextElements.forEach(el => {
            el.style.color = textColor;
        });
        
        // Update SVG icons (exclude logo)
        const svgPaths = document.querySelectorAll('svg:not(.logo) path');
        svgPaths.forEach(path => {
            path.setAttribute('fill', textColor);
        });
        
        // Update border colors for dotted lines
        const dottedBorders = document.querySelectorAll('.border-dotted');
        dottedBorders.forEach(border => {
            border.style.borderColor = textColor;
            border.style.opacity = '0.5';
        });

        console.log(`Colors randomized! Text: ${textColor}, Background: ${bgColor}`);
    }
});
