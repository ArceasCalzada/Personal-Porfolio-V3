"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function TagInput({ label, tags, onChange, placeholder, suggestions = [] }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSelectSuggestion = (e) => {
    const val = e.target.value;
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    e.target.value = "";
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <label style={{ color: "#9aa0a6", fontSize: "0.85rem" }}>
          {label}
        </label>
        {suggestions.length > 0 && (
          <select 
            onChange={handleSelectSuggestion} 
            defaultValue=""
            style={{ 
              background: "#202124", 
              border: "1px solid #5f6368", 
              color: "#FF6D29", 
              borderRadius: "4px", 
              fontSize: "0.8rem", 
              padding: "0.1rem 0.5rem",
              cursor: "pointer"
            }}
          >
            <option value="" disabled>+ Quick Select standard items...</option>
            {suggestions.map((sug, idx) => (
              <option key={idx} value={sug} disabled={tags.includes(sug)}>
                {sug}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "0.5rem", 
          padding: "0.6rem 0.8rem", 
          background: "#202124", 
          border: "1px solid #5f6368", 
          borderRadius: "4px",
          alignItems: "center"
        }}
      >
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            style={{ 
              background: "#FF6D29", 
              color: "#fff", 
              padding: "0.2rem 0.6rem", 
              borderRadius: "4px", 
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(idx)}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "#fff", 
                cursor: "pointer", 
                padding: 0,
                fontSize: "0.8rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center"
              }}
            >
              ×
            </button>
          </span>
        ))}
        
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          style={{ 
            flex: 1, 
            background: "transparent", 
            border: "none", 
            color: "#e8eaed", 
            outline: "none",
            fontSize: "0.95rem",
            minWidth: "120px"
          }}
        />
      </div>
      <small style={{ color: "#5f6368", display: "block", marginTop: "0.25rem", fontSize: "0.75rem" }}>
        Type a tag and press <strong>Enter</strong> or <strong>comma (,)</strong> to add, or choose from the list.
      </small>
    </div>
  );
}

