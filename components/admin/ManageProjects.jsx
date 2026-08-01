"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now()
              }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

function TagInput({ label, tags, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>
        {label}
      </label>
      
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "0.5rem", 
          padding: "0.6rem 0.8rem", 
          background: "#202124", 
          border: "1px solid #5f6368", 
          borderRadius: "4px",
          alignItems: "center"
        }}
      >
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            style={{ 
              background: "#FF6D29", 
              color: "#fff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "4px", 
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(idx)}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "#fff", 
                cursor: "pointer", 
                padding: 0,
                fontSize: "0.8rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center"
              }}
            >
              ×
            </button>
          </span>
        ))}
        
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          style={{ 
            flex: 1, 
            background: "transparent", 
            border: "none", 
            color: "#e8eaed", 
            outline: "none",
            fontSize: "0.95rem",
            minWidth: "120px"
          }}
        />
      </div>
      <small style={{ color: "#5f6368", display: "block", marginTop: "0.25rem", fontSize: "0.75rem" }}>
        Type a tag and press <strong>Enter</strong> or <strong>comma (,)</strong> to add.
      </small>
    </div>
  );
}

export default function ManageProjects({ showConfirm, showSuccess }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [role, setRole] = useState("");
  const [timeline, setTimeline] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1/1");
  const [tags, setTags] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [mainImage, setMainImage] = useState(null); // File object or URL string
  const [awardsImage, setAwardsImage] = useState(null); // File object or URL string
  const [galleryImages, setGalleryImages] = useState([]); // Array of URL strings/Base64

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "projects"));
      const projList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      projList.sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));
      setProjects(projList);
    } catch (err) {
      console.error(err);
      alert("Failed to load projects.");
    }
    setLoading(false);
  };

  const handleUploadImage = async (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file; // Already a URL
    
    const compressed = await compressImage(file, 1200, 800, 0.75);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressed);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleGalleryUpload = async (file) => {
    if (!file) return;
    try {
      const base64 = await handleUploadImage(file);
      if (base64) {
        setGalleryImages((prev) => [...prev, base64]);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let mainImageUrl = mainImage;
      let awardsImageUrl = awardsImage;

      if (mainImage instanceof File) {
        mainImageUrl = await handleUploadImage(mainImage);
      }
      if (awardsImage instanceof File) {
        awardsImageUrl = await handleUploadImage(awardsImage);
      }

      const projectData = {
        title,
        subtitle,
        role,
        timeline,
        technologies,
        description,
        aspectRatio,
        tags,
        videoUrl,
        image: mainImageUrl,
        awardsImage: awardsImageUrl,
        galleryImages: galleryImages.filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      if (currentProject && currentProject.id) {
        await updateDoc(doc(db, "projects", currentProject.id), projectData);
      } else {
        projectData.createdAt = new Date().toISOString();
        projectData.order = projects.length + 1;
        await addDoc(collection(db, "projects"), projectData);
      }

      setIsEditing(false);
      resetForm();
      if (showSuccess) {
        showSuccess("Project saved successfully! 🎉");
      } else {
        alert("Saved successfully!");
      }
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Error saving project: " + err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (showConfirm) {
      showConfirm("Are you sure you want to delete this project? This action cannot be undone.", async () => {
        try {
          await deleteDoc(doc(db, "projects", id));
          fetchProjects();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      });
    } else {
      if (confirm("Are you sure you want to delete this project?")) {
        try {
          await deleteDoc(doc(db, "projects", id));
          fetchProjects();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      }
    }
  };

  const editProject = (proj) => {
    setCurrentProject(proj);
    setTitle(proj.title || "");
    setSubtitle(proj.subtitle || "");
    setRole(proj.role || "");
    setTimeline(proj.timeline || "");
    setTechnologies(proj.technologies || "");
    setDescription(proj.description || "");
    setAspectRatio(proj.aspectRatio || "1/1");
    setTags(proj.tags || []);
    setVideoUrl(proj.videoUrl || "");
    setMainImage(proj.image || null);
    setAwardsImage(proj.awardsImage || null);
    setGalleryImages(proj.galleryImages || []);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentProject(null);
    setTitle("");
    setSubtitle("");
    setRole("");
    setTimeline("");
    setTechnologies("");
    setDescription("");
    setAspectRatio("1/1");
    setTags([]);
    setVideoUrl("");
    setMainImage(null);
    setAwardsImage(null);
    setGalleryImages([]);
  };

  // Reorder handlers
  const handleDragStart = (idx) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIdx) => {
    if (draggedIndex === null || draggedIndex === dropIdx) return;
    const reordered = [...projects];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIdx, 0, movedItem);
    
    // Update local & Firestore
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setProjects(updated);
    setDraggedIndex(null);

    try {
      await Promise.all(
        updated.map(item => updateDoc(doc(db, "projects", item.id), { order: item.order }))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const moveProject = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    handleDragStart(idx);
    await handleDrop(targetIdx);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage your portfolio projects, categories, role, timeline, and case studies here.</p>
        {!isEditing && (
          <button onClick={() => { resetForm(); setIsEditing(true); }} style={{ padding: "0.8rem 1.5rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            + Add New Project
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: "rgba(22,22,25,0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "2rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "2rem" }}>{currentProject ? "Edit Project" : "Add New Project"}</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>PROJECT TITLE *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. SmartiCare Health App" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SUBTITLE / CATEGORY</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Mobile App & Web System" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>MY ROLE</label>
                <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. UI/UX Designer & Lead Developer" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>TIMELINE / DURATION</label>
                <input type="text" value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. Jan 2026 - Mar 2026" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CARD ASPECT RATIO</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }}>
                  <option value="1/1">1:1 Square</option>
                  <option value="16/9">16:9 Landscape</option>
                  <option value="4/3">4:3 Standard</option>
                  <option value="3/4">3:4 Portrait</option>
                  <option value="2/3">2:3 Tall</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>TECHNOLOGIES (Comma Separated)</label>
              <input type="text" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="e.g. React, Next.js, Firebase, Tailwind CSS" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>DESCRIPTION (Supports Markdown)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={6} placeholder="Detailed overview, problem statement, and key features..." style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>

            <TagInput 
              label="TAGS / BADGES" 
              tags={tags} 
              onChange={setTags} 
              placeholder="e.g. UI/UX, Web Design, Figma, Featured" 
            />

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>VIDEO URL / MP4 DEMO LINK (Optional)</label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>MAIN IMAGE COVER *</label>
                <input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} style={{ color: "#e8eaed" }} />
                {typeof mainImage === 'string' && mainImage && <img src={mainImage.startsWith('images/') ? `/src/${mainImage}` : mainImage} alt="Main Cover" style={{ display: "block", marginTop: "1rem", maxWidth: "220px", borderRadius: "8px" }} />}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>AWARDS / MOCKUP IMAGE (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setAwardsImage(e.target.files[0])} style={{ color: "#e8eaed" }} />
                {typeof awardsImage === 'string' && awardsImage && <img src={awardsImage.startsWith('images/') ? `/src/${awardsImage}` : awardsImage} alt="Awards Mockup" style={{ display: "block", marginTop: "1rem", maxWidth: "220px", borderRadius: "8px" }} />}
              </div>
            </div>

            {/* Gallery Images Manager */}
            <div style={{ marginBottom: "2rem", padding: "1.2rem", background: "#202124", borderRadius: "8px", border: "1px solid #3c4043" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <label style={{ color: "#e8eaed", fontSize: "0.9rem", fontWeight: "bold" }}>GALLERY IMAGES ({galleryImages.length})</label>
                <label style={{ padding: "0.4rem 1rem", background: "rgba(255,109,41,0.15)", color: "#FF6D29", border: "1px solid #FF6D29", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }}>
                  + Add Gallery Image
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(f => handleGalleryUpload(f));
                    }
                  }} style={{ display: "none" }} />
                </label>
              </div>

              {galleryImages.length === 0 ? (
                <p style={{ color: "#9aa0a6", fontSize: "0.85rem", margin: 0 }}>No gallery images added yet.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  {galleryImages.map((gImg, idx) => (
                    <div key={idx} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid #5f6368" }}>
                      <img src={gImg?.startsWith('images/') ? `/src/${gImg}` : gImg} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button 
                        type="button" 
                        onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "#ea4335", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={uploading} style={{ background: "#FF6D29", color: "#fff", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: uploading ? "not-allowed" : "pointer" }}>
                {uploading ? "Saving..." : "Save Project"}
              </button>
              <button type="button" onClick={() => { resetForm(); setIsEditing(false); }} style={{ background: "transparent", border: "1px solid #5f6368", color: "#e8eaed", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            projects.map((proj, idx) => (
              <div 
                key={proj.id} 
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                style={{ 
                  background: "rgba(30,30,35,0.6)", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.05)", 
                  overflow: "hidden", 
                  display: "flex", 
                  flexDirection: "column",
                  opacity: draggedIndex === idx ? 0.4 : 1,
                  transition: "opacity 0.2s"
                }}
              >
                {/* Drag Handle */}
                <div style={{ cursor: "grab", padding: "0.4rem", background: "rgba(255,255,255,0.03)", color: "#9aa0a6", fontSize: "0.8rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>⋮⋮ Drag to reorder</span>
                  <div style={{ display: "flex", gap: "0.2rem" }}>
                    <button type="button" onClick={() => moveProject(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▲</button>
                    <button type="button" onClick={() => moveProject(idx, 1)} disabled={idx === projects.length - 1} style={{ background: "none", border: "none", color: idx === projects.length - 1 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▼</button>
                  </div>
                </div>

                <div style={{ height: "180px", background: "#202124", backgroundImage: `url(${proj.image?.startsWith('images/') ? `/src/${proj.image}` : proj.image})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.2rem" }}>{proj.title}</h3>
                  {proj.subtitle && <p style={{ color: "#FF6D29", fontSize: "0.85rem", margin: "0 0 0.8rem 0", fontWeight: "500" }}>{proj.subtitle}</p>}
                  
                  {(proj.role || proj.timeline) && (
                    <p style={{ color: "#9aa0a6", fontSize: "0.8rem", margin: "0 0 0.8rem 0" }}>
                      {proj.role} {proj.role && proj.timeline ? "•" : ""} {proj.timeline}
                    </p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {proj.tags?.map((t, i) => <span key={i} style={{ background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", color: "#9aa0a6" }}>{t}</span>)}
                  </div>
                  
                  <div style={{ marginTop: "auto", display: "flex", gap: "1rem" }}>
                    <button onClick={() => editProject(proj)} style={{ flex: 1, background: "rgba(138, 180, 248, 0.1)", color: "#8ab4f8", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Edit</button>
                    <button onClick={() => handleDelete(proj.id)} style={{ flex: 1, background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
