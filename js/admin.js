// Firebase is loaded globally via compat scripts in admin.html
const firebaseConfig = {
  apiKey: "AIzaSyB_MZWuyfHvQgNtwRjOwBbSP8UgzHHcggU",
  authDomain: "porfolio-website-d4a19.firebaseapp.com",
  projectId: "porfolio-website-d4a19",
  storageBucket: "porfolio-website-d4a19.firebasestorage.app",
  messagingSenderId: "647014557769",
  appId: "1:647014557769:web:95a52b547ed24c1d9eb798",
  measurementId: "G-5WN89PPH7N"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// ----------------------------------------------------
// STATE & DOM ELEMENTS
// ----------------------------------------------------
let currentCollection = 'projects';

const loginSection = document.getElementById('loginLayout');
const dashboardSection = document.getElementById('appLayout');
const loginForm = document.getElementById('loginForm');
const errorModal = document.getElementById('errorModal');
const errorModalMessage = document.getElementById('errorModalMessage');
const closeErrorModalBtn = document.getElementById('closeErrorModalBtn');
const logoutBtn = document.getElementById('logoutBtn');
const signUpBtn = document.getElementById('signUpBtn');

// CMS Elements
const adminSidebarNav = document.getElementById('adminSidebarNav');
const contentSections = document.querySelectorAll('.content-section');
const appHeaderTitle = document.getElementById('appHeaderTitle');
const headerActionBtn = document.getElementById('headerActionBtn');

// Modal Elements
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalTitle = document.getElementById('modalTitle');

let bioEditor;
document.addEventListener('DOMContentLoaded', () => {
    const bioTextArea = document.getElementById('setAboutPageBio');
    if (bioTextArea && typeof EasyMDE !== 'undefined') {
        bioEditor = new EasyMDE({ 
            element: bioTextArea,
            spellChecker: false,
            status: false,
            toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview", "guide"]
        });
    }

    if (typeof Tagify !== 'undefined') {
        const tIndexSkills = document.getElementById('setIndexSkills');
        const tIndexSoftware = document.getElementById('setIndexSoftware');
        const tAboutDesign = document.getElementById('setAboutPageSkillsDesign');
        const tAboutDev = document.getElementById('setAboutPageSkillsDev');

        if (tIndexSkills) window.tagifyIndexSkills = new Tagify(tIndexSkills);
        if (tIndexSoftware) window.tagifyIndexSoftware = new Tagify(tIndexSoftware);
        if (tAboutDesign) window.tagifyAboutDesign = new Tagify(tAboutDesign);
        if (tAboutDev) window.tagifyAboutDev = new Tagify(tAboutDev);
    }

    // Mobile & Desktop Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        if(appSidebar) {
            if(window.innerWidth <= 768) {
                appSidebar.classList.toggle('active');
                if(sidebarOverlay) sidebarOverlay.classList.toggle('active');
            } else {
                appSidebar.classList.toggle('desktop-collapsed');
            }
        }
    }

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    if(sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // Close sidebar on mobile when any link is clicked
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only close if it's a real navigation link (has data-target or is live site link), not a dropdown header
            if(link.dataset.target || link.getAttribute('target') === '_blank') {
                if(window.innerWidth <= 768 && appSidebar && appSidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }
        });
    });
});

function getTagifyArray(tagifyInstance, rawInputId) {
    if (tagifyInstance && tagifyInstance.value) {
        return tagifyInstance.value.map(i => i.value);
    }
    const raw = document.getElementById(rawInputId).value;
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(i => i.value);
    } catch(e) {}
    return raw.split(',').map(s => s.trim()).filter(s => s);
}

function setTagifyArray(tagifyInstance, rawInputId, dataArray) {
    if (tagifyInstance) {
        tagifyInstance.removeAllTags();
        tagifyInstance.addTags(dataArray || []);
    } else {
        document.getElementById(rawInputId).value = (dataArray || []).join(', ');
    }
}

window.showToast = function(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3000);
};

window.showLoading = function(msg = "Saving...") {
    const loadingModalMessage = document.getElementById('loadingModalMessage');
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModalMessage) loadingModalMessage.textContent = msg;
    if (loadingModal) loadingModal.classList.add('active');
};
window.hideLoading = function() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.classList.remove('active');
};

// ----------------------------------------------------
// AUTHENTICATION LOGIC
// ----------------------------------------------------
auth.onAuthStateChanged((user) => {
    if (user) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        // Initial Load
        loadDashboardHome();
    } else {
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            localStorage.setItem('isAdmin', 'true');
            if (errorModal) errorModal.classList.remove('active');
            loginForm.reset();
        })
        .catch((error) => {
            if (errorModalMessage && errorModal) {
                errorModalMessage.textContent = "Error: " + error.message;
                errorModal.classList.add('active');
            }
        });
});

if (signUpBtn) {
    signUpBtn.addEventListener('click', () => {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (!email || !password) {
            if (errorModalMessage && errorModal) {
                errorModalMessage.textContent = "Please enter an email and password first.";
                errorModal.classList.add('active');
            }
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                if (errorModal) errorModal.classList.remove('active');
                loginForm.reset();
                showToast("Account created successfully!", "success");
            })
            .catch((error) => {
                if (errorModalMessage && errorModal) {
                    errorModalMessage.textContent = "Signup Error: " + error.message;
                    errorModal.classList.add('active');
                }
            });
    });
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    auth.signOut();
});

if (closeErrorModalBtn && errorModal) {
    closeErrorModalBtn.addEventListener('click', () => {
        errorModal.classList.remove('active');
    });
}

