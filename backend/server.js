const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const connectDB = require("./config/db");
const Question = require("./models/Question");
const Answer = require("./models/Answer");
require("dotenv").config();

// Connect to MongoDB
connectDB();

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
        ideal_answer:
          "Virtual DOM is a lightweight copy of the real DOM. React updates the virtual DOM first, compares differences and efficiently updates only changed parts in the real DOM to improve performance.",
        category: "technical"
      },
      {
        question: "What are React Hooks?",
        ideal_answer:
          "React Hooks are functions like useState and useEffect that let functional components use state and lifecycle features without class components.",
        category: "technical"
      },
      {
        question: "Difference between props and state?",
        ideal_answer:
          "Props are read-only inputs passed from parent to child, while state is local mutable data managed inside a component.",
        category: "technical"
      },
      {
        question: "What is CORS?",
        ideal_answer:
          "CORS is a browser security mechanism that restricts cross origin HTTP requests unless the server allows them using specific headers.",
        category: "technical"
      },
      {
        question: "How do you improve React performance?",
        ideal_answer:
          "By using memoization, React.memo, useMemo, useCallback, code splitting and avoiding unnecessary re-renders.",
        category: "technical"
      },
    ];
  } else {
    questions = [
      {
        question: "Tell me about yourself.",
        ideal_answer:
          "A good answer briefly covers background, key skills, relevant projects and career goals in a structured and concise way.",
        category: "greeting"
      },
      {
        question: "Explain one project you built.",
        ideal_answer:
          "Describe the problem, technologies used, your role, key features and the impact or result of the project.",
        category: "project"
      },
      {
        question: "What are your strengths?",
        ideal_answer:
          "Mention technical strengths, problem solving ability, teamwork and continuous learning with examples.",
        category: "behavioral"
      },
      {
        question: "How do you learn new technology?",
        ideal_answer:
          "By reading documentation, building small projects, following tutorials and practising consistently.",
        category: "resume"
      },
      {
        question: "Why should we hire you?",
        ideal_answer:
          "Because your skills, projects, attitude and ability to learn quickly match the role requirements.",
        category: "closing"
      },
    ];
  }

  if (company === "Amazon") {
    questions[0] = {
      question:
        "Tell me about a time you solved a difficult problem (STAR method).",
      ideal_answer:
        "A structured STAR answer describing Situation, Task, Action and Result showing ownership and problem solving.",
      category: "behavioral"
    };
  }

  res.json({ questions });
});


app.post("/api/evaluate", async (req, res) => {
  const { answers } = req.body;

  if (!answers || answers.length === 0) {
    return res.json({
      overallScore: 0,
      overallFeedback: "No answers submitted.",
      results: [],
    });
  }

  return simpleEvaluation(answers, res);
});

