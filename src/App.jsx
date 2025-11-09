import React, { useState } from "react";
import ExamLauncher from "./components/ExamLauncher";
import TestModal from "./components/TestModal";
import ResultPage from "./pages/ResultPage";

export default function App() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);

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
          }}
        />
      )}
    </div>
  );
}
