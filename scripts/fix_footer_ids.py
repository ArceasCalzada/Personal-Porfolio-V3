import re

files = ["index.html", "about.html", "project-details.html"]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Location
    content = re.sub(
        r'<p>📍 San Francisco, CA \(Remote Open\)</p>',
        r'<p><span id="dynFooterLocation">📍 San Francisco, CA (Remote Open)</span></p>',
        content
    )
    # Phone
    content = re.sub(
        r'<p>📞 \+1 \(555\) 123-4567</p>',
        r'<p><span id="dynFooterPhone">📞 +1 (555) 123-4567</span></p>',
        content
    )
    # Twitter
    content = re.sub(
        r'<li><a href="#" target="_blank">Twitter/X ↗</a></li>',
        r'<li><a href="#" target="_blank" id="dynFooterTwitter">Twitter/X ↗</a></li>',
        content
    )
    # Instagram
    content = re.sub(
        r'<li><a href="#" target="_blank">Instagram ↗</a></li>',
        r'<li><a href="#" target="_blank" id="dynFooterInstagram">Instagram ↗</a></li>',
        content
    )
    
    with open(file, 'w') as f:
        f.write(content)

print("Updated footer IDs correctly.")
