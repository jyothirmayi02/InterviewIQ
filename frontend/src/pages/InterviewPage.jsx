import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get company/role/position from setup page
  const { company, role, position } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);

  // ✅ Generate questions dynamically
  const generateQuestions = (company, role, position) => {
    let generated = [];

    // Role-based questions
    if (role === "Frontend Developer") {
      generated = [
        "Explain Virtual DOM in React.",
        "What are React Hooks? Why are they used?",
        "Explain the difference between props and state.",
        "What is CORS and why does it happen?",
        "How do you optimize a React application?"
      ];
    } else if (role === "Backend Developer") {
      generated = [
        "What is REST API?",
        "Explain middleware in Express.js.",
        "Difference between SQL and NoSQL databases?",
        "How authentication works using JWT?",
        "What is API rate limiting?"
      ];
    } else if (role === "Full Stack Developer") {
      generated = [
        "Explain MERN stack architecture.",
        "How does frontend communicate with backend?",
        "What is JWT authentication?",
        "Explain CRUD operations.",
        "How do you deploy a full stack application?"
      ];
    } else {
      // Default general questions
      generated = [
        "Tell me about yourself.",
        "What is your strongest skill?",
        "Explain one project from your resume.",
        "What are your future goals?",
        "Why should we hire you?"
      ];
    }

    // Company-based adjustment
    if (company === "Amazon") {
      generated[0] = "Tell me about a time you solved a difficult problem (STAR method).";
    }

    // Position-based adjustment
    if (position === "Fresher" || position === "Intern") {
      // keep easy questions
      return generated;
    } else {
      // add slightly advanced question
      generated[generated.length - 1] = "Explain how you handle system scalability and performance.";
      return generated;
    }
  };

  useEffect(() => {
    if (!company || !role || !position) {
      alert("Setup data missing! Please start again ✅");
      navigate("/setup");
      return;
    }

    const q = generateQuestions(company, role, position);
    setQuestions(q);
    // eslint-disable-next-line
  }, []);

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      alert("Please enter your answer ✅");
      return;
    }

    const newEntry = {
      question: questions[currentIndex],
      answer: answer.trim(),
    };

    const updatedAnswers = [...allAnswers, newEntry];
    setAllAnswers(updatedAnswers);
    setAnswer("");

    // Next question
    if (currentIndex === questions.length - 1) {
      // ✅ Interview completed → go to results page
      navigate("/results", {
        state: {
          company,
          role,
          position,
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
          <p style={styles.questionText}>{questions[currentIndex]}</p>
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
