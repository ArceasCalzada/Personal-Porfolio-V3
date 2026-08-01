"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Footer() {
  const [footerData, setFooterData] = useState({
    headline: "",
    subtext: "",
    email: "",
    location: "",
    phone: "",
    copyright: "© 2026 ARCEAS JOHN CALZADA. ALL RIGHTS RESERVED. THE PROJECTS SHOWCASED IN THIS PORTFOLIO ARE MY INTELLECTUAL PROPERTY UNLESS OTHERWISE CREDITED.",
    cvLink: "",
    linkedIn: ""
  });
  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const eyes = document.querySelectorAll('.eye');
      
      eyes.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
        const maxDistance = 10; 
        const distance = Math.min(maxDistance, Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 10);
        
        const pupil = eye.querySelector('.pupil');
        if (pupil) {
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          pupil.style.transform = `translate(${tx}px, ${ty}px)`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    async function fetchFooterSettings() {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFooterData((prev) => ({
            ...prev,
            headline: data.footerHeadline || prev.headline,
            subtext: data.footerSubtext || prev.subtext,
            email: data.footerEmail || prev.email,
            location: data.footerLocation || prev.location,
            phone: data.footerPhone || prev.phone,
            copyright: data.footerCopyright || prev.copyright,
            cvLink: data.cvLink || prev.cvLink,
            linkedIn: data.footerLinkedIn || prev.linkedIn,
            showFooterLinkedIn: data.showFooterLinkedIn !== false,
            footerBehance: data.footerBehance || "",
            showFooterBehance: data.showFooterBehance !== false,
            footerDribbble: data.footerDribbble || "",
            showFooterDribbble: data.showFooterDribbble !== false,
            footerTwitter: data.footerTwitter || "",
            showFooterTwitter: data.showFooterTwitter !== false,
            footerInstagram: data.footerInstagram || "",
            showFooterInstagram: data.showFooterInstagram !== false,
          }));
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    }
    fetchFooterSettings();
  }, []);

  return (
    <footer id="contact" className="premium-mesh-footer fade-in">
      <div className="mesh-bg"></div>
      <div className="mesh-footer-content">
        <div className="mesh-footer-top">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mesh-back-to-top" style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit'}}>
            ↑ BACK TO TOP
          </button>
          <div className="mesh-date">{new Date().toISOString().split('T')[0].replace(/-/g, '/')}</div>
        </div>
        
        <div className="mesh-footer-middle footer-extended-grid">
          <div className="footer-left-content">
            <h2 className="mesh-availability" dangerouslySetInnerHTML={{ __html: footerData.headline }}></h2>
            <p className="mesh-looking-for">{footerData.subtext}</p>
            
            <div className="footer-contact-info">
              <p><span>{footerData.location}</span></p>
              <p><span>{footerData.phone}</span></p>
            </div>

            <div className="mesh-big-links" style={{ marginTop: "2rem" }}>
              <a href={`mailto:${footerData.email}`}>EMAIL</a>
            </div>
          </div>
          
          <div className="footer-right-content">
            <div className="footer-sitemap">
              <h4>Sitemap</h4>
              <ul>
                <li><Link href="/#hero">Home</Link></li>
                <li><Link href="/#about">About</Link></li>
                <li><Link href="/#showcase">Showcase</Link></li>
                <li><a href={footerData.cvLink} target="_blank" rel="noopener noreferrer" className="dynCVLink">Resume</a></li>
              </ul>
            </div>
            
            <div className="footer-socials">
              <h4>Socials</h4>
              <ul>
                {footerData.showFooterLinkedIn && footerData.linkedIn && (
                  <li><a href={footerData.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
                )}
                {footerData.showFooterBehance && footerData.footerBehance && (
                  <li><a href={footerData.footerBehance} target="_blank" rel="noopener noreferrer">Behance ↗</a></li>
                )}
                {footerData.showFooterDribbble && footerData.footerDribbble && (
                  <li><a href={footerData.footerDribbble} target="_blank" rel="noopener noreferrer">Dribbble ↗</a></li>
                )}
                {footerData.showFooterTwitter && footerData.footerTwitter && (
                  <li><a href={footerData.footerTwitter} target="_blank" rel="noopener noreferrer">Twitter/X ↗</a></li>
                )}
                {footerData.showFooterInstagram && footerData.footerInstagram && (
                  <li><a href={footerData.footerInstagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a></li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mesh-footer-divider"></div>

        <div className="mesh-footer-bottom">
          <div className="mesh-bottom-left">
            <div className="googly-eyes">
              <div className="eye"><div className="pupil"></div></div>
              <div className="eye"><div className="pupil"></div></div>
            </div>
            <div className="mesh-bottom-links">
              <Link href="/#about">ABOUT</Link>
              <a href={footerData.cvLink} target="_blank" rel="noopener noreferrer">CV</a>
            </div>
            <p className="mesh-copyright" dangerouslySetInnerHTML={{ __html: footerData.copyright }}></p>
          </div>
          <div className="mesh-bottom-right">
            <p>DESIGNED & BUILT BY ARCEAS</p>
            <div className="mesh-plus-icon">+</div>
          </div>
        </div>
      </div>
      <div className="mesh-watermark">
        Designed by Arceas
      </div>
    </footer>
  );
}