async function simpleEvaluation(answers, res) {
  function preprocessText(text) {
    if (!text || typeof text !== "string") return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  function calculateRelevance(answerWords, idealWords) {
    const answerSet = new Set(answerWords);
    const idealSet = new Set(idealWords);
    const intersection = new Set([...answerSet].filter((x) => idealSet.has(x)));
    const union = new Set([...answerSet, ...idealSet]);
    return union.size ? intersection.size / union.size : 0;
  }

  function extractKeywords(words) {
    const commonWords = new Set([
      "the","and","or","but","in","on","at","to","for","of","with","by",
      "an","a","is","are","was","were","be","been","being","have","has",
      "had","do","does","did","will","would","could","should","can"
    ]);
    return words.filter((word) => word.length > 3 && !commonWords.has(word));
  }

  function calculateKeywordCoverage(answerWords, keywords) {
    if (keywords.length === 0) return 1;
    const answerSet = new Set(answerWords);
    const covered = keywords.filter((k) => answerSet.has(k));
    return covered.length / keywords.length;
  }

  function calculateLengthScore(wordCount) {
    if (wordCount < 10) return 2;
    if (wordCount < 30) return 5;
    if (wordCount < 100) return 8;
    return 10;
  }

  function evaluateWithIdeal(question, answer, idealAnswer) {
    const answerWords = preprocessText(answer);
    const idealWords = preprocessText(idealAnswer);
    const wordCount = answerWords.length;

    if (wordCount === 0) {
      return { score: 0, feedback: "No answer provided", hasIdeal: true };
    }

    const relevance = calculateRelevance(answerWords, idealWords);
    const lengthScore = calculateLengthScore(wordCount);
    const keywords = extractKeywords(idealWords);
    const keywordCoverage = calculateKeywordCoverage(answerWords, keywords);

    // ✅ FIXED SCORING (NO overflow)
    const score = Math.round(
      (relevance * 4) +
      (lengthScore * 0.3) +
      (keywordCoverage * 3)
    );

    let feedback = [];
    if (lengthScore < 5) feedback.push("Answer is too short");
    if (relevance < 0.3) feedback.push("Missing important concepts");
    if (keywordCoverage < 0.5) feedback.push("Include more key terms");
    if (feedback.length === 0) feedback.push("Good answer");

    return { score: Math.min(10, score), feedback: feedback.join("; "), hasIdeal: true };
  }

  function evaluateWithoutIdeal(question, answer) {
    const answerWords = preprocessText(answer);
    const wordCount = answerWords.length;

    if (wordCount === 0) {
      return { score: 0, feedback: "No answer provided", hasIdeal: false };
    }

    const lengthScore = calculateLengthScore(wordCount);
    const questionWords = preprocessText(question);
    const questionKeywords = extractKeywords(questionWords);
    const keywordCoverage = calculateKeywordCoverage(answerWords, questionKeywords);

    const score = Math.round(
      (lengthScore * 0.7) +
      (keywordCoverage * 3)
    );

    let feedback = [];
    if (lengthScore < 5) feedback.push("Answer is too short");
    if (keywordCoverage < 0.3) feedback.push("Address the question more clearly");
    if (feedback.length === 0) feedback.push("Good attempt");

    return { score: Math.min(10, score), feedback: feedback.join("; "), hasIdeal: false };
  }

  const results = [];
  let totalScore = 0;
  let validCount = 0;

  for (const item of answers) {
    if (!item || !item.question || !item.answer) continue;

    const question = item.question.trim();
    const answer = item.answer.trim();
    const idealAnswer = (item.ideal || item.ideal_answer || item.idealAnswer || "").trim();

    let evaluation;
    if (idealAnswer) {
      evaluation = evaluateWithIdeal(question, answer, idealAnswer);
    } else {
      evaluation = evaluateWithoutIdeal(question, answer);
    }

    results.push({
      question,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      hasIdeal: evaluation.hasIdeal,
    });

    totalScore += evaluation.score;
    validCount++;
  }

  const overallScore = validCount > 0 ? Math.round(totalScore / validCount) : 0;

  let overallFeedback;
  if (overallScore >= 8) overallFeedback = "Excellent performance";
  else if (overallScore >= 5) overallFeedback = "Good but needs improvement";
  else if (overallScore >= 3) overallFeedback = "Average understanding";
  else overallFeedback = "Needs significant improvement";

  return res.json({
    overallScore,
    overallFeedback,
    results,
  });


  // Save answers to database
  try {
    const answerDocuments = [];
    for (const item of answers) {
      const evaluation = results.find(r => r.question === item.question);

      if (item && item.answer && evaluation) {
        let questionId = null;
        if (item.questionId) {
          questionId = item.questionId;
        } else {
          const questionDoc = await Question.findOne({ question: item.question });
          if (questionDoc) {
            questionId = questionDoc._id;
          }
        }

        if (questionId) {
          answerDocuments.push({
            questionId: questionId,
            userAnswer: item.answer,
            score: evaluation.score,
            feedback: evaluation.feedback
          });
        }
      }
    }
    if (answerDocuments.length > 0) {
      const savedAnswers = await Answer.insertMany(answerDocuments);
      console.log(`💾 Saved ${savedAnswers.length} answers to database`);
    }
  } catch (dbError) {
    console.error("❌ Error saving answers to database:", dbError.message);
  }
}

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

Generate exactly 15 interview questions with ideal answers in the following JSON format:

[
  {
    "question": "Question text here",
    "ideal_answer": "Ideal answer text here",
    "category": "category_name"
  }
]

Categories and counts:
- greeting: 2 questions
- resume: 2 questions
- technical: 3 questions
- project: 3 questions
- behavioral: 2 questions
- company: 2 questions
- closing: 1 question

RULES:
- Return ONLY valid JSON array
- No explanations, no numbering, no additional text
- Each question must be unique and professional
- Ideal answers should be concise but comprehensive
- Categories must be exactly one of: greeting, resume, technical, project, behavioral, company, closing`;

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

    // Parse AI response as JSON
    let questions = [];
    try {
      const parsed = JSON.parse(responseText.trim());
      if (Array.isArray(parsed)) {
        // Validate each item has required fields
        questions = parsed.filter(item => 
          item && 
          typeof item.question === 'string' && 
          typeof item.ideal_answer === 'string' && 
          typeof item.category === 'string' &&
          ['greeting', 'resume', 'technical', 'project', 'behavioral', 'company', 'closing'].includes(item.category)
        );
      }
    } catch (parseError) {
      console.warn("❌ Failed to parse AI response as JSON:", parseError.message);
      console.log("Raw response:", responseText.substring(0, 200) + "...");
    }

    // Ensure we have questions, fallback if empty
    if (questions.length === 0) {
      console.log("🔄 Using fallback questions due to parsing failure or empty response");
      questions = [
        {
          question: "Tell me about your technical background and key skills.",
          ideal_answer: "A good answer should highlight relevant experience, technologies mastered, and how they apply to the role.",
          category: "greeting"
        },
        {
          question: "Describe a challenging project you worked on and how you solved it.",
          ideal_answer: "Describe the problem, your approach, technologies used, and the successful outcome.",
          category: "resume"
        },
        {
          question: "What programming languages and frameworks are you most comfortable with?",
          ideal_answer: "List key languages/frameworks with examples of projects or applications built using them.",
          category: "technical"
        },
        {
          question: "How do you approach debugging and problem-solving?",
          ideal_answer: "Explain systematic debugging steps, tools used, and learning from issues.",
          category: "technical"
        },
        {
          question: "Why are you interested in this role and company?",
          ideal_answer: "Connect your skills and career goals with the company's mission and role requirements.",
          category: "company"
        }
      ];
    }

    // Ensure we have exactly 15 questions if possible, but don't pad beyond available
    if (questions.length > 15) {
      questions = questions.slice(0, 15);
      console.log("✂️  Trimmed to 15 questions");
    }

    console.log(`✅ Questions generated successfully: ${questions.length} questions`);

    // Save questions to database
    try {
      const savedQuestions = [];

      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const orderIndex = index + 1; // Start from 1-20

        // Check if question already exists (avoid duplicates)
        const existingQuestion = await Question.findOne({ question: q.question });

        if (existingQuestion) {
          console.log(`⚠️  Question already exists: "${q.question.substring(0, 40)}..."`);
          savedQuestions.push({
            _id: existingQuestion._id,
            question: existingQuestion.question,
            ideal_answer: existingQuestion.idealAnswer,
            category: existingQuestion.category,
            orderIndex: existingQuestion.orderIndex
          });
          continue;
        }

        // Create new question with all required fields
        const newQuestion = new Question({
          question: q.question,
          idealAnswer: q.ideal_answer,
          role: role || null,
          company: company || null,
          position: position || null,
          category: q.category,
          orderIndex: orderIndex
        });

        // Save to MongoDB
        const savedQuestion = await newQuestion.save();
        console.log(`✅ Saved question ${orderIndex}: "${q.question.substring(0, 40)}..."`);

        savedQuestions.push({
          _id: savedQuestion._id,
          question: savedQuestion.question,
          ideal_answer: savedQuestion.idealAnswer,
          category: savedQuestion.category,
          orderIndex: savedQuestion.orderIndex
        });
      }

      console.log(`💾 Saved ${savedQuestions.length} questions to database`);
      res.json({ questions: savedQuestions });
    } catch (dbError) {
      console.error("❌ Error saving questions to database:", dbError.message);
      // Still return questions even if saving fails
      res.json({ questions });
    }
  } catch (error) {
    console.error("❌ Error generating questions:", error.message);

    // Fallback: return static questions with ideal answers
    const fallbackQuestions = [
      {
        question: "Tell me about your technical background and key skills.",
        ideal_answer: "A good answer should highlight relevant experience, technologies mastered, and how they apply to the role.",
        category: "greeting"
      },
      {
        question: "Describe a challenging project you worked on and how you solved it.",
        ideal_answer: "Describe the problem, your approach, technologies used, and the successful outcome.",
        category: "resume"
      },
      {
        question: "What programming languages and frameworks are you most comfortable with?",
        ideal_answer: "List key languages/frameworks with examples of projects or applications built using them.",
        category: "technical"
      },
      {
        question: "How do you approach debugging and problem-solving?",
        ideal_answer: "Explain systematic debugging steps, tools used, and learning from issues.",
        category: "technical"
      },
      {
        question: "Why are you interested in this role and company?",
        ideal_answer: "Connect your skills and career goals with the company's mission and role requirements.",
        category: "company"
      }
    ];

    console.log("🔄 Returning fallback questions");
    res.json({ questions: fallbackQuestions });
  }
});

// Get all questions with optional filters
app.get("/api/questions", async (req, res) => {
  try {
    const { company, role, category, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (company) filter.company = company;
    if (role) filter.role = role;
    if (category) filter.category = category;

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const formattedQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      ideal_answer: q.idealAnswer,
      category: q.category,
      role: q.role,
      company: q.company,
      position: q.position,
      orderIndex: q.orderIndex,
      createdAt: q.createdAt
    }));

    res.json({ questions: formattedQuestions });
  } catch (error) {
    console.error("❌ Error fetching questions:", error.message);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Get a specific question by ID
app.get("/api/questions/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({
      _id: question._id,
      question: question.question,
      ideal_answer: question.idealAnswer,
      category: question.category,
      role: question.role,
      company: question.company,
      position: question.position,
      orderIndex: question.orderIndex,
      createdAt: question.createdAt
    });
  } catch (error) {
    console.error("❌ Error fetching question:", error.message);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

// Get all answers with optional filters
app.get("/api/answers", async (req, res) => {
  try {
    const { questionId, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (questionId) filter.questionId = questionId;

    const answers = await Answer.find(filter)
      .populate('questionId', 'question category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({ answers });
  } catch (error) {
    console.error("❌ Error fetching answers:", error.message);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

