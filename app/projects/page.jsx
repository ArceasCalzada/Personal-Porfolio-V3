"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

function ProjectContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") || "default";
  const collectionName = searchParams.get("collection") || "projects";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId || projectId === "default") {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, collectionName, projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId, collectionName]);

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: "1rem" }}>
        <h2>Project not found</h2>
        <Link href="/#showcase" className="btn btn-secondary">← Back to Showcase</Link>
      </div>
    );
  }

  const heroImg = project.image?.startsWith("images/") ? `/src/${project.image}` : project.image;

  return (
    <section id="project-detail" className="about fade-in visible" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 5%" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/#showcase" className="btn btn-secondary" style={{ fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}>
          ← Back to Showcase
        </Link>
      </div>
      
      <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1rem", lineHeight: 1.1, color: "#fff" }}>
        {project.title || "Untitled"}
      </h1>
      
      {project.subtitle && (
        <p style={{ fontSize: "1.2rem", color: "var(--color-orange)", marginBottom: "3rem", fontWeight: 500 }}>
          {project.subtitle}
        </p>
      )}

      {project.videoUrl ? (
        <div style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginBottom: "4rem", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", background: "#000" }}>
          <video src={project.videoUrl} controls autoPlay muted loop style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      ) : heroImg ? (
        <div style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginBottom: "4rem", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", background: "#000" }}>
          <img src={heroImg} alt={project.title} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", marginBottom: "3rem", border: "1px solid rgba(255,255,255,0.08)" }}>
        {project.role && (
          <div>
            <strong style={{ color: "#9aa0a6", fontSize: "0.85rem", textTransform: "uppercase", display: "block" }}>Role</strong>
            <span style={{ color: "#fff", fontSize: "1.05rem" }}>{project.role}</span>
          </div>
        )}
        {project.timeline && (
          <div>
            <strong style={{ color: "#9aa0a6", fontSize: "0.85rem", textTransform: "uppercase", display: "block" }}>Timeline</strong>
            <span style={{ color: "#fff", fontSize: "1.05rem" }}>{project.timeline}</span>
          </div>
        )}
        {project.technologies && (
          <div>
            <strong style={{ color: "#9aa0a6", fontSize: "0.85rem", textTransform: "uppercase", display: "block" }}>Technologies</strong>
            <span style={{ color: "#fff", fontSize: "1.05rem" }}>{project.technologies}</span>
          </div>
        )}
      </div>

      {project.description && (
        <div style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#e8eaed", whiteSpace: "pre-wrap", marginBottom: "4rem" }}>
          {project.description}
        </div>
      )}
    </section>
  );
}

export default function ProjectPage() {
  return (
    <>
      <div className="noise-overlay"></div>
      <Navbar />
      <main className="content-wrapper" style={{ paddingTop: "150px", minHeight: "80vh" }}>
        <Suspense fallback={<div style={{ minHeight: "80vh", color: "#fff", textAlign: "center", paddingTop: "5rem" }}>Loading...</div>}>
          <ProjectContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
