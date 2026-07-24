// Firebase Configuration
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

// Auth Check
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionName = urlParams.get('collection'); // 'projects' or 'designs'
    const itemId = urlParams.get('id'); // null if adding

    if (!collectionName || (collectionName !== 'projects' && collectionName !== 'designs')) {
        alert('Invalid collection specified.');
        window.location.href = 'admin.html';
        return;
    }

    // Initialize UI
    const isEdit = !!itemId;
    document.getElementById('editorHeaderTitle').textContent = `${isEdit ? 'Edit' : 'Add'} ${collectionName.slice(0, -1)}`;
    document.getElementById('previewOverlayText').textContent = collectionName === 'projects' ? 'View Project ↗' : 'View Design ↗';

    if (collectionName === 'designs') {
        document.getElementById('gallerySection').style.display = 'block';
    } else if (collectionName === 'projects') {
        document.getElementById('projectDetailsSection').style.display = 'block';
    }

    // Sidebar Logic
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const appSidebar = document.querySelector('.app-sidebar');
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

    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // Sidebar Dropdown Accordion
    const adminSidebarNav = document.getElementById('adminSidebarNav');
    if (adminSidebarNav) {
        adminSidebarNav.addEventListener('click', (e) => {
            const dropdownHeader = e.target.closest('.sidebar-dropdown-header');
            if (dropdownHeader) {
                const dropdown = dropdownHeader.parentElement;
                
                document.querySelectorAll('.sidebar-dropdown.active').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                
                dropdown.classList.toggle('active');
                return;
            }

            const link = e.target.closest('.sidebar-link');
            if (link) {
                if(link.getAttribute('target') === '_blank') return;
                
                // Close sidebar on mobile
                if(window.innerWidth <= 768 && appSidebar && appSidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }
        });
    }

    // DOM Elements
    const titleIn = document.getElementById('itemTitle');
    const subtitleIn = document.getElementById('itemSubtitle');
    const descIn = document.getElementById('itemDesc');
    const imageIn = document.getElementById('itemImage');
    const aspectIn = document.getElementById('itemAspect');

    const titleOut = document.getElementById('previewTitle');
    const subtitleOut = document.getElementById('previewSubtitle');
    const descOut = document.getElementById('previewDesc');
    const imageOut = document.getElementById('previewImage');
    const aspectOut = document.getElementById('previewAspect');

    // Project Detail Elements
    const roleIn = document.getElementById('itemRole');
    const timelineIn = document.getElementById('itemTimeline');
    const techIn = document.getElementById('itemTechnologies');
    const videoIn = document.getElementById('itemVideoUrl');
    const awardsIn = document.getElementById('itemAwardsImage');

    // Design Elements
    const designPdfIn = document.getElementById('itemDesignPdf');

    // 2. Live Preview Binding
    function updatePreview() {
        titleOut.textContent = titleIn.value || 'Project Name';
        subtitleOut.textContent = subtitleIn.value || 'Category';
        descOut.textContent = descIn.value || 'Description will appear here.';
        imageOut.src = imageIn.value || 'images/placeholder.png';
        aspectOut.style.aspectRatio = aspectIn.value || '1/1';
    }

    // Attach listeners
    [titleIn, subtitleIn, descIn, imageIn].forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    aspectIn.addEventListener('change', updatePreview);

    // 3. Load Existing Data
    if (isEdit) {
        db.collection(collectionName).doc(itemId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('itemId').value = itemId;
                titleIn.value = data.title || '';
                subtitleIn.value = data.subtitle || '';
                descIn.value = data.description || '';
                imageIn.value = data.image || '';
                aspectIn.value = data.aspectRatio || '1/1';
                
                if (collectionName === 'designs') {
                    if (data.galleryImages) {
                        data.galleryImages.forEach(img => window.addGalleryField(img));
                    }
                    if (designPdfIn) {
                        designPdfIn.value = data.pdfUrl || '';
                    }
                }

                if (collectionName === 'projects') {
                    if (roleIn) roleIn.value = data.role || '';
                    if (timelineIn) timelineIn.value = data.timeline || '';
                    if (techIn) techIn.value = data.technologies || '';
                    if (videoIn) videoIn.value = data.videoUrl || '';
                    if (awardsIn) awardsIn.value = data.awardsImage || '';
                }

                updatePreview();
            } else {
                alert('Item not found.');
                window.location.href = 'admin.html';
            }
        }).catch(err => {
            console.error('Error fetching data:', err);
            alert('Failed to load data.');
        });
    }

    // 4. Image Drop Zone & Base64 Converter
    function compressImageToBlob(file, maxWidth = 1200) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleSize = maxWidth / img.width;
                    const width = img.width > maxWidth ? maxWidth : img.width;
                    const height = img.width > maxWidth ? img.height * scaleSize : img.height;
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert directly to Blob for faster processing
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.8);
                };
            };
            reader.onerror = error => reject(error);
        });
    }

    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageFileInput');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(255,255,255,0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            await handleFileUpload(e.target.files[0]);
        }
    });

    function compressImageToBase64(file, maxWidth = 800, quality = 0.6) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleSize = maxWidth / img.width;
                    const width = img.width > maxWidth ? maxWidth : img.width;
                    const height = img.width > maxWidth ? img.height * scaleSize : img.height;
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress aggressively to fit inside 1MB Firestore limit
                    const base64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64);
                };
                img.onerror = () => reject(new Error("Failed to load image"));
            };
            reader.onerror = error => reject(error);
        });
    }

    async function handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }
        try {
            dropZone.querySelector('p').textContent = 'Compressing Image...';
            
            // Compress to max 1000px, quality 0.7 for main image
            const base64 = await compressImageToBase64(file, 1000, 0.7);
            
            imageIn.value = base64;
            updatePreview();
            
            dropZone.querySelector('p').textContent = 'Image Uploaded Successfully!';
            setTimeout(() => {
                dropZone.querySelector('p').textContent = 'Drag & drop an image here, or click to select';
            }, 3000);
        } catch (error) {
            console.error(error);
            alert('Error compressing image: ' + error.message);
            dropZone.querySelector('p').textContent = 'Drag & drop an image here, or click to select';
        }
    }

    // PDF Upload Logic Removed - Replaced with direct URL input


    // 5. Gallery Logic
    const galleryContainer = document.getElementById('galleryContainer');
    const addGalleryImgBtn = document.getElementById('addGalleryImgBtn');

    window.addGalleryField = function(url = '') {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '0.5rem';
        div.style.alignItems = 'center';
        
        const preview = document.createElement('img');
        preview.src = url || 'images/placeholder.png';
        preview.style.width = '50px';
        preview.style.height = '50px';
        preview.style.objectFit = 'cover';
        preview.style.borderRadius = '4px';
        preview.style.background = '#3c4043';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'admin-input gallery-input-field';
        input.placeholder = 'Image URL...';
        input.value = url;
        input.style.flex = '1';
        
        input.addEventListener('input', (e) => {
            preview.src = e.target.value.trim() || 'images/placeholder.png';
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.className = 'btn';
        removeBtn.style.background = '#ea4335';
        removeBtn.style.padding = '0.5rem 1rem';
        removeBtn.addEventListener('click', () => {
            div.remove();
        });

        div.appendChild(preview);
        div.appendChild(input);
        div.appendChild(removeBtn);
        galleryContainer.appendChild(div);
    };

    if (addGalleryImgBtn) {
        addGalleryImgBtn.addEventListener('click', () => {
            window.addGalleryField();
        });
    }

    // Gallery Drop Zone Logic
    const galleryDropZone = document.getElementById('galleryDropZone');
    const galleryFileInput = document.getElementById('galleryFileInput');

    if (galleryDropZone && galleryFileInput) {
        galleryDropZone.addEventListener('click', () => galleryFileInput.click());

        galleryDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            galleryDropZone.style.background = 'rgba(255,255,255,0.1)';
        });

        galleryDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            galleryDropZone.style.background = 'transparent';
        });

        galleryDropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            galleryDropZone.style.background = 'transparent';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = e.dataTransfer.files;
                galleryDropZone.querySelector('p').textContent = `Uploading ${files.length} images...`;
                const uploadPromises = [];
                for (let i = 0; i < files.length; i++) {
                    uploadPromises.push(handleGalleryUpload(files[i]));
                }
                await Promise.all(uploadPromises);
                galleryDropZone.querySelector('p').textContent = 'All images uploaded!';
                setTimeout(() => {
                    galleryDropZone.querySelector('p').textContent = 'Drag & drop images here to add to gallery, or click to upload';
                }, 2500);
            }
        });

        galleryFileInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const files = e.target.files;
                galleryDropZone.querySelector('p').textContent = `Uploading ${files.length} images...`;
                const uploadPromises = [];
                for (let i = 0; i < files.length; i++) {
                    uploadPromises.push(handleGalleryUpload(files[i]));
                }
                await Promise.all(uploadPromises);
                galleryDropZone.querySelector('p').textContent = 'All images uploaded!';
                setTimeout(() => {
                    galleryDropZone.querySelector('p').textContent = 'Drag & drop images here to add to gallery, or click to upload';
                }, 2500);
            }
        });

        async function handleGalleryUpload(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
                return;
            }
            try {
                // Compress very aggressively to fit multiple inside 1MB limit
                const base64 = await compressImageToBase64(file, 800, 0.6); 
                window.addGalleryField(base64);
            } catch (error) {
                console.error(error);
                alert('Error uploading gallery image (' + file.name + '): ' + error.message);
            }
        }
    }

    // 6. Save Action
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', async () => {
        // Validate
        if (!titleIn.value || !imageIn.value) {
            alert('Please fill out the Title and Main Image.');
            return;
        }

        saveBtn.textContent = 'Publishing...';
        saveBtn.disabled = true;

        const data = {
            title: titleIn.value,
            subtitle: subtitleIn.value,
            description: descIn.value,
            image: imageIn.value,
            aspectRatio: aspectIn.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (collectionName === 'designs') {
            const galleryInputs = document.querySelectorAll('.gallery-input-field');
            const galleryArray = [];
            galleryInputs.forEach(input => {
                if (input.value.trim()) {
                    galleryArray.push(input.value.trim());
                }
            });
            data.galleryImages = galleryArray;
            if (designPdfIn && designPdfIn.value.trim()) {
                data.pdfUrl = designPdfIn.value.trim();
            } else {
                data.pdfUrl = null;
            }
        } else if (collectionName === 'projects') {
            if (roleIn && roleIn.value.trim()) data.role = roleIn.value.trim();
            if (timelineIn && timelineIn.value.trim()) data.timeline = timelineIn.value.trim();
            if (techIn && techIn.value.trim()) data.technologies = techIn.value.trim();
            if (videoIn && videoIn.value.trim()) data.videoUrl = videoIn.value.trim();
            if (awardsIn && awardsIn.value.trim()) data.awardsImage = awardsIn.value.trim();
        }

        // Safety check before saving to prevent ugly Firebase 1MB errors
        const payloadSize = new Blob([JSON.stringify(data)]).size;
        if (payloadSize > 950000) {
            alert('Error: The total size of all your images/PDF combined is too large to fit in the database! Please remove a few gallery images or compress the PDF further.');
            saveBtn.textContent = 'Publish Changes';
            saveBtn.disabled = false;
            return;
        }

        try {
            if (isEdit) {
                // To preserve 'order' field, we merge
                await db.collection(collectionName).doc(itemId).update(data);
            } else {
                await db.collection(collectionName).add(data);
            }
            
            // Show Success Toast
            const toast = document.getElementById('saveToast');
            if (toast) {
                toast.classList.add('show');
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    toast.classList.remove('show');
                    window.location.href = 'admin.html';
                }, 2000);
            } else {
                window.location.href = 'admin.html'; // Fallback
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving data: ' + error.message);
            saveBtn.textContent = 'Publish Changes';
            saveBtn.disabled = false;
        }
    });

    // Initial preview setup
    updatePreview();
});
