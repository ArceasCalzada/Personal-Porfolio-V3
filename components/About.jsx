"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function About() {
  const [aboutData, setAboutData] = useState({
    stat1Value: "4+ Years",
    stat1Label: "Design & Tech Experience",
    stat2Value: "15+",
    stat2Label: "Projects Completed",
    aboutText: "I am a BS Information Technology Graduate from the University of Mindanao. I'm a motivated and detail-oriented professional deeply passionate about UI/UX design and front-end development, constantly striving to craft seamless and visually stunning digital experiences.\n\nMy experience spans UI/UX design, front-end development, mobile application development, and digital content creation. As part of Jairosoft's Digital Marketing Team, I contribute to visual design, component libraries, and web user experiences.",
    skills: ["UI/UX Design", "Front-End Development", "System Architecture", "Design Systems", "Prototyping", "User Research"],
    software: ["Figma", "React", "Next.js", "JavaScript", "HTML5", "CSS3", "Firebase", "Python"]
  });

  useEffect(() => {
    async function fetchAboutSettings() {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAboutData((prev) => ({
            ...prev,
            stat1Value: data.indexStat1Value || prev.stat1Value,
            stat1Label: data.indexStat1Label || prev.stat1Label,
            stat2Value: data.indexStat2Value || prev.stat2Value,
            stat2Label: data.indexStat2Label || prev.stat2Label,
            aboutText: data.aboutText || prev.aboutText,
            skills: data.indexSkills || prev.skills,
            software: data.indexSoftware || prev.software,
          }));
        }
      } catch (error) {
        console.error("Error fetching about settings:", error);
      }
    }
    fetchAboutSettings();
  }, []);

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

  return (
    <section id="about" className="about fade-in visible" data-bg-dark="#1a1412" data-bg-light="#fff5f0" style={{ paddingTop: "5rem", display: "block" }}>
      <div className="skills-experience-header">
        <h2>Skills & Experience</h2>
        <Link href="/about" style={{
          background: "#1a1a1a", color: "#ffffff", border: "none", borderRadius: "30px", 
          padding: "0.8rem 1.8rem", textDecoration: "none", fontSize: "0.95rem", 
          fontWeight: 500, transition: "all 0.3s ease", display: "inline-flex", 
          alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          About me ↗
        </Link>
      </div>
      
      <div className="skills-experience-grid">
        <motion.div 
          className="stats-column"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="stat-item">
            <div className="stat-number">{aboutData.stat1Value}</div>
            <div className="stat-label">{aboutData.stat1Label}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{aboutData.stat2Value}</div>
            <div className="stat-label">{aboutData.stat2Label}</div>
          </div>
        </motion.div>

        <motion.div 
          className="content-column"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h4>What I Do</h4>
          <div style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)", lineHeight: 1.6, color: "var(--color-text-muted)", marginBottom: "3rem", minHeight: "150px" }}
               dangerouslySetInnerHTML={{ __html: aboutData.aboutText.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('<br>') }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "4rem", minHeight: "50px", gap: "0.5rem" }}>
            {aboutData.skills.map((skill, index) => (
              <span key={index} className="skill-pill-alt">{skill}</span>
            ))}
          </div>

          <h4>Software & Tech Stack</h4>
          <div style={{ display: "flex", flexWrap: "wrap", minHeight: "50px", gap: "0.5rem", marginTop: "1rem" }}>
            {aboutData.software.map((sw, index) => {
              const iconUrl = devicons[sw.toLowerCase()] || 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg';
              return (
                <div key={index} className="software-pill">
                  <img src={iconUrl} alt={sw} style={sw.toLowerCase() === 'bubble.io' ? { borderRadius: '50%' } : {}} /> {sw}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
