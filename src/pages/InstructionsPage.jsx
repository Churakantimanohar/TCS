import React, { useEffect, useState } from "react";

export default function InstructionsPage({ onStart }) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    fetch("/examConfig.json")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  const renderPattern = () => {
    if (!config) return <div>Loading pattern…</div>;
    const totalQuestions = config.sequence.reduce((a, s) => a + s.count, 0);
    const totalMinutes = Math.round(
      config.sequence.reduce((a, s) => a + s.durationSec, 0) / 60
    );
    return (
      <div className="space-y-4 text-sm">
        <div className="font-semibold">Part A - Foundation Section</div>
        {config.sequence
          .filter((s) => s.part.includes("Part A"))
          .map((s) => (
            <div key={s.key} className="flex justify-between">
              <span>{s.name}:</span>
              <span>
                {s.count} questions | {Math.round(s.durationSec / 60)} minutes
              </span>
            </div>
          ))}
        <div className="font-semibold pt-2">Part B - Advanced Section</div>
        {config.sequence
          .filter((s) => s.part.includes("Part B"))
          .map((s) => (
            <div key={s.key} className="flex justify-between">
              <span>{s.name}:</span>
              <span>
                {s.count} questions | {Math.round(s.durationSec / 60)} minutes
              </span>
            </div>
          ))}
        <div className="pt-3 text-xs text-gray-700 border-t mt-2">
          <div>Total Time: {totalMinutes} minutes</div>
          <div>Total Questions: {totalQuestions}</div>
          <div>Difficulty: Hard</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Instructions</h1>
        <p className="text-sm text-gray-700 mb-4">
          Review the exam pattern below before starting. Each section is
          individually timed; when time expires or you submit a section, the
          next section begins automatically. You cannot return to a previous
          section.
        </p>
        <div className="border rounded p-4 mb-6 bg-gray-50">
          {renderPattern()}
        </div>
        <div className="text-xs text-gray-600 mb-4">
          Shortcuts: Alt+N Next | Alt+P Previous | Alt+M Mark | Alt+C Calculator
        </div>
        <button
          onClick={onStart}
          className="px-4 py-2 bg-[#0077C8] text-white rounded"
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
