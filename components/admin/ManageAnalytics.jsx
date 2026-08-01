"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function ManageAnalytics() {
  const [stats, setStats] = useState({ totalViews: 0, uniqueVisitors: 0 });
  const [sources, setSources] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch Global Stats
        const statsRef = doc(db, "analytics", "global_stats");
        const statsSnap = await getDoc(statsRef);
        let globalStats = { totalViews: 0, uniqueVisitors: 0 };
        if (statsSnap.exists()) {
          globalStats = statsSnap.data();
        }

        // Fetch Visits to compute Sources and Devices
        const visitsSnap = await getDocs(collection(db, "analytics_visits"));
        let viewsCount = 0;
        const sourceMap = {};
        const deviceMap = {};

        visitsSnap.forEach((d) => {
          viewsCount++;
          const data = d.data();
          const referrer = data.referrer || "Direct";
          const userAgent = data.userAgent || "Unknown";

          // Simple device detection
          let device = "Desktop";
          if (/mobile/i.test(userAgent)) device = "Mobile";
          if (/tablet/i.test(userAgent)) device = "Tablet";

          sourceMap[referrer] = (sourceMap[referrer] || 0) + 1;
          deviceMap[device] = (deviceMap[device] || 0) + 1;
        });

        // Use global views if larger, else computed
        const totalViews = Math.max(globalStats.totalViews || 0, viewsCount);
        
        setStats({
          totalViews,
          uniqueVisitors: globalStats.uniqueVisitors || 0
        });

        setSources(Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 5));
        setDevices(Object.entries(deviceMap).sort((a, b) => b[1] - a[1]));

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ color: "#9aa0a6" }}>Loading analytics data...</div>;

  return (
    <div className="admin-card" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Site Overview</h2>
      
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ flex: 1, background: "#2a2a2a", padding: "2rem", borderRadius: "12px", textAlign: "center", border: "1px solid #3c4043" }}>
          <h3 style={{ color: "#9aa0a6", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Total Views</h3>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#8ab4f8" }}>
            {stats.totalViews}
          </div>
        </div>
        <div style={{ flex: 1, background: "#2a2a2a", padding: "2rem", borderRadius: "12px", textAlign: "center", border: "1px solid #3c4043" }}>
          <h3 style={{ color: "#9aa0a6", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Unique Visitors</h3>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#8ab4f8" }}>
            {stats.uniqueVisitors}
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1, background: "#2a2a2a", padding: "1.5rem", borderRadius: "12px", border: "1px solid #3c4043" }}>
          <h3 style={{ color: "#e8eaed", fontSize: "1.1rem", marginBottom: "1rem" }}>Top Traffic Sources</h3>
          <div style={{ color: "#9aa0a6" }}>
            {sources.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {sources.map(([source, count], idx) => (
                  <li key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span>{source}</span>
                    <strong style={{ color: "#fff" }}>{count}</strong>
                  </li>
                ))}
              </ul>
            ) : "No source data yet."}
          </div>
        </div>
        <div style={{ flex: 1, background: "#2a2a2a", padding: "1.5rem", borderRadius: "12px", border: "1px solid #3c4043" }}>
          <h3 style={{ color: "#e8eaed", fontSize: "1.1rem", marginBottom: "1rem" }}>Top Devices</h3>
          <div style={{ color: "#9aa0a6" }}>
            {devices.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {devices.map(([device, count], idx) => (
                  <li key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span>{device}</span>
                    <strong style={{ color: "#fff" }}>{count}</strong>
                  </li>
                ))}
              </ul>
            ) : "No device data yet."}
          </div>
        </div>
      </div>
    </div>
  );
}
