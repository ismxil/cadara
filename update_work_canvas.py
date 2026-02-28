import re

with open('work.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Ensure quotes are scanty: we'll use 8 projects and 1 quote per block.
new_template = """    <!-- Template for a single Block of projects -->
    <template id="block-template">
        <div class="canvas-block">
            <!-- Project 1 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/1569076/pexels-photo-1569076.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Cadana</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Fintech</span>
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">UX/UI</span>
                    </div>
                </div>
            </a>
            
            <!-- Project 2 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Gomoney</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Banking</span>
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">UX/UI</span>
                    </div>
                </div>
            </a>
            
            <!-- Quote 1 -->
            <div class="canvas-card quote-card group bg-brand-red text-brand-black flex flex-col justify-center items-start p-10">
                <h3 class="font-display text-4xl md:text-5xl uppercase leading-none font-bold">I AM DESIGNER OF COS, I HAVE MORE FONTS THAN FRIENDS</h3>
            </div>

            <!-- Project 3 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/5475765/pexels-photo-5475765.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Mezovest</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Logistics</span>
                    </div>
                </div>
            </a>

            <!-- Project 4 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Sterling Bank</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Enterprise</span>
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">App</span>
                    </div>
                </div>
            </a>

            <!-- Project 5 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Motel One</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Hospitality</span>
                    </div>
                </div>
            </a>

            <!-- Project 6 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/1036641/pexels-photo-1036641.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Lemfi</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Global Transfer</span>
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Fintech</span>
                    </div>
                </div>
            </a>
            
            <!-- Project 7 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/2041556/pexels-photo-2041556.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Moniepoint</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Finance</span>
                    </div>
                </div>
            </a>
            
            <!-- Project 8 -->
            <a href="project.html" class="canvas-card group">
                <img src="https://images.pexels.com/photos/3182743/pexels-photo-3182743.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Work Example">
                <div class="canvas-card-content flex flex-col justify-end h-full">
                    <h3 class="font-display text-3xl md:text-4xl text-brand-red uppercase font-bold mb-3 tracking-widest">Kuda</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-[10px] md:text-xs font-display tracking-widest uppercase border-2 border-brand-red text-brand-red rounded-full px-3 py-1">Banking</span>
                    </div>
                </div>
            </a>
        </div>
    </template>"""

html = re.sub(r'<!-- Template for a single Block of projects -->.*?</template>', new_template, html, flags=re.DOTALL)

# 2. Fix the gradient selector so it strictly doesn't apply to quotes.
# Old: .canvas-card:not(.bg-brand-red)::before
# New: a.canvas-card::before (since only project cards are <a> tags, quotes are <div>s)
css_fix = """        /* The dark overlay should also fade in on hover so the card is fully bright when not hovered */
        a.canvas-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 50%);
            z-index: 10;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }

        a.canvas-card:hover::before {
            opacity: 1;
        }"""
        
html = re.sub(r'/\* The dark overlay should also fade in on hover.*?opacity: 1;\n\s*\}', css_fix, html, flags=re.DOTALL)

with open('work.html', 'w', encoding='utf-8') as f:
    f.write(html)
