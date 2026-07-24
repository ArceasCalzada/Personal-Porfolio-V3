import os

new_footer = """
    <footer id="contact" class="premium-mesh-footer fade-in" data-bg-dark="#151116" data-bg-light="#faf5fa">
        <div class="mesh-bg"></div>
        <div class="mesh-footer-content">
            <div class="mesh-footer-top">
                <a href="#" class="mesh-back-to-top">↑ BACK TO TOP</a>
                <div class="mesh-date" id="liveDateStr">2026/07/23</div>
            </div>
            
            <div class="mesh-footer-middle">
                <h2 class="mesh-availability" id="dynFooterHeadline">Available from July 2026.</h2>
                <p class="mesh-looking-for" id="dynFooterSubtext">Looking for a UI/UX design internship. Small teams, complex problems.</p>
                <div class="mesh-big-links">
                    <a href="mailto:calzada.arceas@gmail.com" id="dynFooterEmail">EMAIL</a>
                    <a href="#" target="_blank" id="dynFooterLinkedIn">LINKEDIN</a>
                    <!-- Hidden so JS doesn't crash if it expects them -->
                    <a href="#" id="dynFooterBehance" style="display:none;"></a>
                    <a href="#" id="dynFooterDribbble" style="display:none;"></a>
                </div>
            </div>

            <div class="mesh-footer-divider"></div>

            <div class="mesh-footer-bottom">
                <div class="mesh-bottom-left">
                    <div class="mesh-bottom-links">
                        <a href="index.html#about">ABOUT</a>
                        <a href="Resume_Arceas_John_Calzada.pdf" target="_blank">CV</a>
                    </div>
                    <p class="mesh-copyright">&copy; 2026 ARCEAS JOHN CALZADA. ALL RIGHTS RESERVED. THE PROJECTS SHOWCASED IN THIS PORTFOLIO ARE MY INTELLECTUAL PROPERTY UNLESS OTHERWISE CREDITED.</p>
                </div>
                <div class="mesh-bottom-right">
                    <p>DESIGNED & BUILT BY ARCEAS</p>
                    <div class="mesh-plus-icon">+</div>
                </div>
            </div>
        </div>
        <div class="mesh-watermark">
            Designed by Arceas
        </div>
    </footer>
"""

files = ['index.html', 'about.html', 'project-details.html', 'seed.html']

for file in files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        
        start_str = '<footer id="contact"'
        end_str = '</footer>'
        
        if start_str in content and end_str in content:
            start_idx = content.find(start_str)
            end_idx = content.find(end_str, start_idx) + len(end_str)
            
            new_content = content[:start_idx] + new_footer.strip() + content[end_idx:]
            
            with open(file, 'w') as f:
                f.write(new_content)
            print(f"Updated footer in {file}")
