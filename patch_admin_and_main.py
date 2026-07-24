import re

with open('js/admin.js', 'r') as f:
    admin_content = f.read()

# Replace Load
load_old = """            document.getElementById('setFooterLinkedIn').value = data.footerLinkedIn || '';
            document.getElementById('setFooterBehance').value = data.footerBehance || '';
            document.getElementById('setFooterDribbble').value = data.footerDribbble || '';
            document.getElementById('setFooterTwitter').value = data.footerTwitter || '';
            document.getElementById('setFooterInstagram').value = data.footerInstagram || '';"""
load_new = """            document.getElementById('setFooterLinkedIn').value = data.footerLinkedIn || '';
            document.getElementById('showFooterLinkedIn').checked = data.showFooterLinkedIn !== false;
            document.getElementById('setFooterBehance').value = data.footerBehance || '';
            document.getElementById('showFooterBehance').checked = data.showFooterBehance !== false;
            document.getElementById('setFooterDribbble').value = data.footerDribbble || '';
            document.getElementById('showFooterDribbble').checked = data.showFooterDribbble !== false;
            document.getElementById('setFooterTwitter').value = data.footerTwitter || '';
            document.getElementById('showFooterTwitter').checked = data.showFooterTwitter !== false;
            document.getElementById('setFooterInstagram').value = data.footerInstagram || '';
            document.getElementById('showFooterInstagram').checked = data.showFooterInstagram !== false;"""
admin_content = admin_content.replace(load_old, load_new)

# Replace Save
save_old = """            footerEmail: document.getElementById('setFooterEmail').value,
            footerLinkedIn: document.getElementById('setFooterLinkedIn').value,
            footerBehance: document.getElementById('setFooterBehance').value,
            footerDribbble: document.getElementById('setFooterDribbble').value,
            footerTwitter: document.getElementById('setFooterTwitter').value,
            footerInstagram: document.getElementById('setFooterInstagram').value,"""
save_new = """            footerEmail: document.getElementById('setFooterEmail').value,
            footerLinkedIn: document.getElementById('setFooterLinkedIn').value,
            showFooterLinkedIn: document.getElementById('showFooterLinkedIn').checked,
            footerBehance: document.getElementById('setFooterBehance').value,
            showFooterBehance: document.getElementById('showFooterBehance').checked,
            footerDribbble: document.getElementById('setFooterDribbble').value,
            showFooterDribbble: document.getElementById('showFooterDribbble').checked,
            footerTwitter: document.getElementById('setFooterTwitter').value,
            showFooterTwitter: document.getElementById('showFooterTwitter').checked,
            footerInstagram: document.getElementById('setFooterInstagram').value,
            showFooterInstagram: document.getElementById('showFooterInstagram').checked,"""
admin_content = admin_content.replace(save_old, save_new)

with open('js/admin.js', 'w') as f:
    f.write(admin_content)

with open('js/main.js', 'r') as f:
    main_content = f.read()

# Replace frontend load logic to hide the parent list item (li) instead of just a if toggle is false
main_old = """            if (data.footerLinkedIn) {
                const el = document.getElementById('dynFooterLinkedIn');
                if (el) { el.href = data.footerLinkedIn; el.style.display = ''; }
                const sub = document.getElementById('dynFooterLinkedInSub');"""
main_new = """            if (data.footerLinkedIn) {
                const el = document.getElementById('dynFooterLinkedIn');
                if (el) { 
                    el.href = data.footerLinkedIn; 
                    if (data.showFooterLinkedIn !== false) {
                        el.parentElement.style.display = '';
                        el.style.display = ''; 
                    } else {
                        el.parentElement.style.display = 'none';
                    }
                }
                const sub = document.getElementById('dynFooterLinkedInSub');"""
main_content = main_content.replace(main_old, main_new)

# Behance
main_old = """            if (data.footerBehance) {
                const el = document.getElementById('dynFooterBehance');
                if (el) { el.href = data.footerBehance; el.style.display = ''; }
                const sub = document.getElementById('dynFooterBehanceSub');"""
main_new = """            if (data.footerBehance) {
                const el = document.getElementById('dynFooterBehance');
                if (el) { 
                    el.href = data.footerBehance; 
                    if (data.showFooterBehance !== false) {
                        el.parentElement.style.display = '';
                        el.style.display = ''; 
                    } else {
                        el.parentElement.style.display = 'none';
                    }
                }
                const sub = document.getElementById('dynFooterBehanceSub');"""
main_content = main_content.replace(main_old, main_new)

# Dribbble
main_old = """            if (data.footerDribbble) {
                const el = document.getElementById('dynFooterDribbble');
                if (el) { el.href = data.footerDribbble; el.style.display = ''; }
                const sub = document.getElementById('dynFooterDribbbleSub');"""
main_new = """            if (data.footerDribbble) {
                const el = document.getElementById('dynFooterDribbble');
                if (el) { 
                    el.href = data.footerDribbble; 
                    if (data.showFooterDribbble !== false) {
                        el.parentElement.style.display = '';
                        el.style.display = ''; 
                    } else {
                        el.parentElement.style.display = 'none';
                    }
                }
                const sub = document.getElementById('dynFooterDribbbleSub');"""
main_content = main_content.replace(main_old, main_new)

# Twitter
main_old = """            if (data.footerTwitter) {
                const el = document.getElementById('dynFooterTwitter');
                if (el) { el.href = data.footerTwitter; el.style.display = ''; }
            }"""
main_new = """            if (data.footerTwitter) {
                const el = document.getElementById('dynFooterTwitter');
                if (el) { 
                    el.href = data.footerTwitter; 
                    if (data.showFooterTwitter !== false) {
                        el.parentElement.style.display = '';
                        el.style.display = ''; 
                    } else {
                        el.parentElement.style.display = 'none';
                    }
                }
            }"""
main_content = main_content.replace(main_old, main_new)

# Instagram
main_old = """            if (data.footerInstagram) {
                const el = document.getElementById('dynFooterInstagram');
                if (el) { el.href = data.footerInstagram; el.style.display = ''; }
            }"""
main_new = """            if (data.footerInstagram) {
                const el = document.getElementById('dynFooterInstagram');
                if (el) { 
                    el.href = data.footerInstagram; 
                    if (data.showFooterInstagram !== false) {
                        el.parentElement.style.display = '';
                        el.style.display = ''; 
                    } else {
                        el.parentElement.style.display = 'none';
                    }
                }
            }"""
main_content = main_content.replace(main_old, main_new)

with open('js/main.js', 'w') as f:
    f.write(main_content)
print("done")
