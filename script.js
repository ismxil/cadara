// Color palettes used across the site — split by light/dark backgrounds
const lightPalettes = [
    { bg: '#FFF3DE', fg: '#2660A4' },
    { bg: '#fdf0d5', fg: '#003049' },
    { bg: '#f1faee', fg: '#1d3557' },
    { bg: '#fefae0', fg: '#606c38' },
    { bg: '#eddcd2', fg: '#264653' },
    { bg: '#f4f1de', fg: '#e07a5f' },
    { bg: '#d8e2dc', fg: '#6d6875' },
];

const darkPalettes = [
    { bg: '#191919', fg: '#4d7cc7' },
    { bg: '#1a1a2e', fg: '#e94560' },
    { bg: '#0f0e17', fg: '#ff8906' },
    { bg: '#2b2d42', fg: '#edf2f4' },
    { bg: '#0d1b2a', fg: '#e0e1dd' },
    { bg: '#1b1b1b', fg: '#f5c518' },
    { bg: '#212529', fg: '#f8f9fa' },
    { bg: '#2d0a31', fg: '#d4a5e5' },
    { bg: '#1c1917', fg: '#fbbf24' },
];

// All palettes combined (used as fallback)
const palettes = [...lightPalettes, ...darkPalettes];

// Returns true if the visitor's local time is between 4 PM and 6:59 AM (dark hours)
function isDarkHours() {
    const hour = new Date().getHours();
    return hour >= 16 || hour < 7; // 4 PM – 6:59 AM
}

// Pick a random palette appropriate for the current time of day
function getTimeAwarePalette() {
    const pool = isDarkHours() ? darkPalettes : lightPalettes;
    return pool[Math.floor(Math.random() * pool.length)];
}

// Return the default palette for the current time of day (first item in each pool)
function getDefaultPalette() {
    return isDarkHours() ? darkPalettes[0] : lightPalettes[0];
}

// Generate a cursor SVG data URI — outline in fgColor, inner fill in bgColor (matches cursor.svg)
function buildCursorSvg(fgColor, bgColor) {
    const fg = encodeURIComponent(fgColor);
    const bg = encodeURIComponent(bgColor);
    return `url("data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M0.716797 0.265772C1.16442 -0.0304122 1.73054 -0.082585 2.22461 0.1271L20.6846 7.96694C21.2751 8.21794 21.659 8.79795 21.6592 9.4396V13.0412C21.6589 13.6703 21.2895 14.2418 20.7158 14.5001L12.7061 18.1056L7.81738 25.3214C7.4642 25.8426 6.83797 26.1083 6.21777 26.0001C5.59742 25.8917 5.09788 25.4287 4.94238 24.8185L0.0488281 5.59487C0.0160918 5.46612 2.66574e-05 5.33319 0 5.20034V1.59976C0 1.06287 0.269077 0.562067 0.716797 0.265772Z' fill='${fg}'/><path d='M1.59912 1.599L20.0585 9.43899L11.6359 13.2308L6.49211 20.8226L1.59912 1.599Z' fill='${bg}'/></svg>") 0 0, auto`;
}

