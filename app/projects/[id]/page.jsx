import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetails({ params, searchParams }) {
  // In Next.js 15, params and searchParams are promises.
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const projectId = resolvedParams.id;
  const collectionName = resolvedSearchParams.collection || "projects";

  let project = null;

  try {
    const docRef = doc(db, collectionName, projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      project = { id: docSnap.id, ...docSnap.data() };
    } else {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    return notFound();
  }

  return (
    <>
      <div className="noise-overlay"></div>
      
      <Navbar />

      <main className="content-wrapper" style={{ paddingTop: "150px", minHeight: "80vh" }}>
        <section id="project-detail" className="about fade-in visible" data-bg-dark="#11161a" data-bg-light="#f0f5fa">
          <div className="project-detail-content" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 5%" }}>
            <div style={{ marginBottom: "2rem" }}>
              <Link href="/#showcase" className="btn btn-secondary" style={{ fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}>
                ← Back to Showcase
              </Link>
            </div>
            
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1rem", lineHeight: 1.1 }}>
              {project.title || "Untitled"}
            </h1>
            
            {project.subtitle && (
              <p style={{ fontSize: "1.2rem", color: "var(--color-orange)", marginBottom: "3rem", fontWeight: 500 }}>
                {project.subtitle}
              </p>
            )}

            {project.image && (
              <div className="project-hero-image" style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginBottom: "4rem", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", background: "#000" }}>
                <img src={project.image.startsWith("images/") ? `/src/${project.image}` : project.image} alt={project.title} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}

            <div className="project-info-grid">
              <div className="project-description" style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {project.description}
              </div>

              <div className="project-meta" style={{ position: "sticky", top: "120px", alignSelf: "start" }}>
                {project.role && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Role</h4>
                    <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>{project.role}</p>
                  </div>
                )}
                
                {project.timeline && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Timeline</h4>
                    <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>{project.timeline}</p>
                  </div>
                )}
                
                {project.technologies && (
                  <div>
                    <h4 style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Technologies</h4>
                    <div className="skill-tags" style={{ marginTop: "1rem" }}>
                      {project.technologies.split(',').map((tech, i) => (
                        <span key={i}>{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {project.videoUrl && (
              <div className="project-media-section" style={{ marginTop: "6rem", marginBottom: "8rem" }}>
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                  <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Project Demo</h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto" }}>
                    Watch the project in action.
                  </p>
                </div>
                <div style={{ width: "100%", borderRadius: "24px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", background: "#000", border: "1px solid var(--glass-border)" }}>
                  <video controls muted loop playsInline style={{ width: "100%", display: "block", background: "#000" }}>
                    <source src={project.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {project.awardsImage && (
              <div className="project-awards-section" style={{ marginBottom: "8rem" }}>
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                  <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Awards & Recognition</h2>
                </div>
                <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", borderRadius: "24px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", border: "1px solid var(--glass-border)" }}>
                  <img src={project.awardsImage} alt="Awards" style={{ width: "100%", display: "block" }} />
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "6rem", marginBottom: "4rem" }}>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Ready to see more?</h2>
              <Link href="/#showcase" className="btn btn-primary" style={{ marginRight: "1rem" }}>Back to Showcase</Link>
              <Link href="/#contact" className="btn btn-secondary">Contact Me</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
