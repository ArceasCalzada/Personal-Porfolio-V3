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

export default function ManageCertificates({ showConfirm, showSuccess }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("3/4");
  const [certDate, setCertDate] = useState("");
  const [certCredentialId, setCertCredentialId] = useState("");
  const [mainImage, setMainImage] = useState(null);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "certificates"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));
      setCertificates(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load certificates.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let mainImageUrl = mainImage;
      if (mainImage instanceof File) {
        mainImageUrl = await handleUploadImage(mainImage);
      }

      const certData = {
        title,
        subtitle,
        issuedBy: subtitle,
        description,
        aspectRatio,
        certDate,
        certCredentialId,
        image: mainImageUrl,
        updatedAt: new Date().toISOString()
      };

      if (currentCert && currentCert.id) {
        await updateDoc(doc(db, "certificates", currentCert.id), certData);
      } else {
        certData.createdAt = new Date().toISOString();
        certData.order = certificates.length + 1;
        await addDoc(collection(db, "certificates"), certData);
      }

      setIsEditing(false);
      resetForm();
      if (showSuccess) {
        showSuccess("Certificate saved successfully! 🎉");
      } else {
        alert("Saved successfully!");
      }
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert("Error saving certificate: " + err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (showConfirm) {
      showConfirm("Are you sure you want to delete this certificate? This action cannot be undone.", async () => {
        try {
          await deleteDoc(doc(db, "certificates", id));
          fetchCertificates();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      });
    } else {
      if (confirm("Are you sure you want to delete this certificate?")) {
        try {
          await deleteDoc(doc(db, "certificates", id));
          fetchCertificates();
        } catch (err) {
          console.error(err);
          alert("Failed to delete.");
        }
      }
    }
  };

  const editCert = (cert) => {
    setCurrentCert(cert);
    setTitle(cert.title || "");
    setSubtitle(cert.subtitle || cert.issuedBy || "");
    setDescription(cert.description || "");
    setAspectRatio(cert.aspectRatio || "3/4");
    setCertDate(cert.certDate || "");
    setCertCredentialId(cert.certCredentialId || "");
    setMainImage(cert.image || null);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentCert(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setAspectRatio("3/4");
    setCertDate("");
    setCertCredentialId("");
    setMainImage(null);
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
    const reordered = [...certificates];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIdx, 0, movedItem);
    
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCertificates(updated);
    setDraggedIndex(null);

    try {
      await Promise.all(
        updated.map(item => updateDoc(doc(db, "certificates", item.id), { order: item.order }))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const moveCert = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= certificates.length) return;
    handleDragStart(idx);
    await handleDrop(targetIdx);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage your licenses, credentials, certificates, and display ordering.</p>
        {!isEditing && (
          <button onClick={() => { resetForm(); setIsEditing(true); }} style={{ padding: "0.8rem 1.5rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            + Add New Certificate
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: "rgba(22,22,25,0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "2rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "2rem" }}>{currentCert ? "Edit Certificate" : "Add New Certificate"}</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CERTIFICATE TITLE *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. AWS Certified Solutions Architect" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>ISSUED BY (SUBTITLE) *</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} required placeholder="e.g. Amazon Web Services / Google" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>ISSUED DATE</label>
                <input type="text" value={certDate} onChange={e => setCertDate(e.target.value)} placeholder="e.g. Feb 2024" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CREDENTIAL ID / URL</label>
                <input type="text" value={certCredentialId} onChange={e => setCertCredentialId(e.target.value)} placeholder="e.g. 3c03c349-b8fe... or URL" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>IMAGE ASPECT RATIO</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} required style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }}>
                  <option value="3/4">Tall Portrait (3/4)</option>
                  <option value="1/1">Square (1/1)</option>
                  <option value="4/3">Wide Landscape (4/3)</option>
                  <option value="16/9">Ultra Wide (16/9)</option>
                  <option value="210/297">A4 Size (Portrait)</option>
                  <option value="297/210">A4 Size (Landscape)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SKILLS / TAGS / DESCRIPTION</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Cloud Architecture, Security, DevOps" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CERTIFICATE IMAGE *</label>
              <input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} required={!currentCert} style={{ color: "#e8eaed" }} />
              {typeof mainImage === 'string' && mainImage && <img src={mainImage.startsWith('images/') ? `/src/${mainImage}` : mainImage} alt="Current" style={{ display: "block", marginTop: "1rem", maxWidth: "220px", borderRadius: "8px" }} />}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={uploading} style={{ background: "#FF6D29", color: "#fff", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: uploading ? "not-allowed" : "pointer" }}>
                {uploading ? "Saving..." : "Save Certificate"}
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
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p>No certificates found.</p>
          ) : (
            certificates.map((cert, idx) => (
              <div 
                key={cert.id} 
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
                    <button type="button" onClick={() => moveCert(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▲</button>
                    <button type="button" onClick={() => moveCert(idx, 1)} disabled={idx === certificates.length - 1} style={{ background: "none", border: "none", color: idx === certificates.length - 1 ? "#444" : "#9aa0a6", cursor: "pointer", fontSize: "0.8rem" }}>▼</button>
                  </div>
                </div>

                <div style={{ height: "200px", background: "#202124", backgroundImage: `url(${cert.image?.startsWith('images/') ? `/src/${cert.image}` : cert.image})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.2rem" }}>{cert.title}</h3>
                  <p style={{ color: "#FF6D29", margin: "0 0 0.8rem 0", fontSize: "0.85rem", fontWeight: "500" }}>{cert.issuedBy || cert.subtitle}</p>
                  {cert.certDate && <p style={{ color: "#9aa0a6", margin: "0 0 1rem 0", fontSize: "0.8rem" }}>Issued: {cert.certDate}</p>}
                  
                  <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", gap: "1rem" }}>
                    <button onClick={() => editCert(cert)} style={{ flex: 1, background: "rgba(138, 180, 248, 0.1)", color: "#8ab4f8", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Edit</button>
                    <button onClick={() => handleDelete(cert.id)} style={{ flex: 1, background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", border: "none", padding: "0.6rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
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
