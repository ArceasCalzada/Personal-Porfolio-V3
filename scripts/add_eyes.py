import os

files = ['index.html', 'about.html', 'project-details.html']

replacement = """
                    <div class="googly-eyes">
                        <div class="eye"><div class="pupil"></div></div>
                        <div class="eye"><div class="pupil"></div></div>
                    </div>
                    <div class="mesh-bottom-links">
"""

for file in files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
            
        content = content.replace('<div class="mesh-bottom-links">', replacement.strip())
        
        with open(file, 'w') as f:
            f.write(content)
        print(f"Updated eyes in {file}")
