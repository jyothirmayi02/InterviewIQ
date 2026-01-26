import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");

  const handleStart = () => {
    if (!company || !role || !position) {
      alert("Please select Company, Role and Position ✅");
      return;
    }

    // Later we will send this data to backend & generate questions
    //alert(`Selected:\nCompany: ${company}\nRole: ${role}\nPosition: ${position}`);

    // Next page (later): Interview page
    // For now, just navigate to a dummy interview route
    navigate("/interview", {
    state: { company, role, position },
  });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Interview Setup</h1>
        <p style={styles.subtitle}>
          Select your target company, role and position level.
        </p>

        {/* Company */}
        <div style={styles.field}>
          <label style={styles.label}>Company</label>
          <select
            style={styles.select}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          >
            <option value="">-- Select Company --</option>
            <option value="Amazon">Amazon</option>
            <option value="Infosys">Infosys</option>
            <option value="TCS">TCS</option>
            <option value="Google">Google</option>
          </select>
        </div>

        {/* Role */}
        <div style={styles.field}>
          <label style={styles.label}>Role</label>
          <select
            style={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Analyst">Data Analyst</option>
          </select>
        </div>

        {/* Position */}
        <div style={styles.field}>
          <label style={styles.label}>Position Level</label>
          <select
            style={styles.select}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">-- Select Position --</option>
            <option value="Fresher">Fresher</option>
            <option value="Intern">Intern</option>
            <option value="Experienced">Experienced</option>
          </select>
        </div>

        <button style={styles.button} onClick={handleStart}>
          Start Mock Interview
        </button>

        <button style={styles.backBtn} onClick={() => navigate("/upload")}>
          ⬅ Back
        </button>
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
    background: "#fff",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "8px",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    color: "#4b5563",
    marginBottom: "20px",
  },

  field: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#111827",
    fontSize: "14px",
  },

  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
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
    marginTop: "10px",
  },

  backBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "12px",
  },
};
