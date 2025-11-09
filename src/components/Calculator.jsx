import React, { useEffect, useRef, useState } from "react";

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState("");
  const containerRef = useRef(null);

  function safeEvaluate(expr) {
    const sanitized = expr.replace(/\s+/g, "");
    if (!/^[-+*/().0-9]+$/.test(sanitized)) return "Err";
    try {
      // eslint-disable-next-line no-new-func
      // Using Function instead of eval; expression already constrained by regex
      // to basic math chars only.
      // Wrap in return to evaluate.
      const result = Function(`"use strict"; return (${sanitized || 0})`)();
      if (Number.isFinite(result)) return String(result);
      return "Err";
    } catch (e) {
      return "Err";
    }
  }

  function press(v) {
    if (v === "=") {
      setDisplay((d) => safeEvaluate(d));
      return;
    }
    if (v === "C") return setDisplay("");
    if (v === "BACKSPACE") {
      setDisplay((d) => d.slice(0, -1));
      return;
    }
    setDisplay((d) => d + v);
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") return onClose();
      if (/^[0-9]$/.test(e.key)) return press(e.key);
      if (["+", "-", "*", "/", ".", "(", ")"].includes(e.key))
        return press(e.key);
      if (e.key === "Enter" || e.key === "=") return press("=");
      if (e.key === "Backspace") return press("BACKSPACE");
      if (e.key.toLowerCase() === "c" && (e.ctrlKey || e.metaKey)) return; // allow copy if needed
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];

  return (
    <div
      ref={containerRef}
      className="fixed top-20 right-10 bg-white shadow-lg rounded-md w-64 p-4 z-60"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">Calculator</div>
        <button onClick={onClose} className="text-sm text-gray-500">
          Close
        </button>
      </div>
      <input
        readOnly
        value={display}
        className="w-full text-right border p-2 mb-2"
      />
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((b) => (
          <button
            key={b}
            className="bg-gray-200 p-2 rounded"
            onClick={() => press(b)}
          >
            {b}
          </button>
        ))}
        <button onClick={() => press("C")} className="bg-red-200 p-2 rounded">
          C
        </button>
        <button
          onClick={() => press("BACKSPACE")}
          className="bg-gray-300 p-2 rounded"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
