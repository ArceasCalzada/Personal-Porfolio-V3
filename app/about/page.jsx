"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const [data, setData] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openViewer = (images) => {
    setViewerImages(images);
    setViewerIndex(0);
    setIsViewerOpen(true);
  };

  const parseJSON = (str, fallback) => {
    try {
      if (!str) return fallback;
      // Pre-process common typos like "." instead of ":" in key-value pairs
      let cleaned = str.replace(/"\s*\.\s*"/g, '":"').replace(/"\s*\.\s*/g, '":');
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON string:", str, e);
      try {
        return JSON.parse(str);
      } catch (e2) {
        return fallback;
      }
    }
  };

  const normalizeExperience = (exp) => {
    return {
      company: exp.company || exp.Company || "",
      date: exp.date || exp.April || exp.Date || "",
      role: exp.role || exp["UI/UX"] || exp.Role || "",
      desc: exp.desc || exp.Desc || exp.description || ""
    };
  };

  const normalizeEducation = (edu) => {
    return {
      year: edu.year || edu.Year || "",
      degree: edu.degree || edu.Degree || "",
      school: edu.school || edu.School || ""
    };
  };

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
    'mysql': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    'java': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    'python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'next.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
    'nextjs': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg'
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }

        const heroSnap = await getDocs(collection(db, "hero_carousel"));
        if (!heroSnap.empty) {
          const images = [];
          heroSnap.forEach(d => images.push({ id: d.id, ...d.data() }));
          images.sort((a, b) => (a.order || 99) - (b.order || 99));
          const validImgs = images.map(img => img.image).filter(Boolean);
          if (validImgs.length > 0) {
            setCarouselImages(validImgs);
          }
        }

        const certSnap = await getDocs(collection(db, "certificates"));
        const certs = [];
        certSnap.forEach(d => certs.push({ id: d.id, ...d.data() }));
        certs.sort((a, b) => (a.order || 99) - (b.order || 99));
        setCertificates(certs);
      } catch (error) {
        console.error("Error fetching about page data:", error);
      }
    }
    fetchData();
  }, []);

  const handleCarouselClick = () => {
    if (carouselImages.length === 0) return;
    setCarouselImages((prev) => {
      const newImages = [...prev];
      const last = newImages.pop();
      newImages.unshift(last);
      return newImages;
    });
  };

  const getImgSrc = (src) => {
    if (!src) return "/src/images/Img_1.JPG";
    if (src.startsWith("data:") || src.startsWith("http")) return src;
    return src.startsWith("images/") ? `/src/${src}` : src;
  };

  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <>
      <div className="noise-overlay"></div>
      <Navbar />

      <main className="content-wrapper" style={{ paddingTop: "150px", minHeight: "80vh" }}>
        <section id="about-extended" className="about fade-in visible" data-bg-dark="#1a1412" data-bg-light="#fff5f0">
          <div className="about-content" style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 8%" }}>
            
            <div className="editorial-layout-row" style={{ paddingTop: "2rem" }}>
              <div className="editorial-layout-left">
                <h2>About</h2>
              </div>
              <div className="editorial-layout-right">
                <h1 className="editorial-text-intro" style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, lineHeight: 1.2 }}>
                  {data?.aboutPageHeadline || "Designing intuitive products & building modern web applications."}
                </h1>
                <p className="editorial-text-subtitle" style={{ fontSize: "1.1rem", color: "var(--color-text-muted)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
                  {data?.aboutPageSubtitle || "BS Information Technology Graduate from the University of Mindanao."}
                </p>
                
                <div className="editorial-text-body" style={{ marginBottom: "3.5rem", fontSize: "1.15rem", lineHeight: 1.8, color: "var(--color-text)", whiteSpace: "pre-wrap" }}>
                  {data?.aboutPageBio || "I am a BS Information Technology Graduate from the University of Mindanao. I'm a motivated and detail-oriented aspiring professional deeply passionate about UI/UX design and front-end development, constantly striving to craft seamless and visually stunning digital experiences.\n\nMy experience spans UI/UX design, front-end development, mobile application development, and digital content creation. I recently joined Jairosoft's Digital Marketing Team, contributing to visual design and branding initiatives."}
                </div>
                
                <div style={{ marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "0.8rem", color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <strong style={{ width: "100px", color: "var(--color-text-muted)", fontWeight: 500 }}>Currently</strong> 
                    <span style={{ color: "var(--color-text)" }}>{data?.aboutPageCurrently || "UI/UX Designer & Front-End Developer"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <strong style={{ width: "100px", color: "var(--color-text-muted)", fontWeight: 500 }}>Available</strong> 
                    <span style={{ color: "var(--color-text)" }}>{data?.aboutPageAvailable || "Open for Full-Time Roles & Freelance Projects"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", marginBottom: "4rem" }}>
                  <a href={data.cvLink || "/assets/docs/CV_ArceasJohnCalzada.pdf"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>CV <span>↗</span></a>
                  <a href={data.footerLinkedIn || "https://www.linkedin.com/"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>LinkedIn <span>↗</span></a>
                  <a href={`mailto:${data.footerEmail || "calzada.arceas@gmail.com"}`} style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem" }}>{data.footerEmail || "calzada.arceas@gmail.com"}</a>
                </div>
                
                <div style={{ position: "relative", width: "100%", borderRadius: "16px", overflow: "hidden", marginBottom: "3rem" }}>
                  <div className="stacked-carousel" onClick={handleCarouselClick} style={{ position: "relative", zIndex: 2, width: "100%", aspectRatio: "3/4", maxWidth: "500px", margin: "0 auto", cursor: "pointer" }}>
                    {carouselImages.map((img, idx) => (
                      <img key={idx} src={getImgSrc(img)} alt="Profile" className={`stack-${idx + 1}`} />
                    ))}
                  </div>
                </div>
                
                <div style={{ width: "100%", maxWidth: "420px", background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--glass-border)", backdropFilter: "blur(10px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                    <span style={{ width: "8px", height: "8px", backgroundColor: "#1DB954", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 10px rgba(29, 185, 84, 0.6)" }}></span>
                    <h3 style={{ fontSize: "0.9rem", margin: 0, color: "var(--color-text)", fontWeight: 500 }}>Currently listening to</h3>
                  </div>
                  <iframe 
                    style={{ borderRadius: "12px" }} 
                    src={(() => {
                      const url = data?.spotifyUrl;
                      if (!url) return "https://open.spotify.com/embed/track/60a0Rd6pjrkxjPbaKzXjfq?utm_source=generator&theme=0";
                      if (url.includes("/embed/")) return url;
                      const match = url.match(/track\/([a-zA-Z0-9]+)/);
                      if (match && match[1]) {
                        return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
                      }
                      return url;
                    })()} 
                    width="100%" 
                    height="80" 
                    frameBorder="0" 
                    allowFullScreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--glass-border)", width: "100%", margin: "5rem 0" }}></div>

            <div className="editorial-layout-row">
              <div className="editorial-layout-left">
                <h2>Experience</h2>
              </div>
              <div className="editorial-layout-right">
                <div className="editorial-exp-list">
                  {parseJSON(data.aboutPageExperience, []).map((rawExp, i) => {
                    const exp = normalizeExperience(rawExp);
                    return (
                      <motion.div key={i} className="editorial-exp-row fade-in visible" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="editorial-exp-date">{exp.date}</div>
                        <div className="editorial-exp-role">
                          <strong>{exp.role}</strong> {exp.company && `— ${exp.company}`}
                        </div>
                        <div className="editorial-exp-location">{exp.desc}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div style={{ height: "1px", background: "var(--glass-border)", width: "100%", margin: "5rem 0" }}></div>

            <div className="editorial-layout-row">
              <div className="editorial-layout-left">
                <h2>Education</h2>
              </div>
              <div className="editorial-layout-right">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "3rem", alignItems: "start" }}>
                  {parseJSON(data.aboutPageEducation, []).map((rawEdu, i) => {
                    const edu = normalizeEducation(rawEdu);
                    return (
                      <motion.div key={i} className="fade-in visible" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h3 style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 1.5rem 0", color: "var(--color-text)", lineHeight: 1.1 }}>{edu.school}</h3>
                        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text)", margin: "0 0 0.2rem 0" }}>{edu.year}</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: edu.degree.replace(/\\n/g, '<br>').replace(/\n/g, '<br>') }}></p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div style={{ height: "1px", background: "var(--glass-border)", width: "100%", margin: "5rem 0" }}></div>
            
            <div className="editorial-layout-row">
              <div className="editorial-layout-left">
                <h2>Licenses & certifications</h2>
              </div>
              <div className="editorial-layout-right">
                <div className="editorial-exp-list">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="editorial-exp-row" style={{ alignItems: "flex-start", marginBottom: "2rem" }}>
                      <div className="editorial-exp-date" style={{ width: "150px" }}>
                        <img 
                          src={getImgSrc(cert.image)} 
                          alt={cert.title} 
                          className="cert-img" 
                          onClick={() => openViewer([getImgSrc(cert.image)])}
                          style={{ width: "100%", borderRadius: "8px", border: "1px solid var(--glass-border)", cursor: "zoom-in", transition: "transform 0.2s ease" }} 
                        />
                      </div>
                      <div className="editorial-exp-role">
                        <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.25rem" }}>{cert.title}</h3>
                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                          {cert.subtitle || cert.issuedBy} {cert.certDate ? `· Issued: ${cert.certDate}` : ""}
                        </p>
                        {cert.certCredentialId && (
                          <>
                            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Credential ID: {cert.certCredentialId}</p>
                            <a href={`https://www.credly.com/badges/${cert.certCredentialId}/public_url`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem", color: "var(--color-text)", textDecoration: "none", fontWeight: 500 }}>Verify Credential ↗</a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ height: "1px", background: "var(--glass-border)", width: "100%", margin: "5rem 0" }}></div>
            
            <div className="editorial-layout-row">
              <div className="editorial-layout-left">
                <h2>Skills</h2>
              </div>
              <div className="editorial-layout-right">
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", margin: "0 0 1rem 0", fontWeight: 500 }}>Competencies</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                      {data.aboutPageSkillsDesign?.map((skill, i) => (
                        <span key={i} className="editorial-skill">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", margin: "0 0 1rem 0", fontWeight: 500 }}>Tools</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                      {data.aboutPageSkillsDev?.map((skill, i) => {
                        const iconUrl = devicons[skill.toLowerCase()];
                        return (
                          <span key={i} className="editorial-skill">
                            {iconUrl && <img src={iconUrl} alt={skill} style={{ width: "16px", height: "16px", objectFit: "contain" }} />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: "6rem", textAlign: "center" }}>
              <Link href="/" className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>← Back to Portfolio</Link>
            </div>
          </div>
        </section>
      </main>

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

      <Footer />
    </>
  );
}