// ----------------------------------------------------
// TAB NAVIGATION LOGIC
// ----------------------------------------------------
if (adminSidebarNav) {
    adminSidebarNav.addEventListener('click', (e) => {
        // Handle Dropdown Header Click
        const dropdownHeader = e.target.closest('.sidebar-dropdown-header');
        if (dropdownHeader) {
            const dropdown = dropdownHeader.parentElement;
            
            // Accordion logic: close other open dropdowns
            document.querySelectorAll('.sidebar-dropdown.active').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });
            
            dropdown.classList.toggle('active');
            return;
        }

        const link = e.target.closest('.sidebar-link');
        if (!link || !link.dataset.target) return;
        if (link.getAttribute('target') === '_blank') return; // let live site link work natively

        e.preventDefault();

        // Auto-expand parent dropdown (useful for external button clicks simulating nav clicks)
        const parentDropdownContent = link.closest('.sidebar-dropdown-content');
        if (parentDropdownContent) {
            const parentDropdown = parentDropdownContent.parentElement;
            document.querySelectorAll('.sidebar-dropdown.active').forEach(d => {
                if (d !== parentDropdown) d.classList.remove('active');
            });
            parentDropdown.classList.add('active');
        } else {
            // Clicking a standalone link closes all dropdowns for a clean accordion effect
            document.querySelectorAll('.sidebar-dropdown.active').forEach(d => {
                d.classList.remove('active');
            });
        }

        // Remove active class from all links
        adminSidebarNav.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Hide all sections
        contentSections.forEach(sec => sec.classList.add('hidden'));
        
        // Show target section
        const targetId = link.dataset.target;
        document.getElementById(targetId).classList.remove('hidden');

        // Update Header & State
        if (targetId === 'section-home') {
            appHeaderTitle.textContent = 'Dashboard Home';
            headerActionBtn.style.display = 'none';
            loadDashboardHome();
        } else if (targetId === 'section-projects') {
            currentCollection = 'projects';
            appHeaderTitle.textContent = 'Projects';
            headerActionBtn.textContent = '+ Add Project';
            headerActionBtn.style.display = 'block';
            loadItems('projects');
        } else if (targetId === 'section-designs') {
            currentCollection = 'designs';
            appHeaderTitle.textContent = 'Designs';
            headerActionBtn.textContent = '+ Add Design';
            headerActionBtn.style.display = 'block';
            loadItems('designs');
        } else if (targetId === 'section-certificates') {
            currentCollection = 'certificates';
            appHeaderTitle.textContent = 'Certificates';
            headerActionBtn.textContent = '+ Add Certificate';
            headerActionBtn.style.display = 'block';
            loadItems('certificates');
        } else if (targetId === 'section-hero-carousel') {
            currentCollection = 'hero_carousel';
            appHeaderTitle.textContent = 'Global Carousel Images';
            headerActionBtn.textContent = '+ Add Image';
            headerActionBtn.style.display = 'block';
            loadCarouselItems('hero_carousel');
        } else if (targetId === 'section-hero') {
            currentCollection = 'hero';
            appHeaderTitle.textContent = 'Hero Settings';
            headerActionBtn.style.display = 'none';
            loadHeroSettings();
        } else if (targetId === 'section-about') {
            currentCollection = 'about';
            appHeaderTitle.textContent = 'Index About Settings';
            headerActionBtn.style.display = 'none';
            loadAboutSettings();
        } else if (targetId === 'section-about-page') {
            appHeaderTitle.textContent = 'About Page Settings';
            headerActionBtn.style.display = 'none';
            loadAboutPageSettings();
        } else if (targetId === 'section-footer') {
            currentCollection = 'footer';
            appHeaderTitle.textContent = 'Footer Settings';
            headerActionBtn.style.display = 'none';
            loadHeroSettings();
            loadAboutSettings();
            loadAboutPageSettings();
            loadFooterSettings();
        } else if (targetId === 'section-inbox') {
            currentCollection = 'inbox';
            appHeaderTitle.textContent = 'Inbox';
            headerActionBtn.style.display = 'none';
            loadInbox();
        } else if (targetId === 'section-analytics') {
            appHeaderTitle.textContent = 'Analytics Overview';
            headerActionBtn.style.display = 'none';
            loadAnalytics();
        }
    });
}

