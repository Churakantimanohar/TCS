import React, { useEffect, useMemo, useState } from "react";
import { runJsCode, summarizeResults } from "../utils/codeRunner";

export default function CodingQuestion({
  prompt,
  functionName,
  starterCode = "",
  tests = [],
  value,
  onChange,
  onAttempt, // call when user runs tests (to mark as attempted/answered)
}) {
  const [code, setCode] = useState(value ?? starterCode);
  const [results, setResults] = useState([]);
  const summary = useMemo(() => summarizeResults(results), [results]);

  useEffect(() => {
    // keep external value in sync when switching questions
    setCode(value ?? starterCode);
    setResults([]);
  }, [value, starterCode]);

  const handleRun = () => {
    const res = runJsCode({ code, functionName, tests });
    setResults(res);
    // notify parent an attempt occurred with the current code
    onAttempt && onAttempt(code, summarizeResults(res));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-800 whitespace-pre-wrap">{prompt}</div>
      <div className="text-xs text-gray-600">
        Function to implement:{" "}
        <span className="font-mono">{functionName}(...)</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          onChange && onChange(e.target.value);
        }}
        className="w-full h-56 font-mono text-sm p-3 border rounded outline-none focus:ring-2 focus:ring-[#0077C8]"
        spellCheck={false}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleRun}
          className="px-4 py-2 bg-[#0077C8] text-white rounded"
        >
          Run Tests
        </button>
        {results.length > 0 && (
          <div
            className={`text-sm ${
              summary.allPassed ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.passed}/{summary.total} tests passed
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="mt-2 border rounded p-3 bg-gray-50 max-h-48 overflow-auto text-sm">
          {results.map((r, idx) => (
            <div key={idx} className="mb-2">
              <div
                className={`font-medium ${
                  r.pass ? "text-green-700" : "text-red-700"
                }`}
              >
                {r.pass ? "PASS" : "FAIL"} — {r.desc || `Test ${idx + 1}`}
              </div>
              {!r.pass && (
                <div className="text-xs text-gray-700">
                  Expected:{" "}
                  <code className="font-mono">
                    {JSON.stringify(r.expected)}
                  </code>{" "}
                  | Received:{" "}
                  <code className="font-mono">
                    {JSON.stringify(r.received)}
                  </code>
                  {r.error ? (
                    <>
                      {" "}
                      | Error: <code className="font-mono">{r.error}</code>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500">
        Note: This in-browser runner is for practice and executes JavaScript
        only.
      </div>
    </div>
  );
}
