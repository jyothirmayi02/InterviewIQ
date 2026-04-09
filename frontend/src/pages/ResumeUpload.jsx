import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only PDF
    if (file.type !== "application/pdf") {
      alert("Please upload only PDF file ✅");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleContinue = () => {
    if (!resumeFile) {
      alert("Please upload your resume first ✅");
      return;
    }

    // Pass resume file to setup page to generate AI questions
    navigate("/setup", { state: { resumeFile } });
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">

    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-lg text-center">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Upload Your Resume
      </h1>

      <p className="text-gray-500 mb-6">
        Upload your resume (PDF) to generate personalized interview questions
      </p>

      {/* Upload Box */}
      <label className="block border-2 border-dashed border-purple-300 rounded-2xl p-8 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">

          <div className="text-4xl">📄</div>

          <p className="font-semibold text-purple-600">
            Click to upload your Resume
          </p>

          <p className="text-sm text-gray-400">
            Only PDF format supported
          </p>

          {resumeFile && (
            <div className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm">
              ✅ {resumeFile.name}
            </div>
          )}

        </div>
      </label>

      {/* Button */}
      <button
        onClick={handleContinue}
        className="w-full mt-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition shadow-md"
      >
        Continue to Setup →
      </button>

      {/* Note */}
      <p className="mt-4 text-xs text-gray-400">
        Your resume is used only to generate interview questions
      </p>

    </div>
  </div>
);
}
