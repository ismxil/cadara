import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace main tag
html = html.replace('<main class="max-w-sm mx-auto">', '<main class="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen relative">\n<!-- LEFT SIDEBAR -->\n<div class="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-0 lg:h-screen flex flex-col pt-12 px-4 md:px-8 border-r-0 lg:border-r-[2px] border-current overflow-y-auto">\n<div class="max-w-sm mx-auto w-full flex-1 flex flex-col">')

# Replace the "<!-- Title -->" onwards
title_pattern = r"<!-- Title -->.*?</h1>"
new_title = """<!-- Title -->
<h1 class="font-display text-6xl md:text-8xl font-black uppercase tracking-tight mt-12 mb-6 text-left">Work</h1>
<p class="font-serif text-lg md:text-xl opacity-70 mb-12">Selected projects from over 10 years of designing experiences that drive growth, crafted with focus and precision.</p>"""
html = re.sub(title_pattern, new_title, html, flags=re.DOTALL)

# Let's remove the Project Grid
proj_pattern = r"<!-- Project Grid -->.*?</div>\s*</div>"
new_proj = """<!-- Project Grid -->
<div class="hidden lg:block mt-auto mb-12 pt-12">
    <!-- Desktop bottom nav placeholder -->
    <div id="desktop-nav-container"></div>
</div>"""
html = re.sub(proj_pattern, new_proj, html, flags=re.DOTALL)

# Inject the Right Side panel before the Password overlay
# First, let's find the Password Overlay
pass_pattern = r"<!-- Password Overlay -->"
right_col = """</div></div>
<!-- RIGHT CONTENT -->
<div class="lg:col-span-8 xl:col-span-9 p-4 md:p-12 xl:p-24 w-full">
    <div class="flex flex-col gap-12 lg:gap-24 w-full max-w-5xl mx-auto">
        <!-- Image 1 -->
        <div class="aspect-[4/3] w-full border-[3px] border-current overflow-hidden rounded-2xl group">
            <img src="https://images.pexels.com/photos/3182741/pexels-photo-3182741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Project 1" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        </div>
        <!-- Image 2 -->
        <div class="aspect-[4/3] w-full border-[3px] border-current overflow-hidden rounded-2xl group">
            <img src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Project 2" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        </div>
        <!-- Image 3 -->
        <div class="aspect-[4/3] w-full border-[3px] border-current overflow-hidden rounded-2xl group">
            <img src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Project 3" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        </div>
        <!-- Image 4 -->
        <div class="aspect-[4/3] w-full border-[3px] border-current overflow-hidden rounded-2xl group">
            <img src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Project 4" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        </div>
    </div>
    
    <!-- Mobile bottom nav wrapper (visible only below lg) -->
    <div class="block lg:hidden mt-24 max-w-sm mx-auto pb-12" id="mobile-nav-container">
    </div>
</div>
<!-- Password Overlay -->"""
html = html.replace(pass_pattern, right_col)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
