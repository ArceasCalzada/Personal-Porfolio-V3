"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CURSORS = [
  // Main Center
  { id: 1, name: "Arceas Calzada", color: "#FF6D29", style: { top: "44%", left: "38%" }, isMain: true, delay: 0, floatDuration: 3.5, moveX: 10, moveY: 12 },
  
  // Top Row
  { id: 2, name: "UI/UX Designer", color: "#A259FF", style: { top: "14%", left: "8%" }, isMain: false, delay: 0.05, floatDuration: 4.2, moveX: -14, moveY: -10 },
  { id: 3, name: "Frontend Developer", color: "#1ABCFE", style: { top: "18%", right: "28%" }, isMain: false, delay: 0.1, floatDuration: 3.8, moveX: -10, moveY: -10 },
  { id: 4, name: "Interaction Designer", color: "#0ACF83", style: { top: "10%", left: "38%" }, isMain: false, delay: 0.15, floatDuration: 4.6, moveX: 8, moveY: -18 },
  { id: 5, name: "Visual Design", color: "#FD79A8", style: { top: "22%", left: "24%" }, isMain: false, delay: 0.2, floatDuration: 4.0, moveX: -12, moveY: 10 },
  { id: 6, name: "User Experience", color: "#FAB1A0", style: { top: "24%", right: "44%" }, isMain: false, delay: 0.25, floatDuration: 4.4, moveX: 14, moveY: -8 },

  // Middle Flanks & Core
  { id: 7, name: "Design System", color: "#F24E1E", style: { top: "44%", left: "5%" }, isMain: false, delay: 0.3, floatDuration: 3.9, moveX: -18, moveY: 12 },
  { id: 8, name: "Prototyping", color: "#FF7262", style: { top: "46%", right: "6%" }, isMain: false, delay: 0.35, floatDuration: 4.1, moveX: 18, moveY: -10 },
  { id: 9, name: "Component Architecture", color: "#6C5CE7", style: { top: "26%", right: "22%" }, isMain: false, delay: 0.4, floatDuration: 4.3, moveX: -10, moveY: -16 },
  { id: 10, name: "Figma Power User", color: "#74B9FF", style: { top: "32%", left: "14%" }, isMain: false, delay: 0.45, floatDuration: 3.7, moveX: 12, moveY: 14 },
  { id: 11, name: "Design Tokens", color: "#A29BFE", style: { top: "34%", right: "32%" }, isMain: false, delay: 0.5, floatDuration: 4.2, moveX: -15, moveY: -12 },
  { id: 12, name: "Design Architecture", color: "#E84393", style: { top: "38%", right: "12%" }, isMain: false, delay: 0.55, floatDuration: 3.9, moveX: 16, moveY: 10 },

  // Bottom Row
  { id: 13, name: "Creative Direction", color: "#FFC700", style: { bottom: "22%", left: "12%" }, isMain: false, delay: 0.6, floatDuration: 4.4, moveX: -16, moveY: 14 },
  { id: 14, name: "Web Developer", color: "#00C2FF", style: { bottom: "24%", right: "14%" }, isMain: false, delay: 0.65, floatDuration: 4.0, moveX: 15, moveY: -12 },
  { id: 15, name: "User Research", color: "#E2445C", style: { bottom: "14%", left: "36%" }, isMain: false, delay: 0.7, floatDuration: 3.7, moveX: 10, moveY: 16 },
  { id: 16, name: "Wireframing", color: "#00B894", style: { bottom: "12%", right: "30%" }, isMain: false, delay: 0.75, floatDuration: 4.5, moveX: -14, moveY: 18 },
  { id: 17, name: "Responsive Layouts", color: "#55E6C1", style: { bottom: "34%", left: "26%" }, isMain: false, delay: 0.8, floatDuration: 4.3, moveX: -12, moveY: -10 },
];

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Check if onboarding was already shown in this session
    let onboardingSeen = false;
    try {
      onboardingSeen = sessionStorage.getItem("onboarding-seen") === "true";
    } catch (e) {
      console.warn("sessionStorage access denied:", e);
    }

    if (onboardingSeen) {
      return; // If seen, do not mount/render onboarding
    }

    // 2. If not seen, show the onboarding screen and lock scrolling
    setIsVisible(true);
    document.body.style.overflow = "hidden";

    // 3. Increment progress counter from 0 to 100 smoothly
    const duration = 2400; // 2.4 seconds total animation duration
    const intervalTime = 30; // Update every 30ms
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
        // Complete loading, lock off overlay in 400ms
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = "";
          try {
            sessionStorage.setItem("onboarding-seen", "true");
          } catch (e) {
            console.warn("sessionStorage setItem failed:", e);
          }
        }, 400);
      }
    }, intervalTime);

    return () => {
      clearInterval(progressTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="onboarding-overlay"
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%", 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Glowing Background Orbs */}
          <div className="onboarding-glow-container">
            <div className="onboarding-glow-orb"></div>
          </div>

          <div className="onboarding-content">
            {/* Scattered Figma Collaboration Mouse Cursors */}
            {CURSORS.map((c, idx) => (
              <motion.div
                key={c.id}
                className={`figma-cursor-badge ${c.isMain ? "figma-cursor-main" : "figma-cursor-scattered"}`}
                style={c.style}
                initial={{ opacity: 0, scale: 0.2, x: c.moveX * -2, y: c.moveY * -2 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: [0, c.moveX, -c.moveX, 0],
                  y: [0, -c.moveY, c.moveY, 0] 
                }}
                transition={{
                  opacity: { duration: 0.4, delay: c.delay },
                  scale: { duration: 0.5, delay: c.delay, ease: [0.16, 1, 0.3, 1] },
                  x: { duration: c.floatDuration, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: c.floatDuration * 1.25, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {/* Figma Mouse Pointer SVG */}
                <svg 
                  width="26" 
                  height="26" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="figma-cursor-pointer"
                >
                  <path 
                    d="M5.5 3.5L18.5 11.5L12.5 13.5L9.5 19.5L5.5 3.5Z" 
                    fill={c.color} 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Name Pill Badge */}
                <div 
                  className="figma-cursor-name" 
                  style={{ background: c.color, boxShadow: `0 10px 30px ${c.color}55` }}
                >
                  {c.name}
                </div>
              </motion.div>
            ))}

            {/* Top Right Percentage Counter */}
            <div className="onboarding-percentage">
              {progress.toString().padStart(3, "0")}%
            </div>

            {/* Bottom Progress Bar */}
            <div className="onboarding-footer">
              <div className="onboarding-progress-bar-container">
                <motion.div 
                  className="onboarding-progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
