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

    // Color randomizer functionality — both main page and menu buttons
    const colorRandomizer = document.getElementById('color-randomizer');
    const menuColorRandomizer = document.getElementById('menu-color-randomizer');

    // Time-aware color system
    // Before 4pm: light backgrounds, dark text (day mode)
    // From 4pm:   dark backgrounds, light text (night mode)
    function isNightMode() {
        return new Date().getHours() >= 16;
    }

    // Curated color presets — day (light bg, dark text) and night (dark bg, light text)
    const dayPresets = [
        { text: '#111111', bg: '#FF3B3B' },   // Red bg, dark text
        { text: '#2660A4', bg: '#FFF3DE' },   // Cream bg, blue text
        { text: '#F76C5E', bg: '#F5D547' },   // Yellow bg, coral text
        { text: '#0A0A0A', bg: '#E63946' },   // Red bg, black text
        { text: '#1B4332', bg: '#D8F3DC' },   // Mint bg, forest text
        { text: '#5A189A', bg: '#E0AAFF' },   // Lavender bg, purple text
    ];

    const nightPresets = [
        { text: '#FF3B3B', bg: '#111111' },   // Original — dark bg, red text
        { text: '#F5D547', bg: '#F76C5E' },   // Coral bg, yellow text
        { text: '#E0AAFF', bg: '#10002B' },   // Deep purple bg, lavender text
        { text: '#D8F3DC', bg: '#1B4332' },   // Forest bg, mint text
        { text: '#FFF3DE', bg: '#2660A4' },   // Blue bg, cream text
        { text: '#F76C5E', bg: '#1A1A2E' },   // Dark navy bg, coral text
    ];

    let presetIndex = 0;
    
    if (colorRandomizer) {
        colorRandomizer.addEventListener('click', (e) => {
            e.preventDefault();
            cycleColors();
        });
    }

    if (menuColorRandomizer) {
        menuColorRandomizer.addEventListener('click', (e) => {
            e.preventDefault();
            cycleColors();
        });
    }

    function cycleColors() {
        let textColor, bgColor;
        const night = isNightMode();
        const presets = night ? nightPresets : dayPresets;

        if (presetIndex < presets.length) {
            // Cycle through curated presets first
            const preset = presets[presetIndex];
            textColor = preset.text;
            bgColor = preset.bg;
            presetIndex++;
        } else {
            // After all presets, generate random colors respecting time of day
            const hue = Math.floor(Math.random() * 360);
            const complementaryHue = (hue + 180) % 360;

            if (night) {
                // Night: dark bg, light/vibrant text
                textColor = `hsl(${hue}, 70%, 55%)`;
                bgColor = `hsl(${complementaryHue}, 25%, 8%)`;
            } else {
                // Day: light bg, dark text
                textColor = `hsl(${hue}, 60%, 25%)`;
                bgColor = `hsl(${complementaryHue}, 40%, 90%)`;
            }
        }

        applyColors(textColor, bgColor);
    }

    function applyColors(textColor, bgColor) {
        // Apply colors to CSS custom properties
        document.documentElement.style.setProperty('--brand-red', textColor);
        document.documentElement.style.setProperty('--brand-black', bgColor);
        
        // Update body directly for immediate effect
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;

        // Update the nav overlay background so it stays in sync
        if (navOverlay) {
            navOverlay.style.backgroundColor = bgColor;
        }
        
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

        console.log(`Colors applied! Text: ${textColor}, Background: ${bgColor}`);
    }
});
