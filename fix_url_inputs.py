import re

with open('admin.html', 'r') as f:
    content = f.read()

# We just replace type="url" with type="text" for the footer inputs
content = content.replace('type="url" id="setFooterLinkedIn"', 'type="text" id="setFooterLinkedIn"')
content = content.replace('type="url" id="setFooterBehance"', 'type="text" id="setFooterBehance"')
content = content.replace('type="url" id="setFooterDribbble"', 'type="text" id="setFooterDribbble"')
content = content.replace('type="url" id="setFooterTwitter"', 'type="text" id="setFooterTwitter"')
content = content.replace('type="url" id="setFooterInstagram"', 'type="text" id="setFooterInstagram"')

with open('admin.html', 'w') as f:
    f.write(content)

print("Updated input types.")
