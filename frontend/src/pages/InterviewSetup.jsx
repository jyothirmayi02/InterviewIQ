import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const { resumeFile: navResume } = location.state || {};
  const [resumeFile, setResumeFile] = useState(navResume || null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedText = sessionStorage.getItem("resumeText");
    if (savedText) {
      setResumeFile(savedText);
    }
  }, []);

  const handleStart = async () => {
    if (!company || !role || !position) {
      alert("Please select Company, Role and Position ✅");
      return;
    }

    setLoading(true);

    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("company", company);
        formData.append("role", role);
        formData.append("position", position);

        const res = await fetch("http://localhost:5000/api/generate-questions", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.questions) {
          navigate("/interview", {
            state: { company, role, position, questions: data.questions },
          });
        } else {
          throw new Error(data.error || "Failed");
        }
      } else {
        navigate("/interview", {
          state: { company, role, position },
        });
      }
    } catch (error) {
      alert("Failed to generate questions. Using defaults.");
      navigate("/interview", {
        state: { company, role, position },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">

  <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-3xl">

    {/* Title */}
    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
      Interview Setup
    </h1>

    <p className="text-center text-gray-500 mb-8">
      Configure your interview preferences and get personalized questions
    </p>

    {/* FORM GRID */}
    <div className="grid md:grid-cols-2 gap-6">

      {/* Company */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Company</label>
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none"
        >
          <option value="">Select Company</option>
          <option>Google</option>
          <option>Amazon</option>
          <option>Microsoft</option>
          <option>Infosys</option>
          <option>TCS</option>
          <option>Wipro</option>
          <option>Accenture</option>
          <option>Meta</option>
          <option>Netflix</option>
        </select>
      </div>

      {/* Role */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none"
        >
          <option value="">Select Role</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Full Stack Developer</option>
          <option>Data Analyst</option>
          <option>Data Scientist</option>
          <option>Machine Learning Engineer</option>
          <option>DevOps Engineer</option>
          <option>Software Engineer</option>
        </select>
      </div>

      {/* Position */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium text-gray-700">Position Level</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none"
        >
          <option value="">Select Position</option>
          <option>Intern</option>
          <option>Fresher / Entry Level</option>
          <option>Junior (1-2 years)</option>
          <option>Mid-Level (3-5 years)</option>
          <option>Senior (5+ years)</option>
        </select>
      </div>

    </div>

    {/* BUTTONS */}
    <div className="mt-8 flex flex-col gap-3">

      <button
        onClick={handleStart}
        disabled={loading}
        className={`w-full py-3 rounded-xl text-white font-semibold transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 shadow-md"
        }`}
      >
        {loading ? "Generating Questions..." : "Start Mock Interview"}
      </button>

      <button
        onClick={() => navigate("/upload")}
        className="w-full py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
      >
        ← Back to Upload
      </button>

    </div>

  </div>
</div>
  );
}