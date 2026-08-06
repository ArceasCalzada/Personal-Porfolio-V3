"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // Need this to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [cvLink, setCvLink] = useState("/assets/docs/CV_ArceasJohnCalzada.pdf");

  useEffect(() => {
    setMounted(true);
    
    // Check initial theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== "dark") {
      document.body.classList.add("light-mode");
      setIsLightMode(true);
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(doc(db, "settings", "general"));
        if (docSnap.exists() && docSnap.data().cvLink) {
          setCvLink(docSnap.data().cvLink);
        }
      } catch (err) {
        console.error("Failed to load CV link for navbar", err);
      }
    };

    fetchSettings();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    
    if (newMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!mounted) return null;

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <Link href="/" className="nav-brand" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
        <svg width="20" height="20" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
          <path d="M 140 380 L 256 130 L 372 380" stroke="currentColor" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 190 280 L 322 280" stroke="currentColor" strokeWidth="56" strokeLinecap="round" />
        </svg>
        <span className="brand-text" style={{ textTransform: "none", color: "var(--color-text-light)" }}>Arceas John Calzada</span>
      </Link>
      <div className="nav-links">
        <div className="nav-indicator"></div>
        <Link href="/#hero">Home</Link>
        <Link href="/#about">About</Link>
        <Link href="/#showcase">Showcase</Link>
        <Link href="/#contact">Contact</Link>
      </div>
      <div className="nav-actions">
        <a
          href={cvLink}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-cv-btn dynCVLink"
          style={{
            padding: "0.4rem 1.2rem",
            borderRadius: "20px",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            color: "var(--color-bg)",
            background: "var(--color-text-light)",
            transition: "all 0.3s ease",
            marginRight: "0.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          CV <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>↗</span>
        </a>
        <button
          id="theme-toggle"
          className="theme-toggle-btn"
          aria-label="Toggle Theme"
          onClick={toggleTheme}
        >
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </nav>
  );
}
