import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get company/role/position from setup page
  const { company, role, position, questions: preloadedQuestions } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const videoRef = React.useRef(null);

  const [faceCount, setFaceCount] = useState(0);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [smileCount, setSmileCount] = useState(0);
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

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
  };
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech not supported");
      return;
    }
    const recog = new SpeechRecognition();

    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = false;

    recog.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      // Append speech to existing text
      setAnswer((prev) => prev + " " + transcript);
    };



    /*recognition.onend = () => {
      setListening(false);
      };*/
    recog.onend = () => {
      if (listening) {
        recog.start(); // Restart recognition if it stopped unexpectedly
      }
    };
    setRecognition(recog);
    return () => {
      recog.stop();
    };
  }, []);


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

  const toggleListening = () => {
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play(); // IMPORTANT
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startDetection = () => {
    setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const detections = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceExpressions();

      if (detections.length > 0) {
        setFaceCount((prev) => prev + 1);

        const expressions = detections[0].expressions;

        if (expressions.happy > 0.5) {
          setSmileCount((prev) => prev + 1);
        }
      } else {
        setNoFaceCount((prev) => prev + 1);
      }
    }, 1000);
  };
  useEffect(() => {
    const init = async () => {
      await loadModels();
      await startVideo();
      setTimeout(() => {
        startDetection();
      }, 2000); // Start detection after 2 seconds to allow video to initialize
    };
    init();
  }, []);
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
      const totalFrames = faceCount + noFaceCount;
      const facePresence = totalFrames > 0 ? (faceCount / totalFrames) * 100 : 0;
      const smileRate = faceCount > 0 ? (smileCount / faceCount) * 100 : 0;

      const feedback = [];
      // 🎯 Eye contact
      if (facePresence > 80) {
        feedback.push("Excellent eye contact maintained throughout the interview");
      } else if (facePresence > 50) {
        feedback.push("Good eye contact, but can improve consistency");
      } else {
        feedback.push("Try to maintain better eye contact with the camera");
      }

      // 🎯 Confidence (based on presence)
      if (facePresence > 70) {
        feedback.push("Good confidence and engagement");
      } else {
        feedback.push("You seemed less engaged at times, stay focused");
      }

      // 🎯 Smile / expression
      if (smileRate > 0.3) {
        feedback.push("Great positive expressions and friendliness");
      } else if (smileRate > 0.1) {
        feedback.push("Occasional positive expressions, try to smile more");
      } else {
        feedback.push("Try to smile more to appear confident and approachable");
      }

      // 🎯 Final summary
      if (feedback.length === 0) {
        feedback.push("Excellent overall presence and confidence");
      }
      navigate("/results", {
        state: {
          answers: updatedAnswers,
          webcamFeedback: feedback,
        },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">
            Loading Interview Questions...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* 🔵 Navbar (Same as Home) */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm">

        <h1 className="text-xl font-bold text-purple-600">
          AI Interview Prep
        </h1>

        <div className="flex items-center gap-6">

          {/* Progress */}
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {questions.length}
          </span>

          {/* Optional Exit */}
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-black transition"
          >
            Exit
          </button>

        </div>

      </nav>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 p-6 flex flex-col gap-4">

          {/* INFO */}
          <div className="bg-white p-4 rounded-xl shadow-md text-sm text-purple-600 flex flex-wrap gap-4">
            <span><b>Company:</b> {company}</span>
            <span><b>Role:</b> {role}</span>
            <span><b>Level:</b> {position}</span>
          </div>

          {/* QUESTION */}
          <div className="bg-white p-5 rounded-xl shadow-md flex-1 flex flex-col">

            <p className="text-sm text-gray-400 mb-2">Question</p>

            <h3 className="text-lg font-semibold text-gray-900">
              {questions[currentIndex]?.question || "Loading..."}
            </h3>

            <div className="mt-auto flex flex-col gap-3">

              <button
                onClick={toggleListening}
                className={`w-full py-3 rounded-xl text-white font-semibold ${listening
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-purple-600 to-pink-500"
                  }`}
              >
                {listening ? "Stop Speaking" : "Start Speaking"}
              </button>

              <button
                onClick={() => setAnswer("")}
                className="w-full py-3 rounded-xl border hover:bg-gray-100"
              >
                Clear Answer
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE (WEBCAM) */}
        <div className="w-1/2 p-6 flex flex-col">

          <div className="bg-white p-4 rounded-xl shadow-md flex flex-col h-full">

            <p className="text-sm text-gray-400 mb-2">Live Camera</p>

            <video
              ref={videoRef}
              autoPlay
              muted
              className="rounded-xl w-full flex-1 object-cover"
            />

            <p className="text-xs text-gray-400 mt-2 text-center">
              Maintain eye contact & confidence
            </p>

          </div>

        </div>

      </div>

      {/* ANSWER SECTION (BOTTOM FIXED) */}
      <div className="p-4 bg-white border-t">

        <textarea
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full h-24 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        />

        <div className="flex gap-3 mt-3">

          <button
            onClick={handleSubmitAnswer}
            className="flex-1 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition"
          >
            Submit & Next →
          </button>

          <button
            onClick={() => navigate("/setup")}
            className="px-6 py-3 rounded-xl border hover:bg-gray-100"
          >
            Back
          </button>

        </div>

      </div>

    </div>
  );
}