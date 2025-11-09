import React, { useState } from "react";
import ExamLauncher from "./components/ExamLauncher";
import TestModal from "./components/TestModal";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <ExamLauncher onStart={() => setOpen(true)} />
      {open && <TestModal onClose={() => setOpen(false)} />}
    </div>
  );
}
