import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get company/role/position from setup page
  const { company, role, position, questions: preloadedQuestions } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);

  const normalizeQuestion = (item) => {
    if (!item) return null;
    if (typeof item === "string") {
      return { question: item, idealAnswer: "" };
    }
    return {
      question: item.question || "",
      idealAnswer: item.idealAnswer || item.ideal || item.ideal_answer || "",
      category: item.category || "",
    };
  };

  useEffect(() => {
    if (!company || !role || !position) {
      alert("Setup data missing! Please start again ✅");
      navigate("/setup");
      return;
    }

    // If questions were pre-generated (via resume), normalize them
    if (preloadedQuestions && preloadedQuestions.length > 0) {
      setQuestions(preloadedQuestions.map(normalizeQuestion).filter(Boolean));
      return;
    }

    // Otherwise fetch questions from backend
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/questions?company=${company}&role=${role}&position=${position}`
        );
        const data = await res.json();
        const normalized = (data.questions || []).map(normalizeQuestion).filter(Boolean);
        setQuestions(normalized);
      } catch (error) {
        console.error("Error loading questions:", error);
        alert("Failed to load questions from server");
      }
    };

    fetchQuestions();
  }, [company, role, position, navigate, preloadedQuestions]);

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      alert("Please enter your answer ✅");
      return;
    }

    const currentQuestion = questions[currentIndex];
    const questionText = currentQuestion?.question || "";
    const idealAnswer = currentQuestion?.idealAnswer || "";

    if (!questionText) {
      alert("Current question is missing. Please restart the interview.");
      return;
    }

    if (!idealAnswer) {
      console.warn("Ideal answer missing for question:", questionText);
    }

    const newEntry = {
      question: questionText,
      ideal: idealAnswer,
      answer: answer.trim(),
    };

    const updatedAnswers = [...allAnswers, newEntry];
    setAllAnswers(updatedAnswers);
    setAnswer("");

    // Next question or finish
    if (currentIndex >= questions.length - 1) {
      navigate("/results", {
        state: {
          answers: updatedAnswers,
        },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Loading Interview Questions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Mock Interview</h2>
          <p style={styles.progress}>
            Question {currentIndex + 1} / {questions.length}
          </p>
        </div>

        <div style={styles.infoBar}>
          <span><b>Company:</b> {company}</span>
          <span><b>Role:</b> {role}</span>
          <span><b>Level:</b> {position}</span>
        </div>

        <div style={styles.questionBox}>
          <p style={styles.questionLabel}>Question:</p>
          <p style={styles.questionText}>{questions[currentIndex]?.question || "(Question text unavailable)"}</p>
        </div>

        <textarea
          style={styles.textarea}
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button style={styles.button} onClick={handleSubmitAnswer}>
          Submit & Next ➜
        </button>

        <button style={styles.backBtn} onClick={() => navigate("/setup")}>
          ⬅ Back to Setup
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
    maxWidth: "750px",
    background: "#fff",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "10px",
  },
  heading: {
    margin: 0,
    fontSize: "22px",
    color: "#111827",
  },
  progress: {
    margin: 0,
    fontSize: "14px",
    color: "#4b5563",
  },
  infoBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    background: "#eff6ff",
    padding: "10px",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#1d4ed8",
    marginBottom: "16px",
  },
  questionBox: {
    padding: "16px",
    borderRadius: "14px",
    background: "#f9fafb",
    marginBottom: "16px",
  },
  questionLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
  },
  questionText: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    lineHeight: "1.5",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
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
