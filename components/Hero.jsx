"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Hero() {
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    cvLink: "",
    linkedIn: "",
    email: ""
  });

  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHeroData({
            title: data.heroTitle || "",
            subtitle: data.heroSub1 || "",
            cvLink: data.cvLink || "",
            linkedIn: data.footerLinkedIn || "",
            email: data.footerEmail || "",
          });
        }
      } catch (error) {
        console.error("Error fetching hero settings:", error);
      }
    }

    async function fetchCarousel() {
      try {
        const snapshot = await getDocs(collection(db, "hero_carousel"));
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          items.sort((a, b) => (a.order || 99) - (b.order || 99));
          const fetchedImgs = items.map(item => item.image).filter(Boolean);
          if (fetchedImgs.length > 0) {
            setCarouselImages(fetchedImgs);
          }
        }
      } catch (error) {
        console.error("Error fetching carousel:", error);
      }
    }

    fetchHeroSettings();
    fetchCarousel();
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

  return (
    <section id="hero" className="hero fade-in visible">
      <div className="hero-content">
        <motion.div
          className="hero-text-column"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">{heroData.title}</h1>
          <p className="hero-subtitle">{heroData.subtitle}</p>
          <div className="hero-actions-minimal">
            <a href={heroData.cvLink} target="_blank" rel="noopener noreferrer" className="minimal-link">
              CV <span className="link-arrow">↗</span>
            </a>
            <a href={heroData.linkedIn} target="_blank" rel="noopener noreferrer" className="minimal-link">
              LinkedIn <span className="link-arrow">↗</span>
            </a>
            <a href={`mailto:${heroData.email}`} className="minimal-link">
              {heroData.email} <span className="link-arrow">↗</span>
            </a>
          </div>
        </motion.div>
        <motion.div
          className="hero-image-column"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
            <div className="stacked-carousel" onClick={handleCarouselClick} style={{ cursor: "pointer" }}>
              {carouselImages.map((img, idx) => (
                <img 
                  key={idx} 
                  src={getImgSrc(img)} 
                  alt="Carousel Image" 
                  className={`stack-${idx + 1}`} 
                />
              ))}
            </div>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "100%", height: "100%", background: "var(--color-orange)",
              borderRadius: "50%", zIndex: -1, filter: "blur(80px)", opacity: 0.15, pointerEvents: "none"
            }}></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
