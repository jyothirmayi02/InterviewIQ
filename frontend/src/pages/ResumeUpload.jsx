import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only PDF
    if (file.type !== "application/pdf") {
      alert("Please upload only PDF file ✅");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleContinue = () => {
    if (!resumeFile) {
      alert("Please upload your resume first ✅");
      return;
    }

    // Pass resume file to setup page to generate AI questions
    navigate("/setup", { state: { resumeFile } });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Upload Resume</h1>
        <p style={styles.subtitle}>
          Upload your resume (PDF) to generate personalized interview questions.
        </p>

        <label style={styles.uploadBox}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={styles.hiddenInput}
          />

          <div>
            <p style={styles.uploadText}>
              📄 Click here to choose your Resume PDF
            </p>

            {resumeFile && (
              <p style={styles.fileName}>Selected: {resumeFile.name}</p>
            )}
          </div>
        </label>

        <button onClick={handleContinue} style={styles.button}>
          Continue
        </button>

        <p style={styles.note}>
          *Your resume will be used only for generating questions.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "550px",
    background: "#ffffff",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    textAlign: "center",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "28px",
    color: "#111827",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "15px",
    color: "#4b5563",
    marginBottom: "20px",
    lineHeight: "1.5",
  },

  uploadBox: {
    display: "block",
    border: "2px dashed #93c5fd",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    background: "#eff6ff",
    marginBottom: "18px",
  },

  uploadText: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  fileName: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#111827",
  },

  hiddenInput: {
    display: "none",
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
    marginTop: "14px",
    fontSize: "12px",
    color: "#6b7280",
  },
};