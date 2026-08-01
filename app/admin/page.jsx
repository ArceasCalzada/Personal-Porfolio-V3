"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import ManageProjects from "@/components/admin/ManageProjects";
import ManageSettings from "@/components/admin/ManageSettings";
import ManageDesigns from "@/components/admin/ManageDesigns";
import ManageCertificates from "@/components/admin/ManageCertificates";
import ManageHeroCarousel from "@/components/admin/ManageHeroCarousel";
import ManageMessages from "@/components/admin/ManageMessages";
import ManageAnalytics from "@/components/admin/ManageAnalytics";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  
  // Dashboard stats
  const [stats, setStats] = useState({
    projects: 0,
    designs: 0,
    certificates: 0,
    slides: 0,
    messages: 0
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Modal Dialog States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: ""
  });

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      }
    });
  };

  const showSuccess = (message) => {
    setSuccessModal({
      isOpen: true,
      message
    });
  };

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchStats = async () => {
    try {
      const projectsSnap = await getDocs(collection(db, "projects"));
      const designsSnap = await getDocs(collection(db, "designs"));
      const certsSnap = await getDocs(collection(db, "certificates"));
      const slidesSnap = await getDocs(collection(db, "hero_carousel"));
      
      // Get count of UNREAD messages
      const msgsQuery = query(collection(db, "messages"), where("read", "==", false));
      let unreadCount = 0;
      try {
        const msgsSnap = await getDocs(msgsQuery);
        unreadCount = msgsSnap.size;
      } catch(e) {
        // If index doesn't exist yet, fallback to getting all and filtering manually for now
        const allMsgs = await getDocs(collection(db, "messages"));
        unreadCount = allMsgs.docs.filter(d => !d.data().read).length;
      }
      
      setStats({
        projects: projectsSnap.size,
        designs: designsSnap.size,
        certificates: certsSnap.size,
        slides: slidesSnap.size,
        messages: unreadCount
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0f", color: "#e8eaed" }}>
        Loading Admin Panel...
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0f", color: "#e8eaed", fontFamily: "'Inter', sans-serif" }}>
        <div className="fade-in" style={{ background: "rgba(22, 22, 25, 0.8)", padding: "3rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", width: "100%", maxWidth: "400px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <h2 style={{ margin: "0 0 2rem 0", textAlign: "center", fontSize: "1.8rem" }}>Admin Login</h2>
          
          {loginError && (
            <div style={{ background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.9rem" }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "1rem", background: "#1e1e24", border: "1px solid #333", color: "#fff", borderRadius: "8px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.9rem" }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "1rem", background: "#1e1e24", border: "1px solid #333", color: "#fff", borderRadius: "8px", outline: "none" }}
              />
            </div>
            <button type="submit" style={{ background: "#FF6D29", color: "#fff", border: "none", padding: "1rem", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "1rem" }}>
              Sign In
            </button>
          </form>
          
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/" style={{ color: "#8ab4f8", textDecoration: "none", fontSize: "0.9rem" }}>&larr; Back to Portfolio</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="admin-container">
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700, letterSpacing: "1px", background: "linear-gradient(to right, #fff, #9aa0a6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PORTFOLIO CMS
          </h2>
        </div>

        <nav className="admin-sidebar-nav">
          <button onClick={() => setActiveTab("home")} style={{ background: activeTab === "home" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "home" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>🏠</span> Dashboard
          </button>

          <button onClick={() => setActiveTab("messages")} style={{ background: activeTab === "messages" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "messages" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span>📥</span> Inbox
            </div>
            {stats.messages > 0 && (
              <span style={{ background: "#ff4a4a", color: "#fff", padding: "0.1rem 0.5rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "bold" }}>
                {stats.messages}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab("analytics")} style={{ background: activeTab === "analytics" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "analytics" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>📊</span> Analytics
          </button>
          
          <div style={{ padding: "0.8rem 1.2rem", color: "#9aa0a6", fontWeight: 500, fontSize: "0.95rem", marginTop: "1rem", marginBottom: "0.5rem" }}>
            CONTENT
          </div>
          <button onClick={() => setActiveTab("hero")} style={{ background: activeTab === "hero" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "hero" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>🖼️</span> Hero Carousel
          </button>
          <button onClick={() => setActiveTab("projects")} style={{ background: activeTab === "projects" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "projects" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>📁</span> Manage Projects
          </button>
          <button onClick={() => setActiveTab("designs")} style={{ background: activeTab === "designs" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "designs" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>🎨</span> Manage Designs
          </button>
          <button onClick={() => setActiveTab("certificates")} style={{ background: activeTab === "certificates" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "certificates" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>📜</span> Certificates
          </button>
          
          <button onClick={() => setActiveTab("settings")} style={{ background: activeTab === "settings" ? "rgba(138, 180, 248, 0.1)" : "transparent", color: activeTab === "settings" ? "#8ab4f8" : "#9aa0a6", padding: "0.6rem 1rem", textAlign: "left", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span>⚙️</span> Manage Settings
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "#9aa0a6", textDecoration: "none", padding: "0.6rem 1rem", borderRadius: "6px", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            <span>🌐</span> View Live Site
          </Link>
          <button onClick={handleLogout} style={{ background: "transparent", color: "#ff4a4a", border: "none", padding: "0.6rem 1rem", textAlign: "left", width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", borderRadius: "6px" }}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 600 }}>
            {activeTab === "home" ? "Dashboard Overview" : 
             activeTab === "messages" ? "Inbox" :
             activeTab === "analytics" ? "Analytics" :
             activeTab === "projects" ? "Project Management" : 
             activeTab === "designs" ? "Design Showcases" :
             activeTab === "certificates" ? "Certificates" :
             activeTab === "hero" ? "Hero Carousel" :
             "Global Settings"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             <span style={{ fontSize: "0.9rem", color: "#9aa0a6" }}>Logged in as <strong style={{color: "#e8eaed"}}>{user.email}</strong></span>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "home" && (
            <div className="fade-in">
              <h2 style={{ marginBottom: "0.5rem", fontSize: "2rem", fontWeight: 500 }}>Welcome back! 👋</h2>
              <p style={{ color: "#9aa0a6", marginBottom: "3rem", fontSize: "1.1rem" }}>Here's what's happening with your portfolio today.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
                
                <div style={{ background: "linear-gradient(145deg, rgba(30,30,35,0.6) 0%, rgba(22,22,25,0.8) 100%)", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#9aa0a6", margin: 0, fontSize: "1rem", fontWeight: 500 }}>Unread Messages</h3>
                    <span style={{ background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>Inbox</span>
                  </div>
                  <div style={{ fontSize: "3.5rem", fontWeight: "bold", color: "#e8eaed" }}>{stats.messages}</div>
                </div>

                <div style={{ background: "linear-gradient(145deg, rgba(30,30,35,0.6) 0%, rgba(22,22,25,0.8) 100%)", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#9aa0a6", margin: 0, fontSize: "1rem", fontWeight: 500 }}>Published Projects</h3>
                    <span style={{ background: "rgba(138, 180, 248, 0.1)", color: "#8ab4f8", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>Dev</span>
                  </div>
                  <div style={{ fontSize: "3.5rem", fontWeight: "bold", color: "#e8eaed" }}>{stats.projects}</div>
                </div>
                
                <div style={{ background: "linear-gradient(145deg, rgba(30,30,35,0.6) 0%, rgba(22,22,25,0.8) 100%)", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#9aa0a6", margin: 0, fontSize: "1rem", fontWeight: 500 }}>Design Showcases</h3>
                    <span style={{ background: "rgba(255, 109, 41, 0.1)", color: "#FF6D29", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>UI/UX</span>
                  </div>
                  <div style={{ fontSize: "3.5rem", fontWeight: "bold", color: "#e8eaed" }}>{stats.designs}</div>
                </div>

              </div>

              <div style={{ marginTop: "4rem" }}>
                 <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", fontWeight: 500 }}>Quick Actions</h3>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                   <button onClick={() => setActiveTab("messages")} style={{ background: "#FF6D29", color: "#fff", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.target.style.background = "#e65a1c"} onMouseOut={e => e.target.style.background = "#FF6D29"}>View Inbox</button>
                   <button onClick={() => setActiveTab("projects")} style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaed", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>Manage Projects</button>
                   <button onClick={() => setActiveTab("designs")} style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaed", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>Manage Designs</button>
                   <button onClick={() => setActiveTab("settings")} style={{ background: "rgba(255,255,255,0.05)", color: "#e8eaed", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>Edit Settings</button>
                 </div>
              </div>

            </div>
          )}

          {activeTab === "messages" && <ManageMessages showConfirm={showConfirm} showSuccess={showSuccess} />}
          {activeTab === "analytics" && <ManageAnalytics />}
          {activeTab === "hero" && <ManageHeroCarousel showConfirm={showConfirm} showSuccess={showSuccess} />}
          {activeTab === "projects" && <ManageProjects showConfirm={showConfirm} showSuccess={showSuccess} />}
          {activeTab === "designs" && <ManageDesigns showConfirm={showConfirm} showSuccess={showSuccess} />}
          {activeTab === "certificates" && <ManageCertificates showConfirm={showConfirm} showSuccess={showSuccess} />}
          {activeTab === "settings" && <ManageSettings showConfirm={showConfirm} showSuccess={showSuccess} />}
        </div>
      </main>

      {/* Global Confirm Modal Dialog */}
      {confirmModal.isOpen && (
        <div 
          onClick={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.8)", 
            backdropFilter: "blur(5px)",
            zIndex: 10000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              background: "#16161a", 
              borderRadius: "16px", 
              border: "1px solid rgba(255,255,255,0.08)", 
              padding: "2.5rem", 
              width: "100%", 
              maxWidth: "400px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", color: "#fff", fontWeight: 600 }}>Confirmation Required</h3>
            <p style={{ color: "#9aa0a6", margin: "0 0 2rem 0", fontSize: "0.95rem", lineHeight: 1.5 }}>{confirmModal.message}</p>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                onClick={confirmModal.onConfirm}
                style={{ 
                  flex: 1, 
                  background: "#ff4a4a", 
                  color: "#fff", 
                  border: "none", 
                  padding: "0.8rem", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  cursor: "pointer" 
                }}
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
                style={{ 
                  flex: 1, 
                  background: "transparent", 
                  border: "1px solid #5f6368", 
                  color: "#e8eaed", 
                  padding: "0.8rem", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  cursor: "pointer" 
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Success Modal Dialog */}
      {successModal.isOpen && (
        <div 
          onClick={() => setSuccessModal({ isOpen: false, message: "" })}
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.8)", 
            backdropFilter: "blur(5px)",
            zIndex: 10000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              background: "#16161a", 
              borderRadius: "16px", 
              border: "1px solid rgba(255,255,255,0.08)", 
              padding: "2.5rem", 
              width: "100%", 
              maxWidth: "360px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.3rem", color: "#fff", fontWeight: 600 }}>Success!</h3>
            <p style={{ color: "#9aa0a6", margin: "0 0 2rem 0", fontSize: "0.95rem", lineHeight: 1.5 }}>{successModal.message}</p>
            
            <button 
              onClick={() => setSuccessModal({ isOpen: false, message: "" })}
              style={{ 
                width: "100%",
                background: "#FF6D29", 
                color: "#fff", 
                border: "none", 
                padding: "0.8rem", 
                borderRadius: "8px", 
                fontWeight: "bold", 
                cursor: "pointer" 
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
