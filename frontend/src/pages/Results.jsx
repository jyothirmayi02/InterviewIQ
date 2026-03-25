import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { company, role, position, answers } = location.state || {};

  const [score, setScore] = React.useState(null);
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [evaluations, setEvaluations] = React.useState([]);
  
  React.useEffect(() => {
    const evaluate = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        });

        const data = await res.json();
        setScore(data.score);
        setFeedback(data.feedback);
        setEvaluations(data.evaluations || []);
      } catch (err) {
        console.error("Evaluation failed", err);
        setFeedback("Failed to get evaluation from server.");
      } finally {
        setLoading(false);
      }
    };

    if (answers && answers.length > 0) {
      evaluate();
    }
  }, [answers]);
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

  {loading ? (
    <p>Evaluating your answers...</p>
  ) : (
    <>
      <p style={styles.scoreValue}>{score}/10</p>
      <p style={styles.feedback}>{feedback}</p>
    </>
  )}
</div>

        {/* Q&A Summary */}
        <h3 style={styles.sectionTitle}>Your Answers & Detailed Feedback</h3>

        <div style={styles.list}>
          {answers.map((item, index) => {
            const evalData = evaluations[index];
            return (
              <div key={index} style={styles.item}>
                <p style={styles.q}>
                  <b>Q{index + 1}:</b> {item.question}
                </p>
                <p style={styles.a}>
                  <b>Your Answer:</b> {item.answer}
                </p>
                {evalData && evalData.score !== undefined && (
                  <p style={styles.score}>
                    <b>Score:</b> {evalData.score}/10
                  </p>
                )}
                {evalData && evalData.detailedEvaluation && (
                  <div style={styles.detailedEval}>
                    <details>
                      <summary style={styles.summary}>📋 View Detailed Evaluation</summary>
                      <pre style={styles.evalText}>{evalData.detailedEvaluation}</pre>
                    </details>
                  </div>
                )}
                {evalData && evalData.feedback && !evalData.detailedEvaluation && (
                  <p style={styles.feedbackText}>
                    <b>Feedback:</b> {evalData.feedback}
                  </p>
                )}
              </div>
            );
          })}
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

  score: {
    margin: "8px 0",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "bold",
  },

  detailedEval: {
    marginTop: "10px",
  },

  summary: {
    cursor: "pointer",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  evalText: {
    background: "#f9fafb",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap",
    color: "#374151",
    border: "1px solid #e5e7eb",
    maxHeight: "400px",
    overflowY: "auto",
  },

  feedbackText: {
    marginTop: "8px",
    color: "#059669",
    fontSize: "14px",
    fontStyle: "italic",
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
