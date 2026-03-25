const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
//const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration - store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "InterviewIQ Backend Running ✅" });
});

// Health check for automated tests
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Sample Questions API (temporary)
app.get("/api/questions", (req, res) => {
  const { company, role } = req.query;

  let questions = [];

  if (role === "Frontend Developer") {
    questions = [
      {
        question: "Explain Virtual DOM in React.",
        ideal:
          "Virtual DOM is a lightweight copy of the real DOM. React updates the virtual DOM first, compares differences and efficiently updates only changed parts in the real DOM to improve performance.",
      },
      {
        question: "What are React Hooks?",
        ideal:
          "React Hooks are functions like useState and useEffect that let functional components use state and lifecycle features without class components.",
      },
      {
        question: "Difference between props and state?",
        ideal:
          "Props are read-only inputs passed from parent to child, while state is local mutable data managed inside a component.",
      },
      {
        question: "What is CORS?",
        ideal:
          "CORS is a browser security mechanism that restricts cross origin HTTP requests unless the server allows them using specific headers.",
      },
      {
        question: "How do you improve React performance?",
        ideal:
          "By using memoization, React.memo, useMemo, useCallback, code splitting and avoiding unnecessary re-renders.",
      },
    ];
  } else {
    questions = [
      {
        question: "Tell me about yourself.",
        ideal:
          "A good answer briefly covers background, key skills, relevant projects and career goals in a structured and concise way.",
      },
      {
        question: "Explain one project you built.",
        ideal:
          "Describe the problem, technologies used, your role, key features and the impact or result of the project.",
      },
      {
        question: "What are your strengths?",
        ideal:
          "Mention technical strengths, problem solving ability, teamwork and continuous learning with examples.",
      },
      {
        question: "How do you learn new technology?",
        ideal:
          "By reading documentation, building small projects, following tutorials and practising consistently.",
      },
      {
        question: "Why should we hire you?",
        ideal:
          "Because your skills, projects, attitude and ability to learn quickly match the role requirements.",
      },
    ];
  }

  if (company === "Amazon") {
    questions[0] = {
      question:
        "Tell me about a time you solved a difficult problem (STAR method).",
      ideal:
        "A structured STAR answer describing Situation, Task, Action and Result showing ownership and problem solving.",
    };
  }

  res.json({ questions });
});


app.post("/api/evaluate", async (req, res) => {
  const { answers } = req.body;

  if (!answers || answers.length === 0) {
    return res.json({ score: 0, feedback: "No answers submitted." });
  }

  // If no API key, use simple scoring
  if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  No GROQ_API_KEY for detailed evaluation -- using simple scoring");
    return simpleEvaluation(answers, res);
  }

  // Use AI for detailed evaluation
  await detailedEvaluation(answers, res);
});

async function detailedEvaluation(answers, res) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let totalScore = 0;
    let validCount = 0;
    const evaluations = [];

    for (const item of answers) {
      if (!item || !item.answer) continue;

      const question = item.question || "General question";
      const candidateAnswer = item.answer.trim();

      // If no ideal answer, create a generic one or skip detailed eval
      const idealAnswer = item.ideal || "A comprehensive answer demonstrating technical knowledge and clear explanation.";

      const prompt = `
You are an expert technical interviewer for a platform called "Interview IQ".

Your task is to evaluate a candidate's answer to an interview question and help them improve by comparing it with an ideal answer.

Follow this exact structured format in your response:

---

### 1. Question

Display the given interview question.

### 2. Candidate Answer

Display the candidate's answer exactly as provided.

### 3. Ideal Answer

Write a clear, concise, and technically correct ideal answer that a strong candidate would give in an interview.

---

### 4. Evaluation

**Accuracy:** (Correct / Partially Correct / Incorrect)
**Completeness:** (What important points are missing or covered)
**Clarity:** (How well the answer is structured and explained)

---

### 5. Score (Out of 10)

* Technical Accuracy: /5
* Explanation Quality: /3
* Completeness: /2

**Total Score: /10**

---

### 6. Feedback

Provide constructive feedback including:

* What the candidate did well
* What needs improvement
* Specific suggestions to improve the answer

---

### 7. Improved Answer

Rewrite the candidate's answer into a better and more complete version based on their attempt.

---

### 8. 📘 Learn from the Ideal Answer

Display the ideal answer again so the candidate can study and learn from it.

---

### Important Instructions:

* Keep the tone professional, supportive, and encouraging.
* Do not discourage the candidate even if the answer is wrong.
* Keep explanations simple and easy to understand.
* Always include all sections, even if the candidate answer is weak or empty.
* Do not skip the Ideal Answer—it is mandatory.

---

### Input Format:

Question: ${question}
Candidate Answer: ${candidateAnswer}
Ideal Answer: ${idealAnswer}
`;

      // Try models for evaluation
      let evaluationText = null;
      for (const model of ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-20b", "openai/gpt-oss-120b"]) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
          });
          evaluationText = completion.choices?.[0]?.message?.content;
          if (evaluationText) break;
        } catch (err) {
          console.warn(`Model ${model} failed for evaluation:`, err.message);
        }
      }

      if (!evaluationText) {
        // Fallback to simple scoring for this item
        const score = candidateAnswer.length > 50 ? 7 : 5;
        evaluations.push({
          question,
          answer: candidateAnswer,
          score,
          feedback: "Detailed evaluation unavailable. Basic score based on answer length.",
        });
        totalScore += score;
        validCount++;
        continue;
      }

      // Extract score from evaluation text (look for "Total Score: X/10")
      const scoreMatch = evaluationText.match(/Total Score:\s*(\d+)\/10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

      evaluations.push({
        question,
        answer: candidateAnswer,
        score,
        detailedEvaluation: evaluationText,
      });

      totalScore += score;
      validCount++;
    }

    if (validCount === 0) {
      return res.json({ score: 0, feedback: "Answers are invalid or missing." });
    }

    const avgScore = Math.round(totalScore / validCount);

    res.json({
      score: avgScore,
      feedback: `Average score: ${avgScore}/10 based on detailed AI evaluation.`,
      evaluations, // Include detailed evaluations for each question
    });

  } catch (error) {
    console.error("❌ Detailed evaluation failed:", error.message);
    // Fallback to simple evaluation
    return simpleEvaluation(answers, res);
  }
}

