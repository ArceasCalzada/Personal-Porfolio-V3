document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Fade-In Animations
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once faded in if you only want it to happen once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 2. Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Optional: Parallax/Mouse Movement Effect on Background Orbs
    // Adds a subtle dynamic feel based on user cursor
    const orb1 = document.querySelector('.glow-orb-1');
    const orb2 = document.querySelector('.glow-orb-2');
    
    const eyes = document.querySelectorAll('.googly-eyes .eye');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const x = mouseX / window.innerWidth;
        const y = mouseY / window.innerHeight;
        
        // Move orbs slightly opposite to mouse
        if(orb1) {
            orb1.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        }
        if(orb2) {
            orb2.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        }

        // Googly Eyes Tracking
        eyes.forEach(eye => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            // Cap the pupil movement distance so it stays inside the eye
            const maxDistance = 10; 
            const distance = Math.min(maxDistance, Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 10);
            
            const pupil = eye.querySelector('.pupil');
            if (pupil) {
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                pupil.style.transform = `translate(${tx}px, ${ty}px)`;
            }
        });
    });

    // 4. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check for saved theme preference. Default to light mode.
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme !== 'dark') {
        document.body.classList.add('light-mode');
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        // Save preference
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
        
        // Update background color for current section if theme changes
        if(typeof updateBackgroundColor === 'function') {
            updateBackgroundColor();
        }
    });

    // 5. Section Background Color Change and ScrollSpy
    let currentSection = document.querySelector('#hero');
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateBackgroundColor() {
        if (!currentSection) return;
        
        const isLightMode = document.body.classList.contains('light-mode');
        const defaultDark = '#161316';
        const defaultLight = '#FAFAFA';
        
        const targetColor = isLightMode 
            ? (currentSection.dataset.bgLight || defaultLight) 
            : (currentSection.dataset.bgDark || defaultDark);
            
        document.body.style.backgroundColor = targetColor;
    }

    // 6. Sliding Nav Indicator
    const indicator = document.querySelector('.nav-indicator');
    const navLinksContainer = document.querySelector('.nav-links');
    let isHoveringNav = false;
    
    function moveIndicator(link) {
        if(!link || !indicator) return;
        indicator.style.opacity = '1';
        indicator.style.width = `${link.offsetWidth}px`;
        indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    }

    if (navLinksContainer) {
        navLinksContainer.addEventListener('mouseenter', () => {
            isHoveringNav = true;
        });

        navLinksContainer.addEventListener('mouseleave', () => {
            isHoveringNav = false;
            const activeLink = document.querySelector('.nav-links a.active');
            if (activeLink) {
                moveIndicator(activeLink);
            } else {
                indicator.style.opacity = '0';
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            moveIndicator(e.target);
        });
    });

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                currentSection = entry.target;
                updateBackgroundColor();
                
                // ScrollSpy: Update active nav link
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (id && link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        // Move indicator if we aren't manually hovering
                        if (!isHoveringNav) {
                            moveIndicator(link);
                        }
                    }
                });
            }
        });
    }, {
        rootMargin: "-40% 0px -60% 0px" // Trigger when section passes the top 40% of the screen
    });

    sections.forEach(sec => bgObserver.observe(sec));

    // 7. Tabs Logic for Showcase Section
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and target pane
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if(targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // 8. Lightbox for Certificate Images
    const certImages = document.querySelectorAll('.cert-img-wrapper img');
    if (certImages.length > 0) {
        // Create lightbox elements dynamically
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.className = 'lightbox-img';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        // Open lightbox on click
        certImages.forEach(img => {
            img.style.cursor = 'zoom-in'; // Make it clear it's clickable
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });
        
        // Close mobile menu on clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        // Close lightbox on clicking close btn or background
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Image Viewer Modal Logic
    const imageViewerModal = document.getElementById('imageViewerModal');
    const viewerImage = document.getElementById('viewerImage');
    const closeImageViewerBtn = document.getElementById('closeImageViewer');
    const viewerPrevBtn = document.getElementById('viewerPrevBtn');
    const viewerNextBtn = document.getElementById('viewerNextBtn');
    
    let currentGalleryImages = [];
    let currentGalleryIndex = 0;

    function updateViewerImage() {
        if (currentGalleryImages.length > 0) {
            viewerImage.src = currentGalleryImages[currentGalleryIndex];
            viewerPrevBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
            viewerNextBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
        }
    }

    window.openImageViewer = function(images) {
        if (!imageViewerModal || !viewerImage) return;
        
        if (Array.isArray(images)) {
            currentGalleryImages = images;
            currentGalleryIndex = 0;
            updateViewerImage();
        } else {
            // Fallback for single image
            currentGalleryImages = [images];
            currentGalleryIndex = 0;
            updateViewerImage();
            if (viewerPrevBtn) viewerPrevBtn.style.display = 'none';
            if (viewerNextBtn) viewerNextBtn.style.display = 'none';
        }
        
        imageViewerModal.style.display = 'flex';
        setTimeout(() => {
            imageViewerModal.style.opacity = '1';
        }, 10);
    };

    window.closeImageViewer = function() {
        if (!imageViewerModal) return;
        imageViewerModal.style.opacity = '0';
        setTimeout(() => {
            imageViewerModal.style.display = 'none';
            currentGalleryImages = [];
        }, 300);
    };

    if (viewerPrevBtn) {
        viewerPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length > 1) {
                currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateViewerImage();
            }
        });
    }

    if (viewerNextBtn) {
        viewerNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length > 1) {
                currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
                updateViewerImage();
            }
        });
    }

    if (closeImageViewerBtn) {
        closeImageViewerBtn.addEventListener('click', closeImageViewer);
    }
    
    if (imageViewerModal) {
        imageViewerModal.addEventListener('click', (e) => {
            if (e.target === imageViewerModal) closeImageViewer();
        });
    }
    
    // 9. Stacked Carousel Logic
    const stackedCarousels = document.querySelectorAll('.stacked-carousel');
    
    // Create tooltip element
    const carouselTooltip = document.createElement('div');
    carouselTooltip.className = 'carousel-tooltip';
    carouselTooltip.textContent = 'Click to cycle photos';
    document.body.appendChild(carouselTooltip);

    stackedCarousels.forEach(carousel => {
        carousel.addEventListener('mousemove', (e) => {
            carouselTooltip.style.left = e.clientX + 'px';
            carouselTooltip.style.top = e.clientY + 'px';
            carouselTooltip.style.opacity = '1';
        });
        
        carousel.addEventListener('mouseleave', () => {
            carouselTooltip.style.opacity = '0';
        });

        carousel.addEventListener('click', () => {
            const currentImages = Array.from(carousel.querySelectorAll('img'));
            if (currentImages.length === 0) return;
            
            let classes = currentImages.map(img => img.className);
            classes.unshift(classes.pop());
            
            currentImages.forEach((img, index) => {
                img.className = classes[index];
            });
        });
    });
});

