import re

files = ["index.html", "about.html", "project-details.html"]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Replace Location ID
    content = content.replace('<p>San Francisco, CA</p>', '<p id="dynFooterLocation">San Francisco, CA</p>')
    # Replace Phone ID
    content = content.replace('<p>+1 (234) 567-890</p>', '<p id="dynFooterPhone">+1 (234) 567-890</p>')
    
    # Replace Twitter ID
    content = content.replace('<li><a href="#" target="_blank">Twitter / X</a></li>', '<li><a id="dynFooterTwitter" href="#" target="_blank">Twitter / X</a></li>')
    # Replace Instagram ID
    content = content.replace('<li><a href="#" target="_blank">Instagram</a></li>', '<li><a id="dynFooterInstagram" href="#" target="_blank">Instagram</a></li>')
    
    with open(file, 'w') as f:
        f.write(content)

print("Updated footer IDs in HTML files.")
