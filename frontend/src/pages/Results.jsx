import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const { company, role, position, answers } = location.state || {};

  // ✅ If no results data found
  if (!answers || answers.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: "red" }}>No interview data found ❌</h2>
          <button style={styles.button} onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ Simple overall score calculation (based on answer length)
  // (Later we will replace this with ML scoring)
  const totalScore = answers.reduce((sum, item) => {
    const len = item.answer.length;

    // simple scoring out of 10
    let score = 2;
    if (len > 40) score = 5;
    if (len > 80) score = 7;
    if (len > 120) score = 9;

    return sum + score;
  }, 0);

  const avgScore = Math.round(totalScore / answers.length);

  // ✅ Overall Feedback based on avg score
  let overallMessage = "";
  if (avgScore >= 8) {
    overallMessage = "Excellent ✅ You answered confidently and clearly.";
  } else if (avgScore >= 5) {
    overallMessage =
      "Good 👍 Your answers are fine. Try adding more examples and technical details.";
  } else {
    overallMessage =
      "Needs Improvement ⚠️ Please improve explanation, clarity, and confidence.";
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Final Interview Report ✅</h1>

        {/* Candidate Setup Info */}
        <div style={styles.infoBar}>
          <p style={styles.infoText}>
            <b>Company:</b> {company}
          </p>
          <p style={styles.infoText}>
            <b>Role:</b> {role}
          </p>
          <p style={styles.infoText}>
            <b>Position:</b> {position}
          </p>
        </div>

        {/* Overall Score */}
        <div style={styles.scoreBox}>
          <h2 style={styles.scoreTitle}>Overall Score</h2>
          <p style={styles.scoreValue}>{avgScore}/10</p>
          <p style={styles.feedback}>{overallMessage}</p>
        </div>

        {/* Q&A Summary */}
        <h3 style={styles.sectionTitle}>Your Answers</h3>

        <div style={styles.list}>
          {answers.map((item, index) => (
            <div key={index} style={styles.item}>
              <p style={styles.q}>
                <b>Q{index + 1}:</b> {item.question}
              </p>
              <p style={styles.a}>
                <b>Your Answer:</b> {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button style={styles.button} onClick={() => navigate("/")}>
          Go to Home
        </button>

        <button style={styles.secondaryButton} onClick={() => navigate("/setup")}>
          Try Another Interview
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
    maxWidth: "900px",
    background: "#fff",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "18px",
    color: "#111827",
  },

  infoBar: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    background: "#eff6ff",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "18px",
  },

  infoText: {
    margin: 0,
    color: "#1d4ed8",
    fontSize: "14px",
  },

  scoreBox: {
    textAlign: "center",
    padding: "18px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  scoreTitle: {
    margin: 0,
    color: "#166534",
  },

  scoreValue: {
    margin: "8px 0",
    fontSize: "34px",
    fontWeight: "bold",
    color: "#15803d",
  },

  feedback: {
    margin: 0,
    color: "#166534",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  sectionTitle: {
    marginBottom: "12px",
    color: "#111827",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },

  item: {
    padding: "14px",
    background: "#f9fafb",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },

  q: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "14px",
  },

  a: {
    margin: 0,
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.5",
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
    marginBottom: "12px",
  },

  secondaryButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
