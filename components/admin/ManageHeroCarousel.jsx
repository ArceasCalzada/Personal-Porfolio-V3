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

export default function ManageHeroCarousel({ showConfirm, showSuccess }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Form State
  const [mainImage, setMainImage] = useState(null); // File object or URL string

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "hero_carousel"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.order || 99) - (b.order || 99));
      setSlides(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load hero carousel slides.");
    }
    setLoading(false);
  };

  const handleUploadImage = async (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    
    // Compress the image to a smaller size for Base64 database storage
    const compressed = await compressImage(file, 1200, 800, 0.75);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressed);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainImage) {
      alert("Please select or drop an image first.");
      return;
    }
    setUploading(true);

    try {
      let mainImageUrl = mainImage;
      if (mainImage instanceof File) {
        mainImageUrl = await handleUploadImage(mainImage, 'hero_carousel');
      }

      const slideData = {
        image: mainImageUrl,
        updatedAt: new Date().toISOString()
      };

      slideData.createdAt = new Date().toISOString();
      slideData.order = slides.length + 1;
      await addDoc(collection(db, "hero_carousel"), slideData);

      setIsEditing(false);
      resetForm();
      if (showSuccess) {
        showSuccess("Hero carousel slide saved successfully! 🎉");
      } else {
        alert("Saved successfully!");
      }
      fetchSlides();
    } catch (err) {
      console.error(err);
      alert("Error saving slide.");
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (showConfirm) {
      showConfirm("Are you sure you want to delete this slide? This action cannot be undone.", async () => {
        try {
          await deleteDoc(doc(db, "hero_carousel", id));
          fetchSlides();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      });
    } else {
      if (confirm("Are you sure you want to delete this slide?")) {
        try {
          await deleteDoc(doc(db, "hero_carousel", id));
          fetchSlides();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...slides];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    // Optimistically update state
    setSlides(list);
    setDraggedIndex(null);

    // Save ordering to Firestore
    try {
      for (let i = 0; i < list.length; i++) {
        await updateDoc(doc(db, "hero_carousel", list[i].id), { order: i + 1 });
      }
    } catch (err) {
      console.error("Error updating slide orders:", err);
      alert("Failed to save slide order.");
      fetchSlides();
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const resetForm = () => {
    setMainImage(null);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage the images that appear in the home page hero carousel.</p>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ padding: "0.8rem 1.5rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            + Add New Slide
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: "rgba(22,22,25,0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h3 style={{ marginTop: 0, marginBottom: "2rem" }}>Add New Slide</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.8rem", color: "#9aa0a6", fontSize: "0.85rem", fontWeight: "bold" }}>SLIDE IMAGE (1920x1080 recommended)</label>
              
              <div 
                style={{ border: "2px dashed #5f6368", borderRadius: "8px", padding: "2rem", textAlign: "center", background: "rgba(255,255,255,0.02)", cursor: "pointer", marginBottom: "1rem" }}
                onClick={() => document.getElementById("fileInput").click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setMainImage(e.dataTransfer.files[0]);
                  }
                }}
              >
                <p style={{ margin: 0, color: "#9aa0a6", fontSize: "0.95rem" }}>Drag & drop an image here, or click to select</p>
                <input 
                  type="file" 
                  id="fileInput" 
                  accept="image/*" 
                  onChange={e => setMainImage(e.target.files[0])} 
                  style={{ display: "none" }} 
                />
              </div>

              {mainImage && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <img 
                    src={mainImage instanceof File ? URL.createObjectURL(mainImage) : (mainImage.startsWith('images/') ? `/src/${mainImage}` : mainImage)} 
                    alt="Preview" 
                    style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", border: "1px dashed #5f6368", padding: "5px" }} 
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={uploading} style={{ flex: 1, background: "#FF6D29", color: "#fff", border: "none", padding: "1rem", borderRadius: "8px", fontWeight: "bold", cursor: uploading ? "not-allowed" : "pointer" }}>
                {uploading ? "Saving..." : "Save Slide"}
              </button>
              <button type="button" onClick={() => { resetForm(); setIsEditing(false); }} style={{ flex: 1, background: "transparent", border: "1px solid #5f6368", color: "#e8eaed", padding: "1rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {loading ? (
            <p>Loading slides...</p>
          ) : slides.length === 0 ? (
            <p>No slides found.</p>
          ) : (
            slides.map((slide, index) => (
              <div 
                key={slide.id} 
                draggable={true}
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{ 
                  background: "rgba(30,30,35,0.6)", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.05)", 
                  overflow: "hidden", 
                  display: "flex", 
                  flexDirection: "column",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "grab",
                  opacity: draggedIndex === index ? 0.4 : 1,
                  transition: "opacity 0.2s ease"
                }}
              >
                <div style={{ cursor: "grab", marginBottom: "0.8rem", color: "#5f6368", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "4px" }}>
                  ⋮⋮ Drag to reorder
                </div>
                
                <div style={{ height: "180px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img 
                    src={slide.image?.startsWith('images/') ? `/src/${slide.image}` : slide.image} 
                    alt="Slide Image" 
                    draggable={false}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                  />
                </div>

                <div style={{ marginTop: "auto" }}>
                  <button onClick={() => handleDelete(slide.id)} style={{ width: "100%", background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
