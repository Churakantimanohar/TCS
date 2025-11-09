import React, { useState } from "react";

export default function ResultPage({ summary, onRestart }) {
  const [expanded, setExpanded] = useState(null);
  if (!summary) return null;
  const agg = summary.aggregate || {
    correct: 0,
    wrong: 0,
    skipped: 0,
    total: 0,
  };
  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-semibold mb-4">Mark Sheet</h1>
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          <Stat label="Total Questions" value={agg.total} />
          <Stat label="Answered" value={agg.answered} />
          <Stat label="Correct" value={agg.correct} color="text-green-600" />
          <Stat label="Wrong" value={agg.wrong} color="text-red-600" />
          <Stat label="Skipped" value={agg.skipped} color="text-gray-500" />
          <Stat
            label="Accuracy"
            value={
              agg.total
                ? ((agg.correct / agg.total) * 100).toFixed(1) + "%"
                : "0%"
            }
          />
          <Stat
            label="Global Time"
            value={formatDuration(summary.globalElapsed)}
          />
        </div>
        <div className="divide-y border rounded mb-6">
          {summary.sections.map((sec, idx) => {
            const open = expanded === idx;
            return (
              <div key={sec.key}>
                <button
                  onClick={() => setExpanded(open ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm w-full">
                    <span className="font-medium">{sec.name}</span>
                    <span>
                      Score: {sec.correct ?? 0}/{sec.total}
                    </span>
                    <span className="text-green-600">
                      Correct: {sec.correct ?? 0}
                    </span>
                    <span className="text-red-600">
                      Wrong: {sec.wrong ?? 0}
                    </span>
                    <span className="text-gray-500">
                      Skipped: {sec.skipped ?? 0}
                    </span>
                    <span>Time: {formatDuration(sec.timeUsed)}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {open ? "▲" : "▼"}
                  </span>
                </button>
                {open && (
                  <div className="bg-gray-50 px-4 pb-4 overflow-x-auto">
                    <table className="w-full text-xs md:text-sm mt-2">
                      <thead>
                        <tr className="text-left border-b">
                          <Th>#</Th>
                          <Th>Question</Th>
                          <Th>Your Answer</Th>
                          <Th>Correct Answer</Th>
                          <Th>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.questions.map((q, i) => {
                          const status =
                            q.selected === undefined
                              ? "Skipped"
                              : q.selected === q.correct
                              ? "Correct"
                              : "Wrong";
                          const statusClass =
                            status === "Correct"
                              ? "text-green-600"
                              : status === "Wrong"
                              ? "text-red-600"
                              : "text-gray-500";
                          return (
                            <tr
                              key={q.id || i}
                              className="border-b last:border-0 align-top"
                            >
                              <td className="py-1 pr-2 font-mono">{i + 1}</td>
                              <td className="py-1 pr-2 w-[40%]">
                                <div className="whitespace-pre-wrap break-words">
                                  {q.title || q.question}
                                </div>
                                {q.type === "coding" && (
                                  <div className="mt-1 text-[10px] text-indigo-600 font-mono">
                                    Coding Task ({q.functionName})
                                  </div>
                                )}
                              </td>
                              <td className="py-1 pr-2">
                                {renderAnswer(q, q.selected)}
                              </td>
                              <td className="py-1 pr-2">
                                {typeof q.correct === "number"
                                  ? renderAnswer(q, q.correct)
                                  : q.type === "coding"
                                  ? "—"
                                  : "N/A"}
                              </td>
                              <td
                                className={`py-1 pr-2 font-medium ${statusClass}`}
                              >
                                {status}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-[#0077C8] text-white rounded"
          >
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}

function renderAnswer(q, value) {
  if (value === undefined || value === null)
    return <span className="text-gray-400">—</span>;
  if (q.type === "coding") {
    if (!q.codeSummary) return <span className="text-gray-500">Attempted</span>;
    return (
      <span
        className={q.codeSummary.allPassed ? "text-green-600" : "text-red-600"}
      >
        {q.codeSummary.passed}/{q.codeSummary.total} tests
      </span>
    );
  }
  if (Array.isArray(q.options) && typeof value === "number") {
    return (
      <span>
        {String.fromCharCode(65 + value)}. {q.options[value]}
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className={`text-base font-semibold ${color || ""}`}>{value}</span>
    </div>
  );
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
