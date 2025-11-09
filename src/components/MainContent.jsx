import React from "react";
import CodingQuestion from "./CodingQuestion";

export default function MainContent({
  question,
  qIndex = 0,
  onAnswer,
  onPrev,
  onNext,
  onMark,
}) {
  // Be defensive: some restored question objects may miss fields if localStorage is stale
  const defaults = {
    question: `Question ${qIndex + 1}: Sample question?`,
    options: ["A", "B", "C", "D"],
    selected: undefined,
  };
  const q = { ...defaults, ...(question || {}) };

  const isCoding = q.type === "coding";

  return (
    <main className="flex-1 p-6">
      <p className="font-medium mb-4">{q.title || q.question}</p>

      {isCoding ? (
        <CodingQuestion
          prompt={q.prompt || ""}
          functionName={q.functionName}
          starterCode={q.starterCode}
          tests={q.tests || []}
          value={q.selected || q.starterCode}
          onChange={(code) => onAnswer(code)}
          onAttempt={(code) => onAnswer(code)}
        />
      ) : (
        <ul className="space-y-2">
          {(q.options || []).map((opt, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q${qIndex}`}
                  checked={q.selected === idx}
                  onChange={() => onAnswer(idx)}
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 bg-gray-200 rounded">
          Previous
        </button>
        <div className="flex gap-3">
          <button onClick={onMark} className="px-4 py-2 bg-yellow-400 rounded">
            Mark for Review
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-[#0077C8] text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
