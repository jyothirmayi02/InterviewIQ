import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* 🔵 Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm">
        <h1 className="text-xl font-bold text-purple-600">
          AI Interview Prep
        </h1>

        <div className="flex gap-4">
          <button className="text-gray-700 hover:text-black transition">
            Login
          </button>

          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* 🟣 Hero Section */}
      <div className="flex flex-col items-center text-center mt-24 px-6">

        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 tracking-tight">
          Master Your Interviews <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            with AI-Powered Precision
          </span>
        </h2>

        <p className="text-gray-600 max-w-xl mb-10 text-lg">
          Practice real interview scenarios, analyze your confidence, and
          receive intelligent feedback to improve your performance.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/upload")}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl shadow-md hover:scale-105 transition"
          >
            Get Started
          </button>

          <button className="border border-gray-300 px-8 py-3 rounded-xl hover:bg-gray-100 transition">
            Watch Demo
          </button>
        </div>
      </div>

      {/* 🟡 Features */}
      <div className="mt-28 px-8 text-center">
        <h3 className="text-3xl font-bold mb-12 text-gray-900">
          Powerful Features
        </h3>

        <div className="grid md:grid-cols-4 gap-8">

          {[
            "AI-Powered Questions",
            "Webcam Analysis",
            "Speech Evaluation",
            "Smart Feedback"
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >
              <h4 className="font-semibold mb-2 text-purple-600">
                {feature}
              </h4>
              <p className="text-gray-500 text-sm">
                Enhance your interview skills using advanced AI-driven insights.
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* 🟢 How It Works */}
      <div className="mt-28 px-8 text-center">
        <h3 className="text-3xl font-bold mb-12 text-gray-900">
          How It Works
        </h3>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            "Upload Resume",
            "Start AI Interview",
            "Get Feedback"
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <h4 className="font-semibold mb-2 text-purple-600">
                {step}
              </h4>
              <p className="text-gray-500 text-sm">
                A simple and efficient process to prepare for interviews.
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* 🔵 CTA */}
      <div className="mt-28 text-center px-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">
          Start Your Interview Preparation Today
        </h3>

        <button
          onClick={() => navigate("/upload")}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-10 py-4 rounded-xl shadow-lg hover:scale-105 transition"
        >
          Start Now
        </button>
      </div>

      {/* ⚫ Footer */}
      <div className="mt-20 bg-white/70 backdrop-blur-md py-6 text-center text-gray-500 text-sm">
        <p>© 2026 AI Interview Prep</p>
        <div className="flex justify-center gap-6 mt-2">
          <span className="hover:text-black cursor-pointer">About</span>
          <span className="hover:text-black cursor-pointer">Contact</span>
          <span className="hover:text-black cursor-pointer">Privacy</span>
        </div>
      </div>

    </div>
  );
}