// ----------------------------------------------------
// GENERALIZED CRUD (Projects, Designs, Certificates)
// ----------------------------------------------------
async function loadItems(collectionName) {
    const listContainer = document.getElementById(`${collectionName}List`);
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1 / -1;">Loading data...</p>';

    try {
        const querySnapshot = await db.collection(collectionName).get();
        listContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1 / -1;">No items found.</p>';
            return;
        }

        const items = [];
        querySnapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        
        // Local sort to support custom ordering without breaking existing timestamps
        items.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            if (orderA !== orderB) return orderA - orderB;
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        items.forEach((data) => {
            listContainer.innerHTML += `
                <div class="project-card-ui" draggable="true" data-id="${data.id}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${collectionName}')" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondragend="handleDragEnd(event)">
                    <div style="cursor: grab; margin-bottom: 0.8rem; color: #5f6368; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); padding: 0.3rem; border-radius: 4px;">
                        ⋮⋮ Drag to reorder
                    </div>
                    <img src="${data.image || 'images/placeholder.png'}" class="project-card-image" alt="Thumbnail" draggable="false">
                    <h4 style="margin: 0; font-size: 1.2rem; margin-bottom: 0.2rem;">${data.title || 'Untitled'}</h4>
                    <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem;">${data.subtitle || 'No Category'}</p>
                    
                    <div class="project-actions-grid">
                        <button class="edit-btn" onclick="editItem('${data.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteItem('${data.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        listContainer.innerHTML = `<p style="color: #ff4a4a; grid-column: 1 / -1;">Error: ${error.message}</p>`;
    }
}

// DRAG AND DROP HANDLERS
let dragSrcEl = null;

window.handleDragStart = function(e) {
    dragSrcEl = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', dragSrcEl.dataset.id);
    dragSrcEl.style.opacity = '0.4';
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
};

window.handleDragEnter = function(e) {
    e.currentTarget.style.borderColor = '#8ab4f8';
    e.currentTarget.style.background = 'rgba(138, 180, 248, 0.05)';
};

window.handleDragLeave = function(e) {
    e.currentTarget.style.borderColor = '#3c4043';
    e.currentTarget.style.background = '#1e1e1e';
};

window.handleDragEnd = function(e) {
    e.currentTarget.style.opacity = '1';
};

window.handleDrop = async function(e, collectionName) {
    e.stopPropagation();
    const targetEl = e.currentTarget;
    targetEl.style.borderColor = '#3c4043';
    targetEl.style.background = '#1e1e1e';
    
    if (dragSrcEl !== targetEl) {
        const listContainer = targetEl.parentElement;
        const items = Array.from(listContainer.children);
        const srcIndex = items.indexOf(dragSrcEl);
        const targetIndex = items.indexOf(targetEl);
        
        if (srcIndex < targetIndex) {
            targetEl.after(dragSrcEl);
        } else {
            targetEl.before(dragSrcEl);
        }
        
        // Update Firestore order
        const newItems = Array.from(listContainer.children);
        const batch = db.batch();
        newItems.forEach((item, index) => {
            const id = item.dataset.id;
            if (id) {
                const docRef = db.collection(collectionName).doc(id);
                batch.update(docRef, { order: index });
            }
        });
        
        try {
            await batch.commit();
        } catch (error) {
            console.error('Error saving reorder:', error);
            showToast("Failed to save new order. Please check console.", "error");
        }
    }
    return false;
};

async function loadCarouselItems(collectionName) {
    let containerId = 'heroCarouselList';
    if (collectionName === 'about_carousel') containerId = 'aboutCarouselList';
    
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1 / -1;">Loading images...</p>';

    try {
        const querySnapshot = await db.collection(collectionName).get();
        listContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1 / -1;">No images found. Add some!</p>';
            return;
        }

        const items = [];
        querySnapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        
        // Local sort to support custom ordering
        items.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            if (orderA !== orderB) return orderA - orderB;
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        items.forEach((data) => {
            listContainer.innerHTML += `
                <div class="project-card-ui" draggable="true" data-id="${data.id}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${collectionName}')" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondragend="handleDragEnd(event)" style="text-align: center;">
                    <div style="cursor: grab; margin-bottom: 0.8rem; color: #5f6368; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); padding: 0.3rem; border-radius: 4px;">
                        ⋮⋮ Drag to reorder
                    </div>
                    <img src="${data.image || 'images/placeholder.png'}" class="project-card-image" alt="Carousel Image" draggable="false" style="height: 250px; width: auto; max-width: 100%; margin: 0 auto 1rem auto;">
                    
                    <div class="project-actions-grid" style="margin-top: 0;">
                        <button class="delete-btn" onclick="deleteItem('${data.id}', '${collectionName}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        listContainer.innerHTML = `<p style="color: #ff4a4a; grid-column: 1 / -1;">Error: ${error.message}</p>`;
    }
}

// Open Modal for Add
if (headerActionBtn) {
    headerActionBtn.addEventListener('click', () => {
        if (currentCollection === 'projects' || currentCollection === 'designs') {
            window.location.href = `admin-editor.html?collection=${currentCollection}`;
            return;
        }

        if (currentCollection === 'hero_carousel' || currentCollection === 'about_carousel') {
            const imageModal = document.getElementById('imageModal');
            document.getElementById('imageForm').reset();
            document.getElementById('imageId').value = '';
            
            const carouselImagePreview = document.getElementById('carouselImagePreview');
            if (carouselImagePreview) {
                carouselImagePreview.src = '';
                carouselImagePreview.style.display = 'none';
            }

            document.getElementById('imageModalTitle').textContent = `Add Image`;
            imageModal.classList.add('active');
        } else {
            projectForm.reset();
            document.getElementById('projectId').value = '';
            
            // Clear image preview
            const projImagePreview = document.getElementById('projImagePreview');
            if (projImagePreview) {
                projImagePreview.src = '';
                projImagePreview.style.display = 'none';
            }
            
            // Toggle UI for Certificates
            if (currentCollection === 'certificates') {
                document.getElementById('certOnlyFields').style.display = 'block';
                document.getElementById('lblProjDesc').textContent = "Skills / Tags";
            } else {
                document.getElementById('certOnlyFields').style.display = 'none';
                document.getElementById('lblProjDesc').textContent = "Description";
            }

            if (currentCollection === 'designs') {
                document.getElementById('designOnlyFields').style.display = 'block';
                document.getElementById('galleryContainer').innerHTML = ''; // Reset
            } else {
                document.getElementById('designOnlyFields').style.display = 'none';
            }

            modalTitle.textContent = `Add ${currentCollection.slice(0, -1)}`; // "Add Project", "Add Design"
            projectModal.classList.add('active');
        }
    });
}

// Close Modal
if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', () => {
        projectModal.classList.remove('active');
    });
}
if (projectModal) {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.classList.remove('active');
        }
    });
}

// Close Image Modal
const cancelImageModalBtn = document.getElementById('cancelImageModalBtn');
const imageModal = document.getElementById('imageModal');
if (cancelImageModalBtn) {
    cancelImageModalBtn.addEventListener('click', () => {
        imageModal.classList.remove('active');
    });
}
if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
        }
    });
}

// Submit Image Form
const imageForm = document.getElementById('imageForm');
if (imageForm) {
    imageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('imageId').value;
        const data = {
            image: document.getElementById('imgUrl').value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        const submitBtn = document.getElementById('saveImageBtn');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            if(window.showLoading) window.showLoading("Saving Image...");
            if (id) {
                await db.collection(currentCollection).doc(id).update(data);
            } else {
                await db.collection(currentCollection).add(data);
            }
            imageModal.classList.remove('active');
            loadCarouselItems(currentCollection);
        } catch (error) {
            showToast("Error saving image: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
            submitBtn.textContent = 'Save Image';
            submitBtn.disabled = false;
        }
    });
}

// Submit Form (Add/Update)
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('projectId').value;
        const data = {
            title: document.getElementById('projTitle').value,
            subtitle: document.getElementById('projSubtitle').value,
            description: document.getElementById('projDesc').value,
            image: document.getElementById('projImage').value,
            aspectRatio: document.getElementById('projAspect').value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (currentCollection === 'certificates') {
            data.certDate = document.getElementById('certDate').value;
            data.certCredentialId = document.getElementById('certCredentialId').value;
        }

        if (currentCollection === 'designs') {
            const galleryInputs = document.querySelectorAll('.gallery-input-field');
            const galleryArray = [];
            galleryInputs.forEach(input => {
                if (input.value.trim()) {
                    galleryArray.push(input.value.trim());
                }
            });
            data.galleryImages = galleryArray;
        }

        const submitBtn = document.getElementById('saveProjectBtn');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            if(window.showLoading) window.showLoading("Saving Project...");
            if (id) {
                await db.collection(currentCollection).doc(id).update(data);
            } else {
                await db.collection(currentCollection).add(data);
            }
            projectModal.classList.remove('active');
            loadItems(currentCollection);
        } catch (error) {
            showToast("Error saving data: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
            submitBtn.textContent = 'Save Project';
            submitBtn.disabled = false;
        }
    });
}

