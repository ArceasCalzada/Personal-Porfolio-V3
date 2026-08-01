"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AnalyticsTracker() {
  useEffect(() => {
    async function trackVisit() {
      try {
        const statsRef = doc(db, 'analytics', 'global_stats');
        
        // Track Total Views (every page load)
        await setDoc(statsRef, { totalViews: increment(1) }, { merge: true }).catch(console.error);
        
        // Track Unique Visitors
        if (!localStorage.getItem('hasVisited')) {
          localStorage.setItem('hasVisited', 'true');
          await setDoc(statsRef, { uniqueVisitors: increment(1) }, { merge: true }).catch(console.error);
        }

        // Track individual visit session
        if (!sessionStorage.getItem('sessionTracked')) {
          sessionStorage.setItem('sessionTracked', 'true');
          await addDoc(collection(db, 'analytics_visits'), {
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer || "Direct",
            path: window.location.pathname,
            timestamp: serverTimestamp()
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Analytics error:", e);
      }
    }
    
    trackVisit();
  }, []);

  return null;
}