// --- FIREBASE DYNAMIC PORTFOLIO FETCH ---
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    const firebaseConfig = {
      apiKey: "AIzaSyB_MZWuyfHvQgNtwRjOwBbSP8UgzHHcggU",
      authDomain: "porfolio-website-d4a19.firebaseapp.com",
      projectId: "porfolio-website-d4a19",
      storageBucket: "porfolio-website-d4a19.firebasestorage.app",
      messagingSenderId: "647014557769",
      appId: "1:647014557769:web:95a52b547ed24c1d9eb798"
    };
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();

    // -- Analytics Tracking --
    try {
        if (!window.location.pathname.includes('admin') && localStorage.getItem('isAdmin') !== 'true') {
            const statsRef = db.collection('analytics').doc('global_stats');
            
            // Track Total Views (every page load)
            statsRef.set({ totalViews: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(console.error);

            // Track Unique Visitors
            if (!localStorage.getItem('hasVisited')) {
                localStorage.setItem('hasVisited', 'true');
                statsRef.set({ uniqueVisitors: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(console.error);
            }

            // Track individual visit session
            if (!sessionStorage.getItem('sessionTracked')) {
                sessionStorage.setItem('sessionTracked', 'true');
                
                // Fire and forget so we don't block main execution
                (async () => {
                    let ipData = { city: 'Unknown', country_name: 'Unknown', ip: 'Unknown' };
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        if (res.ok) ipData = await res.json();
                    } catch(e) {}
                    
                    // Determine Referrer
                    let referrer = document.referrer || 'Direct';
                    if (referrer.includes('facebook.com') || referrer.includes('fb.me')) referrer = 'Facebook';
                    else if (referrer.includes('instagram.com')) referrer = 'Instagram';
                    else if (referrer.includes('linkedin.com')) referrer = 'LinkedIn';
                    else if (referrer.includes('google.com')) referrer = 'Google';
                    else if (referrer.length > 30) referrer = referrer.substring(0, 30) + '...'; // truncate long URLs

                    // Parse User Agent
                    const ua = navigator.userAgent;
                    let deviceType = 'Desktop';
                    if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
                    if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

                    let browser = 'Other';
                    if (ua.includes('Firefox')) browser = 'Firefox';
                    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
                    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
                    else if (ua.includes('Trident')) browser = 'IE';
                    else if (ua.includes('Edg')) browser = 'Edge';
                    else if (ua.includes('Chrome')) browser = 'Chrome';
                    else if (ua.includes('Safari')) browser = 'Safari';

                    let os = 'Other';
                    if (ua.includes('Win')) os = 'Windows';
                    else if (ua.includes('Mac')) os = 'macOS';
                    else if (ua.includes('X11')) os = 'UNIX';
                    else if (ua.includes('Linux')) os = 'Linux';
                    if (/Android/i.test(ua)) os = 'Android';
                    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

                    await db.collection('analytics_visits').add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        ip: ipData.ip || 'Unknown',
                        city: ipData.city || 'Unknown',
                        country: ipData.country_name || 'Unknown',
                        page: window.location.pathname || 'index',
                        userAgent: navigator.userAgent,
                        referrer: referrer,
                        deviceType: deviceType,
                        browser: browser,
                        os: os
                    });
                })();
            }
        }
    } catch(e) {
        console.error("Analytics error:", e);
    }
    // -- End Analytics Tracking --

    // 1. Fetch Site Settings (Hero & About)
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();
            if (data.heroTitle) {
                const el = document.getElementById('dynHeroTitle');
                if (el) el.textContent = data.heroTitle;
            }
            if (data.heroSub1) {
                const el = document.getElementById('dynHeroSub1');
                if (el) el.textContent = data.heroSub1;
            }
            if (data.heroSub2) {
                const el = document.getElementById('dynHeroSub2');
                if (el) el.textContent = data.heroSub2;
            }
            if (data.cvLink) {
                const els = document.querySelectorAll('.dynCVLink');
                els.forEach(el => el.href = data.cvLink);
            }
            if (data.aboutText) {
                const el = document.getElementById('dynAboutTextContainer');
                if (el) {
                    const formattedAbout = data.aboutText.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('<br>');
                    el.innerHTML = formattedAbout;
                }
            }

            // Stats
            if (data.indexStat1Value) {
                const el = document.getElementById('dynIndexStat1Value');
                if (el) el.textContent = data.indexStat1Value;
            }
            if (data.indexStat1Label) {
                const el = document.getElementById('dynIndexStat1Label');
                if (el) el.textContent = data.indexStat1Label;
            }
            if (data.indexStat2Value) {
                const el = document.getElementById('dynIndexStat2Value');
                if (el) el.textContent = data.indexStat2Value;
            }
            if (data.indexStat2Label) {
                const el = document.getElementById('dynIndexStat2Label');
                if (el) el.textContent = data.indexStat2Label;
            }

            // Index Skills
            if (data.indexSkills && data.indexSkills.length > 0) {
                const el = document.getElementById('dynIndexSkills');
                if (el) {
                    el.innerHTML = data.indexSkills.map(skill => `
                        <span class="skill-pill-alt">${skill}</span>
                    `).join('');
                }
            }

            // Index Software
            if (data.indexSoftware && data.indexSoftware.length > 0) {
                const devicons = {
                    'figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
                    'html': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
                    'html5': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
                    'css': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
                    'css3': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
                    'javascript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
                    'react': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
                    'php': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
                    'laravel': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg',
                    'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg',
                    'flutter': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg',
                    'bubble.io': 'https://www.google.com/s2/favicons?domain=bubble.io&sz=128',
                    'mysql': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg'
                };

                const el = document.getElementById('dynIndexSoftware');
                if (el) {
                    el.innerHTML = data.indexSoftware.map(skill => {
                        const iconUrl = devicons[skill.toLowerCase()] || 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg';
                        let imgStyle = '';
                        if (skill.toLowerCase() === 'bubble.io') {
                            imgStyle = 'style="border-radius: 50%;"';
                        }
                        return `
                            <div class="software-pill">
                                <img src="${iconUrl}" alt="${skill}" ${imgStyle}> ${skill}
                            </div>
                        `;
                    }).join('');
                }
            }
            if (data.footerHeadline) {
                const el = document.getElementById('dynFooterHeadline');
                if (el) el.innerHTML = data.footerHeadline;
            }
            if (data.footerSubtext) {
                const el = document.getElementById('dynFooterSubtext');
                if (el) el.textContent = data.footerSubtext;
            }
            if (data.footerEmail) {
                const el = document.getElementById('dynFooterEmail');
                if (el) { el.href = `mailto:${data.footerEmail}`; el.style.display = ''; }
                const sub = document.getElementById('dynFooterEmailSub');
                if (sub) {
                    sub.href = `mailto:${data.footerEmail}`;
                    sub.textContent = data.footerEmail;
                    const container = document.getElementById('containerFooterEmailSub');
                    if(container) container.style.display = '';
                }
            }
            if (data.footerCopyright) {
                const el = document.getElementById('dynFooterCopyright');
                if (el) el.innerHTML = data.footerCopyright;
            }
            const elLinkedIn = document.getElementById('dynFooterLinkedIn');
            if (elLinkedIn) { 
                if (data.footerLinkedIn) elLinkedIn.href = data.footerLinkedIn; 
                if (data.showFooterLinkedIn === false) {
                    elLinkedIn.parentElement.style.display = 'none';
                } else {
                    elLinkedIn.parentElement.style.display = '';
                    elLinkedIn.style.display = ''; 
                }
            }
            const subLinkedIn = document.getElementById('dynFooterLinkedInSub');
            if (subLinkedIn && data.footerLinkedIn) {
                subLinkedIn.href = data.footerLinkedIn;
                const container = document.getElementById('containerFooterLinkedInSub');
                if(container) container.style.display = '';
                try {
                    const url = new URL(data.footerLinkedIn);
                    subLinkedIn.textContent = url.pathname !== '/' ? url.pathname : url.hostname;
                } catch (e) {
                    subLinkedIn.textContent = data.footerLinkedIn;
                }
            }

            const elBehance = document.getElementById('dynFooterBehance');
            if (elBehance) { 
                if (data.footerBehance) elBehance.href = data.footerBehance; 
                if (data.showFooterBehance === false) {
                    elBehance.parentElement.style.display = 'none';
                } else {
                    elBehance.parentElement.style.display = '';
                    elBehance.style.display = ''; 
                }
            }
            const subBehance = document.getElementById('dynFooterBehanceSub');
            if (subBehance && data.footerBehance) {
                subBehance.href = data.footerBehance;
                const container = document.getElementById('containerFooterBehanceSub');
                if(container) container.style.display = '';
                try {
                    const url = new URL(data.footerBehance);
                    subBehance.textContent = url.hostname + url.pathname;
                } catch (e) {
                    subBehance.textContent = data.footerBehance;
                }
            }

            const elDribbble = document.getElementById('dynFooterDribbble');
            if (elDribbble) { 
                if (data.footerDribbble) elDribbble.href = data.footerDribbble; 
                if (data.showFooterDribbble === false) {
                    elDribbble.parentElement.style.display = 'none';
                } else {
                    elDribbble.parentElement.style.display = '';
                    elDribbble.style.display = ''; 
                }
            }
            const subDribbble = document.getElementById('dynFooterDribbbleSub');
            if (subDribbble && data.footerDribbble) {
                subDribbble.href = data.footerDribbble;
                const container = document.getElementById('containerFooterDribbbleSub');
                if(container) container.style.display = '';
                try {
                    const url = new URL(data.footerDribbble);
                    subDribbble.textContent = url.hostname + url.pathname;
                } catch (e) {
                    subDribbble.textContent = data.footerDribbble;
                }
            }

            const elTwitter = document.getElementById('dynFooterTwitter');
            if (elTwitter) { 
                if (data.footerTwitter) elTwitter.href = data.footerTwitter; 
                if (data.showFooterTwitter === false) {
                    elTwitter.parentElement.style.display = 'none';
                } else {
                    elTwitter.parentElement.style.display = '';
                    elTwitter.style.display = ''; 
                }
            }

            const elInstagram = document.getElementById('dynFooterInstagram');
            if (elInstagram) { 
                if (data.footerInstagram) elInstagram.href = data.footerInstagram; 
                if (data.showFooterInstagram === false) {
                    elInstagram.parentElement.style.display = 'none';
                } else {
                    elInstagram.parentElement.style.display = '';
                    elInstagram.style.display = ''; 
                }
            }
            if (data.footerPhone) {
                const el = document.getElementById('dynFooterPhone');
                if (el) el.textContent = data.footerPhone;
            }
            if (data.footerLocation) {
                const el = document.getElementById('dynFooterLocation');
                if (el) el.textContent = data.footerLocation;
            }
        }
    } catch (error) {
        console.error("Error loading general settings:", error);
    }

    // Fetch About Page Settings
    try {
        const doc = await db.collection('settings').doc('aboutPage').get();
        if (doc.exists) {
            const data = doc.data();

            // Headline & Subtitle
            if (data.headline) {
                const el = document.getElementById('dynAboutPageHeadline');
                if (el) el.textContent = data.headline;
            }
            if (data.subtitle) {
                const el = document.getElementById('dynAboutPageSubtitle');
                if (el) el.textContent = data.subtitle;
            }

            // Bio
            if (data.bio) {
                // About Page
                const el = document.getElementById('dynAboutPageBio');
                if (el) {
                    if (typeof marked !== 'undefined') {
                        el.innerHTML = marked.parse(data.bio);
                    } else {
                        el.innerHTML = data.bio.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
                    }
                }
            }

            // Currently & Available
            if (data.currently) {
                const el = document.getElementById('dynAboutPageCurrently');
                if (el) el.textContent = data.currently;
            }
            if (data.available) {
                const el = document.getElementById('dynAboutPageAvailable');
                if (el) el.textContent = data.available;
            }

            // Experience
            if (data.experience && data.experience.length > 0) {
                const el = document.getElementById('dynAboutPageExperience');
                if (el) {
                    el.innerHTML = data.experience.map(exp => `
                        <div class="editorial-exp-row">
                            <div class="editorial-exp-date">${exp.date}</div>
                            <div class="editorial-exp-role"><strong>${exp.role.split(' — ')[0]}</strong> — ${exp.role.split(' — ')[1] || ''}</div>
                            <div class="editorial-exp-location">${exp.location}</div>
                        </div>
                    `).join('');
                }
            }

            // Education
            if (data.education && data.education.length > 0) {
                const el = document.getElementById('dynAboutPageEducation');
                if (el) {
                    el.innerHTML = data.education.map(edu => `
                        <div>
                            <h3 style="font-size: clamp(3rem, 5vw, 4rem); font-weight: 300; letter-spacing: -0.02em; margin: 0 0 1.5rem 0; color: var(--color-text); line-height: 1;">${edu.acronym}</h3>
                            <p style="font-size: 0.85rem; font-weight: 500; color: var(--color-text); margin: 0 0 0.2rem 0;">${edu.details}</p>
                            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0; line-height: 1.5;">${edu.degree.replace('\\n', '<br>')}</p>
                        </div>
                    `).join('');
                }
            }

            // Skills Design
            if (data.skillsDesign && data.skillsDesign.length > 0) {
                const el = document.getElementById('dynAboutPageSkillsDesign');
                if (el) {
                    el.innerHTML = data.skillsDesign.map(skill => `
                        <span class="editorial-skill">${skill}</span>
                    `).join('');
                }
            }

            // Skills Dev
            if (data.skillsDev && data.skillsDev.length > 0) {
                const devicons = {
                    'figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
                    'html': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
                    'html5': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
                    'css': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
                    'css3': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
                    'javascript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
                    'react': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
                    'php': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
                    'laravel': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg',
                    'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg',
                    'flutter': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg',
                    'bubble.io': 'https://www.google.com/s2/favicons?domain=bubble.io&sz=128',
                    'mysql': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg'
                };

                const el = document.getElementById('dynAboutPageSkillsDev');
                if (el) {
                    el.innerHTML = data.skillsDev.map(skill => {
                        const iconUrl = devicons[skill.toLowerCase()];
                        const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${skill} icon" style="width: 16px; height: 16px; object-fit: contain;">` : '';
                        return `<span class="editorial-skill">${iconHtml}${skill}</span>`;
                    }).join('');
                }
            }
        }
    } catch (error) {
        console.error("Error loading about page settings:", error);
    }

    // 1.5 Fetch Carousels (Global Carousel for both Hero and About)
    async function loadCarouselToUI(collectionName, containerIds) {
        try {
            const snapshot = await db.collection(collectionName).get();
            if (snapshot.empty) return;
            
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            items.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (a.timestamp || 0) - (b.timestamp || 0);
            });

            let htmlString = '';
            let index = 1;
            items.forEach(data => {
                htmlString += `<img src="${data.image}" alt="Carousel Image" class="stack-${index}">`;
                index++;
            });

            containerIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = htmlString;
            });
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
        }
    }

    loadCarouselToUI('hero_carousel', ['heroProfileCarousel', 'indexAboutCarousel', 'aboutProfileCarousel']);

    // --- Interactive Footer Mesh ---
    const footers = document.querySelectorAll('.premium-mesh-footer');
    footers.forEach(footer => {
        footer.addEventListener('mousemove', (e) => {
            const rect = footer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            footer.style.setProperty('--mouseX', `${x}%`);
            footer.style.setProperty('--mouseY', `${y}%`);
        });
        footer.addEventListener('mouseleave', () => {
            // Smoothly reset or just leave it where it was.
            // Leaving it creates a nice fluid memory effect.
        });
    });

    // Generalized Masonry Grid Fetcher (for Projects & Designs)
    async function loadStaggeredGrid(collectionName, leftColId, rightColId, viewText = "View Details ↗") {
        const leftCol = document.getElementById(leftColId);
        const rightCol = document.getElementById(rightColId);
        if (!leftCol || !rightCol) return;

        try {
            const snapshot = await db.collection(collectionName).get();
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            items.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (a.timestamp || 0) - (b.timestamp || 0);
            });

            let index = 0;
            items.forEach(item => {
                let linkHTML = `<a href="project-details.html?id=${item.id}&collection=${collectionName}" class="stagger-img-link" style="aspect-ratio: ${item.aspectRatio || '1/1'};">`;
                if (collectionName === 'designs') {
                    if (item.pdfUrl) {
                        linkHTML = `<a href="${item.pdfUrl}" target="_blank" class="stagger-img-link" style="aspect-ratio: ${item.aspectRatio || '1/1'};">`;
                    } else {
                        const allImages = [item.image];
                        if (item.galleryImages && item.galleryImages.length > 0) {
                            allImages.push(...item.galleryImages);
                        }
                        const imagesJson = JSON.stringify(allImages).replace(/"/g, '&quot;');
                        linkHTML = `<a onclick="openImageViewer(${imagesJson})" class="stagger-img-link" style="aspect-ratio: ${item.aspectRatio || '1/1'}; cursor: pointer;">`;
                    }
                }

                let shortDesc = item.description || '';
                if (shortDesc.length > 120) {
                    shortDesc = shortDesc.substring(0, 120) + '...';
                }

                const cardHTML = `
                    <div class="stagger-card fade-in">
                        <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid var(--glass-border); margin-bottom: 2rem;">
                            ${linkHTML}
                                <img src="${item.image || 'images/placeholder.png'}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
                                <div class="hover-overlay">
                                    <span>${viewText}</span>
                                </div>
                            </a>
                        </div>
                        <h3>${item.title}</h3>
                        <p class="subtitle">${item.subtitle}</p>
                        <p class="desc">${shortDesc}</p>
                    </div>
                `;
                
                if (index % 2 === 0) leftCol.innerHTML += cardHTML;
                else rightCol.innerHTML += cardHTML;
                index++;
            });
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
        }
    }

    // 2. Fetch Projects
    await loadStaggeredGrid('projects', 'projects-left-col', 'projects-right-col', 'View Project ↗');

    // 3. Fetch Designs
    await loadStaggeredGrid('designs', 'designs-left-col', 'designs-right-col', 'View Design ↗');

    // 4. Fetch Certificates (About Page)
    const certContainer = document.getElementById('dynAboutPageCertificates');
    if (certContainer) {
        try {
            const snapshot = await db.collection('certificates').get();
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            items.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (a.timestamp || 0) - (b.timestamp || 0);
            });

            items.forEach(item => {
                certContainer.innerHTML += `
                    <div class="editorial-exp-row" style="align-items: flex-start;">
                        <div class="editorial-exp-date" style="width: 150px;">
                            <img src="${item.image || 'images/placeholder.png'}" alt="${item.title} Badge" class="cert-img" onclick="openLightbox(this.src)" style="width: 100%; border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer; transition: transform 0.2s ease;">
                        </div>
                        <div class="editorial-exp-role">
                            <h3 style="margin: 0 0 0.2rem 0; font-size: 1.25rem;">${item.title || 'Certificate Title'}</h3>
                            <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: var(--color-text-muted);">${item.subtitle || 'Issuer'} · Issued: ${item.certDate || 'N/A'}</p>
                            ${item.certCredentialId ? `
                                <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--color-text-muted);">Credential ID: ${item.certCredentialId}</p>
                                <a href="https://www.credly.com/badges/${item.certCredentialId}/public_url" target="_blank" style="font-size: 0.9rem; color: var(--color-text); text-decoration: none; font-weight: 500;">Verify Credential ↗</a>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error fetching certificates:", error);
        }
    }

    // Re-apply intersection observer to new fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    fadeElements.forEach(el => fadeObserver.observe(el));

    // 5. Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const statusText = document.getElementById('contactStatus');
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const messageData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                message: document.getElementById('contactMessage').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('messages').add(messageData);
                statusText.textContent = "Message sent successfully! I will get back to you soon.";
                statusText.style.display = 'block';
                contactForm.reset();
            } catch (error) {
                statusText.textContent = "Error sending message. Please try again.";
                statusText.style.color = "#ff4a4a";
                statusText.style.display = 'block';
            } finally {
                submitBtn.textContent = 'Send Message';
                submitBtn.disabled = false;
            }
        });
    }

    // --- Bento Box Interactive Logic ---
    
    // 1. Live Clock
    const clockEl = document.getElementById('bento-clock');
    if (clockEl) {
        setInterval(() => {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    }

    // 2. Draggable Cards
    const draggables = document.querySelectorAll('.draggable-card');
    let activeCard = null;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;
    let maxZ = 100;

    // We only enable drag on screens larger than 900px, since on mobile they stack
    const isDesktop = window.matchMedia("(min-width: 900px)");

    draggables.forEach(card => {
        card.dataset.xOffset = 0;
        card.dataset.yOffset = 0;

        card.addEventListener('mousedown', dragStart);
        card.addEventListener('touchstart', dragStart, {passive: false});
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, {passive: false});

    function dragStart(e) {
        if (!isDesktop.matches) return; // Don't drag on mobile layout
        
        activeCard = e.currentTarget;
        maxZ++;
        activeCard.style.zIndex = maxZ;

        if (!activeCard.dataset.baseTransform) {
            // Get original transform (e.g. rotation) from stylesheet
            const computed = window.getComputedStyle(activeCard).transform;
            activeCard.dataset.baseTransform = computed !== 'none' ? computed : '';
        }

        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - parseFloat(activeCard.dataset.xOffset);
            initialY = e.touches[0].clientY - parseFloat(activeCard.dataset.yOffset);
        } else {
            initialX = e.clientX - parseFloat(activeCard.dataset.xOffset);
            initialY = e.clientY - parseFloat(activeCard.dataset.yOffset);
        }
    }

    function dragEnd(e) {
        if (activeCard) {
            activeCard = null;
        }
    }

    function drag(e) {
        if (activeCard) {
            e.preventDefault();
        
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            activeCard.dataset.xOffset = currentX;
            activeCard.dataset.yOffset = currentY;

            const baseT = activeCard.dataset.baseTransform || '';
            activeCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${baseT}`;
        }
    }

});
