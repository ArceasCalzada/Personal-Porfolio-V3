"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function ManageMessages({ showConfirm, showSuccess }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "messages"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date descending
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setMessages(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load messages.");
    }
    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent opening the modal
    if (showConfirm) {
      showConfirm("Are you sure you want to delete this message? This action is permanent.", async () => {
        try {
          await deleteDoc(doc(db, "messages", id));
          if (activeMessage && activeMessage.id === id) {
            setActiveMessage(null);
          }
          fetchMessages();
        } catch (err) {
          console.error(err);
          alert("Failed to delete message.");
        }
      });
    } else {
      if (confirm("Are you sure you want to delete this message?")) {
        try {
          await deleteDoc(doc(db, "messages", id));
          if (activeMessage && activeMessage.id === id) {
            setActiveMessage(null);
          }
          fetchMessages();
        } catch (err) {
          console.error(err);
          alert("Failed to delete message.");
        }
      }
    }
  };

  const handleOpenMessage = async (msg) => {
    setActiveMessage(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, "messages", msg.id), {
          read: true
        });
        // Update local state read status optimistically
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      } catch (err) {
        console.error("Failed to mark message as read", err);
      }
    }
  };

  const toggleReadStatus = async (msg, e) => {
    if (e) e.stopPropagation();
    try {
      const newRead = !msg.read;
      await updateDoc(doc(db, "messages", msg.id), {
        read: newRead
      });
      if (activeMessage && activeMessage.id === msg.id) {
        setActiveMessage(prev => ({ ...prev, read: newRead }));
      }
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage messages received from your contact form. Click on any message to view details.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages found in your inbox.</p>
        ) : (
          messages.map(msg => {
            const truncatedMessage = msg.message && msg.message.length > 90 
              ? msg.message.substring(0, 90) + "..." 
              : (msg.message || msg.content || "No message content.");
            
            return (
              <div 
                key={msg.id} 
                onClick={() => handleOpenMessage(msg)}
                style={{ 
                  background: "rgba(30,30,35,0.6)", 
                  borderRadius: "12px", 
                  border: msg.read ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255, 109, 41, 0.4)", 
                  padding: "1.2rem 1.5rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: "translateY(0)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = "1px solid rgba(255, 109, 41, 0.6)";
                  e.currentTarget.style.background = "rgba(40,40,45,0.8)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = msg.read ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255, 109, 41, 0.4)";
                  e.currentTarget.style.background = "rgba(30,30,35,0.6)";
                }}
              >
                <div style={{ flex: 1, overflow: "hidden", paddingRight: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "baseline", marginBottom: "0.3rem" }}>
                    <h4 style={{ margin: 0, color: "#e8eaed", fontSize: "1rem", fontWeight: 600 }}>
                      {msg.name || "Unknown Sender"}
                    </h4>
                    {!msg.read && (
                      <span style={{ background: "#FF6D29", color: "#fff", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "bold" }}>
                        NEW
                      </span>
                    )}
                    <span style={{ color: "#5f6368", fontSize: "0.8rem" }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Date unknown"}
                    </span>
                  </div>
                  <p style={{ color: "#9aa0a6", margin: 0, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {truncatedMessage}
                  </p>
                </div>
                
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <button 
                    onClick={(e) => toggleReadStatus(msg, e)} 
                    style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#9aa0a6", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}
                  >
                    {msg.read ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button 
                    onClick={(e) => handleDelete(msg.id, e)} 
                    style={{ background: "rgba(255, 74, 74, 0.1)", color: "#ff4a4a", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message View Modal Overlay */}
      {activeMessage && (
        <div 
          onClick={() => setActiveMessage(null)}
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0, 0, 0, 0.85)", 
            backdropFilter: "blur(5px)",
            zIndex: 9999, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            style={{ 
              background: "#16161a", 
              borderRadius: "16px", 
              border: "1px solid rgba(255,255,255,0.08)", 
              padding: "2.5rem", 
              width: "100%", 
              maxWidth: "600px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            <button 
              onClick={() => setActiveMessage(null)}
              style={{ 
                position: "absolute", 
                top: "1.5rem", 
                right: "1.5rem", 
                background: "transparent", 
                border: "none", 
                color: "#9aa0a6", 
                fontSize: "1.2rem", 
                cursor: "pointer" 
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1.5rem" }}>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "#fff", fontWeight: 600 }}>
                {activeMessage.name || "Unknown Sender"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <a 
                  href={`mailto:${activeMessage.email}`} 
                  style={{ color: "#FF6D29", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem" }}
                >
                  {activeMessage.email}
                </a>
                <span style={{ color: "#5f6368", fontSize: "0.85rem" }}>
                  Received on: {activeMessage.createdAt ? new Date(activeMessage.createdAt).toLocaleString() : "Date unknown"}
                </span>
              </div>
            </div>

            <div 
              style={{ 
                color: "#e8eaed", 
                lineHeight: 1.6, 
                whiteSpace: "pre-wrap", 
                fontSize: "1rem", 
                background: "rgba(255,255,255,0.02)", 
                padding: "1.5rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.03)",
                minHeight: "150px",
                maxHeight: "350px",
                overflowY: "auto",
                marginBottom: "2rem"
              }}
            >
              {activeMessage.message || activeMessage.content || "No message content."}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
              <button 
                onClick={() => {
                  window.location.href = `mailto:${activeMessage.email}`;
                }}
                style={{ 
                  flex: 1, 
                  background: "#FF6D29", 
                  color: "#fff", 
                  border: "none", 
                  padding: "0.8rem 1.5rem", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  cursor: "pointer" 
                }}
              >
                Reply Message ✉
              </button>
              <button 
                onClick={() => setActiveMessage(null)}
                style={{ 
                  flex: 1, 
                  background: "transparent", 
                  border: "1px solid #5f6368", 
                  color: "#e8eaed", 
                  padding: "0.8rem 1.5rem", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  cursor: "pointer" 
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