export default function ManageSettings({ showConfirm, showSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Home Page - Hero
    heroTitle: "",
    heroSub1: "",
    cvLink: "",
    // Home Page - About Section
    indexStat1Value: "",
    indexStat1Label: "",
    indexStat2Value: "",
    indexStat2Label: "",
    aboutText: "",
    indexSkills: [],
    indexSoftware: [],
    // About Page
    aboutPageHeadline: "",
    aboutPageSubtitle: "",
    aboutPageBio: "",
    aboutPageCurrently: "",
    aboutPageAvailable: "",
    spotifyUrl: "",
    // About Page - Arrays
    aboutPageSkillsDesign: [],
    aboutPageSkillsDev: [],
    aboutPageExperience: "[]",
    aboutPageEducation: "[]",
    // Footer
    footerHeadline: "",
    footerSubtext: "",
    footerCopyright: "",
    footerEmail: "",
    footerLocation: "",
    footerPhone: "",
    footerLinkedIn: "",
    showFooterLinkedIn: true,
    footerBehance: "",
    showFooterBehance: true,
    footerDribbble: "",
    showFooterDribbble: true,
    footerTwitter: "",
    showFooterTwitter: true,
    footerInstagram: "",
    showFooterInstagram: true,
  });

  // Parse experiences list from settings
  const experiences = (() => {
    try {
      return JSON.parse(settings.aboutPageExperience || "[]");
    } catch (e) {
      return [];
    }
  })();

  const setExperiences = (newList) => {
    setSettings(prev => ({
      ...prev,
      aboutPageExperience: JSON.stringify(newList)
    }));
  };

  const addExperience = () => {
    const newList = [...experiences, { company: "", date: "", role: "", desc: "" }];
    setExperiences(newList);
  };

  const updateExperience = (idx, field, val) => {
    const newList = experiences.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setExperiences(newList);
  };

  const removeExperience = (idx) => {
    const newList = experiences.filter((_, i) => i !== idx);
    setExperiences(newList);
  };

  const moveExperience = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;
    const newList = [...experiences];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;
    setExperiences(newList);
  };

  // Parse educations list from settings
  const educations = (() => {
    try {
      return JSON.parse(settings.aboutPageEducation || "[]");
    } catch (e) {
      return [];
    }
  })();

  const setEducations = (newList) => {
    setSettings(prev => ({
      ...prev,
      aboutPageEducation: JSON.stringify(newList)
    }));
  };

  const addEducation = () => {
    const newList = [...educations, { school: "", year: "", degree: "" }];
    setEducations(newList);
  };

  const updateEducation = (idx, field, val) => {
    const newList = educations.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setEducations(newList);
  };

  const removeEducation = (idx) => {
    const newList = educations.filter((_, i) => i !== idx);
    setEducations(newList);
  };

  const moveEducation = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= educations.length) return;
    const newList = [...educations];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;
    setEducations(newList);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings((prev) => ({ ...prev, ...docSnap.data() }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load settings.");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "indexSkills" || name === "indexSoftware" || name === "aboutPageSkillsDesign" || name === "aboutPageSkillsDev") {
      // Split by comma for arrays
      setSettings(prev => ({ ...prev, [name]: value.split(",").map(s => s.trim()) }));
    } else if (e.target.type === "checkbox") {
      setSettings(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "general");
      await updateDoc(docRef, settings);
      if (showSuccess) {
        showSuccess("Settings updated successfully! 🎉");
      } else {
        alert("Settings updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  if (loading) return <div className="fade-in">Loading settings...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <p style={{ color: "#9aa0a6", margin: 0 }}>Manage global settings for your portfolio.</p>
      </div>

      <div style={{ background: "rgba(22,22,25,0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "2rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "2rem" }}>General Settings</h3>
        
        <form onSubmit={handleSubmit}>
          <h4 style={{ color: "#8ab4f8", borderBottom: "1px solid rgba(138, 180, 248, 0.2)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Home Page - Hero</h4>
          
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>TITLE</label>
              <input type="text" name="heroTitle" value={settings.heroTitle || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SUBTITLE</label>
              <input type="text" name="heroSub1" value={settings.heroSub1 || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CV LINK / URL</label>
            <input type="text" name="cvLink" value={settings.cvLink || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>

          <h4 style={{ color: "#8ab4f8", borderBottom: "1px solid rgba(138, 180, 248, 0.2)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Home Page - About Section</h4>
          
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>STAT 1 VALUE (e.g. 05+)</label>
              <input type="text" name="indexStat1Value" value={settings.indexStat1Value || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>STAT 1 LABEL (e.g. Years Experience)</label>
              <input type="text" name="indexStat1Label" value={settings.indexStat1Label || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>STAT 2 VALUE (e.g. 50+)</label>
              <input type="text" name="indexStat2Value" value={settings.indexStat2Value || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>STAT 2 LABEL (e.g. Projects Completed)</label>
              <input type="text" name="indexStat2Label" value={settings.indexStat2Label || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>ABOUT TEXT</label>
            <textarea name="aboutText" value={settings.aboutText || ""} onChange={handleChange} rows={3} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>
          
          <TagInput 
            label="SKILLS" 
            tags={settings.indexSkills || []} 
            onChange={(newTags) => setSettings(prev => ({ ...prev, indexSkills: newTags }))} 
            placeholder="e.g. UI/UX Design, Web Development" 
            suggestions={["UI/UX Design", "Web Design", "Interaction Design", "Branding", "Mobile App Design", "User Research", "Wireframing", "Motion Design", "Visual Design"]}
          />

          <TagInput 
            label="SOFTWARE / TOOLS" 
            tags={settings.indexSoftware || []} 
            onChange={(newTags) => setSettings(prev => ({ ...prev, indexSoftware: newTags }))} 
            placeholder="e.g. Figma, VS Code, Photoshop" 
            suggestions={["Figma", "Next.js", "React", "HTML5", "CSS3", "JavaScript", "Flutter", "Bubble.io", "Photoshop", "Illustrator", "WordPress", "Webflow", "PHP", "Laravel", "MySQL"]}
          />

          <h4 style={{ color: "#8ab4f8", borderBottom: "1px solid rgba(138, 180, 248, 0.2)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>About Page</h4>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>HEADLINE</label>
            <input type="text" name="aboutPageHeadline" value={settings.aboutPageHeadline || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SUBTITLE</label>
            <input type="text" name="aboutPageSubtitle" value={settings.aboutPageSubtitle || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>BIO</label>
            <textarea name="aboutPageBio" value={settings.aboutPageBio || ""} onChange={handleChange} rows={5} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>CURRENTLY</label>
              <select 
                value={
                  ["Designing experiences as a freelancer", "Designing products as a freelancer", "Studying UI/UX design & Web development", "Looking for new design challenges"].includes(settings.aboutPageCurrently)
                    ? settings.aboutPageCurrently
                    : "custom"
                } 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setSettings(prev => ({ ...prev, aboutPageCurrently: "" }));
                  } else {
                    setSettings(prev => ({ ...prev, aboutPageCurrently: val }));
                  }
                }}
                style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", marginBottom: "0.5rem" }}
              >
                <option value="Designing experiences as a freelancer">Designing experiences as a freelancer</option>
                <option value="Designing products as a freelancer">Designing products as a freelancer</option>
                <option value="Studying UI/UX design & Web development">Studying UI/UX design & Web development</option>
                <option value="Looking for new design challenges">Looking for new design challenges</option>
                <option value="custom">Custom Status (Type below)...</option>
              </select>
              
              {!["Designing experiences as a freelancer", "Designing products as a freelancer", "Studying UI/UX design & Web development", "Looking for new design challenges"].includes(settings.aboutPageCurrently) && (
                <input 
                  type="text" 
                  name="aboutPageCurrently" 
                  value={settings.aboutPageCurrently || ""} 
                  onChange={handleChange} 
                  placeholder="Type your custom status here..." 
                  style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} 
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>AVAILABLE STATUS</label>
              <select 
                value={
                  ["Available for contract / freelance", "Open to full-time opportunities", "Not currently looking for new roles"].includes(settings.aboutPageAvailable)
                    ? settings.aboutPageAvailable
                    : "custom"
                } 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setSettings(prev => ({ ...prev, aboutPageAvailable: "" }));
                  } else {
                    setSettings(prev => ({ ...prev, aboutPageAvailable: val }));
                  }
                }}
                style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", marginBottom: "0.5rem" }}
              >
                <option value="Available for contract / freelance">Available for contract / freelance</option>
                <option value="Open to full-time opportunities">Open to full-time opportunities</option>
                <option value="Not currently looking for new roles">Not currently looking for new roles</option>
                <option value="custom">Custom Status (Type below)...</option>
              </select>
              
              {!["Available for contract / freelance", "Open to full-time opportunities", "Not currently looking for new roles"].includes(settings.aboutPageAvailable) && (
                <input 
                  type="text" 
                  name="aboutPageAvailable" 
                  value={settings.aboutPageAvailable || ""} 
                  onChange={handleChange} 
                  placeholder="Type your custom status here..." 
                  style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} 
                />
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>SPOTIFY EMBED OR SONG URL</label>
            <input type="text" name="spotifyUrl" value={settings.spotifyUrl || ""} onChange={handleChange} placeholder="e.g. https://open.spotify.com/track/60a0Rd6pjrkxjPbaKzXjfq" style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>

          <TagInput 
            label="COMPETENCIES" 
            tags={settings.aboutPageSkillsDesign || []} 
            onChange={(newTags) => setSettings(prev => ({ ...prev, aboutPageSkillsDesign: newTags }))} 
            placeholder="e.g. UI/UX Design, Interaction Design" 
            suggestions={["UI/UX Design", "Web Design", "Interaction Design", "Branding", "Mobile App Design", "User Research", "Wireframing", "Motion Design", "Visual Design"]}
          />

          <TagInput 
            label="TOOLS" 
            tags={settings.aboutPageSkillsDev || []} 
            onChange={(newTags) => setSettings(prev => ({ ...prev, aboutPageSkillsDev: newTags }))} 
            placeholder="e.g. Figma, Framer, Next.js" 
            suggestions={["Figma", "Next.js", "React", "HTML5", "CSS3", "JavaScript", "Flutter", "Bubble.io", "Photoshop", "Illustrator", "WordPress", "Webflow", "PHP", "Laravel", "MySQL"]}
          />

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#9aa0a6", fontSize: "0.85rem", fontWeight: "bold" }}>EXPERIENCE ENTRIES</label>
              <button 
                type="button" 
                onClick={addExperience} 
                style={{ padding: "0.4rem 1rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
              >
                + Add Experience
              </button>
            </div>
            
            {experiences.length === 0 ? (
              <div style={{ border: "1px dashed #5f6368", padding: "2rem", borderRadius: "6px", textAlign: "center", color: "#9aa0a6" }}>
                No experience entries added yet. Click "+ Add Experience" to create one.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {experiences.map((exp, idx) => (
                  <div key={idx} style={{ background: "#202124", border: "1px solid #5f6368", borderRadius: "6px", padding: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "bold", color: "#FF6D29", fontSize: "0.9rem" }}>Job #{idx + 1}</span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="button" onClick={() => moveExperience(idx, -1)} disabled={idx === 0} style={{ background: "transparent", border: "none", color: idx === 0 ? "#5f6368" : "#fff", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: "1rem" }}>▲</button>
                        <button type="button" onClick={() => moveExperience(idx, 1)} disabled={idx === experiences.length - 1} style={{ background: "transparent", border: "none", color: idx === experiences.length - 1 ? "#5f6368" : "#fff", cursor: idx === experiences.length - 1 ? "not-allowed" : "pointer", fontSize: "1rem" }}>▼</button>
                        <button type="button" onClick={() => removeExperience(idx)} style={{ background: "transparent", border: "none", color: "#ea4335", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>Delete</button>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>COMPANY</label>
                        <input type="text" value={exp.company || ""} onChange={(e) => updateExperience(idx, "company", e.target.value)} placeholder="e.g. Google" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>ROLE</label>
                        <input type="text" value={exp.role || ""} onChange={(e) => updateExperience(idx, "role", e.target.value)} placeholder="e.g. Lead Designer" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>DATE / DURATION</label>
                      <input type="text" value={exp.date || ""} onChange={(e) => updateExperience(idx, "date", e.target.value)} placeholder="e.g. 2023 - Present" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>DESCRIPTION</label>
                      <textarea value={exp.desc || ""} onChange={(e) => updateExperience(idx, "desc", e.target.value)} placeholder="Briefly describe what you did..." rows={3} style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#9aa0a6", fontSize: "0.85rem", fontWeight: "bold" }}>EDUCATION ENTRIES</label>
              <button 
                type="button" 
                onClick={addEducation} 
                style={{ padding: "0.4rem 1rem", background: "#FF6D29", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
              >
                + Add Education
              </button>
            </div>
            
            {educations.length === 0 ? (
              <div style={{ border: "1px dashed #5f6368", padding: "2rem", borderRadius: "6px", textAlign: "center", color: "#9aa0a6" }}>
                No education entries added yet. Click "+ Add Education" to create one.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {educations.map((edu, idx) => (
                  <div key={idx} style={{ background: "#202124", border: "1px solid #5f6368", borderRadius: "6px", padding: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "bold", color: "#FF6D29", fontSize: "0.9rem" }}>Education #{idx + 1}</span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="button" onClick={() => moveEducation(idx, -1)} disabled={idx === 0} style={{ background: "transparent", border: "none", color: idx === 0 ? "#5f6368" : "#fff", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: "1rem" }}>▲</button>
                        <button type="button" onClick={() => moveEducation(idx, 1)} disabled={idx === educations.length - 1} style={{ background: "transparent", border: "none", color: idx === educations.length - 1 ? "#5f6368" : "#fff", cursor: idx === educations.length - 1 ? "not-allowed" : "pointer", fontSize: "1rem" }}>▼</button>
                        <button type="button" onClick={() => removeEducation(idx)} style={{ background: "transparent", border: "none", color: "#ea4335", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>Delete</button>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>SCHOOL</label>
                        <input type="text" value={edu.school || ""} onChange={(e) => updateEducation(idx, "school", e.target.value)} placeholder="e.g. Stanford University" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>DEGREE / CERTIFICATE</label>
                        <input type="text" value={edu.degree || ""} onChange={(e) => updateEducation(idx, "degree", e.target.value)} placeholder="e.g. BS Computer Science" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", color: "#9aa0a6", fontSize: "0.8rem" }}>YEAR / DURATION</label>
                      <input type="text" value={edu.year || ""} onChange={(e) => updateEducation(idx, "year", e.target.value)} placeholder="e.g. 2018 - 2022" style={{ width: "100%", padding: "0.6rem", background: "#303134", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px", fontSize: "0.85rem" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h4 style={{ color: "#8ab4f8", borderBottom: "1px solid rgba(138, 180, 248, 0.2)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Footer</h4>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>FOOTER HEADLINE (HTML ALLOWED)</label>
            <input type="text" name="footerHeadline" value={settings.footerHeadline || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>FOOTER SUBTEXT</label>
            <textarea name="footerSubtext" value={settings.footerSubtext || ""} onChange={handleChange} rows={2} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>FOOTER COPYRIGHT STATEMENT (HTML ALLOWED)</label>
            <textarea name="footerCopyright" value={settings.footerCopyright || ""} onChange={handleChange} rows={2} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
          </div>
          
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>EMAIL</label>
              <input type="email" name="footerEmail" value={settings.footerEmail || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>LOCATION</label>
              <input type="text" name="footerLocation" value={settings.footerLocation || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>PHONE</label>
              <input type="text" name="footerPhone" value={settings.footerPhone || ""} onChange={handleChange} style={{ width: "100%", padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>LINKEDIN URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input type="text" name="footerLinkedIn" value={settings.footerLinkedIn || ""} onChange={handleChange} style={{ flex: 1, padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e8eaed", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" name="showFooterLinkedIn" checked={settings.showFooterLinkedIn !== false} onChange={handleChange} /> Show
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>BEHANCE URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input type="text" name="footerBehance" value={settings.footerBehance || ""} onChange={handleChange} style={{ flex: 1, padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e8eaed", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" name="showFooterBehance" checked={settings.showFooterBehance !== false} onChange={handleChange} /> Show
                </label>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>DRIBBBLE URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input type="text" name="footerDribbble" value={settings.footerDribbble || ""} onChange={handleChange} style={{ flex: 1, padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e8eaed", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" name="showFooterDribbble" checked={settings.showFooterDribbble !== false} onChange={handleChange} /> Show
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>TWITTER/X URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input type="text" name="footerTwitter" value={settings.footerTwitter || ""} onChange={handleChange} style={{ flex: 1, padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e8eaed", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" name="showFooterTwitter" checked={settings.showFooterTwitter !== false} onChange={handleChange} /> Show
                </label>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#9aa0a6", fontSize: "0.85rem" }}>INSTAGRAM URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input type="text" name="footerInstagram" value={settings.footerInstagram || ""} onChange={handleChange} style={{ flex: 1, padding: "0.8rem", background: "#202124", border: "1px solid #5f6368", color: "#e8eaed", borderRadius: "4px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e8eaed", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" name="showFooterInstagram" checked={settings.showFooterInstagram !== false} onChange={handleChange} /> Show
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: "#FF6D29", color: "#fff", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
