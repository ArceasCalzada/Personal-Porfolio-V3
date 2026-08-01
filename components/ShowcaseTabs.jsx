"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState({ left: [], right: [] });
  const [designs, setDesigns] = useState({ left: [], right: [] });
  const [certificates, setCertificates] = useState([]);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    async function fetchStaggered(collectionName) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const items = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999999;
          const orderB = b.order !== undefined ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return (a.timestamp || 0) - (b.timestamp || 0);
        });

        const left = [];
        const right = [];
        items.forEach((item, index) => {
          if (index % 2 === 0) left.push(item);
          else right.push(item);
        });

        if (collectionName === "projects") setProjects({ left, right });
        if (collectionName === "designs") setDesigns({ left, right });
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      }
    }

    async function fetchCertificates() {
      try {
        const snapshot = await getDocs(collection(db, "certificates"));
        const items = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => (a.order || 999999) - (b.order || 999999));
        setCertificates(items);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    }

    fetchStaggered("projects");
    fetchStaggered("designs");
    fetchCertificates();
  }, []);

  const openViewer = (images) => {
    setViewerImages(images);
    setViewerIndex(0);
    setIsViewerOpen(true);
  };

  const StaggeredColumn = ({ items, type, isOffset }) => (
    <div className={`stagger-col ${isOffset ? "offset-down" : ""}`}>
      {items.map((item) => {
        let shortDesc = item.description || "";
        if (shortDesc.length > 120) shortDesc = shortDesc.substring(0, 120) + "...";
        const imgSrc = item.image?.startsWith("images/") ? `/src/${item.image}` : (item.image || "/src/images/Cover.png");
        
        let linkContent;
        if (type === "designs") {
          if (item.pdfUrl) {
            linkContent = (
              <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="stagger-img-link" style={{ aspectRatio: item.aspectRatio || "1/1" }}>
                <img src={imgSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="hover-overlay"><span>View Design ↗</span></div>
              </a>
            );
          } else {
            const allImages = [imgSrc, ...(item.galleryImages || [])];
            linkContent = (
              <div onClick={() => openViewer(allImages)} className="stagger-img-link" style={{ aspectRatio: item.aspectRatio || "1/1", cursor: "pointer" }}>
                <img src={imgSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="hover-overlay"><span>View Design ↗</span></div>
              </div>
            );
          }
        } else {
          linkContent = (
            <Link href={`/projects/${item.id}?collection=projects`} className="stagger-img-link" style={{ aspectRatio: item.aspectRatio || "1/1" }}>
              <img src={imgSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="hover-overlay"><span>View Project ↗</span></div>
            </Link>
          );
        }

        return (
          <motion.div key={item.id} className="stagger-card fade-in visible" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ borderRadius: "8px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", marginBottom: "2rem" }}>
              {linkContent}
            </div>
            <h3>{item.title}</h3>
            <p className="subtitle">{item.subtitle}</p>
            <p className="desc">{shortDesc}</p>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section id="showcase" className="showcase fade-in visible" data-bg-dark="#11161a" data-bg-light="#f0f5fa">
      <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "3rem" }}>Showcase</h2>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>Projects</button>
          <button className={`tab-btn ${activeTab === "designs" ? "active" : ""}`} onClick={() => setActiveTab("designs")}>Design</button>
          <button className={`tab-btn ${activeTab === "certificates" ? "active" : ""}`} onClick={() => setActiveTab("certificates")}>Certificates</button>
        </div>

        <div className="tabs-content">
          {activeTab === "projects" && (
            <div className="tab-pane active fade-in visible">
              <div className="editorial-stagger-grid">
                <StaggeredColumn items={projects.left} type="projects" />
                <StaggeredColumn items={projects.right} type="projects" isOffset={true} />
              </div>
            </div>
          )}

          {activeTab === "designs" && (
            <div className="tab-pane active fade-in visible">
              <div className="editorial-stagger-grid">
                <StaggeredColumn items={designs.left} type="designs" />
                <StaggeredColumn items={designs.right} type="designs" isOffset={true} />
              </div>
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="tab-pane active fade-in visible">
              <div className="showcase-grid">
                {certificates.map((cert) => {
                  const imgSrc = cert.image?.startsWith("images/") ? `/src/${cert.image}` : (cert.image || "/src/images/Cover.png");
                  return (
                    <motion.div key={cert.id} className="showcase-item" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                      <div className="showcase-img-wrap" style={{ aspectRatio: cert.aspectRatio === "portrait" || cert.aspectRatio === "3/4" || cert.aspectRatio === "210/297" ? "3/4" : "4/3" }}>
                        <img src={imgSrc} alt={cert.title} />
                        <div className="showcase-overlay">
                          {cert.certCredentialId ? (
                            <a href={`https://www.credly.com/badges/${cert.certCredentialId}/public_url`} target="_blank" rel="noopener noreferrer" className="view-btn">Verify Credential ↗</a>
                          ) : (
                            <button className="view-btn" onClick={() => openViewer([imgSrc])} style={{ background: "var(--color-orange)", border: "none", cursor: "pointer" }}>Zoom In 🔍</button>
                          )}
                        </div>
                      </div>
                      <div className="showcase-info">
                        <h3>{cert.title}</h3>
                        <p>{cert.subtitle || cert.issuedBy} {cert.certDate ? `· ${cert.certDate}` : ""}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isViewerOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }} onClick={() => setIsViewerOpen(false)}>
          <span style={{ position: "absolute", top: "20px", right: "30px", color: "#fff", fontSize: "2.5rem", fontWeight: "bold", cursor: "pointer", zIndex: 2001 }}>&times;</span>
          {viewerImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setViewerIndex((prev) => (prev === 0 ? viewerImages.length - 1 : prev - 1)); }} style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: "2rem", padding: "1rem", cursor: "pointer", borderRadius: "50%", zIndex: 2001 }}>&#10094;</button>
          )}
          <img src={viewerImages[viewerIndex]} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", objectFit: "contain" }} onClick={(e) => e.stopPropagation()} />
          {viewerImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setViewerIndex((prev) => (prev + 1) % viewerImages.length); }} style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: "2rem", padding: "1rem", cursor: "pointer", borderRadius: "50%", zIndex: 2001 }}>&#10095;</button>
          )}
        </div>
      )}
    </section>
  );
}
