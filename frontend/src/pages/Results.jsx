import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const { answers, webcamFeedback } = locationState;

  const [score, setScore] = React.useState(null);
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [evaluations, setEvaluations] = React.useState([]);

  React.useEffect(() => {
    const evaluate = async () => {
      try {
        const res = await fetch("https://interviewiq-mz3m.onrender.com/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        const data = await res.json();
        setScore(data.overallScore);
        setFeedback(data.overallFeedback);
        setEvaluations(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (answers && answers.length > 0) evaluate();
  }, [answers]);

  if (!answers || answers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const chartData = evaluations.map((e, i) => ({
    name: `Q${i + 1}`,
    score: e.score || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">

      {/* Navbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-purple-600">AI Interview Prep</h1>
        <button onClick={() => navigate("/")} className="text-gray-600">Home</button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HERO SCORE */}
<div className="bg-white rounded-3xl shadow-lg p-8 text-center">

  {loading ? (
    <p>Evaluating...</p>
  ) : (
    <>
      {/* Score */}
      <h1 className="text-7xl font-bold text-purple-600">
        {score}/10
      </h1>

      {/* Performance Label */}
      <p className="mt-2 text-lg font-semibold">
        {score >= 8
          ? "🌟 Excellent Performance"
          : score >= 6
          ? "👍 Good Performance"
          : score >= 4
          ? "⚠️ Needs Improvement"
          : "❌ Poor Performance"}
      </p>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-gradient-to-r from-purple-600 to-pink-500"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>

      {/* AI Summary */}
      <p className="mt-4 text-gray-600 max-w-xl mx-auto">
        {feedback}
      </p>
    </>
  )}

</div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="mb-4 font-semibold">Performance Chart</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* WEBCAM FEEDBACK */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-semibold mb-3">Webcam Feedback</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {webcamFeedback?.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-4">
          {answers.map((item, index) => {
            const evalData = evaluations.find(e => e.question === item.question) || {};

            return (
              <div key={index} className="bg-white p-5 rounded-2xl shadow-md">

                <div className="flex justify-between mb-3">
                  <h4 className="font-semibold">
                    Q{index + 1}: {item.question}
                  </h4>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {evalData.score || 0}/10
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  <b>Your Answer:</b> {item.answer}
                </p>

                <p className="text-sm text-gray-500 mb-2">
                  <b>Ideal:</b> {item.ideal}
                </p>

                {evalData.feedback && (
                  <p className="text-sm text-red-500">
                    {evalData.feedback}
                  </p>
                )}

              </div>
            );
          })}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white"
          >
            Go Home
          </button>

          <button
            onClick={() => navigate("/setup")}
            className="flex-1 py-3 rounded-xl border"
          >
            Try Again
          </button>
        </div>

      </div>
    </div>
  );
}