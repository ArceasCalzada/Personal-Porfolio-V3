import os
import re

new_footer = """    <footer id="contact" class="premium-mesh-footer fade-in" data-bg-dark="#151116" data-bg-light="#faf5fa">
        <div class="mesh-bg"></div>
        <div class="mesh-footer-content">
            <div class="mesh-footer-top">
                <a href="#" class="mesh-back-to-top">↑ BACK TO TOP</a>
                <div class="mesh-date" id="liveDateStr">2026/07/23</div>
            </div>
            
            <div class="mesh-footer-middle footer-extended-grid">
                <!-- Left Side: Main text and Email -->
                <div class="footer-left-content">
                    <h2 class="mesh-availability" id="dynFooterHeadline">Available from July 2026.</h2>
                    <p class="mesh-looking-for" id="dynFooterSubtext">Looking for a UI/UX design internship. Small teams, complex problems.</p>
                    
                    <div class="footer-contact-info">
                        <p>📍 San Francisco, CA (Remote Open)</p>
                        <p>📞 +1 (555) 123-4567</p>
                    </div>

                    <div class="mesh-big-links" style="margin-top: 2rem;">
                        <a href="mailto:calzada.arceas@gmail.com" id="dynFooterEmail">EMAIL</a>
                    </div>
                </div>
                
                <!-- Right Side: Links and Sitemap -->
                <div class="footer-right-content">
                    <div class="footer-sitemap">
                        <h4>Sitemap</h4>
                        <ul>
                            <li><a href="index.html#hero">Home</a></li>
                            <li><a href="index.html#about">About</a></li>
                            <li><a href="index.html#showcase">Showcase</a></li>
                            <li><a href="CV_ArceasJohnCalzada.pdf" target="_blank">Resume</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-socials">
                        <h4>Socials</h4>
                        <ul>
                            <li><a href="#" target="_blank" id="dynFooterLinkedIn">LinkedIn ↗</a></li>
                            <li><a href="#" id="dynFooterBehance">Behance ↗</a></li>
                            <li><a href="#" id="dynFooterDribbble">Dribbble ↗</a></li>
                            <li><a href="#" target="_blank">Twitter/X ↗</a></li>
                            <li><a href="#" target="_blank">Instagram ↗</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mesh-footer-divider"></div>

            <div class="mesh-footer-bottom">
                <div class="mesh-bottom-left">
                    <div class="googly-eyes">
                        <div class="eye"><div class="pupil"></div></div>
                        <div class="eye"><div class="pupil"></div></div>
                    </div>
                    <div class="mesh-bottom-links">
                        <a href="index.html#about">ABOUT</a>
                        <a href="CV_ArceasJohnCalzada.pdf" target="_blank">CV</a>
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
    </footer>"""

files = ['index.html', 'about.html', 'project-details.html']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # replace everything between <footer id="contact" and </footer>
    new_content = re.sub(r'<footer id="contact"[\s\S]*?</footer>', new_footer, content)
    
    with open(file, 'w') as f:
        f.write(new_content)
    print(f"Updated {file}")
