import React from "react";

export default function ResultPage({ summary, onRestart }) {
  if (!summary) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-8">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-5xl">
        <h1 className="text-2xl font-semibold mb-6">Results Summary</h1>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {summary.sections.map((sec) => (
            <div key={sec.key} className="border rounded p-4">
              <div className="font-semibold mb-2">{sec.name}</div>
              <div className="text-sm">
                Score: {sec.answered}/{sec.total}
              </div>
              <div className="text-sm">
                Time Used: {formatDuration(sec.timeUsed)}
              </div>
              <div className="mt-2 max-h-40 overflow-auto text-xs space-y-1">
                {sec.questions.map((q, i) => (
                  <div key={q.id} className="flex gap-2">
                    <span className="font-mono">{i + 1}.</span>
                    <span className="truncate flex-1" title={q.question}>
                      {q.question}
                    </span>
                    <span
                      className={
                        q.selected === q.correct
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {q.selected === undefined
                        ? "Not Answered"
                        : q.selected === q.correct
                        ? "Correct"
                        : "Wrong"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Time: {formatDuration(summary.totalTimeUsed)} | Global
            Elapsed: {formatDuration(summary.globalElapsed)}
          </div>
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-[#0077C8] text-white rounded"
          >
            Restart Test
          </button>
        </div>
      </div>
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
