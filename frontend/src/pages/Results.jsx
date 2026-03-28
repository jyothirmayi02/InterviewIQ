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
        setScore(data.overallScore);
        setFeedback(data.overallFeedback);
        setEvaluations(data.results || []);
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

        {/*
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
        </div>*/}

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
        <h3 style={styles.sectionTitle}>Detailed Question Review</h3>

        <div style={styles.list}>
          {answers.map((item, index) => {
            const evalData = evaluations.find(e => e.question === item.question) || {};
            return (
              <div key={index} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <h4 style={styles.questionText}>Q{index + 1}: {item.question}</h4>
                  <div style={styles.scoreBadge}>
                    Score: {evalData.score || 0}/10
                  </div>
                </div>

                <div style={styles.answerSection}>
                  <div style={styles.userAnswer}>
                    <h5 style={styles.sectionLabel}>Your Answer:</h5>
                    <p style={styles.answerText}>{item.answer}</p>
                  </div>

                  <div style={styles.idealAnswer}>
                    <h5 style={styles.sectionLabel}>Ideal Answer:</h5>
                    <p style={styles.answerText}>{item.ideal || "Not available"}</p>
                  </div>
                </div>

                {(evalData.feedback || evalData.detailedEvaluation) && (
                  <div style={styles.feedbackSection}>
                    <h5 style={styles.sectionLabel}>Feedback:</h5>
                    {evalData.detailedEvaluation ? (
                      <details style={styles.details}>
                        <summary style={styles.summary}>📋 View Detailed Evaluation</summary>
                        <pre style={styles.evalText}>{evalData.detailedEvaluation}</pre>
                      </details>
                    ) : (
                      <p style={styles.feedbackText}>{evalData.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Strengths and Weaknesses */}
        {!loading && evaluations.length > 0 && (
          <div style={styles.analysisSection}>
            <div style={styles.strengthsCard}>
              <h3 style={styles.analysisTitle}>💪 Strengths</h3>
              <ul style={styles.analysisList}>
                {evaluations
                  .filter(e => e.score >= 7)
                  .map((e, i) => (
                    <li key={i} style={styles.analysisItem}>
                      Strong performance on: "{e.question.substring(0, 50)}..."
                    </li>
                  ))}
                {evaluations.filter(e => e.score >= 7).length === 0 && (
                  <li style={styles.analysisItem}>Keep practicing to build strengths!</li>
                )}
              </ul>
            </div>

            <div style={styles.weaknessesCard}>
              <h3 style={styles.analysisTitle}>🎯 Areas for Improvement</h3>
              <ul style={styles.analysisList}>
                {evaluations
                  .filter(e => e.score < 7)
                  .map((e, i) => (
                    <li key={i} style={styles.analysisItem}>
                      Focus on: "{e.question.substring(0, 50)}..." ({e.feedback || "Review ideal answer"})
                    </li>
                  ))}
                {evaluations.filter(e => e.score < 7).length === 0 && (
                  <li style={styles.analysisItem}>Great job! No major weaknesses identified.</li>
                )}
              </ul>
            </div>
          </div>
        )}

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
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "28px",
    color: "#111827",
    textAlign: "center",
  },
  infoBar: {
    display: "flex",
    justifyContent: "space-around",
    gap: "10px",
    flexWrap: "wrap",
    background: "#eff6ff",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "25px",
    fontSize: "14px",
    color: "#1d4ed8",
  },
  infoText: {
    margin: 0,
    fontWeight: "bold",
  },
  scoreBox: {
    textAlign: "center",
    background: "#f0f9ff",
    padding: "25px",
    borderRadius: "14px",
    marginBottom: "30px",
    border: "2px solid #0ea5e9",
  },
  scoreTitle: {
    margin: "0 0 10px 0",
    fontSize: "20px",
    color: "#0f172a",
  },
  scoreValue: {
    margin: "0 0 10px 0",
    fontSize: "48px",
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  feedback: {
    margin: 0,
    fontSize: "16px",
    color: "#374151",
  },
  sectionTitle: {
    margin: "30px 0 20px 0",
    fontSize: "22px",
    color: "#111827",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "30px",
  },
  questionCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  questionText: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
    flex: 1,
  },
  scoreBadge: {
    background: "#10b981",
    color: "#fff",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  answerSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "15px",
  },
  userAnswer: {},
  idealAnswer: {},
  sectionLabel: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    color: "#374151",
    fontWeight: "bold",
  },
  answerText: {
    margin: 0,
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.5",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  feedbackSection: {
    marginTop: "15px",
  },
  feedbackText: {
    margin: 0,
    fontSize: "14px",
    color: "#dc2626",
    background: "#fef2f2",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
  },
  details: {
    marginTop: "10px",
  },
  summary: {
    cursor: "pointer",
    fontSize: "14px",
    color: "#2563eb",
    fontWeight: "bold",
  },
  evalText: {
    fontSize: "13px",
    color: "#374151",
    whiteSpace: "pre-wrap",
    background: "#f3f4f6",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    maxHeight: "300px",
    overflowY: "auto",
  },
  analysisSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "30px",
  },
  strengthsCard: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
    padding: "20px",
  },
  weaknessesCard: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "20px",
  },
  analysisTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    color: "#111827",
  },
  analysisList: {
    margin: 0,
    paddingLeft: "20px",
  },
  analysisItem: {
    marginBottom: "8px",
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.4",
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
    marginBottom: "10px",
  },
  secondaryButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontSize: "15px",
    cursor: "pointer",
  },
};
