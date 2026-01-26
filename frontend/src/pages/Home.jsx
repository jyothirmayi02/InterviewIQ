import React from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();
  return (

    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>InterviewIQ</h1>
          <p style={styles.subtitle}>
            Resume-based mock interviews with voice + webcam confidence analysis
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Get Interview Ready</h2>
          <p style={styles.cardText}>
            Upload your resume, answer questions one-by-one, and receive a final
            performance report with confidence insights.
          </p>

          <button style={styles.button} onClick={() => navigate("/upload")}>Start Interview</button>

        </div>
        {/* Footer */}
        <p style={styles.footer}>
          Built for Mini Project • Full Stack + AI
        </p>
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",        // ✅ Full screen height
    width: "100%",             // ✅ Full screen width
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  wrapper: {
    width: "100%",
    maxWidth: "700px",         // ✅ limits width on laptop
    textAlign: "center",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    fontSize: "clamp(32px, 5vw, 46px)", // ✅ auto adjusts font size
    fontWeight: "bold",
    color: "#111827",
    margin: "0",
  },

  subtitle: {
    fontSize: "clamp(14px, 2vw, 18px)",
    color: "#4b5563",
    marginTop: "10px",
    lineHeight: "1.5",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    width: "100%",
    boxSizing: "border-box",
  },

  cardTitle: {
    fontSize: "clamp(18px, 2.5vw, 24px)",
    marginBottom: "10px",
    color: "#111827",
  },

  cardText: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#374151",
    lineHeight: "1.6",
    marginBottom: "20px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  note: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#6b7280",
  },

  footer: {
    marginTop: "18px",
    fontSize: "13px",
    color: "#6b7280",
  },
};
