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

if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const collectionName = urlParams.get('collection') || 'projects';

    if (!projectId) {
        document.getElementById('projTitle').textContent = "Project Not Found";
        return;
    }

    try {
        const doc = await db.collection(collectionName).doc(projectId).get();
        if (!doc.exists) {
            document.getElementById('projTitle').textContent = "Project Not Found";
            return;
        }

        const data = doc.data();

        // 1. Basic Info
        document.getElementById('projTitle').textContent = data.title || 'Untitled';
        document.getElementById('projSubtitle').textContent = data.subtitle || '';
        
        if (data.image) {
            const cover = document.getElementById('projCover');
            cover.src = data.image;
            cover.style.display = 'block';
        }

        if (data.description) {
            document.getElementById('projDesc').textContent = data.description;
        }

        // 2. Meta Data (Sidebar)
        if (data.role) {
            document.getElementById('roleContainer').style.display = 'block';
            document.getElementById('projRole').textContent = data.role;
        }

        if (data.timeline) {
            document.getElementById('timelineContainer').style.display = 'block';
            document.getElementById('projTimeline').textContent = data.timeline;
        }

        if (data.technologies) {
            document.getElementById('techContainer').style.display = 'block';
            const techContainer = document.getElementById('projTech');
            const techs = data.technologies.split(',').map(t => t.trim()).filter(t => t);
            techs.forEach(tech => {
                const span = document.createElement('span');
                span.textContent = tech;
                techContainer.appendChild(span);
            });
        }

        // 3. Media (Video)
        if (data.videoUrl) {
            document.getElementById('projVideoSection').style.display = 'block';
            document.getElementById('projVideoSrc').src = data.videoUrl;
            document.getElementById('projVideo').load(); // Reload video with new source
        }

        // 4. Awards
        if (data.awardsImage) {
            document.getElementById('projAwardsSection').style.display = 'block';
            document.getElementById('projAwardsImg').src = data.awardsImage;
        }

    } catch (error) {
        console.error("Error loading project details:", error);
        document.getElementById('projTitle').textContent = "Error Loading Project";
    }
});