// Edit Function
window.editItem = async function(id) {
    if (currentCollection === 'projects' || currentCollection === 'designs') {
        window.location.href = `admin-editor.html?collection=${currentCollection}&id=${id}`;
        return;
    }

    try {
        const doc = await db.collection(currentCollection).doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('projectId').value = id;
            document.getElementById('projTitle').value = data.title || '';
            document.getElementById('projSubtitle').value = data.subtitle || '';
            document.getElementById('projDesc').value = data.description || '';
            document.getElementById('projImage').value = data.image || '';
            document.getElementById('projAspect').value = data.aspectRatio || '1/1';
            
            const projImagePreview = document.getElementById('projImagePreview');
            if (projImagePreview && data.image) {
                projImagePreview.src = data.image;
                projImagePreview.style.display = 'block';
            } else if (projImagePreview) {
                projImagePreview.style.display = 'none';
            }

            if (currentCollection === 'certificates') {
                document.getElementById('certOnlyFields').style.display = 'block';
                document.getElementById('lblProjDesc').textContent = "Skills / Tags";
                document.getElementById('certDate').value = data.certDate || '';
                document.getElementById('certCredentialId').value = data.certCredentialId || '';
            } else {
                document.getElementById('certOnlyFields').style.display = 'none';
                document.getElementById('lblProjDesc').textContent = "Description";
            }

            if (currentCollection === 'designs') {
                document.getElementById('designOnlyFields').style.display = 'block';
                const galleryContainer = document.getElementById('galleryContainer');
                galleryContainer.innerHTML = '';
                if (data.galleryImages && data.galleryImages.length > 0) {
                    data.galleryImages.forEach(imgUrl => addGalleryField(imgUrl));
                }
            } else {
                document.getElementById('designOnlyFields').style.display = 'none';
            }

            modalTitle.textContent = `Edit ${currentCollection.slice(0, -1)}`;
            projectModal.classList.add('active');
        }
    } catch (error) {
        showToast("Error fetching item: " + error.message, "error");
    }
};

// Global Confirm Modal Logic
let pendingConfirmCallback = null;
const confirmModal = document.getElementById('confirmModal');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const executeConfirmBtn = document.getElementById('executeConfirmBtn');

function showConfirmModal(message, callback) {
    document.getElementById('confirmModalMessage').textContent = message;
    pendingConfirmCallback = callback;
    confirmModal.classList.add('active');
}

// Image Preview Listener
const projImageInput = document.getElementById('projImage');
const projImagePreview = document.getElementById('projImagePreview');
if (projImageInput && projImagePreview) {
    projImageInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            projImagePreview.src = val;
            projImagePreview.style.display = 'block';
        } else {
            projImagePreview.src = '';
            projImagePreview.style.display = 'none';
        }
    });
}

const imgUrlInput = document.getElementById('imgUrl');
const carouselImagePreview = document.getElementById('carouselImagePreview');
if (imgUrlInput && carouselImagePreview) {
    imgUrlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            carouselImagePreview.src = val;
            carouselImagePreview.style.display = 'block';
        } else {
            carouselImagePreview.src = '';
            carouselImagePreview.style.display = 'none';
        }
    });
}

// Drag & Drop Image Logic
function setupImageDropZone(dropZoneId, fileInputId, urlInputEl, previewEl) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(255,255,255,0.05)';
        dropZone.style.borderColor = '#8ab4f8';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
        dropZone.style.borderColor = '#3c4043';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
        dropZone.style.borderColor = '#3c4043';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    });

    function processFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast("Please select an image file.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            // Resize Image to prevent large base64 strings in Firestore
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                urlInputEl.value = dataUrl;
                previewEl.src = dataUrl;
                previewEl.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

setupImageDropZone('imageDropZone', 'imageFileInput', projImageInput, projImagePreview);
setupImageDropZone('carouselDropZone', 'carouselFileInput', imgUrlInput, carouselImagePreview);

if (cancelConfirmBtn) {
    cancelConfirmBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        pendingConfirmCallback = null;
    });
}

if (executeConfirmBtn) {
    executeConfirmBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        if (pendingConfirmCallback) {
            pendingConfirmCallback();
            pendingConfirmCallback = null;
        }
    });
}

// Delete Function
window.deleteItem = function(id, forceCollection = null) {
    const col = forceCollection || currentCollection;
    showConfirmModal("Are you sure you want to delete this item? This cannot be undone.", async () => {
        try {
            if(window.showLoading) window.showLoading("Deleting...");
            await db.collection(col).doc(id).delete();
            if (col === 'hero_carousel' || col === 'about_carousel') {
                loadCarouselItems(col);
            } else {
                loadItems(col);
            }
        } catch (error) {
            showToast("Error deleting item: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
};

// ----------------------------------------------------
// HERO & ABOUT SETTINGS LOGIC
// ----------------------------------------------------
const heroForm = document.getElementById('heroForm');
const heroStatus = document.getElementById('heroStatus');
const cvForm = document.getElementById('cvForm');
const cvStatus = document.getElementById('cvStatus');
const aboutForm = document.getElementById('aboutForm');
const aboutPageForm = document.getElementById('aboutPageForm');
const aboutStatus = document.getElementById('aboutStatus');
const footerForm = document.getElementById('footerForm');
const footerStatus = document.getElementById('footerStatus');

async function loadHeroSettings() {
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('setHeroTitle').value = data.heroTitle || '';
            document.getElementById('setHeroSub1').value = data.heroSub1 || '';
            document.getElementById('setHeroSub2').value = data.heroSub2 || '';
            document.getElementById('setCvLink').value = data.cvLink || 'CV_ArceasJohnCalzada.pdf';
        }
    } catch (error) {
        console.error("Error loading hero settings:", error);
    }
}

async function loadAboutSettings() {
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('setIndexStat1Value').value = data.indexStat1Value || '';
            document.getElementById('setIndexStat1Label').value = data.indexStat1Label || '';
            document.getElementById('setIndexStat2Value').value = data.indexStat2Value || '';
            document.getElementById('setIndexStat2Label').value = data.indexStat2Label || '';
            document.getElementById('setAboutText').value = data.aboutText || '';
            setTagifyArray(window.tagifyIndexSkills, 'setIndexSkills', data.indexSkills);
            setTagifyArray(window.tagifyIndexSoftware, 'setIndexSoftware', data.indexSoftware);
        } else {
            document.getElementById('setIndexStat1Value').value = '4+';
            document.getElementById('setIndexStat1Label').value = 'Years studying & practicing IT';
            document.getElementById('setIndexStat2Value').value = '10+';
            document.getElementById('setIndexStat2Label').value = 'Academic & Personal Projects';
            setTagifyArray(window.tagifyIndexSkills, 'setIndexSkills', ['UI/UX Design', 'Front-End Development', 'Mobile App Development', 'Prototyping', 'Graphic Design', 'Video Editing']);
            setTagifyArray(window.tagifyIndexSoftware, 'setIndexSoftware', ['Figma', 'HTML5', 'CSS3', 'JavaScript', 'React', 'PHP', 'Laravel']);
        }
    } catch (error) {
        console.error("Error loading about settings:", error);
    }
}