function simpleEvaluation(answers, res) {
  function similarity(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return 0;
    const aw = a.toLowerCase().split(/\W+/);
    const bw = b.toLowerCase().split(/\W+/);
    const common = aw.filter((w) => bw.includes(w));
    return bw.length ? common.length / new Set(bw).size : 0;
  }

  let total = 0;
  let validCount = 0;

  answers.forEach((item) => {
    if (!item || !item.answer) return;

    let score;
    if (item.ideal && item.ideal.trim().length > 0) {
      const sim = similarity(item.answer, item.ideal);
      score = Math.round(sim * 10);
    } else {
      const answerLength = item.answer.trim().length;
      if (answerLength < 10) score = 2;
      else if (answerLength < 50) score = 5;
      else if (answerLength < 150) score = 7;
      else score = 9;
    }

    total += score;
    validCount += 1;
  });

  if (validCount === 0) {
    return res.json({ score: 0, feedback: "Answers are invalid or missing." });
  }

  const avgScore = Math.round(total / validCount);

  let message;
  if (avgScore >= 8) {
    message = "Excellent answers! You provided thoughtful and detailed responses.";
  } else if (avgScore >= 6) {
    message = "Good answers! You covered most topics well.";
  } else if (avgScore >= 4) {
    message = "Fair answers. Try to provide more detail and thought next time.";
  } else {
    message = "Answers need improvement. Provide more comprehensive responses.";
  }

  res.json({ score: avgScore, feedback: message });
}