// Generate a pointer SVG data URI — outline in fgColor, inner fill in bgColor (matches pointer.svg)
function buildPointerSvg(fgColor, bgColor) {
    const fg = encodeURIComponent(fgColor);
    const bg = encodeURIComponent(bgColor);
    return `url("data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M28.0801 19.5059C26.9376 21.0171 24.5826 22.9384 21.6314 24.6434C20.9089 25.0609 20.1926 25.4397 19.4964 25.7797C15.6926 27.6284 12.4589 28.2659 11.8239 27.1671C11.3176 26.2884 12.6026 24.5246 14.9289 22.6421C16.0451 21.7396 17.4014 20.8097 18.9139 19.9359C20.9851 18.7409 23.0014 17.8522 24.6701 17.3484C26.7601 16.7172 28.3039 16.6896 28.7214 17.4122C28.9964 17.8896 28.7426 18.6284 28.0801 19.5059Z' fill='${fg}'/><path d='M27.3737 18.6619C27.3312 18.7544 27.2812 18.8569 27.2262 18.9669C26.0837 20.4781 23.7287 22.3994 20.7775 24.1044C20.055 24.5219 19.3387 24.9006 18.6425 25.2406L12.6862 21.1494C10.4852 20.6971 8.52303 20.2546 6.63996 18.6619L1.55443 13.8487C0.328052 12.5581 3.32687 11.1589 4.98342 12.5581C6.63996 13.9574 7.25918 14.3311 8.04996 13.7317C8.62335 13.2971 8.16683 12.7512 7.6766 12.0981L1.55443 4.28312C0.461984 2.85293 0.730714 1.67838 1.26994 1.14598C1.80916 0.613575 2.60135 0.724937 3.13997 1.29812L5.97871 4.28312C7.45121 3.89312 8.84622 3.36062 10.1362 4.57687C11.6412 4.11687 12.9162 4.07062 14.14 4.80687L14.1825 4.83187C15.3812 5.55437 16.8862 6.46062 17.68 7.85062C18.6487 9.54437 19.8775 12.7319 20.3875 14.0969C21.0654 15.9127 25.877 17.6517 27.3737 18.6619Z' fill='${bg}'/><path d='M10.1362 4.57687C8.84622 3.36062 7.45121 3.89312 5.97871 4.28312L3.13997 1.29812C2.60135 0.724937 1.80916 0.613575 1.26994 1.14598C0.730714 1.67838 0.461984 2.85293 1.55443 4.28312L7.6766 12.0981C8.16683 12.7512 8.62336 13.2971 8.04996 13.7317C7.25918 14.3311 6.63996 13.9574 4.98342 12.5581C3.32687 11.1589 0.328052 12.5581 1.55443 13.8487L6.63996 18.6619C8.52303 20.2546 10.4852 20.6971 12.6862 21.1494L18.6425 25.2406C19.3387 24.9006 20.055 24.5219 20.7775 24.1044C23.7287 22.3994 26.0837 20.4781 27.2262 18.9669C27.2812 18.8569 27.3312 18.7544 27.3737 18.6619C25.877 17.6517 21.0654 15.9127 20.3875 14.0969C19.8775 12.7319 18.6487 9.54437 17.68 7.85062C16.8862 6.46062 15.3812 5.55437 14.1825 4.83187L14.14 4.80687C12.9162 4.07062 11.6412 4.11687 10.1362 4.57687ZM10.1362 4.57687L12.6588 6.93688M5.9796 4.28253L9.31763 7.81772' stroke='${fg}' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>") 6 0, pointer`;
}

// Apply cursor colors matching the foreground
function updateCursors(fgColor, bgColor) {
    document.documentElement.style.setProperty('cursor', buildCursorSvg(fgColor, bgColor), 'important');
    // Update interactive element cursors via a dynamic style tag
    let cursorStyle = document.getElementById('dynamic-cursor-style');
    if (!cursorStyle) {
        cursorStyle = document.createElement('style');
        cursorStyle.id = 'dynamic-cursor-style';
        document.head.appendChild(cursorStyle);
    }
    cursorStyle.textContent = `
        a, button, [role='button'], input[type='submit'], input[type='button'], select, .cursor-pointer {
            cursor: ${buildPointerSvg(fgColor, bgColor)} !important;
        }
        body {
            cursor: ${buildCursorSvg(fgColor, bgColor)} !important;
        }
    `;
}

