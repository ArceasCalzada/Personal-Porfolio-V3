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

export default function ManageDesigns({ showConfirm, showSuccess }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1/1");
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "designs"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));
      setDesigns(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load designs.");
    }
    setLoading(false);
  };

  const handleUploadImage = async (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    
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
      if (mainImage instanceof File) {
        mainImageUrl = await handleUploadImage(mainImage);
      }

      const designData = {
        title,
        subtitle,
        description,
        pdfUrl,
        aspectRatio,
        image: mainImageUrl,
        galleryImages: galleryImages.filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      if (currentDesign && currentDesign.id) {
        await updateDoc(doc(db, "designs", currentDesign.id), designData);
      } else {
        designData.createdAt = new Date().toISOString();
        designData.order = designs.length + 1;
        await addDoc(collection(db, "designs"), designData);
      }

      setIsEditing(false);
      resetForm();
      if (showSuccess) {
        showSuccess("Design saved successfully! 🎉");
      } else {
        alert("Saved successfully!");
      }
      fetchDesigns();
    } catch (err) {
      console.error(err);
      alert("Error saving design: " + err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (showConfirm) {
      showConfirm("Are you sure you want to delete this design? This action cannot be undone.", async () => {
        try {
          await deleteDoc(doc(db, "designs", id));
          fetchDesigns();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      });
    } else {
      if (confirm("Are you sure you want to delete this design?")) {
        try {
          await deleteDoc(doc(db, "designs", id));
          fetchDesigns();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      }
    }
  };

  const editDesign = (des) => {
    setCurrentDesign(des);
    setTitle(des.title || "");
    setSubtitle(des.subtitle || "");
    setDescription(des.description || "");
    setPdfUrl(des.pdfUrl || "");
    setAspectRatio(des.aspectRatio || "1/1");
    setMainImage(des.image || null);
    setGalleryImages(des.galleryImages || []);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentDesign(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setPdfUrl("");
    setAspectRatio("1/1");
    setMainImage(null);
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
    const reordered = [...designs];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIdx, 0, movedItem);
    
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setDesigns(updated);
    setDraggedIndex(null);

    try {
      await Promise.all(
        updated.map(item => updateDoc(doc(db, "designs", item.id), { order: item.order }))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const moveDesign = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= designs.length) return;
    handleDragStart(idx);
    await handleDrop(targetIdx);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage your UI/UX design showcases, PDFs, galleries, and layout ordering.</p>
        {!isEditing && (
          <button onClick={() => { resetForm(); setIsEditing(true); }} style={{ padding: "0.8rem 1.5rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            + Add New Design
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: "rgba(22,22,25,0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "2rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "2rem" }}>{currentDesign ? "Edit Design" : "Add New Design"}</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>DESIGN TITLE *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Fintech Mobile Concept" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SUBTITLE / CATEGORY</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Mobile App UI / Figma Design System" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>DESIGN PDF URL (Optional)</label>
                <input type="url" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
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
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Design goal, system components, user flow details..." style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>MAIN DESIGN IMAGE *</label>
              <input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} required={!currentDesign} style={{ color: "#e8eaed" }} />
              {typeof mainImage === 'string' && mainImage && <img src={mainImage.startsWith('images/') ? `/src/${mainImage}` : mainImage} alt="Current" style={{ display: "block", marginTop: "1rem", maxWidth: "220px", borderRadius: "8px" }} />}
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
                {uploading ? "Saving..." : "Save Design"}
              </button>
              <button type="button" onClick={() => { resetForm(); setIsEditing(false); }} style={{ background: "transparent", border: "1px solid #5f6368", color: "#e8eaed", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {loading ? (
            <p>Loading designs...</p>
          ) : designs.length === 0 ? (
            <p>No designs found.</p>
          ) : (
            designs.map((des, idx) => (
              <div 
                key={des.id} 
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
                    <button type="button" onClick={() => moveDesign(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▲</button>
                    <button type="button" onClick={() => moveDesign(idx, 1)} disabled={idx === designs.length - 1} style={{ background: "none", border: "none", color: idx === designs.length - 1 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▼</button>
                  </div>
                </div>

                <div style={{ height: "200px", background: "#202124", backgroundImage: `url(${des.image?.startsWith('images/') ? `/src/${des.image}` : des.image})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.2rem" }}>{des.title}</h3>
                  {des.subtitle && <p style={{ color: "#FF6D29", fontSize: "0.85rem", margin: "0 0 0.8rem 0", fontWeight: "500" }}>{des.subtitle}</p>}
                  
                  <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", gap: "1rem" }}>
                    <button onClick={() => editDesign(des)} style={{ flex: 1, background: "rgba(138, 180, 248, 0.1)", color: "#8ab4f8", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Edit</button>
                    <button onClick={() => handleDelete(des.id)} style={{ flex: 1, background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
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