async function loadAboutPageSettings() {
    try {
        const doc = await db.collection('settings').doc('aboutPage').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('setAboutPageHeadline').value = data.headline || '';
            document.getElementById('setAboutPageSubtitle').value = data.subtitle || '';
            if (bioEditor) bioEditor.value(data.bio || '');
            else document.getElementById('setAboutPageBio').value = data.bio || '';
            document.getElementById('setAboutPageCurrently').value = data.currently || '';
            document.getElementById('setAboutPageAvailable').value = data.available || '';
            setTagifyArray(window.tagifyAboutDesign, 'setAboutPageSkillsDesign', data.skillsDesign);
            setTagifyArray(window.tagifyAboutDev, 'setAboutPageSkillsDev', data.skillsDev);
            
            const expContainer = document.getElementById('experienceListContainer');
            expContainer.innerHTML = '';
            if (data.experience && data.experience.length > 0) {
                data.experience.forEach(exp => addExperienceRow(exp));
            } else {
                addExperienceRow();
            }

            const eduContainer = document.getElementById('educationListContainer');
            eduContainer.innerHTML = '';
            if (data.education && data.education.length > 0) {
                data.education.forEach(edu => addEducationRow(edu));
            } else {
                addEducationRow();
            }
        } else {
            document.getElementById('setAboutPageHeadline').value = "Hi – nice to see you here, I'm AJ 😊";
            document.getElementById('setAboutPageSubtitle').value = "UI/UX Intern @Jairosoft · Front-End Development · Interaction Design";
            const defBio = "I am a 4th-year Information Technology student at the University of Mindanao. I'm a motivated and detail-oriented aspiring professional deeply passionate about UI/UX design and front-end development, constantly striving to craft seamless and visually stunning digital experiences.";
            if (bioEditor) bioEditor.value(defBio);
            else document.getElementById('setAboutPageBio').value = defBio;
            document.getElementById('setAboutPageCurrently').value = "BS Information Technology at UM, Davao City";
            document.getElementById('setAboutPageAvailable').value = "UI/UX Designer Intern, Present – July 2026";
            setTagifyArray(window.tagifyAboutDesign, 'setAboutPageSkillsDesign', ['Figma', 'Canva', 'Photoshop', 'After Effects', 'Video Editing', 'Design System']);
            setTagifyArray(window.tagifyAboutDev, 'setAboutPageSkillsDev', ['HTML/CSS', 'JavaScript', 'React', 'PHP', 'Laravel', 'C#', 'Flutter', 'MySQL']);
            
            const expContainer = document.getElementById('experienceListContainer');
            expContainer.innerHTML = '';
            addExperienceRow({date: "Present – July 14, 2026", role: "Jairosoft Inc. — UI/UX Designer Intern", location: "Davao City"});
            addExperienceRow({date: "Recently Joined", role: "Jairosoft Inc. — Digital Marketing Team Contributor", location: "Davao City"});

            const eduContainer = document.getElementById('educationListContainer');
            eduContainer.innerHTML = '';
            addEducationRow({acronym: "UM", details: "2022–2026 Davao City", degree: "Bachelor of Science in\\nInformation Technology"});
            addEducationRow({acronym: "HCSM", details: "Graduated 2022 Davao", degree: "Senior High School\\nGeneral Academic Strand (GAS)"});
        }
    } catch (error) {
        console.error("Error loading about page settings:", error);
    }
}

function addExperienceRow(data = {}) {
    const container = document.getElementById('experienceListContainer');
    const row = document.createElement('div');
    row.style.cssText = "display: flex; gap: 1rem; margin-bottom: 1rem; align-items: flex-start;";
    row.innerHTML = `
        <input type="text" class="admin-input exp-date" placeholder="Date (e.g. Present - 2026)" value="${data.date || ''}" style="flex: 1;">
        <input type="text" class="admin-input exp-role" placeholder="Role (e.g. Jairosoft Inc. - Intern)" value="${data.role || ''}" style="flex: 2;">
        <input type="text" class="admin-input exp-location" placeholder="Location" value="${data.location || ''}" style="flex: 1;">
        <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()" style="padding: 0.8rem;">X</button>
    `;
    container.appendChild(row);
}

function addEducationRow(data = {}) {
    const container = document.getElementById('educationListContainer');
    const row = document.createElement('div');
    row.style.cssText = "display: flex; gap: 1rem; margin-bottom: 1rem; align-items: flex-start;";
    row.innerHTML = `
        <input type="text" class="admin-input edu-acronym" placeholder="Acronym (e.g. UM)" value="${data.acronym || ''}" style="flex: 1;">
        <input type="text" class="admin-input edu-details" placeholder="Details (e.g. 2022-2026 Davao City)" value="${data.details || ''}" style="flex: 1;">
        <input type="text" class="admin-input edu-degree" placeholder="Degree (e.g. BS IT)" value="${data.degree || ''}" style="flex: 2;">
        <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()" style="padding: 0.8rem;">X</button>
    `;
    container.appendChild(row);
}