// Apply a palette to the entire page (body, CSS vars, overlays, cursors)
function applyPalette(palette) {
    document.documentElement.style.setProperty('--brand-black', palette.bg);
    document.documentElement.style.setProperty('--brand-red', palette.fg);
    document.body.style.backgroundColor = palette.bg;
    document.body.style.color = palette.fg;

    // Sync any overlays that are present on the page
    const navOverlay = document.getElementById('nav-overlay');
    if (navOverlay) {
        navOverlay.style.backgroundColor = palette.bg;
        navOverlay.style.color = palette.fg;
    }
    const passwordOverlay = document.getElementById('password-overlay');
    if (passwordOverlay) {
        passwordOverlay.style.backgroundColor = palette.bg;
        passwordOverlay.style.color = palette.fg;
        // Sync the sticky header background inside the overlay
        const stickyHeader = passwordOverlay.querySelector('.sticky');
        if (stickyHeader) stickyHeader.style.backgroundColor = palette.bg;
    }

    // Update cursors to match new foreground color
    updateCursors(palette.fg, palette.bg);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Nav scroll transition ---
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        const scrollThreshold = 80;
        let lastScrolled = false;

        function handleNavScroll() {
            const scrolled = window.scrollY > scrollThreshold;
            if (scrolled !== lastScrolled) {
                mainNav.classList.toggle('nav-scrolled', scrolled);
                lastScrolled = scrolled;
            }
        }

        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll(); // Check initial state
    }

    // --- Hero text letter-by-letter reveal animation ---
    const heroLines = document.querySelectorAll('.hero-line');
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    const heroText = document.getElementById('hero-text');
    let allSpans = [];

    heroLines.forEach((line, lineIndex) => {
        const text = line.getAttribute('data-text');
        if (!text) return;

        line.textContent = '';

        const spans = [];
        text.split('').forEach((char, charIndex) => {
            const span = document.createElement('span');
            span.classList.add('hero-char');
            span.style.display = 'inline-block';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.dataset.original = char === ' ' ? '\u00A0' : char;

            const delay = lineIndex * 300 + charIndex * 80;
            setTimeout(() => {
                span.classList.add('revealed');
            }, delay);

            line.appendChild(span);
            spans.push(span);
        });

        allSpans.push(...spans);
    });

    // Lock each character's width to its natural glyph width
    function lockCharWidths() {
        allSpans.forEach(span => {
            // Clear any previously locked width so we measure the natural size
            span.style.width = '';
            span.style.minWidth = '';
        });
        // Let the browser reflow, then measure and lock
        requestAnimationFrame(() => {
            allSpans.forEach(span => {
                const w = span.getBoundingClientRect().width;
                span.style.width = w + 'px';
                span.style.minWidth = w + 'px';
                span.style.textAlign = 'center';
                span.style.overflow = 'hidden';
            });
        });
    }

    // Lock widths after fonts load, and re-lock on resize
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(lockCharWidths);
    } else {
        requestAnimationFrame(lockCharWidths);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(lockCharWidths, 150);
    });

    // Scramble on hover — single listener for both lines (md: and up only)
    if (heroText) {
        let scrambleInterval = null;

        heroText.addEventListener('mouseenter', () => {
            if (window.innerWidth < 768) return;
            if (scrambleInterval) return;
            const iterations = new Array(allSpans.length).fill(0);
            const maxIterations = 6;

            scrambleInterval = setInterval(() => {
                let allDone = true;
                allSpans.forEach((span, i) => {
                    if (span.dataset.original === '\u00A0') return;
                    if (iterations[i] < maxIterations + i * 2) {
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
            }, 40);
        });
    }

    // --- Mobile hamburger menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        function openMobileMenu() {
            mobileMenu.classList.add('active');
            mobileMenuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }

        mobileMenuBtn.addEventListener('click', openMobileMenu);
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }
        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMobileMenu();
        });
    }

    // --- Color randomizer (works on all pages) ---
    // Support both #color-randomizer (main pages) and #menu-color-randomizer (inside nav overlay)
    const colorRandomizers = document.querySelectorAll('#color-randomizer, #menu-color-randomizer');
    colorRandomizers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Pick from light or dark palettes based on visitor's local time
            const palette = getTimeAwarePalette();
            applyPalette(palette);
            // Persist the chosen palette for the duration of this browser session
            sessionStorage.setItem('activePalette', JSON.stringify(palette));
        });
    });

    // --- Restore saved palette or apply a time-appropriate default ---
    const saved = sessionStorage.getItem('activePalette');
    if (saved) {
        try {
            const palette = JSON.parse(saved);
            applyPalette(palette);
        } catch (_) {
            sessionStorage.removeItem('activePalette');
            // Apply the default palette for this time of day
            const palette = getDefaultPalette();
            applyPalette(palette);
            sessionStorage.setItem('activePalette', JSON.stringify(palette));
        }
    } else {
        // First visit — apply the default palette for this time of day
        const palette = getDefaultPalette();
        applyPalette(palette);
        sessionStorage.setItem('activePalette', JSON.stringify(palette));
    }

});
