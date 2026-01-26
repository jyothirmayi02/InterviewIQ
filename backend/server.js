const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "InterviewIQ Backend Running ✅" });
});

// Sample Questions API (temporary)
app.get("/api/questions", (req, res) => {
  const { company, role, position } = req.query;

  res.json({
    company,
    role,
    position,
    questions: [
      "Tell me about yourself.",
      "Explain your final year project.",
      "What is React and why is it used?",
      "What is Node.js?",
      "What is REST API?"
    ],
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