// Debug endpoint: Test skill extraction from resume
app.post("/api/test-skills", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🔍 Testing skill extraction...");

    // Parse PDF
    let resumeText = "";
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text;
    } catch (pdfError) {
      return res.status(400).json({ error: "Failed to parse PDF" });
    }

    // Clean text
    resumeText = resumeText
      .substring(0, 3000)
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    console.log("📝 Resume text:", resumeText.substring(0, 200) + "...");

    // Extract skills - keyword matching
    const skillKeywords = [
      "javascript", "python", "java", "react", "node.js", "express.js", "mongodb", "sql",
      "html", "css", "typescript", "angular", "vue", "aws", "docker", "kubernetes",
      "git", "linux", "rest api", "graphql", "mysql", "postgresql", "firebase",
      "c++", "c#", "php", "ruby", "go", "rust", "swift", "kotlin"
    ];
    
    const resumeLower = resumeText.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => resumeLower.includes(skill));

    console.log("✅ Found skills:", foundSkills);

    res.json({
      message: "Skill extraction test",
      resumePreview: resumeText.substring(0, 300) + "...",
      totalResumeLength: resumeText.length,
      foundSkills: foundSkills,
      skillCount: foundSkills.length,
      debug: {
        availableKeywords: skillKeywords.length,
        keywordsChecked: skillKeywords
      }
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate AI-based interview questions from resume
app.post("/api/generate-questions", upload.single("resume"), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Processing resume...");

    // Parse PDF
    let resumeText = "";
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text;
    } catch (pdfError) {
      console.error("❌ PDF parsing failed:", pdfError.message);
      return res.status(400).json({ error: "Failed to parse PDF" });
    }

    // Clean text: limit to ~3000 chars, remove extra spaces, normalize line breaks
    resumeText = resumeText
      .substring(0, 3000)
      .replace(/\s+/g, " ") // Remove extra spaces
      .replace(/\n+/g, "\n") // Normalize line breaks
      .trim();

    console.log("✅ Resume text extracted:", resumeText.substring(0, 100) + "...");

    // Extract company, role, position from request body
    const { company = "General", role = "General", position = "Candidate" } = req.body;

    // Extract skills - for logging purposes
    const skillKeywords = [
      "javascript", "python", "java", "react", "nodejs", "express", "mongodb", "sql",
      "html", "css", "typescript", "angular", "vue", "aws", "docker", "kubernetes",
      "git", "linux", "rest api", "graphql", "mysql", "postgresql", "firebase"
    ];
    
    const resumeLower = resumeText.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => resumeLower.includes(skill));
    console.log("📌 Detected skills:", foundSkills.length > 0 ? foundSkills : "None detected");

    // Prepare prompt - structured format enforces all categories
    const prompt = `You are a professional interviewer. Generate a complete structured interview based on this resume and details.

RESUME:
${resumeText}

CANDIDATE DETAILS:
- Company: ${company}
- Role: ${role}
- Position Level: ${position}

GENERATE EXACTLY 15-20 interview questions, organized into categories. Each question should be on a NEW LINE and numbered.

**CATEGORY 1: GREETING (2 questions)**
Ask warmup questions to make candidate comfortable.

**CATEGORY 2: RESUME-BASED (3-4 questions)**
Ask specific questions about their resume, work experience, and skills.

**CATEGORY 3: TECHNICAL (4-5 questions)**
Ask technical questions specific to the ${role} role.

**CATEGORY 4: PROJECT-BASED (3-4 questions)**
Ask about specific projects they built or worked on.

**CATEGORY 5: BEHAVIORAL (2-3 questions)**
Ask STAR-method behavioral questions about challenges and conflict resolution.

**CATEGORY 6: COMPANY-SPECIFIC (2-3 questions)**
Ask questions specific to ${company} and why they want to work there.

**CATEGORY 7: CLOSING (1-2 questions)**
Ask closing questions and allow candidate to ask questions.

RULES:
- Each question on a NEW line
- Exactly ONE question per line
- NO numbering like "1." at start (just the question)
- Questions must be clear, specific, and professional
- NO answers or explanations
- ONLY QUESTIONS`;

    console.log("🤖 Preparing to generate AI questions...");

    // If no model API key is available, skip the live AI call and use fallback questions
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️  No GROQ_API_KEY found -- using fallback question set.");
      throw new Error("No GROQ_API_KEY configured");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const modelCandidates = [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
    ];

    let responseText = null;
    let usedModel = null;

    for (const model of modelCandidates) {
      try {
        console.log(`🤖 Trying model: ${model}`);
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        responseText = completion.choices?.[0]?.message?.content;
        if (responseText) {
          usedModel = model;
          break;
        }

      } catch (modelError) {
        console.warn(`⚠️ Model ${model} failed:`, modelError?.message || modelError);

        // If there is a strong deprecation error, continue to next model.
        if (modelError?.code === "model_decommissioned" ||
            (modelError?.error && modelError.error.code === "model_decommissioned")) {
          continue;
        }

        // For other kinds of errors, keep trying the next candidate;
        // do not crash user flow.
        continue;
      }
    }

    if (!responseText) {
      throw new Error("No valid model response received");
    }

    console.log(`✅ AI response received from model: ${usedModel}`);

    // Parse questions: split by newline, clean up, validate
    let questions = responseText
      .split('\n')
      .map(line => line
        .replace(/^[\d\.]+(\.|\)|\s)+/, '') // Remove numbering (1., 1), 1  etc)
        .replace(/^\*\*[A-Z\s]+\*\*/, '')   // Remove category headers
        .replace(/^[-*]\s+/, '')             // Remove bullet points
        .trim()
      )
      .filter(q => {
        // Must be non-empty and at least some length
        if (!q || q.length < 8) return false;
        // Should look like a question (end with ?, or be command-like)
        if (!q.includes('?') && !q.match(/^(describe|explain|tell|how|why|what|when|where|which)/i)) return false;
        // Filter out category headers and metadata
        if (q.match(/^(CATEGORY|RULE|RESUME|COMPANY|CLOSING|TECHNICAL|BEHAVIORAL|GREETING|PROJECT|QUESTION)/i)) return false;
        // Filter out very long fragments (likely parsing errors)
        if (q.length > 250) return false;
        // Filter out common AI junk
        if (q.includes('**') || q.includes('--') || q.match(/^(Example|Answer|Note|Tip)/i)) return false;
        return true;
      });

    // Remove duplicates (case-insensitive)
    const seen = new Set();
    questions = questions.filter(q => {
      const normalized = q.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    // Ensure we have 15-20 questions
    if (questions.length < 15 && questions.length > 0) {
      console.log(`⚠️  Only ${questions.length} questions generated but expected 15-20`);
    } else if (questions.length > 20) {
      questions = questions.slice(0, 20);
      console.log("✂️  Trimmed to 20 questions");
    }

    console.log(`✅ Questions generated successfully: ${questions.length} questions`);
    res.json({ questions });
  } catch (error) {
    console.error("❌ Error generating questions:", error.message);

    // Fallback: return static questions
    const fallbackQuestions = [
      "Tell me about your technical background and key skills.",
      "Describe a challenging project you worked on and how you solved it.",
      "What programming languages and frameworks are you most comfortable with?",
      "How do you approach debugging and problem-solving?",
      "Why are you interested in this role and company?",
    ];

    console.log("🔄 Returning fallback questions");
    res.json({ questions: fallbackQuestions });
  }
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

