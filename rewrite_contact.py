import re

with open('play.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the beginning of <main> to give us full width control
main_pattern = r'<main class="max-w-sm mx-auto">\s*<!-- NAV Starts here-->\s*<!-- Header with Logo and Hamburger Menu -->\s*<div class="flex justify-between items-center mt-12">'

new_main = """<main class="w-full">
    <!-- NAV Starts here-->
    <div class="max-w-sm mx-auto">
        <!-- Header with Logo and Hamburger Menu -->
        <div class="flex justify-between items-center mt-12 px-4">"""
        
html = re.sub(main_pattern, new_main, html, flags=re.DOTALL)

# Fix the Title and Calendar and Marquee section
title_pattern = r'<!-- Title -->.*?<!-- Footer Info -->'
new_body = """<!-- Title -->
        </div> <!-- Close nav wrapper -->
        
        <div class="max-w-5xl mx-auto px-4 mt-8 mb-12 flex flex-col items-center text-center">
            <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-black leading-tight">Let's design the right<br>thing the right way.</h1>
        </div>

        <!-- Calendar Embed -->
        <div class="max-w-5xl mx-auto w-full mb-24 px-4">
            <div class="rounded-3xl border border-current/10 shadow-sm overflow-hidden bg-white">
                <iframe src="https://cal.com/cadara/intro30mins?embed=true&theme=light" class="w-full h-[700px] border-none" loading="lazy"></iframe>
            </div>
        </div>

        <!-- Trusted By Section -->
        <div class="w-full mb-32 text-center overflow-hidden">
            <h2 class="font-display text-xs uppercase tracking-widest opacity-60 mb-8">Trusted by 40+ industry leaders</h2>
            <div class="w-full relative">
                <div id="logo-marquee" class="logo-strip flex items-center gap-16 md:gap-24 opacity-60">
                    <!-- SVG logos injected by initLogoMarquee() below -->
                </div>
                <!-- Gradient fades for marquee -->
                <div class="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none"></div>
                <div class="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none"></div>
            </div>
        </div>
        
        <div class="max-w-sm mx-auto"> <!-- Re-open constraint for footer -->
        <!-- Footer Info -->"""

html = re.sub(title_pattern, new_body, html, flags=re.DOTALL)

with open('play.html', 'w', encoding='utf-8') as f:
    f.write(html)