async function loadFooterSettings() {
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('setFooterHeadline').value = data.footerHeadline || '';
            document.getElementById('setFooterSubtext').value = data.footerSubtext || '';
            document.getElementById('setFooterEmail').value = data.footerEmail || '';
            document.getElementById('setFooterCopyright').value = data.footerCopyright || '&copy; 2026 ARCEAS JOHN CALZADA. ALL RIGHTS RESERVED. THE PROJECTS SHOWCASED IN THIS PORTFOLIO ARE MY INTELLECTUAL PROPERTY UNLESS OTHERWISE CREDITED.';
            document.getElementById('setFooterLinkedIn').value = data.footerLinkedIn || '';
            document.getElementById('showFooterLinkedIn').checked = data.showFooterLinkedIn !== false;
            document.getElementById('setFooterBehance').value = data.footerBehance || '';
            document.getElementById('showFooterBehance').checked = data.showFooterBehance !== false;
            document.getElementById('setFooterDribbble').value = data.footerDribbble || '';
            document.getElementById('showFooterDribbble').checked = data.showFooterDribbble !== false;
            document.getElementById('setFooterTwitter').value = data.footerTwitter || '';
            document.getElementById('showFooterTwitter').checked = data.showFooterTwitter !== false;
            document.getElementById('setFooterInstagram').value = data.footerInstagram || '';
            document.getElementById('showFooterInstagram').checked = data.showFooterInstagram !== false;
            document.getElementById('setFooterPhone').value = data.footerPhone || '';
            document.getElementById('setFooterLocation').value = data.footerLocation || '';
        }
    } catch (error) {
        console.error("Error loading footer settings:", error);
    }
}

if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            heroTitle: document.getElementById('setHeroTitle').value,
            heroSub1: document.getElementById('setHeroSub1').value,
            heroSub2: document.getElementById('setHeroSub2').value
        };

        try {
            if(window.showLoading) window.showLoading("Saving Hero Settings...");
            await db.collection('settings').doc('general').set(data, { merge: true });
            heroStatus.style.display = 'block';
            setTimeout(() => heroStatus.style.display = 'none', 3000);
        } catch (error) {
            showToast("Error saving hero settings: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
}

if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            cvLink: document.getElementById('setCvLink').value
        };

        try {
            if(window.showLoading) window.showLoading("Saving CV Settings...");
            await db.collection('settings').doc('general').set(data, { merge: true });
            cvStatus.style.display = 'block';
            setTimeout(() => cvStatus.style.display = 'none', 3000);
        } catch (error) {
            showToast("Error saving CV settings: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
}

if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            indexStat1Value: document.getElementById('setIndexStat1Value').value,
            indexStat1Label: document.getElementById('setIndexStat1Label').value,
            indexStat2Value: document.getElementById('setIndexStat2Value').value,
            indexStat2Label: document.getElementById('setIndexStat2Label').value,
            aboutText: document.getElementById('setAboutText').value,
            indexSkills: getTagifyArray(window.tagifyIndexSkills, 'setIndexSkills'),
            indexSoftware: getTagifyArray(window.tagifyIndexSoftware, 'setIndexSoftware')
        };

        try {
            if(window.showLoading) window.showLoading("Saving Index About Settings...");
            await db.collection('settings').doc('general').set(data, { merge: true });
            aboutStatus.style.display = 'block';
            setTimeout(() => aboutStatus.style.display = 'none', 3000);
        } catch (error) {
            showToast("Error saving about settings: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
}

if (aboutPageForm) {
    aboutPageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Gather Experience
        const experience = [];
        document.querySelectorAll('#experienceListContainer > div').forEach(row => {
            experience.push({
                date: row.querySelector('.exp-date').value,
                role: row.querySelector('.exp-role').value,
                location: row.querySelector('.exp-location').value
            });
        });

        // Gather Education
        const education = [];
        document.querySelectorAll('#educationListContainer > div').forEach(row => {
            education.push({
                acronym: row.querySelector('.edu-acronym').value,
                details: row.querySelector('.edu-details').value,
                degree: row.querySelector('.edu-degree').value
            });
        });

        const data = {
            headline: document.getElementById('setAboutPageHeadline').value,
            subtitle: document.getElementById('setAboutPageSubtitle').value,
            bio: bioEditor ? bioEditor.value() : document.getElementById('setAboutPageBio').value,
            currently: document.getElementById('setAboutPageCurrently').value,
            available: document.getElementById('setAboutPageAvailable').value,
            skillsDesign: getTagifyArray(window.tagifyAboutDesign, 'setAboutPageSkillsDesign'),
            skillsDev: getTagifyArray(window.tagifyAboutDev, 'setAboutPageSkillsDev'),
            experience: experience,
            education: education
        };

        try {
            if(window.showLoading) window.showLoading("Saving About Page Settings...");
            await db.collection('settings').doc('aboutPage').set(data, { merge: true });
            const statusEl = document.getElementById('aboutPageStatus');
            statusEl.style.display = 'block';
            setTimeout(() => statusEl.style.display = 'none', 3000);
        } catch (error) {
            showToast("Error saving about page settings: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
}

if (footerForm) {
    footerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            footerHeadline: document.getElementById('setFooterHeadline').value,
            footerSubtext: document.getElementById('setFooterSubtext').value,
            footerEmail: document.getElementById('setFooterEmail').value,
            footerCopyright: document.getElementById('setFooterCopyright').value,
            footerLinkedIn: document.getElementById('setFooterLinkedIn').value,
            showFooterLinkedIn: document.getElementById('showFooterLinkedIn').checked,
            footerBehance: document.getElementById('setFooterBehance').value,
            showFooterBehance: document.getElementById('showFooterBehance').checked,
            footerDribbble: document.getElementById('setFooterDribbble').value,
            showFooterDribbble: document.getElementById('showFooterDribbble').checked,
            footerTwitter: document.getElementById('setFooterTwitter').value,
            showFooterTwitter: document.getElementById('showFooterTwitter').checked,
            footerInstagram: document.getElementById('setFooterInstagram').value,
            showFooterInstagram: document.getElementById('showFooterInstagram').checked,
            footerPhone: document.getElementById('setFooterPhone').value,
            footerLocation: document.getElementById('setFooterLocation').value
        };

        try {
            if(window.showLoading) window.showLoading("Saving Footer Settings...");
            await db.collection('settings').doc('general').set(data, { merge: true });
            footerStatus.style.display = 'block';
            setTimeout(() => footerStatus.style.display = 'none', 3000);
        } catch (error) {
            showToast("Error saving footer settings: " + error.message, "error");
        } finally {
            if(window.hideLoading) window.hideLoading();
        }
    });
}

