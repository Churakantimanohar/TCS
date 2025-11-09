import React, { useEffect, useState } from "react";
import ExamLauncher from "./components/ExamLauncher";
import TestModal from "./components/TestModal";
import ResultPage from "./pages/ResultPage";

export default function App() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);

  // Load persisted summary (if user completed test earlier or on reload)
  useEffect(() => {
    if (!open && !summary) {
      try {
        const saved = localStorage.getItem("tcs-last-summary");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.sections) setSummary(parsed);
        }
      } catch {}
    }
  }, [open, summary]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      {!open && !summary && <ExamLauncher onStart={() => setOpen(true)} />}
      {open && (
        <TestModal
          onClose={(s) => {
            setOpen(false);
            setSummary(s);
          }}
        />
      )}
      {!open && summary && (
        <ResultPage
          summary={summary}
          onRestart={() => {
            setSummary(null);
            setOpen(true);
            try {
              localStorage.removeItem("tcs-last-summary");
            } catch {}
          }}
        />
      )}
    </div>
  );
}