// ----------------------------------------------------
// INBOX LOGIC
// ----------------------------------------------------
async function loadInbox() {
    const inboxList = document.getElementById('inboxList');
    if (!inboxList) return;

    inboxList.innerHTML = '<p style="color: var(--color-text-muted);">Loading messages...</p>';

    try {
        const querySnapshot = await db.collection('messages').orderBy('timestamp', 'desc').get();
        inboxList.innerHTML = '';
        
        if (querySnapshot.empty) {
            inboxList.innerHTML = '<p style="color: var(--color-text-muted);">Your inbox is empty.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const msg = doc.data();
            const dateStr = msg.timestamp ? msg.timestamp.toDate().toLocaleString() : 'Unknown Date';
            // Escaping for JS injection
            const safeName = msg.name ? msg.name.replace(/'/g, "\\'") : 'Unknown';
            const safeEmail = msg.email ? msg.email.replace(/'/g, "\\'") : 'Unknown';
            const safeMsg = msg.message ? msg.message.replace(/'/g, "\\'").replace(/\n/g, '\\n') : '';

            inboxList.innerHTML += `
                <div style="background: #1e1e1e; border: 1px solid #3c4043; padding: 1rem 1.5rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; transition: border-color 0.2s;">
                    <div style="flex: 1; overflow: hidden; cursor: pointer;" onclick="viewMessage('${safeName}', '${safeEmail}', '${dateStr}', '${safeMsg}')">
                        <div style="display: flex; gap: 1rem; align-items: baseline; margin-bottom: 0.3rem;">
                            <h4 style="margin: 0; color: #e8eaed; font-size: 1rem;">${msg.name}</h4>
                            <span style="color: #9aa0a6; font-size: 0.8rem;">${dateStr}</span>
                        </div>
                        <p style="color: #9aa0a6; margin: 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">
                            ${msg.message}
                        </p>
                    </div>
                    <div>
                        <button onclick="deleteMessage('${doc.id}')" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-color: #5f6368; color: #f28b82;">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        inboxList.innerHTML = `<p style="color: #f28b82;">Error loading messages: ${error.message}</p>`;
    }
}

window.viewMessage = function(name, email, date, message) {
    document.getElementById('msgModalName').textContent = name;
    const emailEl = document.getElementById('msgModalEmail');
    emailEl.textContent = email;
    emailEl.href = `mailto:${email}`;
    document.getElementById('msgModalDate').textContent = date;
    document.getElementById('msgModalContent').textContent = message;
    
    document.getElementById('replyMessageBtn').onclick = () => {
        window.location.href = `mailto:${email}`;
    };
    
    document.getElementById('messageModal').classList.add('active');
};

const messageModal = document.getElementById('messageModal');
const closeMessageModal = document.getElementById('closeMessageModal');
if (closeMessageModal) {
    closeMessageModal.addEventListener('click', () => {
        messageModal.classList.remove('active');
    });
}
if (messageModal) {
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) messageModal.classList.remove('active');
    });
}

window.deleteMessage = function(id) {
    showConfirmModal("Are you sure you want to delete this message? This action is permanent.", async () => {
        try {
            await db.collection("messages").doc(id).delete();
            loadInbox();
        } catch (error) {
            showToast("Error deleting message: " + error.message, "error");
        }
    });
};

// ----------------------------------------------------
// AUTO-SEED FUNCTION (Populate Initial DB)
// ----------------------------------------------------
async function seedDataIfEmpty() {
    try {
        const settingsDoc = await db.collection('settings').doc('general').get();
        if (!settingsDoc.exists) {
            await db.collection('settings').doc('general').set({
                heroTitle: "Hi, I’m Arceas John Calzada",
                heroSub1: "I'm a motivated and detail-oriented aspiring professional deeply passionate about UI/UX design and front-end development.",
                heroSub2: "UI/UX Intern @Jairosoft • Constantly striving to craft seamless and visually stunning digital experiences.",
                aboutText: "I am a 4th-year Information Technology student at the University of Mindanao. I'm a motivated and detail-oriented aspiring professional deeply passionate about UI/UX design and front-end development, constantly striving to craft seamless and visually stunning digital experiences.\n\nMy experience spans UI/UX design, front-end development, mobile application development, and digital content creation. I recently joined the company’s Digital Marketing Team, contributing to visual design and branding initiatives.",
                footerHeadline: "Let's create something <span>extraordinary.</span>",
                footerSubtext: "Open for opportunities, freelance projects, and exciting collaborations.",
                footerEmail: "calzada.arceas@gmail.com",
                footerLinkedIn: "https://www.linkedin.com/in/arceas-calzada/",
                footerBehance: "#",
                footerDribbble: "#"
            });
        }

        const heroCarouselSnapshot = await db.collection('hero_carousel').limit(1).get();
        if (heroCarouselSnapshot.empty) {
            const images = ["images/About me Profile.png", "images/Img_1.JPG", "images/Img_2.jpeg", "images/Img_3.JPG"];
            for (let img of images) {
                await db.collection('hero_carousel').add({ image: img, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            }
        }

        const aboutCarouselSnapshot = await db.collection('about_carousel').limit(1).get();
        if (aboutCarouselSnapshot.empty) {
            const images = ["images/Img_2.jpeg", "images/Img_3.JPG", "images/About me Profile.png", "images/Img_1.JPG"];
            for (let img of images) {
                await db.collection('about_carousel').add({ image: img, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            }
        }

        const designsSnapshot = await db.collection('designs').limit(1).get();
        if (designsSnapshot.empty) {
            const designs = [
                { title: "User Manual Cover", subtitle: "Graphic Design", description: "Design for a tech product manual.", image: "images/Cover Page - User Manual - User.png", aspectRatio: "portrait" },
                { title: "Brand Identity", subtitle: "Branding", description: "Corporate branding materials.", image: "images/Cover.png", aspectRatio: "landscape" }
            ];
            for (let d of designs) {
                d.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('designs').add(d);
            }
        }

        const certificatesSnapshot = await db.collection('certificates').limit(1).get();
        if (certificatesSnapshot.empty) {
            const certificates = [
                { title: "Databases", subtitle: "Certification", description: "Advanced Database Management", image: "images/Databases.jpg", aspectRatio: "landscape" },
                { title: "HTML and CSS", subtitle: "Certification", description: "Front-End Web Development", image: "images/HTML and CSS.jpg", aspectRatio: "landscape" },
                { title: "Network Security", subtitle: "Certification", description: "Cybersecurity Fundamentals", image: "images/Network Security.jpg", aspectRatio: "landscape" },
                { title: "Best Oral Research", subtitle: "Award", description: "University Research Presentation", image: "images/Best Oral Research.jpg", aspectRatio: "landscape" }
            ];
            for (let c of certificates) {
                c.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('certificates').add(c);
            }
        }
    } catch (e) {
        console.error("Auto-seed error:", e);
    }
}

// Call seeder (it safely does nothing if DB already has content)
seedDataIfEmpty();

// Gallery Upload Logic
const addGalleryImgBtn = document.getElementById('addGalleryImgBtn');
const galleryContainer = document.getElementById('galleryContainer');

window.addGalleryField = function(initialValue = '') {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.5rem';
    wrapper.style.alignItems = 'center';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'admin-input gallery-input-field';
    input.placeholder = 'Image URL / Base64';
    input.value = initialValue;
    input.style.flex = '1';
    input.style.marginBottom = '0';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn';
    removeBtn.textContent = '✕';
    removeBtn.style.background = 'transparent';
    removeBtn.style.border = '1px solid #ff4a4a';
    removeBtn.style.color = '#ff4a4a';
    removeBtn.style.padding = '0.6rem 1rem';
    
    removeBtn.onclick = () => wrapper.remove();
    
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    galleryContainer.appendChild(wrapper);
};

if (addGalleryImgBtn) {
    addGalleryImgBtn.addEventListener('click', () => {
        addGalleryField();
    });
}

// ==========================================
// ANALYTICS DASHBOARD
// ==========================================

async function loadAnalytics() {
    try {
        // Load Global Stats
        const statsDoc = await db.collection('analytics').doc('global_stats').get();
        if (statsDoc.exists) {
            const data = statsDoc.data();
            document.getElementById('analyticsTotalViews').textContent = data.totalViews || 0;
            document.getElementById('analyticsUniqueVisitors').textContent = data.uniqueVisitors || 0;
        }

        // Aggregate Data for Sources & Devices
        const visitsSnapshotAll = await db.collection('analytics_visits').get();
        let sources = {};
        let devices = {};
        
        visitsSnapshotAll.forEach(doc => {
            const d = doc.data();
            const source = d.referrer || 'Direct';
            const device = d.deviceType || 'Desktop';
            sources[source] = (sources[source] || 0) + 1;
            devices[device] = (devices[device] || 0) + 1;
        });

        const sourcesList = document.getElementById('analyticsSourcesList');
        sourcesList.innerHTML = Object.entries(sources).sort((a,b) => b[1]-a[1]).map(s => 
            `<div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #3c4043;">
                <span>${s[0]}</span>
                <span style="color:#8ab4f8; font-weight:bold;">${s[1]}</span>
            </div>`
        ).join('') || 'No data';

        const devicesList = document.getElementById('analyticsDevicesList');
        devicesList.innerHTML = Object.entries(devices).sort((a,b) => b[1]-a[1]).map(d => 
            `<div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #3c4043;">
                <span>${d[0]}</span>
                <span style="color:#8ab4f8; font-weight:bold;">${d[1]}</span>
            </div>`
        ).join('') || 'No data';

        // Load Recent Visitors Table
        const visitorsTable = document.getElementById('analyticsVisitorsTable');
        visitorsTable.innerHTML = '<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--color-text-muted);">Loading visitors...</td></tr>';
        
        const visitsSnapshot = await db.collection('analytics_visits')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        if (visitsSnapshot.empty) {
            visitorsTable.innerHTML = '<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--color-text-muted);">No visitors tracked yet.</td></tr>';
            return;
        }

        visitorsTable.innerHTML = '';
        visitsSnapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #3c4043';
            
            let timeStr = 'Just now';
            if (data.timestamp) {
                const date = data.timestamp.toDate();
                timeStr = date.toLocaleString();
            }

            const locationStr = `${data.city}, ${data.country}`;
            const sourceBadge = `<span style="background:#4a4a4a; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${data.referrer || 'Direct'}</span>`;
            const systemStr = `${data.deviceType || 'Desktop'} / ${data.browser || 'Unknown'}`;
            
            tr.innerHTML = `
                <td style="padding: 1rem;">${timeStr}</td>
                <td style="padding: 1rem;">${locationStr}</td>
                <td style="padding: 1rem;">${data.page}</td>
                <td style="padding: 1rem;">${sourceBadge}</td>
                <td style="padding: 1rem; font-size: 0.9rem;">${systemStr}</td>
                <td style="padding: 1rem; color: #8ab4f8; font-size: 0.9rem;">${data.ip}</td>
            `;
            visitorsTable.appendChild(tr);
        });

    } catch (e) {
        console.error("Error loading analytics:", e);
        document.getElementById('analyticsVisitorsTable').innerHTML = '<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #ff4a4a;">Failed to load analytics data. Make sure you have setup Firestore.</td></tr>';
    }
}

// ==========================================
// DASHBOARD HOME
// ==========================================
async function loadDashboardHome() {
    try {
        // Load quick stats
        const statsDoc = await db.collection('analytics').doc('global_stats').get();
        if (statsDoc.exists) {
            document.getElementById('homeTotalViews').textContent = statsDoc.data().totalViews || 0;
        }

        // Load unread messages (we'll count messages in inbox)
        const msgsSnapshot = await db.collection('inbox').get();
        document.getElementById('homeUnreadMessages').textContent = msgsSnapshot.size;
    } catch (e) {
        console.error("Error loading dashboard home stats", e);
    }
}
